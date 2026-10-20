// army.json's names in another language, in the shape splitNames
// (src/army/localize.js) gives the English ones. The Army API serves the same
// files per language: same ids, stats and points, only the text translated,
// so every name is looked up by the id army.json already has.
//
// Only names: the rules keep reading the English tokens in the core (weapon
// properties, "+1B", "PS=6", "BS Mode"...), which the Spanish files translate
// too ("+1R", "Modo CD"). The display maps for those (extras, modes, types,
// stats) are here for the screens that show them.

import {splitNames} from '../src/army/localize.js';
import {spanishShort} from '../src/army/shortNames.js';
import {clean, compactUpgrades, resolvers} from './army-compact.mjs';

// The unit's short name for players of each language; English uses the ISC.
const SHORT = {es: spanishShort};

// Weapon rows are listed in a different order per language (sorted by the
// translated mode name), so rows are paired by what they do; the number of
// properties tells apart modes with the same numbers (D-Charges, Monofilament
// Mine's BS and CC Modes).
const rowKey = (w) => JSON.stringify([w.burst, w.damage, w.distance, w.ammunition, (w.properties ?? []).length]);

// {names, problems, warnings}. Problems stop fetch-army: the files don't line
// up with army.json (a unit or weapon row missing). Warnings don't: a newer
// English release than the translation, or a name not translated yet, which
// keeps its English name so English updates are never held back.
export function localNames(lang, army, {enMetadata, enFiles, metadata, files}) {
  const problems = [];
  const warnings = [];
  const {names: en} = splitNames(army);
  const unresolved = new Set();
  const r = resolvers(metadata, [...files.values()], unresolved);

  for (const [fid, file] of files) {
    const version = enFiles.get(fid)?.version;
    if (file.version !== version) warnings.push(`${lang} faction ${fid} is version ${file.version}, English is ${version}`);
  }

  const table = (enTable, resolve, label) => Object.fromEntries(Object.keys(enTable).map((id) => {
    const name = resolve(Number(id));
    if (name !== String(id)) return [id, name];
    warnings.push(`${lang} has no ${label} ${id}; kept "${enTable[id]}"`);
    return [id, enTable[id]];
  }));
  const factionName = new Map(metadata.factions.map((f) => [String(f.id), clean(f.name)]));
  const names = {
    factions: table(en.factions, (id) => factionName.get(String(id)) ?? String(id), 'faction'),
    skills: table(en.skills, r.skillName, 'skill'),
    equip: table(en.equip, r.equipName, 'equipment'),
    weapons: table(en.weapons, r.weaponName, 'weapon'),
    units: {},
  };

  // Each unit's copies in this language's files, by army.json id (a
  // mercenary-pool copy sits at id + 10000, as in fetch-army). A unit's
  // groups and loadouts differ between factions, so all copies are searched.
  const raw = new Map();
  for (const file of files.values()) for (const u of file.units) raw.set(u.id, [...(raw.get(u.id) ?? []), u]);
  const statLabels = Object.fromEntries(([...files.values()][0]?.filters?.attrs ?? []).map((a) => [a.id, a.abbr]));
  for (const unit of army.units) {
    const copies = [...(raw.get(unit.id) ?? []), ...(raw.get(unit.id + 10000) ?? [])];
    const u = copies[0];
    const enUnit = en.units[unit.id];
    if (!u) {
      warnings.push(`${lang} has no unit ${unit.id}; kept the English names`);
      names.units[unit.id] = enUnit;
      continue;
    }
    const groups = {};
    for (const [gid, g] of Object.entries(enUnit.groups)) {
      const rgs = copies.flatMap((c) => c.profileGroups.filter((x) => String(x.id) === gid));
      const rg = rgs[0];
      const byId = (key, ids, what) => Object.fromEntries(Object.keys(ids).map((id) => {
        const name = clean(rgs.flatMap((x) => x[key] ?? []).find((x) => String(x.id) === id)?.name);
        if (!name) warnings.push(`${lang} has no ${what} ${unit.isc} ${gid}:${id}; kept "${ids[id]}"`);
        return [id, name ?? ids[id]];
      }));
      groups[gid] = {isc: clean(rg?.isc) ?? g.isc, profiles: byId('profiles', g.profiles, 'profile'), options: byId('options', g.options, 'loadout')};
    }
    const name = clean(u.name);
    const loadouts = Object.values(groups).flatMap((g) => Object.values(g.options));
    const out = {isc: SHORT[lang]?.(name, loadouts) ?? clean(u.isc), name, code: unit.isc, groups};
    if (enUnit.upgrades) {
      const up = compactUpgrades(u.spectables, {skill: r.skillName, equip: r.equipName, weapon: r.weaponName, extra: r.extraName}, statLabels);
      out.upgrades = {chart: (up?.chart ?? []).map((i) => i.label), ball: (up?.ball ?? []).map((i) => i.label)};
      if (out.upgrades.chart.length !== enUnit.upgrades.chart.length || out.upgrades.ball.length !== enUnit.upgrades.ball.length) {
        problems.push(`${lang} upgrades of ${unit.isc} don't match English`);
      }
    }
    names.units[unit.id] = out;
  }

  // Display maps for English tokens the rules read: extras by id, modes by
  // paired rows, unit types by id. Only entries that change are kept.
  const enR = resolvers(enMetadata, [...enFiles.values()], new Set());
  const changed = (pairs, what) => {
    const map = {};
    for (const [from, to] of pairs) {
      if (from == null || to == null || from === to) continue;
      if (map[from] !== undefined && map[from] !== to) problems.push(`${lang} ${what} "${from}" is both "${map[from]}" and "${to}"`);
      map[from] = to;
    }
    return map;
  };
  const extraIds = new Set([...enFiles.values()].flatMap((f) => (f.filters?.extras ?? []).map((e) => e.id)));
  names.extras = changed([...extraIds].map((id) => [enR.extraName(id), r.extraName(id)]), 'extra');
  const typeIds = new Set([...enFiles.values()].flatMap((f) => (f.filters?.type ?? []).map((t) => t.id)));
  names.types = changed([...typeIds].map((id) => [enR.typeName(id), r.typeName(id)]), 'type');
  names.stats = statLabels;
  const rows = (m) => {
    const out = new Map();
    for (const w of m.weapons) if (w.type === 'WEAPON') out.set(`${w.id}|${rowKey(w)}`, w);
    return out;
  };
  // Modes by weapon id: one English mode can read differently on two
  // weapons (D-Charges' CC Mode is "Arma CC", elsewhere "Modo CC").
  const local = rows(metadata);
  const modePairs = new Map();
  for (const [key, w] of rows(enMetadata)) {
    const lw = local.get(key);
    if (!lw) warnings.push(`${lang} weapon ${w.id} ${w.name} (${w.mode ?? 'one mode'}) has no matching row; its mode stays in English`);
    else if (w.mode) modePairs.set(w.id, [...(modePairs.get(w.id) ?? []), [clean(w.mode), clean(lw.mode)]]);
  }
  names.modes = Object.fromEntries([...modePairs].map(([id, pairs]) => [id, changed(pairs, `weapon ${id} mode`)]));

  return {names, problems, warnings};
}
