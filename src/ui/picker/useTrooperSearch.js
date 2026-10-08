// Loads the search index (src/search/index.json, built from army.json) the
// first time the picker is needed. Recent picks are in the state document
// (lists.recents).
import {useEffect, useState} from 'react';
import {createSearch} from '../../search/search.js';

let searcherPromise = null;
const loadSearcher = () => {
  searcherPromise ??= import('../../search/index.json').then((m) => createSearch(m.default));
  return searcherPromise;
};

export function useSearcher(enabled) {
  const [searcher, setSearcher] = useState(null);
  useEffect(() => {
    if (!enabled) return;
    let live = true;
    loadSearcher().then((s) => { if (live) setSearcher(s); });
    return () => { live = false; };
  }, [enabled]);
  return searcher;
}
