// matchupView() for React: recomputed only when the matchup slice, the army
// data or the language changes, so typing in the picker or opening a sheet
// derives nothing.
import {useMemo} from 'react';
import {matchupView} from './matchupView.js';
import {useAppState} from './store.js';

export default function useMatchupView(army, t) {
  const matchup = useAppState((s) => s.matchup);
  return useMemo(() => matchupView(army, matchup, t), [army, matchup, t]);
}
