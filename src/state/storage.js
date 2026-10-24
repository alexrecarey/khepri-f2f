// The persisted slices of the state document (mode, prefs, lists, scopes) in
// localStorage, under one versioned key. Reads the mode the old calculator
// kept (calculatorMode) once, when the new key isn't there yet.
// `storage` is anything with getItem/setItem (localStorage; a Map-like in tests).
import {MODES} from './modes.js';
import {MAX_RECENTS, STATE_VERSION} from './schema.js';

export const STORAGE_KEY = 'itc.state';

// window.localStorage, or null where it is blocked (private mode, sandboxed
// iframes): then nothing persists.
export function browserStorage() {
  try {
    return typeof window === 'undefined' ? null : window.localStorage;
  } catch {
    return null;
  }
}
const LEGACY_MODE = 'calculatorMode';

/** Anything with getItem/setItem: localStorage, or a Map-like in tests.
 * @typedef {Pick<Storage, 'getItem' | 'setItem'>} StorageLike */
/** What JSON.parse can give.
 * @typedef {Record<string, unknown> | unknown[] | string | number | boolean | null | undefined} Json */

/**
 * @param {StorageLike} storage
 * @param {string} key
 * @returns {Json}
 */
const readJson = (storage, key) => {
  try {
    const raw = storage.getItem(key);
    return raw == null ? undefined : JSON.parse(raw);
  } catch {
    return undefined;
  }
};

/**
 * @param {unknown} x
 * @returns {x is Record<string, unknown>}
 */
const isObject = (x) => x !== null && typeof x === 'object' && !Array.isArray(x);
/**
 * @param {unknown} x
 * @param {unknown[]} [fallback]
 * @returns {unknown[]}
 */
const arrayOr = (x, fallback = []) => (Array.isArray(x) ? x : fallback);

// Whatever was stored -> {mode?, prefs, lists}, dropping anything malformed.
/**
 * @param {StorageLike | null} storage
 * @returns {{scopes: import('../types.js').AppState['scopes'], mode?: string, prefs: import('../types.js').Prefs, lists: import('../types.js').AppState['lists']}}
 */
export function loadPersisted(storage) {
  let saved = storage ? readJson(storage, STORAGE_KEY) : undefined;
  if (!isObject(saved)) {
    // Older builds: jotai's atomWithStorage kept the mode as a JSON string.
    const mode = storage ? readJson(storage, LEGACY_MODE) : undefined;
    saved = {v: STATE_VERSION, mode};
  }
  const lists = isObject(saved.lists) ? saved.lists : {};
  /** @type {import('../types.js').AppState['scopes']} */
  const scopes = {};
  for (const side of /** @type {import('../types.js').Side[]} */ (['A', 'B'])) {
    const v = isObject(saved.scopes) ? saved.scopes[side] : undefined;
    // null or an integer: checked just above.
    if (v === null || Number.isInteger(v)) scopes[side] = /** @type {number | null} */ (v);
  }
  return {
    scopes,
    // What was stored is only checked for shape: each list's items are
    // objects (or integers) of the kind the state keeps there.
    ...(Object.values(MODES).includes(/** @type {string} */ (saved.mode)) ? {mode: /** @type {string} */ (saved.mode)} : {}),
    prefs: isObject(saved.prefs) ? /** @type {import('../types.js').Prefs} */ (saved.prefs) : {},
    lists: {
      recents: /** @type {import('../types.js').Recent[]} */ (arrayOr(lists.recents).filter(isObject).slice(0, MAX_RECENTS * 2)),
      recentFactions: /** @type {number[]} */ (arrayOr(lists.recentFactions).filter(Number.isInteger)),
      // A saved roll needs its setup to load and its summary to list.
      saved: /** @type {import('../types.js').SavedRoll[]} */ (arrayOr(lists.saved).filter((r) => isObject(r) && isObject(r.setup) && isObject(r.summary))),
    },
  };
}

/** @param {import('../types.js').AppState} state */
export const persistedSlice = (state) => ({v: STATE_VERSION, mode: state.mode, prefs: state.prefs, lists: state.lists, scopes: state.scopes});

/**
 * @param {StorageLike} storage
 * @param {import('../types.js').AppState} state
 */
export function savePersisted(storage, state) {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(persistedSlice(state)));
  } catch {
    // Private mode or full storage: keep it in memory for this visit.
  }
}
