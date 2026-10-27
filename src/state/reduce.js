// Every change to the state document is an action through reduce(). Pure: no
// army data, no storage, no DOM. Anything that needs the army data to build an
// action's payload (a picked trooper's weapon, the picker's starting faction)
// is worked out before dispatching, in actions.js.
import {FIRETEAM_MAX, fireteamSize} from '../rules/modifiers.js';
import {RANGE_BANDS} from '../rules/ranges.js';
import {SIDES} from '../lib/side.js';
import {MODES} from './modes.js';
import {fullParams} from '../engine/params.js';
import {classicSave} from './classicView.js';
import {normalizeSetup, setupKey} from './rolls.js';
import {EMPTY_SIDE, EMPTY_UI, MAX_RECENT_FACTIONS, MAX_RECENTS, initialState, other} from './schema.js';

// How many Back presses the open overlays take to close: the overlay itself,
// plus each screen pushed inside the picker. Browser history mirrors this
// (sync.js), so the phone's back gesture closes them one at a time.
/** @typedef {import('../types.js').AppState} AppState */
/** @typedef {import('../types.js').UiState} UiState */
/** @typedef {import('../types.js').Side} Side */

/** @param {UiState | null | undefined} ui */
export function uiDepth(ui) {
  if (!ui?.overlay) return 0;
  return 1 + (ui.overlay === 'picker' ? ui.picker?.stack?.length ?? 0 : 0);
}

// One step back: the top picker screen, else the overlay.
/**
 * @param {UiState} ui
 * @returns {UiState}
 */
function back(ui) {
  if (ui.overlay === 'picker' && ui.picker?.stack?.length) {
    return {...ui, picker: {...ui.picker, stack: ui.picker.stack.slice(0, -1)}};
  }
  return {...ui, overlay: null, picker: null};
}

/**
 * @param {import('../types.js').Recent} a
 * @param {import('../types.js').Recent} b
 */
const sameTrooper = (a, b) => a.unitId === b.unitId && a.groupId === b.groupId && a.optionId === b.optionId;

// A pick moves to the front of its side's recents; the other side's entry for
// the same trooper stays. Each side keeps MAX_RECENTS; an untagged (older)
// entry counts against both.
/**
 * @param {import('../types.js').Recent[]} list
 * @param {import('../types.js').Recent} pick
 */
const pushRecent = (list, pick) => {
  /** @type {Record<Side, number>} */
  const kept = {A: 0, B: 0};
  return [pick, ...list.filter((p) => !(sameTrooper(p, pick) && (p.side == null || p.side === pick.side)))]
    .filter((p) => {
      const sides = p.side == null ? SIDES : [p.side];
      if (sides.every((s) => kept[s] >= MAX_RECENTS)) return false;
      sides.forEach((s) => { kept[s] += 1; });
      return true;
    });
};
/**
 * @param {number[]} list
 * @param {number | null | undefined} id
 */
const pushFaction = (list, id) => (id == null ? list : [id, ...list.filter((f) => f !== id)].slice(0, MAX_RECENT_FACTIONS));

/**
 * @param {AppState['scopes']} scopes
 * @returns {AppState['scopes']}
 */
function swapScopes(scopes) {
  /** @type {AppState['scopes']} */
  const out = {};
  if ('A' in scopes) out.B = scopes.A;
  if ('B' in scopes) out.A = scopes.B;
  return out;
}

/**
 * @param {AppState} state
 * @param {Side} side
 * @param {import('../types.js').Selection} sel
 * @returns {AppState}
 */
const setSide = (state, side, sel) => ({...state, matchup: {...state.matchup, [side]: sel}});

// The open picker with `patch` applied (a patch, or a function of the picker
// as it is); no picker, no change.
/** @typedef {NonNullable<UiState['picker']>} Picker */
/**
 * @param {AppState} state
 * @param {Partial<Picker> | ((picker: Picker) => Partial<Picker>)} patch
 * @returns {AppState}
 */
function patchPicker(state, patch) {
  const picker = state.ui.picker;
  if (!picker) return state;
  return {...state, ui: {...state.ui, picker: {...picker, ...(typeof patch === 'function' ? patch(picker) : patch)}}};
}
// Back at the top of the picker's list, with the arrow keys on it.
const LIST_TOP = /** @type {const} */ ({pane: 'list', lcursor: 0});

/**
 * @param {AppState} state
 * @param {import('../types.js').Action} action
 * @returns {AppState}
 */
