// Phone results: one sheet resting low with its top showing (the card) that
// swipes or taps open to the full results. The top: wounds per order for each
// side over the shaded wound bar. Below: the Face to Face bar, the labelled
// wound bar and the breakdown. Tablet and desktop show the same pieces inline
// (ResultsPanel.jsx); what both derive first is useResultsView.js.
import {useEffect} from 'react';
import PropTypes from 'prop-types';
import {dispatch, useAppState} from '../state/store.js';
import Headline from './Headline.jsx';
import {shareLink} from './share.js';
import useDialogFocus from './useDialogFocus.js';
import useSheetGestures from './useSheetGestures.js';
import useResultsView, {waitMessage} from './useResultsView.js';
import FaceToFaceChart from './FaceToFaceChart.jsx';
import Ledger from './Ledger.jsx';
import {F2FBar, PickBars, useBreakdownView} from './ResultBars.jsx';
import {SheetActions} from './ResultsBody.jsx';
import {Breakdown, ClassicBody, WoundBar} from './ResultsDetail.jsx';
import {EngineLoading, WaitRow} from './ResultsWait.jsx';
import {UnopposedCardBody, UnopposedSheetBody} from './Unopposed.jsx';
import WpoRow from './WpoRow.jsx';
import {StateBar, StateList, useStatesUi} from './WoundStates.jsx';
import {useT} from './i18n.jsx';

// The top of the phone sheet, which is all that shows while it rests low (the
// results card): both sides' headline numbers (wounds per order unless the
// player chose another, results/headline.js) over the shaded wound bar, or over the
// face-to-face bar when the headline is winning it. Open, the numbers and the
// bars are bigger and both bars show; app.css grows them with --open as the
// sheet is dragged.
// Open, with a chart to show (pick), each bar is the switch for its own
// breakdown below (ResultBars).
/**
 * @param {{s: import('../types.js').Summary | null, h: import('../types.js').Headline | null, choice: import('../types.js').HeadlineChoice, classic?: boolean,
 *   pending?: boolean, status?: string, wait: {A: boolean, B: boolean} | null, ui: import('./WoundStates.jsx').StatesUi | null,
 *   view: import('./ResultBars.jsx').BreakdownView, onView: (view: import('./ResultBars.jsx').BreakdownView) => void, pick: boolean}} props
 */
function SheetTop({s, h, choice, classic, pending, status, wait, ui, view, onView, pick}) {
  const t = useT();
  if (wait) {
    return (
      <>
        <WaitRow picked={wait} />
        <div className="bar rs-wbar blank" />
        <div className="split"><span>{waitMessage(wait, t)}</span></div>
      </>
    );
  }
  // A summary comes with its headline.
  if (s?.unopposed) return <UnopposedCardBody s={/** @type {import('./Unopposed.jsx').UnopposedSummary} */ (s)} h={/** @type {import('../types.js').Headline} */ (h)} choice={choice} />;
  if (!s && pending) return <EngineLoading label={status} />;
  return (
    <>
      {h ? <Headline h={h} choice={choice} pending={pending} />
        : <WpoRow active={<span className="big c-active">—</span>} reactive={<span className="big c-reactive">—</span>} />}
      <PickBars view={view} onView={onView} pick={Boolean(pick && ui)}
        f2fBar={s && (!classic || /** @type {import('../types.js').Headline} */ (h).kind === 'win') ? <F2FBar s={s} className="rs-f2f" /> : null}
        woundBar={s?.states ? <StateBar s={/** @type {import('./WoundStates.jsx').StatesSummary} */ (s)} ui={ui} className="rs-wbar" />
          : s ? <WoundBar summary={s} grow labels={classic} /> : <div className="bar rs-wbar blank" />} />
      <div className="split">
        {h ? <><span>{h.small[0]}</span><span>{h.small[1]}</span></> : <span>{status}</span>}
      </div>
    </>
  );
}

SheetTop.propTypes = {
  s: PropTypes.object, h: PropTypes.object, choice: PropTypes.string, classic: PropTypes.bool, pending: PropTypes.bool, status: PropTypes.string,
  wait: PropTypes.object, ui: PropTypes.object, view: PropTypes.string, onView: PropTypes.func, pick: PropTypes.bool,
};

