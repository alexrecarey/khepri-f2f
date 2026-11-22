// What the trooper picker shows of one unit: how it sorts the loadouts and
// shows their stats (pure; the picker components render it). Needs the
// army data (profile stats, Lieutenant); without it the unit page is a plain
// list.
import {unitById} from '../army/lookup.js';
import {isLieutenant} from '../army/traits.js';
import {isNonLethal} from '../army/weapons.js';

/** @typedef {import('../types.js').Army} Army */
/** @typedef {import('../types.js').ProfileHit} ProfileHit */
/** @typedef {import('../types.js').WeaponRow} WeaponRow */

// Support kit doesn't say what a loadout is for: a Flash Pulse or a Disco
// Baller reaches far but doesn't make a Combi Rifle loadout a long-range one.
/** @param {WeaponRow} row */
const isSupport = (row) => row.dmg == null || isNonLethal(row);

// The farthest distance (cm) at which a weapon gets its best positive Range
// MOD: an HMG peaks at 32", a Combi Rifle at 16", a Shotgun at 8".
/** @param {WeaponRow[] | null | undefined} rows */
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

// [['CC', 13], ['BS', 12], ...] for a unit's first profile in a faction; the
// names are English tokens, shown as src/i18n's stat.<name lower-cased>.
/**
 * @param {Army | null | undefined} army
 * @param {number} unitId
 * @param {number | undefined} armyFactionId
 * @returns {[string, number][] | null}
 */
export function statLine(army, unitId, armyFactionId) {
  const unit = unitById(army, unitId);
  if (!unit) return null;
  // No faction id reads nothing, falling back to the first.
  const faction = unit.byFaction[/** @type {number} */ (armyFactionId)] ?? Object.values(unit.byFaction)[0];
  const p = faction?.groups[0]?.profiles[0];
  if (!p) return null;
  return [['CC', p.cc], ['BS', p.bs], ['PH', p.ph], ['WIP', p.wip], ['ARM', p.arm], ['BTS', p.bts], [p.str ? 'STR' : 'W', p.w]];
}

// The army's option row a picker hit names; null without the army data.
/**
 * @param {Army | null | undefined} army
 * @param {ProfileHit} hit
 */
function optionOf(army, hit) {
  const group = unitById(army, hit.unitId)?.byFaction[hit.armyFactionId]?.groups.find((g) => g.id === hit.groupId);
  return group?.options.find((o) => o.id === hit.optionId) ?? null;
}

// What tells a loadout apart from its siblings with the same weapons: the
// skills it adds ("Forward Observer", "Hacker"), at most two. Lieutenant is
// left out: it doesn't change a roll and only cluttered the list.
/**
 * @param {Army | null | undefined} army
 * @param {ProfileHit} hit
 */
export function loadoutTag(army, hit) {
  const skills = (optionOf(army, hit)?.skills ?? []).filter((sk) => !isLieutenant(sk)).map((sk) => sk.name);
  return skills.length ? skills.slice(0, 2).join(', ') : null;
}

// A loadout's main gun: the lethal weapon that reaches farthest (the army
// data lists a Swiss Guard ML's Light Shotgun first), leaving out Disposable
// spares; else the first lethal one (templates, CC), else none.
/**
 * @param {Army | null | undefined} army
 * @param {number[] | null | undefined} weaponIds
 * @returns {number | null}
 */
export function mainWeapon(army, weaponIds) {
  const ids = (weaponIds ?? []).filter((id) => army?.weapons?.[id]);
  // `ids` only has weapons the army has.
  const lethal = ids.filter((id) => !/** @type {Army} */ (army).weapons[id].every(isSupport));
  // A Disposable launcher (Flammenspeer) is a spare shot, not what the loadout is for.
  /** @param {number} id */
  const disposable = (id) => /** @type {Army} */ (army).weapons[id].some((r) => (r.props ?? []).some((p) => p.startsWith('Disposable')));
  const main = lethal.filter((id) => !disposable(id));
  /** @type {number | null} */
  let best = null;
  let reach = 0;
  for (const id of main) {
    const r = bestReach(/** @type {Army} */ (army).weapons[id]);
    if (r > reach) [best, reach] = [id, r];
  }
  return best ?? main[0] ?? lethal[0] ?? null;
}

