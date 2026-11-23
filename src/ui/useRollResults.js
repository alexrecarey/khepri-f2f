// What both screens do with the engine's result: summarize it once (results/summary.js),
// describe it for the saved-rolls list, and offer Save.
import {useMemo} from 'react';
import {summarize} from '../results/summary.js';
import useSaveRoll from './useSaveRoll.js';

// summaryOf(s): rolls.js matchupRollSummary / classicRollSummary for this
// setup, or null when there is nothing to save; memoise it (useCallback).
// targets: each side's target's wound states (Matchup), else null. params:
// the engine params, for who Dodges a Direct Template (summary.js).
/**
 * @param {{result: import('../types.js').EngineResult | null, targets?: import('../types.js').MatchupCore['targets'], params?: import('../types.js').Params | null,
 *   summaryOf: (s: import('../types.js').Summary) => import('../types.js').RollSummary | null, pending: boolean}} props
 */
export default function useRollResults({result, targets = null, params = null, summaryOf, pending}) {
  const s = useMemo(() => summarize(result, targets, params), [result, targets, params]);
  const summary = useMemo(() => (s ? summaryOf(s) : null), [s, summaryOf]);
  const save = useSaveRoll(summary, pending);
  return {s, save};
}