export function reduce(state, action) {
  const {ui, matchup} = state;
  switch (action.type) {
    // Whole document, e.g. a fixture (src/ui/fixtures). Missing slices get
    // their defaults; this device's prefs and lists stay unless given.
    case 'replace': {
      const base = initialState();
      const next = action.state;
      return {
        ...base,
        ...next,
        matchup: {...base.matchup, ...next.matchup},
        classic: {...base.classic, ...next.classic},
        ui: {...EMPTY_UI, ...next.ui},
        prefs: next.prefs ?? state.prefs,
        lists: next.lists ?? state.lists,
        scopes: next.scopes ?? {},
      };
    }

    case 'setMode':
      if (!Object.values(MODES).includes(/** @type {string} */ (action.mode))) return state;
      return {...state, mode: action.mode, ui: {...EMPTY_UI}};

    // --- matchup
    case 'setSide':
      return setSide(state, action.side, {...EMPTY_SIDE, ...action.sel});
    case 'patchSide':
      return setSide(state, action.side, {...matchup[action.side], ...action.patch});
    // Cover or, for Sapper, the Foxhole (its own cover): one or the other.
    case 'setCover':
      return setSide(state, action.side, {...matchup[action.side], inCover: Boolean(action.on), sapper: false});
    case 'setSapper':
      return setSide(state, action.side, {...matchup[action.side], sapper: Boolean(action.on), inCover: false});
    // A weapon button. Picking a CC weapon moves the range to the closest
    // band (0-8"): whoever shoots at a trooper charging into CC almost always
    // does so from there (Alex, 2026-10-19). The CC side has no range, so a
    // split range closes on both. Any other pick drops Berserk (a CC Attack).
    // A Zone of Control weapon (Jammer) reaches 8", so it closes the range too.
    // `kind`: the picked entry's kind (army/weapons.js WEAPON_KINDS).
    case 'pickWeapon': {
      const cc = action.kind === 'cc';
      const next = setSide(state, action.side, {...matchup[action.side], weaponKey: action.key, ...(!cc && {berserk: false})});
      if (!cc && !action.zoc) return next;
      const close = RANGE_BANDS[0].to;
      return {...next, matchup: {...next.matchup, rangeCm: close, ...(matchup.rangeCmB != null && {rangeCmB: close})}};
    }
    // side 'B' sets the reactive's own distance (only once the range is split).
    case 'setRange': {
      const key = /** @type {'rangeCmB' | 'rangeCm'} */ (action.side === 'B' && matchup.rangeCmB != null ? 'rangeCmB' : 'rangeCm');
      return {
        ...state,
        matchup: {...matchup, [key]: action.rangeCm},
        ui: action.open === undefined ? ui : {...ui, rangeOpen: action.open},
      };
    }
    // Splitting starts the reactive at the shared distance; joining keeps the active's.
    case 'setRangeSplit':
      return {...state, matchup: {...matchup, rangeCmB: action.on ? matchup.rangeCm : null}};
    case 'setZone':
      return {...state, matchup: {...matchup, [action.zone]: Boolean(action.on)}};
    case 'setRangeOpen':
      return {...state, ui: {...ui, rangeOpen: action.open}};
    // "No ARO" only exists on the reactive side: drop it so the new active side
    // falls back to its default weapon (Dodge is valid on both). Surprise
    // Attack and Berserk are the active side's, so they don't follow a trooper
    // to reactive.
    case 'swapSides':
      return {
        ...state,
        matchup: {
          ...matchup,
          A: {...matchup.B, weaponKey: matchup.B.weaponKey === 'none' ? null : matchup.B.weaponKey},
          B: {...matchup.A, surpriseAttack: false, berserk: false},
          // A split range follows the troopers too.
          ...(matchup.rangeCmB != null && {rangeCm: matchup.rangeCmB, rangeCmB: matchup.rangeCm}),
        },
        // Each side's faction follows its trooper.
        scopes: swapScopes(state.scopes ?? {}),
        ui: {...ui, edit: null},
      };
    // Clearing the troopers also forgets each side's faction.
    case 'clearSides':
      return {...state, matchup: {...matchup, A: {...EMPTY_SIDE}, B: {...EMPTY_SIDE}}, scopes: {}, ui: {...ui, edit: null}};
    case 'setEdit':
      return {...state, ui: {...ui, edit: action.edit}};

    // --- classic calculator
    case 'setClassic':
      return {...state, classic: {...state.classic, [action.key]: action.value}};
    // A matchup's Face to Face Roll copied into the classic calculator, every
    // number worked out, so the player can tweak it by hand. The matchup stays.
    case 'openInClassic':
      return {...state, mode: MODES.basic, classic: fullParams(action.params), ui: {...EMPTY_UI}};
    case 'setClassicSave':
      return {...state, classic: classicSave(state.classic, action.side, action.which, action.total)};

    // --- overlays and navigation
    case 'openOverlay':
      return {...state, ui: {...ui, overlay: action.overlay, picker: null, rangeOpen: false, edit: null}};
    case 'back':
      return uiDepth(ui) ? {...state, ui: back(ui)} : state;
    // Browser Back (sync.js): close layers until only `depth` are left.
    case 'backTo': {
      let next = ui;
      while (uiDepth(next) > action.depth) next = back(next);
      return next === ui ? state : {...state, ui: next};
    }

    // --- saved rolls, settings
    // Saving the same setup twice keeps one copy, the newest on top.
    case 'saveRoll': {
      const key = setupKey(action.roll.mode, action.roll.setup);
      const rest = state.lists.saved.filter((r) => setupKey(r.mode, r.setup) !== key);
      return {...state, lists: {...state.lists, saved: [action.roll, ...rest]}};
    }
    case 'deleteRoll':
      return {...state, lists: {...state.lists, saved: state.lists.saved.filter((r) => r.id !== action.id)},
        ui: {...ui, swiped: null}};
    case 'loadRoll': {
      const roll = state.lists.saved.find((r) => r.id === action.id);
      if (!roll) return state;
      const setup = normalizeSetup(roll.mode, roll.setup);
      // normalizeSetup returns the mode's own slice.
      const slice = roll.mode === MODES.matchup ? {matchup: /** @type {import('../types.js').Matchup} */ (setup), scopes: {}} : {classic: /** @type {import('../types.js').Params} */ (setup)};
      return {...state, mode: roll.mode, ...slice, ui: {...EMPTY_UI}};
    }
    case 'setSavedTab':
      return {...state, ui: {...ui, savedTab: action.tab, swiped: null}};
    case 'setSwiped':
      return {...state, ui: {...ui, swiped: action.id}};
    case 'clearRecents':
      return {...state, lists: {...state.lists, recents: [], recentFactions: []}};
    case 'clearSaved':
      return {...state, lists: {...state.lists, saved: []}};
    case 'setPref':
      return {...state, prefs: {...state.prefs, [action.key]: action.value}};
    case 'toast':
      return {...state, ui: {...ui, toast: action.text ? {text: action.text} : null}};

    // --- trooper picker
    case 'openPicker':
      return {
        ...state,
        ui: {...ui, overlay: 'picker', rangeOpen: false, edit: null,
          picker: {side: action.side, query: '', scope: action.scope ?? null, stack: []}},
      };
    // A new query starts again at the top of the list.
    case 'pickerQuery':
      return patchPicker(state, {query: action.query, cursor: 0, ...LIST_TOP, profileId: null});
    // Desktop picker: the highlighted list row and loadout, which pane has the
    // arrow keys, the profile tab.
    case 'pickerCursor':
      return patchPicker(state, action.cursor);
    case 'pickerSide':
      return patchPicker(state, {side: action.side, scope: action.scope ?? null, cursor: null, ...LIST_TOP, profileId: null, stack: []});
    // Choosing a faction from the faction list also leaves that list.
    case 'pickerScope': {
      if (!ui.picker) return state;
      const top = ui.picker.stack.at(-1);
      const stack = top?.view === 'factions' ? ui.picker.stack.slice(0, -1) : ui.picker.stack;
      return {
        ...state,
        ui: {...ui, picker: {...ui.picker, scope: action.scope, stack, cursor: null, ...LIST_TOP}},
        scopes: {...state.scopes, [ui.picker.side]: action.scope},
        lists: {...state.lists, recentFactions: pushFaction(state.lists.recentFactions, action.scope)},
      };
    }
    case 'pickerPush':
      return patchPicker(state, (p) => ({stack: [...p.stack, action.view], cursor: 0, ...LIST_TOP}));
    // The picked trooper goes into its side (fireteam size kept), joins
    // the recents, and the picker closes; with `next` it moves on to the other
    // side instead (desktop "Use, then pick Reactive").
    case 'pickTrooper': {
      // Cover and Foxhole come with the new trooper (actions.js); fireteam size is kept.
      const {inCover, ftSize} = matchup[action.side];
      /** @type {UiState['picker']} */
      const picker = action.next && ui.picker
        ? {...ui.picker, side: other(action.side), scope: action.nextScope ?? null, query: '', stack: [], cursor: null, ...LIST_TOP, profileId: null}
        : null;
      return {
        ...setSide(state, action.side, {...EMPTY_SIDE, ...action.sel, inCover: action.sel?.inCover ?? inCover, ftSize: fireteamSize(ftSize, action.ftMax ?? FIRETEAM_MAX)}),
        scopes: action.scope === undefined ? state.scopes : {...state.scopes, [action.side]: action.scope},
        ui: picker ? {...ui, picker} : {...ui, overlay: null, picker: null},
        lists: action.recent ? {...state.lists, recents: pushRecent(state.lists.recents, {...action.recent, side: action.side})} : state.lists,
      };
    }

    default:
      return state;
  }
}
