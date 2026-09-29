import {useEffect, useRef, useState} from 'react';
import {woundsFor} from './previews.js';

// paramsKey -> wounds per order. Shared across both sides and all renders.
const cache = new Map();
const CACHE_MAX = 500;
const remember = (key, value) => {
  if (cache.size >= CACHE_MAX) cache.delete(cache.keys().next().value);
  cache.set(key, value);
};

const DEBOUNCE_MS = 250;

// candidates: previewCandidates() output (must be memoized by the caller).
// calculate: (params) => Promise<worker value>.
// Returns {[weaponKey]: number | 'pending' | null}.
export default function usePreviewWounds(candidates, calculate) {
  const [wounds, setWounds] = useState({});
  const generation = useRef(0);

  useEffect(() => {
    const gen = ++generation.current;
    const initial = {};
    const misses = [];
    for (const c of candidates) {
      if (!c.params) initial[c.weaponKey] = null;
      else if (cache.has(c.key)) initial[c.weaponKey] = cache.get(c.key);
      else {
        initial[c.weaponKey] = 'pending';
        misses.push(c);
      }
    }
    setWounds(initial);
    if (misses.length === 0 || !calculate) return undefined;

    const timer = setTimeout(async () => {
      // Sequential so the main calculation can interleave between previews.
      for (const c of misses) {
        if (generation.current !== gen) return;
        try {
          const value = await calculate(c.params);
          const w = woundsFor(value, c.side);
          remember(c.key, w);
          if (generation.current === gen) setWounds((prev) => ({...prev, [c.weaponKey]: w}));
        } catch (e) {
          console.warn('weapon preview failed', e);
          if (generation.current === gen) setWounds((prev) => ({...prev, [c.weaponKey]: null}));
        }
      }
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [calculate, candidates]);

  return wounds;
}
