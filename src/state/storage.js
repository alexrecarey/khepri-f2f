// The persisted slices of the state document (mode, prefs, lists, scopes) in
// localStorage, under one versioned key. Reads the mode the old calculator
// kept (calculatorMode) once, when the new key isn't there yet.
// `storage` is anything with getItem/setItem (localStorage; a Map-like in tests).
import {parseOr} from '../lib/parse.js';
import {PersistedSchema, STATE_VERSION} from './schema.js';

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

// What loadPersisted gives when nothing readable was stored.
/** @type {import('valibot').InferOutput<typeof PersistedSchema>} */
const NOTHING = {prefs: {}, lists: {recents: [], recentFactions: [], saved: []}, scopes: {}};

// Whatever was stored -> {mode?, prefs, lists, scopes}, read through
// PersistedSchema: a bad field falls back, a bad list item is dropped.
/**
 * @param {StorageLike | null} storage
 * @returns {{scopes: import('../types.js').AppState['scopes'], mode?: string, prefs: import('../types.js').Prefs, lists: import('../types.js').AppState['lists']}}
 */
export function loadPersisted(storage) {
  const stored = storage ? readJson(storage, STORAGE_KEY) : undefined;
  // Older builds: jotai's atomWithStorage kept the mode as a JSON string.
  const legacy = () => ({mode: storage ? readJson(storage, LEGACY_MODE) : undefined});
  const {mode, ...rest} = parseOr(PersistedSchema, isObject(stored) ? stored : legacy(), NOTHING);
  return mode === undefined ? rest : {mode, ...rest};
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
