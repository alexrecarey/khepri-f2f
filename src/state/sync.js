// Keeps the browser in step with the state document:
//   URL      replaced with the shareable slices on every change (url.js)
//   history  one entry per open layer (reduce.js uiDepth), so Back closes the
//            picker, a sheet or the menu instead of leaving the app
//   storage  the persisted slices, written shortly after a change (storage.js)
import {uiDepth} from './reduce.js';
import {savePersisted} from './storage.js';
import {urlFromState} from './url.js';

export function startSync(store, dispatch, {win = window, storage = null} = {}) {
  const urlOf = (state) => `${win.location.pathname}${urlFromState(state)}${win.location.hash}`;
  let depth = 0;
  // A path other than / (old routes) lands on the calculator.
  win.history.replaceState({depth: 0}, '', urlOf(store.get()).replace(/^[^?]*/, '/'));

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

  const onPop = (e) => {
    const target = Number(e.state?.depth ?? 0);
    depth = target;
    if (uiDepth(store.get().ui) > target) dispatch({type: 'backTo', depth: target});
    // History entries keep the URL they were pushed with; show the current setup.
    win.history.replaceState({depth: target}, '', urlOf(store.get()));
  };
  win.addEventListener('popstate', onPop);

  let saveTimer = null;
  let last = store.get();
  const {unsubscribe} = store.subscribe((state) => {
    if (state === last) return;
    const persistedChanged = state.mode !== last.mode || state.prefs !== last.prefs || state.lists !== last.lists;
    last = state;
    apply(state);
    if (storage && persistedChanged) {
      clearTimeout(saveTimer);
      saveTimer = setTimeout(() => savePersisted(storage, store.get()), 200);
    }
  });
  apply(store.get());
  if (storage) savePersisted(storage, store.get());

  return () => {
    unsubscribe();
    win.removeEventListener('popstate', onPop);
    clearTimeout(saveTimer);
  };
}
