// Results, two ways over the same pieces:
//   ResultsCard   phone: one sheet resting low with its top showing (the card)
//                 that swipes or taps open to the full results
//   ResultsPanel  tablet and desktop: the results inline, in their column
// The top: wounds per order for each side over the shaded wound bar. Below:
// the Face to Face bar, the labelled wound bar and the breakdown.
import {useEffect} from 'react';
import PropTypes from 'prop-types';
import {dispatch, useAppState} from '../state/store.js';
import {BookmarkIcon, D20, ShareIcon} from './icons.jsx';
import Headline, {setHeadline} from './Headline.jsx';
import {headline, headlineChoice, nextHeadline} from './headline.js';
import {shareLink} from './share.js';
import useDialogFocus from './useDialogFocus.js';
import useSheetGestures from './useSheetGestures.js';
import Ledger from './Ledger.jsx';
import {pct} from './results.js';
import {Breakdown, ClassicBody, WoundBar} from './ResultsDetail.jsx';
import {UnopposedCardBody, UnopposedSheetBody} from './Unopposed.jsx';
import WpoRow from './WpoRow.jsx';
import {StateBar, StateList, useStatesUi} from './WoundStates.jsx';

// Save and Share on the sheet's handle row. `save` = {saved, pending, toggle}
// or null while there is nothing to save; pending, Save is disabled.
// onShare: copies the link (ui/share.js).
function SheetActions({save, onShare}) {
  return (
    <>
      {save && (
        <button type="button" className="icon-btn sm" aria-pressed={save.saved} aria-label={save.saved ? 'Saved; remove from saved rolls' : 'Save this roll'}
          disabled={save.pending} onClick={save.toggle} style={{color: save.saved ? 'var(--active)' : undefined}}><BookmarkIcon filled={save.saved} /></button>
      )}
      <button type="button" className="icon-btn sm" aria-label="Share a link to this roll" onClick={onShare}><ShareIcon /></button>
    </>
  );
}

SheetActions.propTypes = {save: PropTypes.object, onShare: PropTypes.func.isRequired};

// Until the first result shows up (the dice engine loading on a first visit,
// a few seconds) the two dice roll at each other, bump and bounce back: the
// face to face roll, before the maths. After that, recalculations shimmer.
function EngineLoading({label}) {
  return (
    <div className="engine-loading" role="status" aria-label={label}>
      <div className="clash">
        <span className="die-a"><D20 fill="var(--active)" /></span>
        <span className="die-b"><D20 fill="var(--reactive)" /></span>
      </div>
      <span className="small">Icepool engine getting ready to roll…</span>
    </div>
  );
}

EngineLoading.propTypes = {label: PropTypes.string};

// Before both troopers are picked: each side's number is its still, dimmed
// die, or Ready in its own colour once that side is chosen. Nothing moves;
// the empty slots above are what should catch the eye.
const waitingFor = (picked) => (picked && !(picked.A && picked.B) ? picked : null);
const waitMessage = (picked) => (!picked.A && !picked.B ? 'Choose both troopers to see the odds'
  : !picked.A ? 'Choose the active trooper' : 'Choose the reactive trooper');

function SideWait({side, ready, size = ''}) {
  return ready
    ? <span className={`big ${size} c-${side} ready`}>Ready</span>
    : <span className={`wait-die ${size}`}><D20 fill={`var(--${side})`} /></span>;
}

SideWait.propTypes = {side: PropTypes.string.isRequired, ready: PropTypes.bool, size: PropTypes.string};

function WaitRow({picked, size}) {
  return <WpoRow active={<SideWait side="active" ready={picked.A} size={size} />} reactive={<SideWait side="reactive" ready={picked.B} size={size} />} />;
}

// Who wins the Face to Face Roll, as one thin bar.
function F2FBar({s, className = '', style}) {
  return (
    <div className={`bar${className ? ` ${className}` : ''}`} style={style} role="img"
      aria-label={`Face to face: active wins ${pct(s.win.active)}, nobody ${pct(s.win.none)}, reactive wins ${pct(s.win.reactive)}`}>
      <span className="seg-a2" style={{width: `${100 * s.win.active}%`}} />
      <span className="seg-none" style={{width: `${100 * s.win.none}%`}} />
      <span className="seg-r3" style={{width: `${100 * s.win.reactive}%`}} />
    </div>
  );
}

