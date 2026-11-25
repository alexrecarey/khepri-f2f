// node changelog.mjs <old army.json> <new army.json> <out.json>
// Diffs two army.json snapshots into changelog data: one entry per unit, with
// armies whose changes are identical merged into one entry; each change names
// the profile or loadout it belongs to. Loadouts are labelled "NAME|pts · SWC · kit"
// because several loadouts of one unit often share a name.
import {mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import path from 'node:path';
const [oldPath, newPath, outPath] = process.argv.slice(2);
const A = JSON.parse(readFileSync(oldPath, 'utf8'));
const B = JSON.parse(readFileSync(newPath, 'utf8'));

const trait = (t) => t.name + (t.extra?.length ? ` (${t.extra.join(', ')})` : '');
const STATS = ['type', 'move', 'cc', 'bs', 'ph', 'wip', 'arm', 'bts', 'w', 'str', 's', 'ava'];
const STAT_LABEL = {type: 'Type', move: 'MOV', cc: 'CC', bs: 'BS', ph: 'PH', wip: 'WIP', arm: 'ARM', bts: 'BTS', w: 'W/STR', str: 'STR flag', s: 'S', ava: 'AVA'};
const fmtStat = (k, v) => (v === undefined ? '—' : k === 'move' ? v.join('-') : k === 'ava' && v === -1 ? 'T' : k === 'str' ? (v ? 'STR' : 'W') : String(v));
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

function listDiff(a = [], b = [], kind, what, target, out) {
  const A2 = a.map(trait), B2 = b.map(trait);
  for (const x of B2) if (!A2.includes(x)) out.push({kind, target, op: 'add', text: `${what}: ${x}`});
  for (const x of A2) if (!B2.includes(x)) out.push({kind, target, op: 'remove', text: `${what}: ${x}`});
}

function diffFaction(fa, fb) {
  const out = [];
  if (!fa) { out.push({kind: 'new', target: null, op: 'add', text: 'Added to this army'}); return out; }
  if (!fb) { out.push({kind: 'removed', target: null, op: 'remove', text: 'No longer in this army'}); return out; }
  const ga = new Map(fa.groups.map((g) => [g.id, g])), gb = new Map(fb.groups.map((g) => [g.id, g]));
  for (const [gid, g] of gb) if (!ga.has(gid)) out.push({kind: 'loadouts', target: g.isc, op: 'add', text: `New profile group: ${g.isc}`});
  for (const [gid, g] of ga) if (!gb.has(gid)) out.push({kind: 'loadouts', target: g.isc, op: 'remove', text: `Profile group removed: ${g.isc}`});
  for (const [gid, g2] of gb) {
    const g1 = ga.get(gid); if (!g1) continue;
    if (g1.category !== g2.category) out.push({kind: 'other', target: g2.isc, op: 'change', text: `Category: ${g1.category ?? '—'} → ${g2.category ?? '—'}`});
    const pa = new Map(g1.profiles.map((p) => [p.id, p]));
    for (const p2 of g2.profiles) {
      const p1 = pa.get(p2.id);
      if (!p1) { out.push({kind: 'loadouts', target: p2.name, op: 'add', text: `New profile: ${p2.name}`}); continue; }
      if (p1.name !== p2.name) out.push({kind: 'other', target: p2.name, op: 'change', text: `Renamed from ${p1.name}`});
      for (const k of STATS) if (!same(p1[k], p2[k])) out.push({kind: 'stats', target: p2.name, op: 'change', text: `${STAT_LABEL[k]}: ${fmtStat(k, p1[k])} → ${fmtStat(k, p2[k])}`});
      listDiff(p1.skills, p2.skills, 'skills', 'Skill', p2.name, out);
      listDiff(p1.equip, p2.equip, 'skills', 'Equipment', p2.name, out);
      listDiff(p1.weapons, p2.weapons, 'loadouts', 'Weapon', p2.name, out);
    }
    for (const p1 of g1.profiles) if (!g2.profiles.some((p) => p.id === p1.id)) out.push({kind: 'loadouts', target: p1.name, op: 'remove', text: `Profile removed: ${p1.name}`});
    const oa = new Map(g1.options.map((o) => [o.id, o]));
    const ob = new Map(g2.options.map((o) => [o.id, o]));
    const kit = (o) => [...o.weapons, ...o.skills, ...o.equip].map(trait).join(', ') || 'no extras';
    for (const [oid, o2] of ob) {
      const o1 = oa.get(oid);
      if (!o1) { out.push({kind: 'loadouts', target: `${o2.name}|${o2.points} pts · ${o2.swc} SWC · ${kit(o2)}`, op: 'add', text: 'New loadout'}); continue; }
      const t = `${o2.name}|${o2.points} pts · ${o2.swc} SWC · ${kit(o2)}`;
      if (o1.name !== o2.name) out.push({kind: 'other', target: t, op: 'change', text: `Loadout renamed from ${o1.name}`});
      if (o1.points !== o2.points) out.push({kind: 'points', target: t, op: o2.points > o1.points ? 'up' : 'down', text: `Points: ${o1.points} → ${o2.points}`});
      if (o1.swc !== o2.swc) out.push({kind: 'points', target: t, op: Number(o2.swc) > Number(o1.swc) ? 'up' : 'down', text: `SWC: ${o1.swc} → ${o2.swc}`});
      listDiff(o1.weapons, o2.weapons, 'loadouts', 'Weapon', t, out);
      listDiff(o1.skills, o2.skills, 'skills', 'Skill', t, out);
      listDiff(o1.equip, o2.equip, 'skills', 'Equipment', t, out);
      if (!same(o1.statOverrides, o2.statOverrides)) out.push({kind: 'stats', target: t, op: 'change', text: `Loadout stat override: ${JSON.stringify(o1.statOverrides ?? {})} → ${JSON.stringify(o2.statOverrides ?? {})}`});
      if (!!o1.fto !== !!o2.fto) out.push({kind: 'other', target: t, op: 'change', text: o2.fto ? 'Now an FTO loadout' : 'No longer FTO'});
    }
    for (const [oid, o1] of oa) if (!ob.has(oid)) out.push({kind: 'loadouts', target: `${o1.name}|${o1.points} pts · ${o1.swc} SWC · ${kit(o1)}`, op: 'remove', text: 'Loadout removed'});
  }
  return out;
}

// Units: diff per faction, then merge factions whose change lists are identical.
const ua = new Map(A.units.map((u) => [u.id, u])), ub = new Map(B.units.map((u) => [u.id, u]));
const entries = [];
for (const id of new Set([...ua.keys(), ...ub.keys()])) {
  const u1 = ua.get(id), u2 = ub.get(id), u = u2 ?? u1;
  const factions = new Set([...Object.keys(u1?.byFaction ?? {}), ...Object.keys(u2?.byFaction ?? {})]);
  const bySig = new Map();
  for (const f of factions) {
    const changes = diffFaction(u1?.byFaction[f], u2?.byFaction[f]);
    if (!changes.length) continue;
    const sig = JSON.stringify(changes);
    if (!bySig.has(sig)) bySig.set(sig, {changes, factions: []});
    bySig.get(sig).factions.push(Number(f));
  }
  for (const {changes, factions: fs} of bySig.values()) {
    if (!u1 && fs.length) changes.forEach((c) => (c.text = c.text === 'Added to this army' ? 'New unit' : c.text));
    if (!u2) changes.forEach((c) => (c.text = c.text === 'No longer in this army' ? 'Unit removed' : c.text));
    entries.push({unit: u.isc, slug: u.slug, crest: u.crest ?? null, factions: fs.sort((a, b) => a - b), changes});
  }
}

// Weapons: global, tagged with every army that fields a unit carrying it.
const carriers = new Map();
for (const u of B.units) for (const [f, e] of Object.entries(u.byFaction)) for (const g of e.groups) {
  for (const o of g.options) for (const w of o.weapons) { if (!carriers.has(w.id)) carriers.set(w.id, new Set()); carriers.get(w.id).add(Number(f)); }
  for (const p of g.profiles) for (const w of p.weapons) { if (!carriers.has(w.id)) carriers.set(w.id, new Set()); carriers.get(w.id).add(Number(f)); }
}
const weapons = [];
const fmtRanges = (r) => r.map((x) => `${x.to}":${x.mod > 0 ? '+' : ''}${x.mod}`).join(' ');
for (const id of new Set([...Object.keys(A.weapons), ...Object.keys(B.weapons)])) {
  const w1 = A.weapons[id], w2 = B.weapons[id];
  if (same(w1, w2)) continue;
  const name = (w2 ?? w1)[0].name;
  const changes = [];
  if (!w1) changes.push({kind: 'weapons', op: 'add', text: 'New weapon'});
  else if (!w2) changes.push({kind: 'weapons', op: 'remove', text: 'Weapon removed'});
  else {
    const ma = new Map(w1.map((m) => [m.mode ?? '', m])), mb = new Map(w2.map((m) => [m.mode ?? '', m]));
    for (const [mode, m2] of mb) {
      const m1 = ma.get(mode), tag = mode ? `${mode}: ` : '';
      if (!m1) { changes.push({kind: 'weapons', op: 'add', text: `New mode ${mode}`}); continue; }
      for (const k of Object.keys({...m1, ...m2})) {
        if (k === 'name' || k === 'mode' || same(m1[k], m2[k])) continue;
        const f = (v) => (v === undefined ? '—' : k === 'ranges' ? fmtRanges(v) : Array.isArray(v) ? v.join(', ') || '—' : typeof v === 'object' ? JSON.stringify(v) : String(v));
        changes.push({kind: 'weapons', op: 'change', text: `${tag}${k}: ${f(m1[k])} → ${f(m2[k])}`});
      }
    }
    for (const mode of ma.keys()) if (!mb.has(mode)) changes.push({kind: 'weapons', op: 'remove', text: `Mode removed: ${mode}`});
  }
  weapons.push({weapon: name, factions: [...(carriers.get(Number(id)) ?? [])].sort((a, b) => a - b), changes});
}

const factions = Object.values(B.factions).map((f) => ({id: f.id, name: f.name, parent: f.parent, logo: f.logo?.split('/').pop().replace(/\.svg$/, '') ?? null}));
// Each army has its own version; show the lowest and highest.
const ver = (d) => {
  const n = (v) => v.split('.').map(Number);
  const cmp = (a, b) => { const x = n(a), y = n(b); for (let i = 0; i < 3; i++) if (x[i] !== y[i]) return x[i] - y[i]; return 0; };
  const vs = [...new Set(Object.values(d.factions).map((f) => f.version))].sort(cmp);
  return vs.length > 1 ? `${vs[0]}–${vs.at(-1)}` : vs[0];
};
entries.sort((a, b) => a.unit.localeCompare(b.unit));
weapons.sort((a, b) => a.weapon.localeCompare(b.weapon));
mkdirSync(path.dirname(outPath), {recursive: true});
writeFileSync(outPath, JSON.stringify({from: {version: ver(A), date: A.generatedAt}, to: {version: ver(B), date: B.generatedAt}, factions, units: entries, weapons}));
console.log('unit entries', entries.length, 'weapon entries', weapons.length);
const kinds = {}; for (const e of entries) for (const c of e.changes) kinds[c.kind] = (kinds[c.kind] ?? 0) + 1; console.log(kinds);
