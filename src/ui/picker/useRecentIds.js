// What both pickers need from the search index besides the search itself.
import {useMemo} from 'react';
import {recentsFor} from '../../state/schema.js';
import {useAppState} from '../../state/store.js';

// The side's recent picks as row ids in today's index (recents store real
// ids, row ids change with every army data rebuild).
/**
 * @param {import('../../types.js').Searcher | null} searcher
 * @param {import('../../types.js').Side} side
 * @returns {number[]}
 */
export function useRecentIds(searcher, side) {
  const recents = useAppState((s) => s.lists.recents);
  return useMemo(
    () => (searcher ? /** @type {number[]} */ (recentsFor(recents, side).map((r) => searcher.findRow(r)).filter((id) => id != null)) : []),
    [searcher, recents, side],
  );
}

// A vanilla faction's name.
/**
 * @param {import('../../types.js').Searcher | null} searcher
 * @param {number | null | undefined} id
 */
export const factionNameOf = (searcher, id) => searcher?.factions.find((f) => f.id === id)?.name ?? '';