F2FBar.propTypes = {s: PropTypes.object.isRequired, className: PropTypes.string, style: PropTypes.object};

WaitRow.propTypes = {picked: PropTypes.object.isRequired, size: PropTypes.string};

// Desktop and tablet: the whole results panel in outline, so its shape is
// there before the numbers are.
function WaitPanel({picked}) {
  const rows = (side, labels) => labels.map((l) => (
    <div key={`${side}${l}`} className="skel-row"><span>{l}</span><span className="skel" /><span>—%</span></div>
  ));
  return (
    <>
      <WaitRow picked={picked} size="xl" />
      <div className="skel" style={{height: 4}} />
      <div className="skel" style={{height: 40}} />
      <div className="skel-list">
        <span className="label c-active">Active wins · —%</span>{rows('a', ['1+ wounds', '2+ wounds', '3+ wounds', 'all saved'])}
        <span className="label">Nobody wins · —%</span>{rows('n', ['both fail'])}
        <span className="label c-reactive">Reactive wins · —%</span>{rows('r', ['1+ wounds', '2+ wounds', 'all saved'])}
      </div>
      <span className="empty">{waitMessage(picked)}</span>
    </>
  );
}

WaitPanel.propTypes = {picked: PropTypes.object.isRequired};

// The top of the phone sheet, which is all that shows while it rests low (the
// results card): both sides' headline numbers (wounds per order unless the
// player chose another, headline.js) over the shaded wound bar, or over the
// face-to-face bar when the headline is winning it. Open, the numbers and the
// bars are bigger and both bars show; app.css grows them with --open as the
// sheet is dragged.
function SheetTop({s, h, choice, classic, pending, status, picked, ui}) {
  const wait = waitingFor(picked);
  if (wait) {
    return (
      <>
        <WaitRow picked={wait} />
        <div className="bar rs-wbar" style={{background: 'var(--none)'}} />
        <div className="split"><span>{waitMessage(wait)}</span></div>
      </>
    );
  }
  if (s?.unopposed) return <UnopposedCardBody s={s} h={h} choice={choice} />;
  if (!s && pending) return <EngineLoading label={status} />;
  return (
    <>
      {h ? <Headline h={h} choice={choice} pending={pending} />
        : <WpoRow active={<span className="big c-active">—</span>} reactive={<span className="big c-reactive">—</span>} />}
      {s && (!classic || h.kind === 'win') && <F2FBar s={s} className="rs-f2f" />}
      {s?.states ? <StateBar s={s} ui={ui} className="rs-wbar" />
        : s ? <WoundBar summary={s} grow labels /> : <div className="bar rs-wbar" style={{background: 'var(--none)'}} />}
      <div className="split">
        {h ? <><span>{h.small[0]}</span><span>{h.small[1]}</span></> : <span>{status}</span>}
      </div>
    </>
  );
}

SheetTop.propTypes = {s: PropTypes.object, h: PropTypes.object, choice: PropTypes.string, classic: PropTypes.bool, pending: PropTypes.bool, status: PropTypes.string, picked: PropTypes.object, ui: PropTypes.object};

