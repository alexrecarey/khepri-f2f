// The army data (src/army/army.json, ~7.5 MB) is static reference data, not
// state: loaded once, on first use, and shared by everything that needs it.
import {useCallback, useEffect, useState} from 'react';
import {lazyOnce} from '../lib/lazyOnce.js';

let army = null;

export const loadArmy = lazyOnce(() => import('../army/army.json').then((m) => {
  army = m.default;
  return army;
}));

// The army once loaded (null until then); starts loading when `enabled`.
// After a failure, retry() loads it again.
export function useArmy(enabled = true) {
  const [state, setState] = useState({army, error: null});
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (!enabled || state.army) return undefined;
    let live = true;
    loadArmy().then((a) => live && setState({army: a, error: null}), (error) => live && setState({army: null, error}));
    return () => { live = false; };
  }, [enabled, state.army, attempt]);
  const retry = useCallback(() => {
    setState({army: null, error: null});
    setAttempt((n) => n + 1);
  }, []);
  return {...state, retry};
}