// Phone: one sheet that rests low with only its top showing (the results
// card) and opens to the full results. Swipe it up or down (it follows the
// finger) or tap the top to open, outside to close (useSheetGestures.js).
// Swipe the top sideways (or arrow keys on it) for the next headline.
/** @param {import('../types.js').ResultsProps} props */
export default function ResultsCard({s, status, diceLine, classic, ledger, save, pending, picked, params}) {
  const t = useT();
  const ui = useStatesUi();
  const {choice, h, b, wait, swipe} = useResultsView({s, ledger, params, picked});
  const open = useAppState((st) => st.ui.overlay === 'results') && Boolean(s);
  // Closing the sheet goes back to the wounds.
  const [view, setView] = useBreakdownView(!open);
  const showF2F = view === 'f2f' && Boolean(b);
  /** @param {boolean} o */
  const setOpen = (o) => dispatch(o ? {type: 'openOverlay', overlay: 'results'} : {type: 'back'});
  const g = useSheetGestures({open, canOpen: Boolean(s), onOpen: () => setOpen(true), onClose: () => setOpen(false),
    onSwipeX: s ? swipe : null, measureKey: [s?.wpo.active, s?.wpo.reactive, s?.unopposed, classic, status, h?.kind].join('|')});
  useEffect(() => {
    if (!open) return undefined;
    /** @param {KeyboardEvent} e */
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps
  // Closing gives the focus back to the card (the top), not to what opened it.
  useDialogFocus(g.sheetRef, open, () => g.sheetRef.current?.querySelector('.rs-top'));
  // Resting low, the sheet's scroll goes back to the top.
  useEffect(() => { if (!open && g.sheetRef.current) g.sheetRef.current.scrollTop = 0; }, [open]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <>
      <div className={`rscrim${open ? ' open' : ''}`} ref={g.scrimRef} onClick={() => setOpen(false)} />
      <section className={`rsheet${open ? ' open' : ''}${classic ? ' classic' : ''}${h?.kind === 'win' ? ' hl-win' : ''}`} ref={g.sheetRef} aria-label={t('results.title')}
        {...(open ? {role: 'dialog', 'aria-modal': true} : {})}>
        <div className="rs-head"><span /><span className="handle" /><span className="sheet-actions">{open && <SheetActions save={save} onShare={shareLink} />}</span></div>
        {/* Closed, the top is the card: a button that opens the sheet, its
            numbers still read out. Open, it holds the state bar's own
            controls, so it is no longer a button (no nested controls). The
            element stays the same either way: the gestures measure it. */}
        <div className="rs-top" onClick={g.onTopClick} {...(open ? {} : {
          role: 'button', tabIndex: 0, 'aria-expanded': false,
          onKeyDown: (e) => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); g.onTopClick(); }
            if (s && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) { e.preventDefault(); swipe(e.key === 'ArrowRight' ? 1 : -1); }
          },
        })}>
          <SheetTop s={s} h={h} choice={choice} classic={classic} pending={pending} status={status} wait={wait} ui={open ? ui : null}
            view={view} onView={setView} pick={Boolean(b)} />
          {!open && <span className="vh">{t('results.openHint')}</span>}
        </div>
        {/* Below the top: only there for screen readers and keys while open. */}
        <div className={`rs-rest${showF2F ? ' f2f-view' : ''}`} {...(open ? {} : {inert: '', 'aria-hidden': true})}>
          {s && (s.unopposed
            ? <UnopposedSheetBody s={/** @type {import('./Unopposed.jsx').UnopposedSummary} */ (s)} names={ledger?.names ?? {A: t('side.active'), B: t('side.reactive')}} diceLine={diceLine} />
            : classic ? <ClassicBody s={s} woundBar={false} />
              : <>
                {s.states && <StateBar s={/** @type {import('./WoundStates.jsx').StatesSummary} */ (s)} ui={ui} glyphs="only" />}
                {showF2F ? <FaceToFaceChart b={/** @type {NonNullable<typeof b>} */ (b)} names={/** @type {NonNullable<typeof ledger>} */ (ledger).labels} /> : s.states ? <StateList s={/** @type {import('./WoundStates.jsx').StatesSummary} */ (s)} ui={ui} /> : <Breakdown s={s} />}
              </>)}
          {s && ledger && !s.unopposed && <div className="mods-sep" />}
          {s && ledger && <Ledger {...ledger} />}
          {s && status && <span className="status">{status}</span>}
        </div>
      </section>
    </>
  );
}

// ResultsPanel takes the same props.
ResultsCard.propTypes = {
  // results/summary.js summarize() of the engine's result (with the targets' wound
  // states in Matchup), or null before there is one.
  s: PropTypes.object,
  status: PropTypes.string,
  // {active: 'B4 SV14 PS9', reactive: ...}; matchup only.
  diceLine: PropTypes.object,
  classic: PropTypes.bool,
  // {ledger: buildLedger(...), names: {A, B}, notes: [...]}; matchup only.
  ledger: PropTypes.object,
  // {saved, toggle}: the Save button; null hides it.
  save: PropTypes.object,
  // A new result is on its way.
  pending: PropTypes.bool,
  // {A, B}: which sides have a trooper; matchup only. Missing ones show the wait state.
  picked: PropTypes.object,
  // The engine params: who is dodging, for the headline's label.
  params: PropTypes.object,
};
