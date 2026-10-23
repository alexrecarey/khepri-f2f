// load(key)'s value for React, for data that loads once per key on first use
// (the army data and the search index, one per language). While another key
// loads, the last value stays on screen. A failure is kept for its key, so it
// isn't retried in a loop; retry() loads it again. `load` is a module-level
// lazyOnce loader (lib/lazyOnce.js), so a loaded key costs nothing.
import {useCallback, useEffect, useState} from 'react';

export function useLazy(load, key, enabled = true) {
  // valueKey: the key `value` is for; errorKey: the one that failed.
  const [state, setState] = useState({value: null, valueKey: null, error: null, errorKey: null});
  const {valueKey, error, errorKey} = state;
  useEffect(() => {
    if (!enabled || valueKey === key || (error && errorKey === key)) return undefined;
    let live = true;
    load(key).then(
      (value) => live && setState({value, valueKey: key, error: null, errorKey: null}),
      (e) => live && setState((s) => ({...s, error: e, errorKey: key})),
    );
    return () => { live = false; };
  }, [load, key, enabled, valueKey, error, errorKey]);
  // Clearing the error runs the effect again.
  const retry = useCallback(() => setState((s) => ({...s, error: null})), []);
  return {value: state.value, error: state.error, retry};
}
