// What both results views (ResultsCard on the phone, ResultsPanel wider)
// derive from the summary before showing it: the headline choice and the
// headline, the best-die breakdown, the waiting-for state and the headline
// swipe. One place, so the sheet and the panel can't drift apart.
import {useMemo} from 'react';
import {dispatch, useAppState} from '../state/store.js';
import {headlineChoice, setHeadline} from '../state/headlines.js';
import {headline, nextHeadline} from '../results/headline.js';
import {faceToFaceBreakdown} from '../rules/bestDie.js';
import {useT} from './i18n.jsx';

// Before both troopers are picked: each side's number is its still, dimmed
// die, or Ready in its own colour once that side is chosen. Nothing moves;
// the empty slots above are what should catch the eye.
/** Which sides have a trooper (matchup), null in Classic.
 * @typedef {{A: boolean, B: boolean} | null} Picked */

/** @param {Picked | undefined} picked */
export const waitingFor = (picked) => (picked && !(picked.A && picked.B) ? picked : null);
/**
 * @param {{A: boolean, B: boolean}} picked
 * @param {import('../types.js').Translator} t
 */
export const waitMessage = (picked, t) => t(!picked.A && !picked.B ? 'results.chooseBoth'
  : !picked.A ? 'results.chooseActive' : 'results.chooseReactive');

// The best-die breakdown behind the face to face bar: Matchup only (it needs
// the troopers' names), and only for a real Face to Face Roll.
/**
 * @param {import('../types.js').Summary | null} s
 * @param {import('../types.js').MatchupView['ledger'] | undefined} ledger
 * @param {import('../types.js').Params | null | undefined} params
 */
const useBreakdown = (s, ledger, params) => useMemo(
  () => (s && ledger && !s.unopposed ? faceToFaceBreakdown(params) : null), [s, ledger, params]);

// s: results/summary.js summarize() of the engine's result, or null before
// there is one. ledger: {ledger, names, labels}; matchup only. params: the
// engine params (who is dodging, for the headline's label). picked: {A, B},
// which sides have a trooper; matchup only.
// Returns {choice, h, b, wait, swipe}: the headline choice (state/headlines.js),
// the headline (results/headline.js) or null without a result, the breakdown
// or null, the sides still to pick or null, and swipe(step) for the next headline.
/**
 * @param {{s: import('../types.js').Summary | null, ledger?: import('../types.js').MatchupView['ledger'], params?: import('../types.js').Params | null, picked?: Picked}} props
 */
export default function useResultsView({s, ledger, params, picked}) {
  const t = useT();
  const choice = useAppState((st) => headlineChoice(st.prefs));
  const h = s ? headline(s, choice, params, ledger?.ledger, t) : null;
  const b = useBreakdown(s, ledger, params);
  const wait = waitingFor(picked);
  /** @param {number} step */
  const swipe = (step) => dispatch(setHeadline(nextHeadline(choice, step)));
  return {choice, h, b, wait, swipe};
}
