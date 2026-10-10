// What both pickers need from the search index besides the search itself.
import {useMemo} from 'react';
import {recentsFor} from '../../state/schema.js';
import {useAppState} from '../../state/store.js';

// The side's recent picks as row ids in today's index (recents store real
// ids, row ids change with every army data rebuild).
export function useRecentIds(searcher, side) {
  const recents = useAppState((s) => s.lists.recents);
  return useMemo(
    () => (searcher ? recentsFor(recents, side).map((r) => searcher.findRow(r)).filter((id) => id != null) : []),
    [searcher, recents, side],
  );
}

// A vanilla faction's name, or 'All factions' for none.
export const factionNameOf = (searcher, id) => searcher?.factions.find((f) => f.id === id)?.name ?? 'All factions';