// swc is a string in the data ("1.5", "+1", "-"), as a sort key: a "+1"
// (SWC on top of the list's allowance) sorts as -1, ahead of 0 and 0.5;
// "-" (a peripheral) as 0.
/** @param {string | null | undefined} swc */
const swcKey = (swc) => (swc?.startsWith('+') ? -Number(swc.slice(1)) : Number(swc) || 0);

// One unit's loadouts as the Infinity Army app lists them: cheapest first,
// then least SWC ("+1" first), then Lieutenant last; a list builder looks for
// what fits the points left. Other ties keep the army's order (the rows
// arrive in it, and the sort is stable).
/**
 * @param {Army | null | undefined} army
 * @param {ProfileHit[]} hits
 */
export function orderLoadouts(army, hits) {
  /** @param {ProfileHit} h */
  const swc = (h) => swcKey(h.swc);
  const lt = new Map(hits.map((h) => [h, (optionOf(army, h)?.skills ?? []).some(isLieutenant) ? 1 : 0]));
  return [...hits].sort((a, b) => a.points - b.points || swc(a) - swc(b)
    || /** @type {number} */ (lt.get(a)) - /** @type {number} */ (lt.get(b)));
}

// A profile's stats as [name, value] pairs, the names English tokens (src/i18n
// stat.<name lower-cased>). MOV in cm, as the army has it: the picker shows it
// in the language's unit.
/**
 * @param {import('../types.js').ProfileRow} p
 * @returns {[string, number | number[]][]}
 */
export function profileStats(p) {
  return [['MOV', p.move ?? []], ['CC', p.cc], ['BS', p.bs], ['PH', p.ph],
    ['WIP', p.wip], ['ARM', p.arm], ['BTS', p.bts], [p.str ? 'STR' : 'W', p.w], ['S', p.s]];
}

// A unit with several profile groups (Team-Ops: MI, HI and a remote or
// creature) by group, in the army's order, or null for a unit with one:
//   [{key, name, type, stats, shared, items: [{hit, own}]}]
// shared: the weapons every loadout in the group carries (shown once under
// its stats); own: the rest, what sets a loadout apart (its main gun when it
// has nothing else). A group of one loadout shares nothing.
/**
 * One profile group of a unit with several (Team-Ops, a TAG and its pilot):
 * its name, type, stats and skills, the weapons every loadout shares and each
 * loadout with what sets it apart.
 * @typedef {{key: number, name: string, type: string | null, stats: [string, number | number[]][], skills: import('../types.js').TraitRef[],
 *   shared: string[], items: {hit: ProfileHit, own: string[]}[]}} ProfileGroupView
 */

/**
 * @param {Army | null | undefined} army
 * @param {ProfileHit[]} hits
 * @returns {ProfileGroupView[] | null}
 */
export function profileGroups(army, hits) {
  const unit = hits.length ? unitById(army, hits[0].unitId) : null;
  if (!unit) return null;
  const ids = [...new Set(hits.map((h) => h.groupId))];
  if (ids.length < 2) return null;
  // The army's order (Team-Ops: MI, HI, then the remote or creature), not the
  // cheapest-first order the rows arrive in.
  const order = (unit.byFaction[hits[0].armyFactionId]?.groups ?? []).map((g) => g.id);
  ids.sort((a, b) => order.indexOf(a) - order.indexOf(b));
  return ids.map((id) => {
    const items = orderLoadouts(army, hits.filter((h) => h.groupId === id));
    const group = unit.byFaction[items[0].armyFactionId]?.groups.find((g) => g.id === id);
    const profile = group?.profiles[0];
    const shared = items.length < 2 ? []
      : items[0].weapons.filter((w) => items.every((h) => h.weapons.includes(w)));
    return {
      key: id,
      name: group?.isc ?? '',
      type: profile?.type ?? null,
      stats: profile ? profileStats(profile) : [],
      // As the army lists them; army/traits.js traitLabel words them.
      skills: profile?.skills ?? [],
      shared,
      items: items.map((hit) => {
        const own = hit.weapons.filter((w) => !shared.includes(w));
        // A peripheral with no weapon (Cutters' Crabbot) is named by its loadout.
        const main = /** @type {Army} */ (army).weapons[/** @type {number} */ (mainWeapon(army, hit.weaponIds))]?.[0]?.name ?? hit.weapons[0] ?? hit.loadout;
        return {hit, own: own.length ? own : [main].filter(Boolean)};
      }),
    };
  });
}
