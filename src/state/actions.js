// Actions whose payload needs the army data. The reducer stays pure; these
// work out the payload first and return a plain action to dispatch.
import {hasBerserk} from '../rules/closeCombat.js';
import {hasNoCover} from '../rules/modifiers.js';
import {resolveSelection, trooperWeapons} from '../rules/trooper.js';
import {EMPTY_SIDE, other} from './schema.js';

// A search hit -> a side's selection. The weapon the query matched ("fus ml")
// is preselected; otherwise weaponKey stays null and matchupView derives the
// default for the side's role, so it follows the trooper when sides swap.
/** @typedef {import('../types.js').Army} Army */
/** @typedef {import('../types.js').AppState} AppState */
/** @typedef {import('../types.js').ProfileHit} ProfileHit */
/** @typedef {import('../types.js').Side} Side */

/**
 * @param {Army | null | undefined} army
 * @param {ProfileHit} hit
 * @returns {import('../types.js').Selection}
 */
export function selectionFromHit(army, hit) {
  const sel = {
    ...EMPTY_SIDE,
    unitId: hit.unitId,
    factionId: hit.armyFactionId,
    groupId: hit.groupId,
    profileId: hit.profileId,
    optionId: hit.optionId,
  };
  const resolved = army ? resolveSelection(army, sel) : null;
  if (!resolved?.option) return sel;
  // Resolved, so the army is there.
  const weapons = trooperWeapons(resolved.option, /** @type {Army} */ (army).weapons, resolved.traits);
  const matched = hit.weaponId != null ? weapons.find((w) => w.id === hit.weaponId) : null;
  return matched ? {...sel, weaponKey: matched.key} : sel;
}

// `next`: the picker stays open on the other side.
// ftMax: the new trooper's largest fireteam, so a kept fireteam size shrinks
// to fit (or goes) when the new trooper can't match it.
// A new trooper starts in cover when cover can help it (not No Cover), or in
// its Foxhole when it has Sapper (the Foxhole is its cover).
/**
 * @param {Army | null | undefined} army
 * @param {Side} side
 * @param {ProfileHit} hit
 * @param {{next?: boolean}} [opts]
 * @returns {Extract<import('../types.js').Action, {type: 'pickTrooper'}>}
 */
export function pickTrooper(army, side, hit, {next = false} = {}) {
  const base = selectionFromHit(army, hit);
  const r = resolveSelection(army, base);
  const sapper = Boolean(r?.canSapper);
  // r has traits, so r is there.
  const sel = {...base, sapper, inCover: !sapper && Boolean(r?.traits) && !hasNoCover(r)};
  return {
    type: 'pickTrooper',
    side,
    sel,
    ftMax: r?.ftMax ?? 1,
    recent: {unitId: hit.unitId, groupId: hit.groupId, optionId: hit.optionId, armyFactionId: hit.armyFactionId},
    ...(next ? {next: true} : {}),
  };
}

/**
 * @param {Side} side
 * @returns {import('../types.js').Action}
 */
export const openPicker = (side) => ({type: 'openPicker', side});

// Desktop picker: switch sides.
/**
 * @param {Side} side
 * @returns {import('../types.js').Action}
 */
export const pickerSide = (side) => ({type: 'pickerSide', side});

// A Team-Ops chart or TacBall pick ({upgrade} or {ball}: an index, or null).
// Dropping an upgrade can take away the weapon in use (it falls back to the
// default) or the Berserk it gave.
/**
 * @param {Army | null | undefined} army
 * @param {AppState} state
 * @param {Side} side
 * @param {{upgrade?: number | null, ball?: number | null}} pick
 * @returns {import('../types.js').Action}
 */
export function setUpgrade(army, state, side, pick) {
  const sel = {...state.matchup[side], ...pick};
  const r = resolveSelection(army, sel);
  /** @type {Partial<import('../types.js').Selection>} */
  const patch = {...pick};
  if (sel.weaponKey && !r?.weapon) patch.weaponKey = null;
  if (sel.berserk && !hasBerserk(r?.traits)) patch.berserk = false;
  return {type: 'patchSide', side, patch};
}
