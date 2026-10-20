// Loads the search index (src/search/index.json, built from army.json) the
// first time it is needed: the Matchup screen asks for it on mount, so it is
// ready by the time the picker opens. Recent picks are in the state document
// (lists.recents).
import {useCallback, useEffect, useState} from 'react';
import {lazyOnce} from '../../lib/lazyOnce.js';
import {createSearch} from '../../search/search.js';

// One index per language: unit, weapon and skill names are searched in the
// app's language (src/state/language.js).
const INDEXES = {
  en: () => import('../../search/index.json'),
  es: () => import('../../search/index.es.json'),
};
const searchers = Object.fromEntries(Object.entries(INDEXES).map(([lang, load]) =>
  [lang, lazyOnce(() => load().then((m) => createSearch(m.default)))]));
const loadSearcher = (lang) => (searchers[lang] ?? searchers.en)();

// {searcher, error, retry}: searcher is null until loaded; after a failure,
// error is set and retry() loads it again.
export function useSearcher(enabled, lang) {
  const [state, setState] = useState({searcher: null, error: null});
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (!enabled) return undefined;
    let live = true;
    loadSearcher(lang).then(
      (searcher) => live && setState({searcher, error: null}),
      (error) => live && setState({searcher: null, error}),
    );
    return () => { live = false; };
  }, [enabled, lang, attempt]);
  const retry = useCallback(() => {
    setState({searcher: null, error: null});
    setAttempt((n) => n + 1);
  }, []);
  return {...state, retry};
}
