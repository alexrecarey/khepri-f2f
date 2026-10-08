// The persisted slices of the state document (mode, prefs, lists, scopes) in
// localStorage, under one versioned key. Reads the keys older builds used
// (calculatorMode, recentTroopers) once, when the new key isn't there yet.
// `storage` is anything with getItem/setItem (localStorage; a Map-like in tests).
import {MODES} from '../ui/modes.js';
import {MAX_RECENTS, STATE_VERSION} from './schema.js';

export const STORAGE_KEY = 'itc.state';
const LEGACY_MODE = 'calculatorMode';
const LEGACY_RECENTS = 'recentTroopers';

const readJson = (storage, key) => {
  try {
    const raw = storage.getItem(key);
    return raw == null ? undefined : JSON.parse(raw);
  } catch {
    return undefined;
  }
};

const isObject = (x) => x !== null && typeof x === 'object' && !Array.isArray(x);
const arrayOr = (x, fallback = []) => (Array.isArray(x) ? x : fallback);

// Whatever was stored -> {mode?, prefs, lists}, dropping anything malformed.
export function loadPersisted(storage) {
  let saved = storage ? readJson(storage, STORAGE_KEY) : undefined;
  if (!isObject(saved)) {
    // Older builds: jotai's atomWithStorage kept the mode as a JSON string.
    const mode = storage ? readJson(storage, LEGACY_MODE) : undefined;
    const recents = storage ? readJson(storage, LEGACY_RECENTS) : undefined;
    saved = {v: STATE_VERSION, mode, lists: {recents}};
  }
  const lists = isObject(saved.lists) ? saved.lists : {};
  const scopes = {};
  for (const side of ['A', 'B']) {
    const v = isObject(saved.scopes) ? saved.scopes[side] : undefined;
    if (v === null || Number.isInteger(v)) scopes[side] = v;
  }
  return {
    scopes,
    ...(Object.values(MODES).includes(saved.mode) ? {mode: saved.mode} : {}),
    prefs: isObject(saved.prefs) ? saved.prefs : {},
    lists: {
      recents: arrayOr(lists.recents).filter(isObject).slice(0, MAX_RECENTS),
      recentFactions: arrayOr(lists.recentFactions).filter(Number.isInteger),
      saved: arrayOr(lists.saved).filter(isObject),
    },
  };
}

export const persistedSlice = (state) => ({v: STATE_VERSION, mode: state.mode, prefs: state.prefs, lists: state.lists, scopes: state.scopes});

export function savePersisted(storage, state) {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(persistedSlice(state)));
  } catch {
    // Private mode or full storage: keep it in memory for this visit.
  }
}
