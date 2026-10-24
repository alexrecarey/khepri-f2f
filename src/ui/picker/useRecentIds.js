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

// A vanilla faction's name, or 'All factions' for none.
/**
 * @param {import('../../types.js').Searcher | null} searcher
 * @param {number | null | undefined} id
 * @param {import('../../types.js').Translator} t
 */
export const factionNameOf = (searcher, id, t) => searcher?.factions.find((f) => f.id === id)?.name ?? t('picker.allFactions');
