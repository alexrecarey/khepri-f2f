// Helpers shared by fetch-army.mjs (the English army.json) and
// army-names.mjs (the names in other languages): both read the same Army
// API files, one language each.
import {fixName} from '../src/army/normalize.js';

export const clean = (s) => (typeof s === 'string' ? fixName(s.replace(/\s+/g, ' ').trim()) || null : null);
export const int = (s) => {
  if (s === null || s === undefined || s === '') return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
};


function makeResolver(unresolved, label, ...tables) {
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


// Id -> name lookups over one language's metadata and faction files; ids that
// don't resolve are added to `unresolved`.
export function resolvers(metadata, files, unresolved) {
  const filterTables = (key) => files.map((f) => f.filters?.[key]);
  const makeResolverIn = (...args) => makeResolver(unresolved, ...args);
  const skillName = makeResolverIn('skill', metadata.skills, ...filterTables('skills'));
  const equipName = makeResolverIn('equip', metadata.equips, ...filterTables('equip'));
  // DISTANCE extras are centimetres (e.g. Dodge "+5"); show them in inches so
  // they are not mistaken for attribute MODs.
  const extraRows = filterTables('extras').flat().filter(Boolean).map((e) => {
    const name = clean(e.name);
    if (e.type !== 'DISTANCE') return {id: e.id, name};
    const cm = Number(name);
    const inches = Number.isFinite(cm) && cm % 2.5 === 0 ? `${cm > 0 ? '+' : ''}${cm / 2.5}"` : `${name}cm`;
    return {id: e.id, name: inches};
  });
  const extraName = makeResolverIn('extra', extraRows);
  const ammoName = makeResolverIn('ammo', metadata.ammunitions, ...filterTables('ammunition'));
  const typeName = makeResolverIn('type', ...filterTables('type'));
  const categoryName = makeResolverIn('category', ...filterTables('category'));
  const weaponRows = metadata.weapons.filter((w) => w.type === 'WEAPON');
  const weaponName = makeResolverIn('weapon', weaponRows, ...filterTables('weapons'));

  return {skillName, equipName, extraName, ammoName, typeName, categoryName, weaponName};
}

// Spec-Ops / Team-Ops upgrade charts (`spectables`): `table` is the Spec-Ops or
// Team-Ops chart, `specball` the SpecBall / TacBall chart. Each item is a few
// attrs: a stat change ({stat, q}; MOV is move0/move1 in cm and replaces MOV,
// the rest are deltas) or a skill / equip / weapon to add.
export const STAT_LABELS = {cc: 'CC', bs: 'BS', ph: 'PH', wip: 'WIP', arm: 'ARM', bts: 'BTS', w: 'W', s: 'S'};
const inches = (cm) => (cm % 2.5 === 0 ? cm / 2.5 : `${cm}cm`);

function upgradeLabel(attrs, statLabels) {
  const parts = [];
  const move = attrs.filter((a) => a.type === 'stat' && a.stat.startsWith('move')).map((a) => inches(a.q));
  if (move.length > 0) parts.push(`MOV ${move.join('-')}"`);
  for (const a of attrs) {
    if (a.type === 'stat' && !a.stat.startsWith('move')) parts.push(`${statLabels[a.stat] ?? a.stat.toUpperCase()}+${a.q}`);
    else if (a.type !== 'stat') parts.push(a.extra ? `${a.name} (${a.extra.join(', ')})` : a.name);
  }
  return parts.join(', ');
}

export function compactUpgrades(spectables, names, statLabels = STAT_LABELS) {
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
    return {label: upgradeLabel(attrs, statLabels), attrs};
  };
  const chart = (spectables.table?.items ?? []).map(item);
  const ball = (spectables.specball?.items ?? []).map(item);
  return chart.length > 0 || ball.length > 0 ? {chart, ball} : null;
}

