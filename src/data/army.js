// The army data is static reference data, not state: loaded once per
// language, on first use, and shared by everything that needs it. It ships
// as a language-neutral core plus one names file per language
// (src/army/localize.js), so a player only downloads their own language's
// names; the English ones are split out of army.json at build time
// (vite.config.js).
import {useCallback, useEffect, useState} from 'react';
import {lazyOnce} from '../lib/lazyOnce.js';
import {withNames} from '../army/localize.js';

const loadCore = lazyOnce(() => import('virtual:army-core').then((m) => m.default));
const NAMES = {
  en: () => import('virtual:army-names-en'),
  es: () => import('../army/names.es.json'),
};
const loaders = Object.fromEntries(Object.entries(NAMES).map(([lang, load]) =>
  [lang, lazyOnce(() => Promise.all([loadCore(), load()]).then(([core, names]) => withNames(core, names.default)))]));

export const loadArmy = (lang) => (loaders[lang] ?? loaders.en)();

// The army in `lang` once loaded (null until the first one is); starts
// loading when `enabled`. While another language loads, the last one stays
// on screen. After a failure, retry() loads it again.
export function useArmy(enabled, lang) {
  const [state, setState] = useState({lang: null, army: null, error: null});
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (!enabled || (state.lang === lang && (state.army || state.error))) return undefined;
    let live = true;
    loadArmy(lang).then(
      (army) => live && setState({lang, army, error: null}),
      (error) => live && setState((s) => ({...s, lang, error})),
    );
    return () => { live = false; };
  }, [enabled, lang, state.lang, state.army, state.error, attempt]);
  const retry = useCallback(() => {
    setState((s) => ({...s, error: null}));
    setAttempt((n) => n + 1);
  }, []);
  return {army: state.army, error: state.error, retry};
}
