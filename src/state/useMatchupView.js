// matchupView() for React: the rules (matchupCore) are recomputed only when
// the matchup slice or the army data changes, the wording (renderMatchup)
// also when the language does. Typing in the picker or opening a sheet
// derives nothing; switching language re-derives nothing.
import {useMemo} from 'react';
import {matchupCore, renderMatchup} from './matchupView.js';
import {useAppState} from './store.js';

export default function useMatchupView(army, t) {
  const matchup = useAppState((s) => s.matchup);
  const core = useMemo(() => matchupCore(army, matchup), [army, matchup]);
  return useMemo(() => renderMatchup(core, t), [core, t]);
}
