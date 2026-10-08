// The one place that knows the state lives in TanStack Store. Components read
// with useAppState(selector) and write with dispatch(action); the reducer,
// selectors and screens never import @tanstack/* (docs/plans/redesign.md, 3).
import {createStore} from '@tanstack/store';
import {useSelector} from '@tanstack/react-store';
import {reduce} from './reduce.js';
import {initialState} from './schema.js';
import {loadPersisted} from './storage.js';
import {stateFromUrl} from './url.js';

// First state: defaults, then what this device saved, then the URL (a share
// link wins over the remembered mode).
export function bootState({search = '', storage = null} = {}) {
  const base = initialState();
  const persisted = loadPersisted(storage);
  const fromUrl = stateFromUrl(search);
  return {
    ...base,
    ...persisted,
    ...fromUrl,
    lists: {...base.lists, ...persisted.lists},
    // A link with troopers brings its own sides: the remembered factions were
    // for other troopers.
    scopes: fromUrl.matchup ? {} : persisted.scopes,
  };
}

const browser = typeof window !== 'undefined';
const safeStorage = () => {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
};

export const store = createStore(browser ? bootState({search: window.location.search, storage: safeStorage()}) : initialState());

export const getState = () => store.get();
export const dispatch = (action) => store.setState((s) => reduce(s, action));

// `compare` (e.g. shallow from @tanstack/store, re-exported below) for
// selectors that build a new object each time.
export const useAppState = (selector, compare) => useSelector(store, selector, compare ? {compare} : undefined);

export {shallow} from '@tanstack/store';
