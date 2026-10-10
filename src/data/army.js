// The army data (src/army/army.json, ~7.5 MB) is static reference data, not
// state: loaded once, on first use, and shared by everything that needs it.
import {useCallback, useEffect, useState} from 'react';
import {lazyOnce} from '../lib/lazyOnce.js';
import {searchKey} from '../lib/searchKey.js';

let army = null;

export const loadArmy = lazyOnce(() => import('../army/army.json').then((m) => {
    // List units by the short ISC ("Taguraida", not "Taguraida, JSA TAG
    // Support Pilots"), keeping the full one where short names collide.
    const short = (u) => u.isc.split(',')[0].trim();
    const counts = new Map();
    for (const u of m.default.units) counts.set(short(u), (counts.get(short(u)) ?? 0) + 1);
    const units = m.default.units
      .map((u) => {
        const label = counts.get(short(u)) > 1 ? u.isc : short(u);
        return {...u, label, search: searchKey(label)};
      })
      .sort((a, b) => a.label.localeCompare(b.label));
    army = {...m.default, units};
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

export const getArmy = () => army;
