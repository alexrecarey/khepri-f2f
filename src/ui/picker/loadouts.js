// How the picker sorts one unit's loadouts and shows its stats. Needs the
// army data (weapon range bands, profile stats); without it the unit page is a
// plain list.
import {unitById} from '../../army/lookup.js';
import {isLieutenant} from '../../army/traits.js';
import {isNonLethal} from '../../army/weapons.js';
import {RANGE_BANDS} from '../../rules/ranges.js';

export const REACH_GROUPS = [
  ['long', 'Long range'],
  ['mid', 'Mid range'],
  ['close', 'Close'],
  ['other', 'No ranged weapon'],
];

// Support kit doesn't say what a loadout is for: a Flash Pulse or a Disco
// Baller reaches far but doesn't make a Combi Rifle loadout a long-range one.
const isSupport = (row) => row.dmg == null || isNonLethal(row);

// The farthest distance (cm) at which a weapon gets its best positive Range
// MOD: an HMG peaks at 32", a Combi Rifle at 16", a Shotgun at 8".
function bestReach(rows) {
  let best = 0;
  for (const row of rows ?? []) {
    if (isSupport(row)) continue;
    const bands = row.ranges ?? [];
    const top = Math.max(-Infinity, ...bands.map((b) => b.mod));
    if (top <= 0) continue;
    best = Math.max(best, ...bands.filter((b) => b.mod === top).map((b) => b.to));
  }
  return best;
}

// A loadout's group by its longest-reaching weapon: 24" or more is long
// range, past 8" mid range, else close.
export function reachGroup(army, weaponIds) {
  const reach = Math.max(0, ...(weaponIds ?? []).map((id) => bestReach(army?.weapons?.[id])));
  if (!reach) return 'other';
  if (reach >= RANGE_BANDS[2].to) return 'long';
  if (reach > RANGE_BANDS[0].to) return 'mid';
  return 'close';
}

// Loadout hits -> [{key, name, items}] in REACH_GROUPS order, empty groups left out.
export function groupLoadouts(army, hits) {
  const by = new Map(REACH_GROUPS.map(([k]) => [k, []]));
  for (const h of hits) by.get(reachGroup(army, h.weaponIds)).push(h);
  return REACH_GROUPS.map(([key, name]) => ({key, name, items: by.get(key)})).filter((g) => g.items.length);
}

// [['CC', 13], ['BS', 12], ...] for a unit's first profile in a faction.
export function statLine(army, unitId, armyFactionId) {
  const unit = unitById(army, unitId);
  if (!unit) return null;
  const faction = unit.byFaction[armyFactionId] ?? Object.values(unit.byFaction)[0];
  const p = faction?.groups[0]?.profiles[0];
  if (!p) return null;
  return [['CC', p.cc], ['BS', p.bs], ['PH', p.ph], ['WIP', p.wip], ['ARM', p.arm], ['BTS', p.bts], [p.str ? 'STR' : 'W', p.w]];
}

// What tells a loadout apart from its siblings with the same weapons: the
// skills it adds ("Forward Observer", "Hacker"), at most two. Lieutenant is
// left out: it doesn't change a roll and only cluttered the list.
export function loadoutTag(army, hit) {
  const unit = unitById(army, hit.unitId);
  const group = unit?.byFaction[hit.armyFactionId]?.groups.find((g) => g.id === hit.groupId);
  const option = group?.options.find((o) => o.id === hit.optionId);
  const skills = (option?.skills ?? []).filter((sk) => !isLieutenant(sk)).map((sk) => sk.name);
  return skills.length ? skills.slice(0, 2).join(', ') : null;
}

// A weapon's chart line for the desktop picker: its first fire mode, the
// Range MOD per band (null out of range; none at all for a Direct Template)
// and B / PS / ammo.
export function weaponChart(army, weaponId) {
  const row = army?.weapons?.[weaponId]?.[0];
  if (!row) return null;
  const template = !row.ranges;
  return {
    id: weaponId,
    name: row.name,
    support: isSupport(row),
    bands: RANGE_BANDS.map((b) => (template ? null : row.ranges.find((r) => b.to <= r.to)?.mod ?? null)),
    burst: row.burst ?? null,
    ps: row.dmg ?? null,
    ammo: (row.ammo ?? []).join('+') || (template ? 'template' : ''),
  };
}

// A loadout's main gun: the lethal weapon that reaches farthest (the army
// data lists a Swiss Guard ML's Light Shotgun first), leaving out Disposable
// spares; else the first lethal one (templates, CC), else none.
export function mainWeapon(army, weaponIds) {
  const ids = (weaponIds ?? []).filter((id) => army?.weapons?.[id]);
  const lethal = ids.filter((id) => !army.weapons[id].every(isSupport));
  // A Disposable launcher (Flammenspeer) is a spare shot, not what the loadout is for.
  const disposable = (id) => army.weapons[id].some((r) => (r.props ?? []).some((p) => p.startsWith('Disposable')));
  const main = lethal.filter((id) => !disposable(id));
  let best = null;
  let reach = 0;
  for (const id of main) {
    const r = bestReach(army.weapons[id]);
    if (r > reach) [best, reach] = [id, r];
  }
  return best ?? main[0] ?? lethal[0] ?? null;
}

// The loadout's weapons as chart lines, its main gun first.
export function loadoutCharts(army, weaponIds) {
  const charts = (weaponIds ?? []).map((id) => weaponChart(army, id)).filter(Boolean);
  const main = charts.findIndex((c) => c.id === mainWeapon(army, weaponIds));
  if (main <= 0) return charts;
  return [charts[main], ...charts.slice(0, main), ...charts.slice(main + 1)];
}

// One unit's loadouts, SWC weapons first (an HMG, an ML, a 0.5 SWC hacker),
// then by how far the main gun reaches, then cheapest.
export function orderLoadouts(army, hits) {
  const reach = (h) => bestReach(army?.weapons?.[mainWeapon(army, h.weaponIds)]);
  return [...hits].sort((a, b) => (b.swc ?? 0) - (a.swc ?? 0) || reach(b) - reach(a) || a.points - b.points);
}

// Everything the desktop unit pane shows about a unit in one faction. The
// desk list asks for one per row on every keystroke, so each is built once.
const details = new WeakMap();
export function unitDetail(army, unitId, armyFactionId) {
  if (!army) return null;
  let cache = details.get(army);
  if (!cache) details.set(army, cache = new Map());
  const key = `${unitId}:${armyFactionId}`;
  if (!cache.has(key)) cache.set(key, buildUnitDetail(army, unitId, armyFactionId));
  return cache.get(key);
}

function buildUnitDetail(army, unitId, armyFactionId) {
  const unit = unitById(army, unitId);
  if (!unit) return null;
  const faction = unit.byFaction[armyFactionId] ?? Object.values(unit.byFaction)[0];
  const group = faction?.groups[0];
  const profiles = (group?.profiles ?? []).map((p) => ({
    id: p.id,
    name: p.name,
    type: p.type,
    stats: [['MOV', (p.move ?? []).map((m) => Math.round(m / 2.5)).join('-')], ['CC', p.cc], ['BS', p.bs], ['PH', p.ph],
      ['WIP', p.wip], ['ARM', p.arm], ['BTS', p.bts], [p.str ? 'STR' : 'W', p.w], ['S', p.s]],
    skills: (p.skills ?? []).map((sk) => (sk.extra?.length ? `${sk.name} (${sk.extra.join(', ')})` : sk.name)),
  }));
  return {unit, profiles};
}
