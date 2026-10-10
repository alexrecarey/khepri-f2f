// What both screens do with the engine's result: summarize it once (results.js),
// describe it for the saved-rolls list, and offer Save.
import {useMemo} from 'react';
import {summarize} from './results.js';
import useSaveRoll from './useSaveRoll.js';

// summaryOf(s): rolls.js matchupRollSummary / classicRollSummary for this
// setup, or null when there is nothing to save; memoise it (useCallback).
// targets: each side's target's wound states (Matchup), else null.
export default function useRollResults({result, targets = null, summaryOf, pending}) {
  const s = useMemo(() => summarize(result, targets), [result, targets]);
  const summary = useMemo(() => (s ? summaryOf(s) : null), [s, summaryOf]);
  const save = useSaveRoll(summary, pending);
  return {s, save};
}
