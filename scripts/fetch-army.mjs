#!/usr/bin/env node
// Builds src/army/army.json from Corvus Belli's Army API. Run it whenever a new
// Army release comes out; never edit army.json by hand.
//
//   yarn fetch-army                 every vanilla army and sectorial
//   yarn fetch-army 1102 107        just these faction ids
//   yarn fetch-army --offline       rebuild from the last download (.cache/army)
//
// Steps:
//   1. fetch     raw API responses, kept in .cache/army (not committed)
//   2. compact   resolve ids to names, keep what the calculator uses
//   3. normalize Army encodings -> army.json fields (src/army/normalize.js):
//                misspelt names fixed (RENAMES), ammo as a list, the Saving
//                Roll as {attr, halved, armZero, alsoBts}, "BS=12"-style
//                loadout skills as option.statOverrides
//   4. validate  every value the rules read is one they understand
//                (scripts/army-validate.mjs); anything new stops the build
//                with the list of what to look at
//
// The API rejects requests without an `Origin: https://infinityuniverse.com`
// header, which browsers cannot set, so this runs as a build-time script and
// the output is committed.

import {mkdir, readFile, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {UnknownValue, fixName, normalizeWeaponRow, statOverrides} from '../src/army/normalize.js';
import {validateArmy} from './army-validate.mjs';
import {fireteamLimits} from '../src/army/fireteams.js';

const API = 'https://api.corvusbelli.com/army';
const HEADERS = {Origin: 'https://infinityuniverse.com', Accept: 'application/json'};
// Every vanilla army and sectorial. Reinforcements groups (ids ending in 99)
// and the Contracted Back-Up pseudo-factions (998/999) are left out.
const DEFAULT_FACTIONS = [
  101, 102, 103, 104, 105, 106, 107,       // PanOceania
  201, 202, 204, 205,                      // Yu Jing
  301, 302, 303, 304, 305, 306,            // Ariadna
  401, 402, 403, 404,                      // Haqqislam
  501, 502, 503, 504,                      // Nomads
  601, 602, 603, 604, 605,                 // Combined Army
  701, 702, 703,                           // ALEPH
  801,                                     // Tohaa
  901, 902, 904, 905, 908, 909,            // Non-Aligned Armies
  1001, 1002, 1003,                        // O-12
  1101, 1102, 1103,                        // JSA
];
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'src', 'army', 'army.json');
const CACHE = path.join(ROOT, '.cache', 'army');

const args = process.argv.slice(2);
const offline = args.includes('--offline');
// Every faction file also carries the ~50-unit mercenary pool the Army app
// offers as hireable extras (factions: [], canonical: 1, id >= 10000,
// slug "merc-..."). Those are not part of the faction's roster; skip them
// unless --mercs is passed.
const includeMercs = args.includes('--mercs');
const factionIds = args.map(Number).filter(Number.isInteger);
const wanted = factionIds.length > 0 ? factionIds : DEFAULT_FACTIONS;

