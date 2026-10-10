// Loads the search index (src/search/index.json, built from army.json) the
// first time it is needed: the Matchup screen asks for it on mount, so it is
// ready by the time the picker opens. Recent picks are in the state document
// (lists.recents).
import {useCallback, useEffect, useState} from 'react';
import {lazyOnce} from '../../lib/lazyOnce.js';
import {createSearch} from '../../search/search.js';

const loadSearcher = lazyOnce(() => import('../../search/index.json').then((m) => createSearch(m.default)));

// {searcher, error, retry}: searcher is null until loaded; after a failure,
// error is set and retry() loads it again.
export function useSearcher(enabled) {
  const [state, setState] = useState({searcher: null, error: null});
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (!enabled) return undefined;
    let live = true;
    loadSearcher().then(
      (searcher) => live && setState({searcher, error: null}),
      (error) => live && setState({searcher: null, error}),
    );
    return () => { live = false; };
  }, [enabled, attempt]);
  const retry = useCallback(() => {
    setState({searcher: null, error: null});
    setAttempt((n) => n + 1);
  }, []);
  return {...state, retry};
}
