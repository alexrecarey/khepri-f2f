// Every change to the state document is an action through reduce(). Pure: no
// army data, no storage, no DOM. Anything that needs the army data to build an
// action's payload (a picked trooper's weapon, the picker's starting faction)
// is worked out before dispatching, in actions.js.
import {MODES} from '../ui/modes.js';
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

const setSide = (state, side, sel) => ({...state, matchup: {...state.matchup, [side]: sel}});

export function reduce(state, action) {
  const {ui, matchup} = state;
  switch (action.type) {
    // Whole document, e.g. a fixture in development.
    case 'replace':
      return {...initialState(), ...action.state, ui: {...EMPTY_UI, ...action.state.ui}};

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
        ui: {...ui, edit: null},
      };
    case 'clearSides':
      return {...state, matchup: {...matchup, A: {...EMPTY_SIDE}, B: {...EMPTY_SIDE}}, ui: {...ui, edit: null}};
    case 'setEdit':
      return {...state, ui: {...ui, edit: action.edit}};

    // --- classic calculator
    case 'setClassic':
      return {...state, classic: {...state.classic, [action.key]: action.value}};

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

    // --- trooper picker
    case 'openPicker':
      return {
        ...state,
        ui: {...ui, overlay: 'picker', rangeOpen: false, edit: null,
          picker: {side: action.side, query: '', scope: action.scope ?? null, stack: []}},
      };
    case 'pickerQuery':
      return ui.picker ? {...state, ui: {...ui, picker: {...ui.picker, query: action.query}}} : state;
    // Choosing a faction from the faction list also leaves that list.
    case 'pickerScope': {
      if (!ui.picker) return state;
      const top = ui.picker.stack.at(-1);
      const stack = top?.view === 'factions' ? ui.picker.stack.slice(0, -1) : ui.picker.stack;
      return {
        ...state,
        ui: {...ui, picker: {...ui.picker, scope: action.scope, stack}},
        lists: {...state.lists, recentFactions: pushFaction(state.lists.recentFactions, action.scope)},
      };
    }
    case 'pickerPush':
      return ui.picker ? {...state, ui: {...ui, picker: {...ui.picker, stack: [...ui.picker.stack, action.view]}}} : state;
    // The picked trooper goes into its side (cover kept), joins the recents,
    // and the picker closes.
    case 'pickTrooper': {
      const keep = {inCover: matchup[action.side].inCover};
      return {
        ...setSide(state, action.side, {...EMPTY_SIDE, ...action.sel, ...keep}),
        ui: {...ui, overlay: null, picker: null},
        lists: action.recent ? {...state.lists, recents: pushRecent(state.lists.recents, action.recent)} : state.lists,
      };
    }

    default:
      return state;
  }
}