// GET a path under the API, or read the copy saved by the last online run.
async function get(apiPath) {
  const file = path.join(CACHE, `${apiPath.replaceAll('/', '_')}.json`);
  if (offline) return JSON.parse(await readFile(file, 'utf8'));
  const url = `${API}/${apiPath}`;
  const res = await fetch(url, {headers: HEADERS});
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${url}`);
  const json = await res.json();
  await mkdir(CACHE, {recursive: true});
  await writeFile(file, JSON.stringify(json));
  return json;
}

const clean = (s) => (typeof s === 'string' ? fixName(s.replace(/\s+/g, ' ').trim()) || null : null);
const int = (s) => {
  if (s === null || s === undefined || s === '') return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
};

const unresolved = new Set();

// Values normalize.js doesn't recognise; reported with the validation problems.
const unknownValues = new Set();
function normalizing(where, fn, fallback) {
  try {
    return fn();
  } catch (e) {
    if (!(e instanceof UnknownValue)) throw e;
    unknownValues.add(`${e.message} (${where})`);
    return fallback;
  }
}
function makeResolver(label, ...tables) {
  const map = new Map();
  for (const table of tables) {
    for (const row of table ?? []) {
      if (!map.has(row.id)) map.set(row.id, clean(row.name) ?? String(row.id));
    }
  }
  return (id) => {
    if (map.has(id)) return map.get(id);
    unresolved.add(`${label}:${id}`);
    return String(id);
  };
}

function compactWeapons(rows, ammoName) {
  const table = {};
  for (const w of rows) {
    if (w.type !== 'WEAPON') continue;
    const dist = w.distance ?? {};
    const ranges = ['short', 'med', 'long', 'max']
      .map((band) => dist[band])
      .filter((b) => b && b.max !== null && b.max !== undefined)
      .map((b) => ({to: b.max, mod: int(b.mod) ?? 0}))
      .sort((a, b) => a.to - b.to);
    const raw = {
      name: clean(w.name),
      mode: clean(w.mode),
      ammo: Number(w.ammunition) > 0 ? ammoName(w.ammunition) : null,
      burst: int(w.burst),
      dmg: int(w.damage),
      saving: clean(w.saving) ?? '',
      saves: clean(w.savingNum) ?? '',
      props: w.properties ?? [],
      ranges: ranges.length > 0 ? ranges : null,
    };
    (table[w.id] ??= []).push(normalizing(`weapon ${w.id} ${raw.name}`, () => normalizeWeaponRow(raw), {...raw, save: null}));
  }
  return table;
}

function refs(list, resolve, extraName) {
  return (list ?? [])
    .filter((x) => x && x.id !== null && x.id !== undefined)
    .map((x) => {
      const ref = {id: x.id, name: resolve(x.id)};
      const extra = (x.extra ?? []).map(extraName).filter(Boolean);
      if (extra.length > 0) ref.extra = extra;
      return ref;
    });
}

// Spec-Ops / Team-Ops upgrade charts (`spectables`): `table` is the Spec-Ops or
// Team-Ops chart, `specball` the SpecBall / TacBall chart. Each item is a few
// attrs: a stat change ({stat, q}; MOV is move0/move1 in cm and replaces MOV,
// the rest are deltas) or a skill / equip / weapon to add.
const STAT_LABELS = {cc: 'CC', bs: 'BS', ph: 'PH', wip: 'WIP', arm: 'ARM', bts: 'BTS', w: 'W', s: 'S'};
const inches = (cm) => (cm % 2.5 === 0 ? cm / 2.5 : `${cm}cm`);

function upgradeLabel(attrs) {
  const parts = [];
  const move = attrs.filter((a) => a.type === 'stat' && a.stat.startsWith('move')).map((a) => inches(a.q));
  if (move.length > 0) parts.push(`MOV ${move.join('-')}"`);
  for (const a of attrs) {
    if (a.type === 'stat' && !a.stat.startsWith('move')) parts.push(`${STAT_LABELS[a.stat] ?? a.stat.toUpperCase()}+${a.q}`);
    else if (a.type !== 'stat') parts.push(a.extra ? `${a.name} (${a.extra.join(', ')})` : a.name);
  }
  return parts.join(', ');
}

function compactUpgrades(spectables, names) {
  if (!spectables) return null;
  const item = (it) => {
    const attrs = (it.attrs ?? []).map((a) => {
      if (a.type === 'stat') return {type: 'stat', stat: a.stat, q: a.q};
      const resolve = names[a.type];
      if (!resolve) return null;
      const out = {type: a.type, id: a.id, name: resolve(a.id)};
      const extra = (a.extra ?? []).map(names.extra).filter(Boolean);
      if (extra.length > 0) out.extra = extra;
      return out;
    }).filter(Boolean);
    return {label: upgradeLabel(attrs), attrs};
  };
  const chart = (spectables.table?.items ?? []).map(item);
  const ball = (spectables.specball?.items ?? []).map(item);
  return chart.length > 0 || ball.length > 0 ? {chart, ball} : null;
}

