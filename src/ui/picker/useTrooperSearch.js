// Loads the search index (src/search/index.json, built from army.json) the
// first time the picker is needed, and keeps recent picks in localStorage.
import {useCallback, useEffect, useState} from 'react';
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

const RECENTS_KEY = 'recentTroopers';
const MAX_RECENTS = 8;

// Recent picks, newest first, as stable army ids (not index row ids, which
// move whenever the army data is rebuilt).
const read = () => {
  try {
    const list = JSON.parse(localStorage.getItem(RECENTS_KEY) ?? '[]');
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
};

export function useRecents() {
  const [recents, setRecents] = useState(read);
  const remember = useCallback((hit) => {
    const pick = {unitId: hit.unitId, groupId: hit.groupId, optionId: hit.optionId, armyFactionId: hit.armyFactionId};
    setRecents((list) => {
      const same = (p) => p.unitId === pick.unitId && p.groupId === pick.groupId && p.optionId === pick.optionId;
      const next = [pick, ...list.filter((p) => !same(p))].slice(0, MAX_RECENTS);
      try { localStorage.setItem(RECENTS_KEY, JSON.stringify(next)); } catch { /* private mode: keep in memory */ }
      return next;
    });
  }, []);
  return {recents, remember};
}
