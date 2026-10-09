// The app's one state document (docs/plans/redesign.md, section 2). Every
// screen is a pure function of this object plus the static army data; anything
// else on screen is derived from it. Plain, JSON-serializable data only.
//
// Slices, by where they live:
//   mode, matchup, classic   shareable: mirrored into the URL (url.js)
//   prefs, lists             persisted on this device (storage.js)
//   ui                       ephemeral: overlays, open selectors, picker stack
import {DEFAULT_PARAMS} from '../engine/params.js';
import {MODES} from '../ui/modes.js';

export const STATE_VERSION = 1;

// One side of a matchup: ids into the army data plus the situation chips.
// weaponKey null = the default weapon for the side (rules/defaultWeapon.js),
// worked out when the matchup is derived, never stored.
export const EMPTY_SIDE = {
  unitId: null,
  factionId: null,
  groupId: null,
  profileId: null,
  optionId: null,
  weaponKey: null,
  inCover: false,
  // Use Surprise Attack (active side, units with the skill).
  surpriseAttack: false,
  // Team-Ops: index into unit.upgrades.chart / .ball, or null.
  upgrade: null,
  ball: null,
  // Fireteam size; 1 = not in a fireteam.
  ftSize: 1,
};

// The distance both sides share, as the upper bound of a range band in cm
// (rules/ranges.js RANGE_BANDS): 40 = 8-16".
export const DEFAULT_RANGE_CM = 40;

export const MAX_RECENTS = 8; // per side

// The recents for one side, newest first. Untagged (older) entries belong to both.
export const recentsFor = (recents, side) => recents.filter((r) => r.side == null || r.side === side);
export const MAX_RECENT_FACTIONS = 3;

// overlay: null | 'menu' | 'results' | 'picker' | 'saved' | 'settings' | 'about'
// picker:  {side: 'A'|'B', query, scope: factionId|null, stack: [view]} while
//          overlay is 'picker'; a view is {view: 'factions'} | {view: 'type', type}
//          | {view: 'unit', unitId, name}
// edit:    {side, chip: 'fireteam'} while a chip shows its inline editor
// savedTab: which list Saved rolls shows, 'matchup' | 'basic'
// swiped:  id of the saved roll swiped open to show its Delete button
// toast:   {text} for a moment after Save, Share or Delete
export const EMPTY_UI = {overlay: null, picker: null, rangeOpen: false, edit: null, savedTab: null, swiped: null, toast: null};

export function initialState() {
  return {
    v: STATE_VERSION,
    mode: MODES.matchup,
    matchup: {A: {...EMPTY_SIDE}, B: {...EMPTY_SIDE}, rangeCm: DEFAULT_RANGE_CM},
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
