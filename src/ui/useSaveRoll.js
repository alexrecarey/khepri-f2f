// The results sheet's Save button: saves the current setup with a summary,
// or removes it when it is already saved.
import {useMemo} from 'react';
import {currentSetup, makeRoll, setupKey} from '../state/rolls.js';
import {dispatch, getState, useAppState} from '../state/store.js';

// summary: rolls.js matchupRollSummary / classicRollSummary, null = nothing to save yet.
// pending: a calculation is on its way, so the numbers on screen belong to the
// previous setup; the button stays (disabled, so nothing jumps) but saves
// nothing until it lands.
export default function useSaveRoll(summary, pending = false) {
  const mode = useAppState((s) => s.mode);
  const setup = useAppState(currentSetup);
  const saved = useAppState((s) => s.lists.saved);
  return useMemo(() => {
    if (!summary) return null;
    const key = setupKey(mode, setup);
    const existing = saved.find((r) => setupKey(r.mode, r.setup) === key);
    return {
      saved: Boolean(existing),
      pending,
      toggle: () => {
        if (pending) return;
        if (existing) {
          dispatch({type: 'deleteRoll', id: existing.id});
          dispatch({type: 'toast', text: 'Removed from saved rolls'});
        } else {
          dispatch({type: 'saveRoll', roll: makeRoll({mode, setup: currentSetup(getState()), summary})});
          dispatch({type: 'toast', text: 'Saved'});
        }
      },
    };
  }, [summary, pending, mode, setup, saved]);
}
