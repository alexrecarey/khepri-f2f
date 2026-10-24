// Keeps the browser in step with the state document:
//   URL      replaced with the shareable slices on every change (url.js)
//   history  one entry per open layer (reduce.js uiDepth), so Back closes the
//            picker, a sheet or the menu instead of leaving the app
//   storage  the persisted slices, written shortly after a change (storage.js),
//            and at once when the page is hidden or closed, so a Save just
//            before closing the app isn't lost
import {uiDepth} from './reduce.js';
import {savePersisted} from './storage.js';
import {urlFromState} from './url.js';

/**
 * What the sync reads of the window; a test fakes it (state.test.mjs).
 * @typedef {{location: {pathname: string, search: string, hash: string},
 *   history: {pushState(data: unknown, unused: string, url?: string | null): void, replaceState(data: unknown, unused: string, url?: string | null): void, go(delta?: number): void},
 *   addEventListener(type: string, listener: (e: PopStateEvent) => void): void,
 *   removeEventListener(type: string, listener: (e: PopStateEvent) => void): void,
 *   document?: {visibilityState: string, addEventListener(type: string, listener: () => void): void, removeEventListener(type: string, listener: () => void): void}}} SyncWindow
 */

/**
 * @param {import('@tanstack/store').Store<import('../types.js').AppState>} store
 * @param {(action: import('../types.js').Action) => void} dispatch
 * @param {{win?: SyncWindow, storage?: import('./storage.js').StorageLike | null}} [env]
 */
export function startSync(store, dispatch, {win = window, storage = null} = {}) {
  /** @param {import('../types.js').AppState} state */
  const urlOf = (state) => `${win.location.pathname}${urlFromState(state)}${win.location.hash}`;
  let depth = 0;
  // A path other than / (old routes) lands on the calculator.
  win.history.replaceState({depth: 0}, '', urlOf(store.get()).replace(/^[^?]*/, '/'));

  /** @param {import('../types.js').AppState} state */
  const apply = (state) => {
    const want = uiDepth(state.ui);
    const url = urlOf(state);
    if (want > depth) {
      for (let d = depth + 1; d <= want; d++) win.history.pushState({depth: d}, '', url);
    } else if (want < depth) {
      // Closed from inside the app: step history back to match. The popstate
      // that follows finds the document already at that depth.
      win.history.go(want - depth);
    } else if (`${win.location.pathname}${win.location.search}${win.location.hash}` !== url) {
      win.history.replaceState({depth}, '', url);
    }
    depth = want;
  };

  /** @param {PopStateEvent} e */
  const onPop = (e) => {
    const target = Number(e.state?.depth ?? 0);
    depth = target;
    if (uiDepth(store.get().ui) > target) dispatch({type: 'backTo', depth: target});
    // History entries keep the URL they were pushed with; show the current setup.
    win.history.replaceState({depth: target}, '', urlOf(store.get()));
  };
  win.addEventListener('popstate', onPop);

  /** @type {ReturnType<typeof setTimeout> | null} */
  let saveTimer = null;
  let last = store.get();
  const {unsubscribe} = store.subscribe((state) => {
    if (state === last) return;
    const persistedChanged = state.mode !== last.mode || state.prefs !== last.prefs || state.lists !== last.lists
      || state.scopes !== last.scopes;
    last = state;
    apply(state);
    if (storage && persistedChanged) {
      // A null timer clears nothing.
      clearTimeout(/** @type {ReturnType<typeof setTimeout>} */ (saveTimer));
      saveTimer = setTimeout(() => {
        saveTimer = null;
        savePersisted(storage, store.get());
      }, 200);
    }
  });
  apply(store.get());
  if (storage) savePersisted(storage, store.get());

  const flush = () => {
    if (saveTimer == null) return;
    clearTimeout(saveTimer);
    saveTimer = null;
    savePersisted(/** @type {import('./storage.js').StorageLike} */ (storage), store.get());
  };
  const onHidden = () => { if (win.document?.visibilityState === 'hidden') flush(); };
  win.addEventListener('pagehide', flush);
  win.document?.addEventListener('visibilitychange', onHidden);

  return () => {
    unsubscribe();
    win.removeEventListener('popstate', onPop);
    win.removeEventListener('pagehide', flush);
    win.document?.removeEventListener('visibilitychange', onHidden);
    clearTimeout(/** @type {ReturnType<typeof setTimeout>} */ (saveTimer));
  };
}