async function main() {
  const metadata = await get('infinity/en/metadata');
  const factionFiles = new Map();
  for (const id of wanted) {
    const file = await get(`units/en/${id}`);
    if (!Array.isArray(file.units) || file.units.length === 0) {
      throw new Error(`Faction ${id} returned no units (unknown faction id?)`);
    }
    factionFiles.set(id, file);
  }
  const files = [...factionFiles.values()];
  const filterTables = (key) => files.map((f) => f.filters?.[key]);

  const skillName = makeResolver('skill', metadata.skills, ...filterTables('skills'));
  const equipName = makeResolver('equip', metadata.equips, ...filterTables('equip'));
  // DISTANCE extras are centimetres (e.g. Dodge "+5"); show them in inches so
  // they are not mistaken for attribute MODs.
  const extraRows = filterTables('extras').flat().filter(Boolean).map((e) => {
    const name = clean(e.name);
    if (e.type !== 'DISTANCE') return {id: e.id, name};
    const cm = Number(name);
    const inches = Number.isFinite(cm) && cm % 2.5 === 0 ? `${cm > 0 ? '+' : ''}${cm / 2.5}"` : `${name}cm`;
    return {id: e.id, name: inches};
  });
  const extraName = makeResolver('extra', extraRows);
  const ammoName = makeResolver('ammo', metadata.ammunitions, ...filterTables('ammunition'));
  const typeName = makeResolver('type', ...filterTables('type'));
  const categoryName = makeResolver('category', ...filterTables('category'));
  const weaponRows = metadata.weapons.filter((w) => w.type === 'WEAPON');
  const weaponName = makeResolver('weapon', weaponRows, ...filterTables('weapons'));

  const weapons = compactWeapons(metadata.weapons, ammoName);
  const metaFactions = new Map(metadata.factions.map((f) => [f.id, f]));

  const factions = {};
  const units = new Map();
  for (const [fid, file] of factionFiles) {
    const meta = metaFactions.get(fid);
    factions[fid] = {
      id: fid,
      name: clean(meta?.name) ?? `Faction ${fid}`,
      slug: meta?.slug ?? null,
      parent: meta?.parent ?? null,
      logo: meta?.logo ?? null,
      version: file.version ?? null,
    };

    const ids = new Set(file.units.map((u) => u.id));
    let dropped = 0;
    for (const u of file.units) {
      const native = (u.factions ?? []).includes(fid);
      if (!native && !includeMercs) {
        dropped += 1;
        continue;
      }
      // A mercenary-pool copy of a native unit lives under id + 10000; fold it
      // onto the base id so it merges with the real unit.
      const isMercCopy = !native && u.id >= 10000;
      if (isMercCopy && ids.has(u.id - 10000)) continue;
      const unitId = isMercCopy ? u.id - 10000 : u.id;
      const groups = (u.profileGroups ?? []).map((g) => ({
        id: g.id,
        isc: clean(g.isc),
        category: g.category ? categoryName(g.category) : null,
        profiles: (g.profiles ?? []).map((p) => ({
          id: p.id,
          name: clean(p.name),
          type: p.type === null || p.type === undefined ? null : typeName(p.type),
          move: p.move ?? null,
          cc: p.cc,
          bs: p.bs,
          ph: p.ph,
          wip: p.wip,
          arm: p.arm,
          bts: p.bts,
          w: p.w,
          str: Boolean(p.str),
          s: p.s,
          ava: p.ava,
          skills: refs(p.skills, skillName, extraName),
          equip: refs(p.equip, equipName, extraName),
          weapons: refs(p.weapons, weaponName, extraName),
        })),
        options: (g.options ?? []).map((o) => {
          const skills = refs(o.skills, skillName, extraName);
          const overrides = normalizing(`${u.isc} ${o.name}`, () => statOverrides(skills), null);
          return {
            id: o.id,
            name: clean(o.name),
            points: o.points,
            swc: clean(o.swc === null || o.swc === undefined ? null : String(o.swc)) ?? '0',
            weapons: refs(o.weapons, weaponName, extraName),
            skills,
            equip: refs(o.equip, equipName, extraName),
            ...(overrides ? {statOverrides: overrides} : {}),
          };
        }),
      }));

      const existing = units.get(unitId);
      const unit = existing ?? {
        id: unitId,
        isc: clean(u.isc) ?? clean(u.name) ?? String(unitId),
        name: clean(u.name),
        slug: u.slug ?? null,
        inFactions: [],
        byFaction: {},
      };
      // Identical in every faction file the unit appears in; keep the first.
      if (!existing) {
        const upgrades = compactUpgrades(u.spectables, {
          skill: skillName, equip: equipName, weapon: weaponName, extra: extraName,
        });
        if (upgrades) unit.upgrades = upgrades;
      }
      unit.inFactions.push(fid);
      unit.byFaction[fid] = {groups};
      units.set(unitId, unit);
    }
    console.log(`${factions[fid].name} (${fid}): ${file.units.length - dropped} units, version ${file.version}` +
      (dropped ? `, skipped ${dropped} mercenary-pool units` : ''));
  }

  // The largest fireteam each unit can join in any army fetched (vanilla or
  // sectorial; src/army/fireteams.js): {all, fto}, absent when it can't.
  const fireteams = fireteamLimits(files.map((f) => f.fireteamChart));
  for (const unit of units.values()) {
    const ft = unit.slug ? fireteams[unit.slug] : null;
    if (ft && (ft.all || ft.fto)) unit.fireteam = ft;
  }

  const data = {
    generatedAt: new Date().toISOString(),
    source: 'https://api.corvusbelli.com/army (Corvus Belli, Infinity Army). Unofficial snapshot.',
    factions,
    units: [...units.values()].sort((a, b) => a.isc.localeCompare(b.isc)),
    weapons,
  };

  if (unresolved.size > 0) {
    console.warn(`Unresolved names: ${[...unresolved].join(', ')}`);
  }
  const problems = [...unknownValues, ...validateArmy(data)];
  if (problems.length > 0) {
    console.error(`\n${problems.length} value(s) the calculator doesn't know yet; army.json not written:`);
    for (const p of problems) console.error(`  - ${p}`);
    console.error('\nFor each one, teach the rules about it or list it in scripts/army-validate.mjs as known.');
    process.exit(1);
  }

  await mkdir(path.dirname(OUT), {recursive: true});
  await writeFile(OUT, JSON.stringify(data, null, 1) + '\n');
  console.log(`Wrote ${path.relative(ROOT, OUT)}: ${data.units.length} units, ${Object.keys(weapons).length} weapons`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
