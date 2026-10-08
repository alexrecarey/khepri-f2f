// Every change to the state document is an action through reduce(). Pure: no
// army data, no storage, no DOM. Anything that needs the army data to build an
// action's payload (a picked trooper's weapon, the picker's starting faction)
// is worked out before dispatching, in actions.js.
import {LIMITS} from '../engine/params.js';
import {MODES} from '../ui/modes.js';
import {setupKey} from './rolls.js';
import {EMPTY_SIDE, EMPTY_UI, MAX_RECENT_FACTIONS, MAX_RECENTS, initialState} from './schema.js';

export const other = (side) => (side === 'A' ? 'B' : 'A');

// How many Back presses the open overlays take to close: the overlay itself,
// plus each screen pushed inside the picker. Browser history mirrors this
// (sync.js), so the phone's back gesture closes them one at a time.
export function uiDepth(ui) {
  if (!ui?.overlay) return 0;
  return 1 + (ui.overlay === 'picker' ? ui.picker?.stack?.length ?? 0 : 0);
}

// One step back: the top picker screen, else the overlay.
function back(ui) {
  if (ui.overlay === 'picker' && ui.picker?.stack?.length) {
    return {...ui, picker: {...ui.picker, stack: ui.picker.stack.slice(0, -1)}};
  }
  return {...ui, overlay: null, picker: null};
}

const sameTrooper = (a, b) => a.unitId === b.unitId && a.groupId === b.groupId && a.optionId === b.optionId;

const pushRecent = (list, pick) => [pick, ...list.filter((p) => !sameTrooper(p, pick))].slice(0, MAX_RECENTS);
const pushFaction = (list, id) => (id == null ? list : [id, ...list.filter((f) => f !== id)].slice(0, MAX_RECENT_FACTIONS));

const clamp = ([min, max], n) => Math.min(max, Math.max(min, n));

// Classic: the save the opponent makes against side s, as one number (the
// engine only reads PS + ARM and PS + BTS). Moves the weapon PS first and
// spills into the target's ARM past its limits; a Plasma BTS total below the
// PS lowers the PS and gives the difference to ARM, so the ARM total holds.
export function classicSave(c, s, which, total) {
  const t = other(s);
  const dmg = c[`damage${s}`];
  if (which === 'arm') {
    const armT = c[`arm${t}`];
    const want = clamp([0, LIMITS.damage[1] + LIMITS.arm[1]], total);
    const damage = clamp(LIMITS.damage, want - armT);
    return {...c, [`damage${s}`]: damage, [`arm${t}`]: clamp(LIMITS.arm, want - damage)};
  }
  const want = clamp([0, LIMITS.damage[1] + LIMITS.bts[1]], total);
  if (want >= dmg) return {...c, [`bts${t}`]: clamp(LIMITS.bts, want - dmg)};
  return {...c, [`damage${s}`]: want, [`arm${t}`]: clamp(LIMITS.arm, c[`arm${t}`] + dmg - want), [`bts${t}`]: 0};
}

function swapScopes(scopes) {
  const out = {};
  if ('A' in scopes) out.B = scopes.A;
  if ('B' in scopes) out.A = scopes.B;
  return out;
}

const setSide = (state, side, sel) => ({...state, matchup: {...state.matchup, [side]: sel}});

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
      if (!Object.values(MODES).includes(action.mode)) return state;
      return {...state, mode: action.mode, ui: {...EMPTY_UI}};

    // --- matchup
    case 'setSide':
      return setSide(state, action.side, {...EMPTY_SIDE, ...action.sel});
    case 'patchSide':
      return setSide(state, action.side, {...matchup[action.side], ...action.patch});
    case 'setRange':
      return {
        ...state,
        matchup: {...matchup, rangeCm: action.rangeCm},
        ui: action.open === undefined ? ui : {...ui, rangeOpen: action.open},
      };
    case 'setRangeOpen':
      return {...state, ui: {...ui, rangeOpen: action.open}};
    // "No ARO" only exists on the reactive side: drop it so the new active side
    // falls back to its default weapon (Dodge is valid on both). Surprise
    // Attack is the active side's, so it doesn't follow a trooper to reactive.
    case 'swapSides':
      return {
        ...state,
        matchup: {
          ...matchup,
          A: {...matchup.B, weaponKey: matchup.B.weaponKey === 'none' ? null : matchup.B.weaponKey},
          B: {...matchup.A, surpriseAttack: false},
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
      const slice = roll.mode === MODES.matchup ? {matchup: roll.setup, scopes: {}} : {classic: {...state.classic, ...roll.setup}};
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
      return ui.picker ? {...state, ui: {...ui, picker: {...ui.picker, query: action.query, cursor: 0, pane: 'list', lcursor: 0, profileId: null}}} : state;
    // Desktop picker: the highlighted list row and loadout, which pane has the
    // arrow keys, the profile tab.
    case 'pickerCursor':
      return ui.picker ? {...state, ui: {...ui, picker: {...ui.picker, ...action.cursor}}} : state;
    case 'pickerSide':
      return ui.picker ? {...state, ui: {...ui, picker: {...ui.picker, side: action.side, scope: action.scope ?? null,
        cursor: null, pane: 'list', lcursor: 0, profileId: null, stack: []}}} : state;
    // Choosing a faction from the faction list also leaves that list.
    case 'pickerScope': {
      if (!ui.picker) return state;
      const top = ui.picker.stack.at(-1);
      const stack = top?.view === 'factions' ? ui.picker.stack.slice(0, -1) : ui.picker.stack;
      return {
        ...state,
        ui: {...ui, picker: {...ui.picker, scope: action.scope, stack, cursor: null, pane: 'list', lcursor: 0}},
        scopes: {...state.scopes, [ui.picker.side]: action.scope},
        lists: {...state.lists, recentFactions: pushFaction(state.lists.recentFactions, action.scope)},
      };
    }
    case 'pickerPush':
      return ui.picker ? {...state, ui: {...ui, picker: {...ui.picker, stack: [...ui.picker.stack, action.view], cursor: 0, pane: 'list', lcursor: 0}}} : state;
    // The picked trooper goes into its side (cover and fireteam kept), joins
    // the recents, and the picker closes; with `next` it moves on to the other
    // side instead (desktop "Use, then pick Reactive").
    case 'pickTrooper': {
      const {inCover, ftSize} = matchup[action.side];
      const picker = action.next && ui.picker
        ? {...ui.picker, side: other(action.side), scope: action.nextScope ?? null, query: '', stack: [], cursor: null, pane: 'list', lcursor: 0, profileId: null}
        : null;
      return {
        ...setSide(state, action.side, {...EMPTY_SIDE, ...action.sel, inCover, ftSize}),
        scopes: action.scope === undefined ? state.scopes : {...state.scopes, [action.side]: action.scope},
        ui: picker ? {...ui, picker} : {...ui, overlay: null, picker: null},
        lists: action.recent ? {...state.lists, recents: pushRecent(state.lists.recents, action.recent)} : state.lists,
      };
    }

    default:
      return state;
  }
}