// Phone: one sheet that rests low with only its top showing (the results
// card) and opens to the full results. Swipe it up or down (it follows the
// finger) or tap the top to open, outside to close (useSheetGestures.js).
// Swipe the top sideways (or arrow keys on it) for the next headline.
export default function ResultsCard({s, status, diceLine, classic, ledger, save, pending, picked, params}) {
  const ui = useStatesUi();
  const choice = useAppState((st) => headlineChoice(st.prefs));
  const h = s ? headline(s, choice, params, ledger?.ledger) : null;
  const swipe = (step) => setHeadline(nextHeadline(choice, step));
  const open = useAppState((st) => st.ui.overlay === 'results') && Boolean(s);
  const setOpen = (o) => dispatch(o ? {type: 'openOverlay', overlay: 'results'} : {type: 'back'});
  const g = useSheetGestures({open, canOpen: Boolean(s), onOpen: () => setOpen(true), onClose: () => setOpen(false),
    onSwipeX: s ? swipe : null, measureKey: [s?.wpo.active, s?.wpo.reactive, s?.unopposed, classic, status, h?.kind].join('|')});
  useEffect(() => {
    if (!open) return undefined;
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
      <section className={`rsheet${open ? ' open' : ''}${classic ? ' classic' : ''}${h?.kind === 'win' ? ' hl-win' : ''}`} ref={g.sheetRef} aria-label="Results"
        {...(open ? {role: 'dialog', 'aria-modal': true} : {})}>
        <div className="rs-head"><span /><span className="handle" /><span className="sheet-actions">{open && <SheetActions save={save} onShare={() => shareLink(choice)} />}</span></div>
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
          <SheetTop s={s} h={h} choice={choice} classic={classic} pending={pending} status={status} picked={picked} ui={open ? ui : null} />
          {!open && <span className="vh">Show full results. Left and right arrows change the big number.</span>}
        </div>
        {/* Below the top: only there for screen readers and keys while open. */}
        <div className="rs-rest" {...(open ? {} : {inert: '', 'aria-hidden': true})}>
          {s && (s.unopposed
            ? <UnopposedSheetBody s={s} names={ledger?.names ?? {A: 'Active', B: 'Reactive'}} diceLine={diceLine} />
            : classic ? <ClassicBody s={s} woundBar={false} />
              : s.states ? <><StateBar s={s} ui={ui} glyphs="only" /><StateList s={s} ui={ui} /></> : <Breakdown s={s} />)}
          {s && ledger && !s.unopposed && <div className="mods-sep" />}
          {s && ledger && <Ledger {...ledger} />}
          {s && status && <span className="status">{status}</span>}
        </div>
      </section>
    </>
  );
}

// What the results say, wherever they are shown.
function ResultsBody({s, classic, ledger, diceLine, pending, ui, params}) {
  const choice = useAppState((st) => headlineChoice(st.prefs));
  if (s.unopposed) return <UnopposedSheetBody s={s} names={ledger?.names ?? {A: 'Active', B: 'Reactive'}} diceLine={diceLine} />;
  if (classic) return <ClassicBody s={s} />;
  return (
    <>
      <Headline h={headline(s, choice, params, ledger?.ledger)} choice={choice} size="xl" pending={pending} buttons />
      <F2FBar s={s} style={{height: 4, borderRadius: 2}} />
      {s.states ? (
        <>
          <StateBar s={s} ui={ui} glyphs style={{height: 40, borderRadius: 8}} />
          <StateList s={s} ui={ui} />
        </>
      ) : (
        <>
          <WoundBar summary={s} height={40} labels />
          <Breakdown s={s} />
        </>
      )}
    </>
  );
}

ResultsBody.propTypes = {
  s: PropTypes.object.isRequired, classic: PropTypes.bool, ledger: PropTypes.object, diceLine: PropTypes.object,
  pending: PropTypes.bool, ui: PropTypes.object, params: PropTypes.object,
};

// Tablet and desktop: the results in their own column, always open. The mods
// go in another column (MatchupScreen).
export function ResultsPanel({s, status, diceLine, classic, ledger, save, pending, picked, params}) {
  const ui = useStatesUi();
  const choice = useAppState((st) => headlineChoice(st.prefs));
  const h = s ? headline(s, choice, params, ledger?.ledger) : null;
  const wait = waitingFor(picked);
  return (
    <section className="results-panel" aria-label="Results">
      <div className="panel-head"><span className="label">Results</span><span className="sheet-actions"><SheetActions save={save} onShare={() => shareLink(choice)} /></span></div>
      {wait ? <WaitPanel picked={wait} />
        : s ? <ResultsBody s={s} classic={classic} ledger={ledger} diceLine={diceLine} pending={pending} ui={ui} params={params} />
        : pending ? <EngineLoading label={status} /> : <span className="empty">{status}</span>}
      {s && status && <span className="status">{status}</span>}
    </section>
  );
}

ResultsPanel.propTypes = {
  s: PropTypes.object, status: PropTypes.string, diceLine: PropTypes.object, classic: PropTypes.bool,
  ledger: PropTypes.object, save: PropTypes.object, pending: PropTypes.bool, picked: PropTypes.object, params: PropTypes.object,
};

ResultsCard.propTypes = {
  // results.js summarize() of the engine's result (with the targets' wound
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
