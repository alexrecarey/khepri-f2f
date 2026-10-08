// The army data (src/army/army.json, ~7.5 MB) is static reference data, not
// state: loaded once, on first use, and shared by everything that needs it.
import {useEffect, useState} from 'react';
import {searchKey} from '../lib/searchKey.js';

let armyPromise = null;
let army = null;

export function loadArmy() {
  armyPromise ??= import('../army/army.json').then((m) => {
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
  });
  return armyPromise;
}

// The army once loaded (null until then); starts loading when `enabled`.
export function useArmy(enabled = true) {
  const [state, setState] = useState({army, error: null});
  useEffect(() => {
    if (!enabled || state.army) return undefined;
    let live = true;
    loadArmy().then((a) => live && setState({army: a, error: null}), (error) => live && setState({army: null, error}));
    return () => { live = false; };
  }, [enabled, state.army]);
  return state;
}

export const getArmy = () => army;
