// The app's one state document (docs/plans/redesign.md, section 2). Every
// screen is a pure function of this object plus the static army data; anything
// else on screen is derived from it. Plain, JSON-serializable data only.
//
// Slices, by where they live:
//   mode, matchup, classic   shareable: mirrored into the URL (url.js)
//   prefs, lists             persisted on this device (storage.js)
//   ui                       ephemeral: overlays, open selectors, picker stack
import {DEFAULT_PARAMS} from '../engine/params.js';
import {MODES} from './modes.js';

export const STATE_VERSION = 1;

// The two sides: A is the active trooper, B the reactive one.
/** @type {Record<import('../types.js').Side, 'active' | 'reactive'>} */
export const ROLE = {A: 'active', B: 'reactive'};
export {other} from '../lib/side.js';

// One side of a matchup: ids into the army data plus the situation chips.
// weaponKey null = the default weapon for the side (rules/defaultWeapon.js),
// worked out when the matchup is derived, never stored.
/** @type {import('../types.js').Selection} */
export const EMPTY_SIDE = {
  unitId: null,
  factionId: null,
  groupId: null,
  profileId: null,
  optionId: null,
  weaponKey: null,
  inCover: false,
  // The Firewall chip against a Comms Attack: -3, -6, 0 for none, null for
  // the trooper's own Firewall (none without one).
  firewall: null,
  // In a Foxhole (units with Sapper): cover and Mimetism (-3); replaces inCover.
  sapper: false,
  // Situation chips on the side's own roll (rules/modifiers.js): the target is
  // Targeted (+3 to a shot or program against it, -3 to its Reset), Hacked (-3 to -12 to a Reset, 0 for
  // none), Immobilized-A (-6 to a Dodge).
  targeted: false,
  hackedReset: 0,
  immA: false,
  // Use Surprise Attack (active side, units with the skill).
  surpriseAttack: false,
  // Declare Berserk (active side, units with the skill): a CC Attack.
  berserk: false,
  // Team-Ops: index into unit.upgrades.chart / .ball, or null.
  upgrade: null,
  ball: null,
  // Fireteam size; 1 = not in a fireteam.
  ftSize: 1,
  // Allies in base contact with the target, each +1 B to a CC Attack.
  ccAllies: 0,
};

// The distance both sides share, as the upper bound of a range band in cm
// (rules/ranges.js RANGE_BANDS): 40 = 8-16". matchup.rangeCmB is null, or the
// reactive's own distance when the range is split (it answers a different
// trooper, or from somewhere else); rangeCm is then the active's.
export const DEFAULT_RANGE_CM = 40;

// Smoke / White Noise between the troopers (rules/visibility.js): like the
// range, they belong to the table, not to either side.
export const NO_ZONES = {smoke: false, whiteNoise: false};

export const MAX_RECENTS = 8; // per side

// The recents for one side, newest first. Untagged (older) entries belong to both.
/**
 * @param {import('../types.js').Recent[]} recents
 * @param {import('../types.js').Side} side
 */
export const recentsFor = (recents, side) => recents.filter((r) => r.side == null || r.side === side);
export const MAX_RECENT_FACTIONS = 3;

// The ephemeral slice: overlays, the picker stack, a chip's inline editor,
// the toast (types.js UiState).
/** @type {import('../types.js').UiState} */
export const EMPTY_UI = {overlay: null, picker: null, rangeOpen: false, edit: null, savedTab: null, swiped: null, toast: null};

/** @returns {import('../types.js').AppState} */
export function initialState() {
  return {
    v: STATE_VERSION,
    mode: MODES.matchup,
    matchup: {A: {...EMPTY_SIDE}, B: {...EMPTY_SIDE}, rangeCm: DEFAULT_RANGE_CM, rangeCmB: null, ...NO_ZONES},
    classic: {...DEFAULT_PARAMS},
    ui: {...EMPTY_UI},
    // startFaction: {A, B}, the faction the picker opens on for an empty side
    // (null = the last one used)
    prefs: {},
    // The faction each side's picker is scoped to, remembered per side: {A, B},
    // a vanilla faction id or null for All factions; a missing side has no
    // choice yet (actions.js scopeFor). Cleared with the troopers.
    scopes: {},
    // recents: troopers picked, newest first, as stable army ids plus the
    //   side they were picked for: {unitId, groupId, optionId, armyFactionId, side}.
    //   Active and Reactive each keep their own MAX_RECENTS; entries saved
    //   before the tag existed have no side and count for both (recentsFor).
    // recentFactions: vanilla faction ids scoped to in the picker, newest first
    lists: {recents: [], recentFactions: [], saved: []},
  };
}
