// What the trooper picker shows of one unit: how it sorts the loadouts and
// shows their stats (pure; the picker components render it). Needs the
// army data (weapon range bands, profile stats); without it the unit page is a
// plain list.
import {crestOf} from '../army/crests.js';
import {unitById} from '../army/lookup.js';
import {isLieutenant} from '../army/traits.js';
import {isNonLethal} from '../army/weapons.js';
import {RANGE_BANDS} from '../rules/ranges.js';

/** @typedef {import('../types.js').Army} Army */
/** @typedef {import('../types.js').ProfileHit} ProfileHit */
/** @typedef {import('../types.js').WeaponRow} WeaponRow */
/** @typedef {'long' | 'mid' | 'close' | 'other'} ReachGroup */

// Their names are src/i18n's reach.<key>.
/** @type {ReachGroup[]} */
export const REACH_GROUPS = ['long', 'mid', 'close', 'other'];

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

// A loadout's group by its longest-reaching weapon: 24" or more is long
// range, past 8" mid range, else close.
/**
 * @param {Army | null | undefined} army
 * @param {number[] | null | undefined} weaponIds
 * @returns {ReachGroup}
 */
export function reachGroup(army, weaponIds) {
  const reach = Math.max(0, ...(weaponIds ?? []).map((id) => bestReach(army?.weapons?.[id])));
  if (!reach) return 'other';
  if (reach >= RANGE_BANDS[2].to) return 'long';
  if (reach > RANGE_BANDS[0].to) return 'mid';
  return 'close';
}

// Loadout hits -> [{key, name, items}] in REACH_GROUPS order, empty groups left out.
/**
 * @param {Army | null | undefined} army
 * @param {ProfileHit[]} hits
 * @returns {{key: ReachGroup, items: ProfileHit[]}[]}
 */
export function groupLoadouts(army, hits) {
  /** @type {Map<ReachGroup, ProfileHit[]>} */
  const by = new Map(REACH_GROUPS.map((k) => [k, []]));
  // Every group starts in the map.
  for (const h of hits) /** @type {ProfileHit[]} */ (by.get(reachGroup(army, h.weaponIds))).push(h);
  return REACH_GROUPS.map((key) => ({key, items: /** @type {ProfileHit[]} */ (by.get(key))})).filter((g) => g.items.length);
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

// What tells a loadout apart from its siblings with the same weapons: the
// skills it adds ("Forward Observer", "Hacker"), at most two. Lieutenant is
// left out: it doesn't change a roll and only cluttered the list.
/**
 * @param {Army | null | undefined} army
 * @param {ProfileHit} hit
 */
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
/** A weapon's chart line for the desktop picker.
 * @typedef {{id: number, name: string, support: boolean, bands: (number | null)[], burst: number | null, ps: number | null, ammo: string}} WeaponChart */

/**
 * @param {Army | null | undefined} army
 * @param {number} weaponId
 * @returns {WeaponChart | null}
 */
export function weaponChart(army, weaponId) {
  const row = army?.weapons?.[weaponId]?.[0];
  if (!row) return null;
  const template = !row.ranges;
  return {
    id: weaponId,
    name: row.name,
    support: isSupport(row),
    bands: RANGE_BANDS.map((b) => (template ? null : /** @type {NonNullable<WeaponRow['ranges']>} */ (row.ranges).find((r) => b.to <= r.to)?.mod ?? null)),
    burst: row.burst ?? null,
    ps: row.dmg ?? null,
    ammo: (row.ammo ?? []).join('+') || (template ? 'template' : ''),
  };
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

// The loadout's weapons as chart lines, its main gun first.
/**
 * @param {Army | null | undefined} army
 * @param {number[] | null | undefined} weaponIds
 * @returns {WeaponChart[]}
 */
export function loadoutCharts(army, weaponIds) {
  const charts = /** @type {WeaponChart[]} */ ((weaponIds ?? []).map((id) => weaponChart(army, id)).filter(Boolean));
  const main = charts.findIndex((c) => c.id === mainWeapon(army, weaponIds));
  if (main <= 0) return charts;
  return [charts[main], ...charts.slice(0, main), ...charts.slice(main + 1)];
}

// One unit's loadouts, SWC weapons first (an HMG, an ML, a 0.5 SWC hacker),
// then by how far the main gun reaches, then cheapest.
/**
 * @param {Army | null | undefined} army
 * @param {ProfileHit[]} hits
 */
export function orderLoadouts(army, hits) {
  /** @param {ProfileHit} h */
  const reach = (h) => bestReach(army?.weapons?.[/** @type {number} */ (mainWeapon(army, h.weaponIds))]);
  // swc is a string in the data ("1.5"); the number it names.
  /** @param {ProfileHit} h */
  const swc = (h) => Number(h.swc ?? 0);
  return [...hits].sort((a, b) => swc(b) - swc(a) || reach(b) - reach(a) || a.points - b.points);
}

// Everything the desktop unit pane shows about a unit in one faction. The
// desk list asks for one per row on every keystroke, so each is built once.
/** What the desktop unit pane shows about a unit in one faction.
 * @typedef {{unit: import('../types.js').UnitRow, profiles: {id: number, name: string, type: string, crest: string | null, stats: [string, number | number[]][], skills: import('../types.js').TraitRef[]}[]}} UnitDetail */

/** @type {WeakMap<Army, Map<string, UnitDetail | null>>} */
const details = new WeakMap();
/**
 * @param {Army | null | undefined} army
 * @param {number} unitId
 * @param {number | null} armyFactionId null: the unit's first faction
 * @returns {UnitDetail | null}
 */
export function unitDetail(army, unitId, armyFactionId) {
  if (!army) return null;
  let cache = details.get(army);
  if (!cache) details.set(army, cache = new Map());
  const key = `${unitId}:${armyFactionId}`;
  if (!cache.has(key)) cache.set(key, buildUnitDetail(army, unitId, armyFactionId));
  // Set just above when missing.
  return /** @type {UnitDetail | null} */ (cache.get(key));
}

/**
 * @param {Army} army
 * @param {number} unitId
 * @param {number | null} armyFactionId
 * @returns {UnitDetail | null}
 */
function buildUnitDetail(army, unitId, armyFactionId) {
  const unit = unitById(army, unitId);
  if (!unit) return null;
  // A null faction reads nothing, falling back to the first.
  const faction = unit.byFaction[/** @type {number} */ (armyFactionId)] ?? Object.values(unit.byFaction)[0];
  const group = faction?.groups[0];
  const profiles = (group?.profiles ?? []).map((p) => ({
    id: p.id,
    name: p.name,
    type: p.type,
    crest: crestOf(unit, p),
    stats: profileStats(p),
    // The skills as the army lists them; army/traits.js traitLabel words them.
    skills: p.skills ?? [],
  }));
  return {unit, profiles};
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
