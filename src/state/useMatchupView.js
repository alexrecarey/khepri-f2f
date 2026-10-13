// matchupView() for React: recomputed only when the matchup slice or the army
// data changes, so typing in the picker or opening a sheet derives nothing.
import {useMemo} from 'react';
import {matchupView} from './matchupView.js';
import {useAppState} from './store.js';

export default function useMatchupView(army) {
  const matchup = useAppState((s) => s.matchup);
  return useMemo(() => matchupView(army, matchup), [army, matchup]);
}
