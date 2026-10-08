// How the picker sorts one unit's loadouts and shows its stats. Needs the
// army data (weapon range bands, profile stats); without it the unit page is a
// plain list.
import {RANGE_BANDS} from '../../rules/ranges.js';

export const REACH_GROUPS = [
  ['long', 'Long range'],
  ['mid', 'Mid range'],
  ['close', 'Close'],
  ['other', 'No ranged weapon'],
];

// Support kit doesn't say what a loadout is for: a Flash Pulse or a Disco
// Baller reaches far but doesn't make a Combi Rifle loadout a long-range one.
const isSupport = (row) => row.dmg == null || (row.props ?? []).includes('Non-lethal');

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
  const unit = army?.units.find((u) => u.id === unitId);
  if (!unit) return null;
  const faction = unit.byFaction[armyFactionId] ?? Object.values(unit.byFaction)[0];
  const p = faction?.groups[0]?.profiles[0];
  if (!p) return null;
  return [['CC', p.cc], ['BS', p.bs], ['PH', p.ph], ['WIP', p.wip], ['ARM', p.arm], ['BTS', p.bts], [p.str ? 'STR' : 'W', p.w]];
}

// What tells a loadout apart from its siblings with the same weapons: the
// skills it adds ("Lieutenant", "Forward Observer"), at most two.
export function loadoutTag(army, hit) {
  const unit = army?.units.find((u) => u.id === hit.unitId);
  const group = unit?.byFaction[hit.armyFactionId]?.groups.find((g) => g.id === hit.groupId);
  const option = group?.options.find((o) => o.id === hit.optionId);
  const skills = (option?.skills ?? []).map((sk) => sk.name);
  return skills.length ? skills.slice(0, 2).join(', ') : null;
}
