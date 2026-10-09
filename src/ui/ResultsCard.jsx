// Results, two ways over the same pieces:
//   ResultsCard   phone: one sheet resting low with its top showing (the card)
//                 that swipes or taps open to the full results
//   ResultsPanel  tablet and desktop: the results inline, in their column
// The top: wounds per order for each side over the shaded wound bar. Below:
// the Face to Face bar, the labelled wound bar and the breakdown.
import {useEffect, useRef, useState} from 'react';
import PropTypes from 'prop-types';
import {dispatch, useAppState} from '../state/store.js';
import {BookmarkIcon, D20, ShareIcon} from './icons.jsx';
import {shareLink} from './share.js';
import useSheetGestures from './useSheetGestures.js';
import Ledger from './Ledger.jsx';
import {pct, shows, summarize} from './results.js';
import {UnopposedCardBody, UnopposedSheetBody} from './Unopposed.jsx';
import {StateBar, StateList, useStatesUi} from './WoundStates.jsx';

const SEG = {active: ['', 'seg-a1', 'seg-a2', 'seg-a3'], reactive: ['', 'seg-r1', 'seg-r2', 'seg-r3']};
const segClass = (s) => (s.side === 'none' ? 'seg-none' : SEG[s.side][s.wounds]);
const wpo = (n) => (n == null ? '—' : n.toFixed(2));

// The most wounds each side can cause in this roll (up to 3): that bucket is
// labelled "N+" ("2+" when 3 or more never happens).
const topWounds = (s, side) => Math.max(0, ...s.bar.filter((b) => b.side === side && shows(b.chance)).map((b) => b.wounds));
const woundsLabel = (w, top) => (w === top ? `${w}+` : `${w}`);

// `grow`: the phone sheet's bar, sized by CSS from --open (6 px resting, 40
// open), its labels fading in with it; else a fixed `height`.
function WoundBar({summary, height, labels = false, grow = false}) {
  const top = topWounds(summary, 'active');
  return (
    <div className={`bar${grow ? ' rs-wbar' : ''}`} style={grow ? undefined : {height, borderRadius: height > 10 ? 8 : 3}}>
      {summary.bar.filter((s) => shows(s.chance)).map((s) => (
        <span key={`${s.side}${s.wounds}`} className={segClass(s)} style={{width: `${100 * s.chance}%`, display: 'grid', placeItems: 'center',
          fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600, color: s.side === 'none' ? 'var(--muted)' : 'var(--active-ink)'}}>
          <span className="lbl">
            {labels && s.side === 'active' && s.chance > 0.05 ? woundsLabel(s.wounds, top) : ''}
            {labels && s.side === 'none' && s.chance > 0.05 ? '0' : ''}
          </span>
        </span>
      ))}
    </div>
  );
}

WoundBar.propTypes = {summary: PropTypes.object.isRequired, height: PropTypes.number, labels: PropTypes.bool, grow: PropTypes.bool};

// Save and Share on the sheet's handle row. `save` = {saved, toggle} or null
// while there is nothing to save.
function SheetActions({save}) {
  return (
    <>
      {save && (
        <button type="button" className="icon-btn sm" aria-pressed={save.saved} aria-label={save.saved ? 'Saved; remove from saved rolls' : 'Save this roll'}
          onClick={save.toggle} style={{color: save.saved ? 'var(--active)' : undefined}}><BookmarkIcon filled={save.saved} /></button>
      )}
      <button type="button" className="icon-btn sm" aria-label="Share a link to this roll" onClick={shareLink}><ShareIcon /></button>
    </>
  );
}

SheetActions.propTypes = {save: PropTypes.object};

// The wounds/order number: ticks in when it changes, shimmers while the next
// result is being worked out, and floats the change (+0.33) for a moment.
function Wpo({value, side, size = '', pending}) {
  const prev = useRef(value);
  const [delta, setDelta] = useState(null);
  useEffect(() => {
    const before = prev.current;
    prev.current = value;
    if (value == null || before == null || Math.abs(value - before) < 0.005) return undefined;
    setDelta(value - before);
    const t = setTimeout(() => setDelta(null), 1600);
    return () => clearTimeout(t);
  }, [value]);
  return (
    <span className="wpo-n">
      <span key={wpo(value)} className={`big ${size} c-${side} tick${pending ? ' computing' : ''}`}>{wpo(value)}</span>
      {delta != null && <span className={`delta c-${side}`} aria-hidden="true">{delta > 0 ? '+' : '−'}{Math.abs(delta).toFixed(2)}</span>}
    </span>
  );
}

Wpo.propTypes = {value: PropTypes.number, side: PropTypes.string.isRequired, size: PropTypes.string, pending: PropTypes.bool};

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
  return (
    <div className="wpo-row">
      <div className="wpo"><SideWait side="active" ready={picked.A} size={size} /><span className="small">wounds / order</span></div>
      <div className="wpo right"><SideWait side="reactive" ready={picked.B} size={size} /><span className="small">wounds / order</span></div>
    </div>
  );
}

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
// results card): both sides' wounds per order over the shaded wound bar. Open,
// the numbers and the bar are bigger and the face-to-face bar appears above
// it; app.css grows them with --open as the sheet is dragged.
function SheetTop({s, classic, pending, status, picked, ui}) {
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
  if (s?.unopposed) return <UnopposedCardBody s={s} />;
  if (!s && pending) return <EngineLoading label={status} />;
  return (
    <>
      <div className="wpo-row">
        <div className="wpo"><Wpo value={s?.wpo.active} side="active" pending={pending} /><span className="small">wounds / order</span></div>
        <div className="wpo right"><Wpo value={s?.wpo.reactive} side="reactive" pending={pending} /><span className="small">wounds / order</span></div>
      </div>
      {s && !classic && (
        <div className="bar rs-f2f" role="img"
          aria-label={`Face to face: active wins ${pct(s.win.active)}, nobody ${pct(s.win.none)}, reactive wins ${pct(s.win.reactive)}`}>
          <span className="seg-a2" style={{width: `${100 * s.win.active}%`}} />
          <span className="seg-none" style={{width: `${100 * s.win.none}%`}} />
          <span className="seg-r3" style={{width: `${100 * s.win.reactive}%`}} />
        </div>
      )}
      {s?.states ? <StateBar s={s} ui={ui} className="rs-wbar" />
        : s ? <WoundBar summary={s} grow labels /> : <div className="bar rs-wbar" style={{background: 'var(--none)'}} />}
      <div className="split">
        {s ? <><span>{pct(s.atLeast.active[0])} at least one wound</span><span>{pct(s.atLeast.reactive[0])}</span></>
          : <span>{status}</span>}
      </div>
    </>
  );
}

SheetTop.propTypes = {s: PropTypes.object, classic: PropTypes.bool, pending: PropTypes.bool, status: PropTypes.string, picked: PropTypes.object, ui: PropTypes.object};

// Phone: one sheet that rests low with only its top showing (the results
// card) and opens to the full results. Swipe it up or down (it follows the
// finger) or tap the top to open, outside to close (useSheetGestures.js).
export default function ResultsCard({result, status, diceLine, classic, ledger, save, pending, picked, targets}) {
  const s = summarize(result, targets);
  const ui = useStatesUi();
  const open = useAppState((st) => st.ui.overlay === 'results') && Boolean(s);
  const setOpen = (o) => dispatch(o ? {type: 'openOverlay', overlay: 'results'} : {type: 'back'});
  const g = useSheetGestures({open, canOpen: Boolean(s), onOpen: () => setOpen(true), onClose: () => setOpen(false),
    measureKey: [s?.wpo.active, s?.wpo.reactive, s?.unopposed, classic, status].join('|')});
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps
  // Resting low, the sheet's scroll goes back to the top.
  useEffect(() => { if (!open && g.sheetRef.current) g.sheetRef.current.scrollTop = 0; }, [open]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <>
      <div className={`rscrim${open ? ' open' : ''}`} ref={g.scrimRef} onClick={() => setOpen(false)} />
      <section className={`rsheet${open ? ' open' : ''}${classic ? ' classic' : ''}`} ref={g.sheetRef} aria-label="Results"
        {...(open ? {role: 'dialog', 'aria-modal': true} : {})}>
        <div className="rs-head"><span /><span className="handle" /><span className="sheet-actions">{open && <SheetActions save={save} />}</span></div>
        <button type="button" className="rs-top" onClick={g.onTopClick} aria-expanded={open} tabIndex={open ? -1 : 0}
          aria-label={open ? undefined : 'Show full results'}>
          <SheetTop s={s} classic={classic} pending={pending} status={status} picked={picked} ui={open ? ui : null} />
        </button>
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
function ResultsBody({s, classic, ledger, diceLine, pending, ui}) {
  if (s.unopposed) return <UnopposedSheetBody s={s} names={ledger?.names ?? {A: 'Active', B: 'Reactive'}} diceLine={diceLine} />;
  if (classic) return <ClassicBody s={s} />;
  return (
    <>
      <div className="wpo-row">
        <div className="wpo"><Wpo value={s.wpo.active} side="active" size="xl" pending={pending} /><span className="small">wounds / order</span></div>
        <div className="wpo right"><Wpo value={s.wpo.reactive} side="reactive" size="xl" pending={pending} /><span className="small">wounds / order</span></div>
      </div>
      <div className="bar" style={{height: 4, borderRadius: 2}} role="img"
        aria-label={`Face to face: active wins ${pct(s.win.active)}, nobody ${pct(s.win.none)}, reactive wins ${pct(s.win.reactive)}`}>
        <span className="seg-a2" style={{width: `${100 * s.win.active}%`}} />
        <span className="seg-none" style={{width: `${100 * s.win.none}%`}} />
        <span className="seg-r3" style={{width: `${100 * s.win.reactive}%`}} />
      </div>
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

ResultsBody.propTypes = {s: PropTypes.object.isRequired, classic: PropTypes.bool, ledger: PropTypes.object, diceLine: PropTypes.object, pending: PropTypes.bool, ui: PropTypes.object};

// Tablet and desktop: the results in their own column, always open. The mods
// go in another column unless `withLedger`.
export function ResultsPanel({result, status, diceLine, classic, ledger, save, pending, picked, targets, withLedger = false}) {
  const s = summarize(result, targets);
  const ui = useStatesUi();
  const wait = waitingFor(picked);
  return (
    <section className="results-panel" aria-label="Results">
      <div className="panel-head"><span className="label">Results</span><span className="sheet-actions"><SheetActions save={save} /></span></div>
      {wait ? <WaitPanel picked={wait} />
        : s ? <ResultsBody s={s} classic={classic} ledger={ledger} diceLine={diceLine} pending={pending} ui={ui} />
        : pending ? <EngineLoading label={status} /> : <span className="empty">{status}</span>}
      {withLedger && s && ledger && <Ledger {...ledger} />}
      {s && status && <span className="status">{status}</span>}
    </section>
  );
}

ResultsPanel.propTypes = {
  result: PropTypes.object, status: PropTypes.string, diceLine: PropTypes.object, classic: PropTypes.bool,
  ledger: PropTypes.object, save: PropTypes.object, pending: PropTypes.bool, picked: PropTypes.object, targets: PropTypes.object, withLedger: PropTypes.bool,
};

ResultsCard.propTypes = {
  result: PropTypes.object,
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
  // {active, reactive}: the states each side's target goes through (matchupView); matchup only.
  targets: PropTypes.object,
};

// Classic results: the face-to-face bar with its numbers, the wound bar, then
// each side's wounds per order and its at-least ladder, nobody wounded between.
// woundBar false: the phone sheet already shows the wound bar at its top.
function ClassicBody({s, woundBar = true}) {
  const ladder = (side, cls, name) => (
    <div className="ladder">
      <div className={`ladder-h c-${side}`}><b>{wpo(s.wpo[side])}</b><span>{name} wounds / order</span></div>
      {s.atLeast[side].map((p, i) => (shows(p) ? (
        <div key={i} className="ladder-r"><i className={`${cls}${i + 1}`} /><span>{i + 1} or more wounds</span><span className="p">{pct(p)}</span></div>
      ) : null))}
    </div>
  );
  const big = (p) => p > 0.12;
  return (
    <>
      <div style={{display: 'flex', flexDirection: 'column', gap: 6}}>
        <span className="label">Face to face</span>
        <div className="bar labelled" style={{height: 28, borderRadius: 7}}>
          <span className="seg-a2" style={{width: `${100 * s.win.active}%`, color: 'var(--active-ink)'}}>{big(s.win.active) ? pct(s.win.active) : ''}</span>
          <span className="seg-none" style={{width: `${100 * s.win.none}%`}} />
          <span className="seg-r3" style={{width: `${100 * s.win.reactive}%`, color: 'var(--reactive-ink)'}}>{big(s.win.reactive) ? pct(s.win.reactive) : ''}</span>
        </div>
        <div className="split"><span>Active wins</span><span>{pct(s.win.none)} nobody</span><span>Reactive wins</span></div>
      </div>
      {woundBar && (
        <div style={{display: 'flex', flexDirection: 'column', gap: 6}}>
          <span className="label">Wounds</span>
          <WoundBar summary={s} height={28} labels />
        </div>
      )}
      {ladder('active', 'seg-a', 'Active')}
      <div className="ladder">
        <div className="label">Nobody wounded</div>
        <div className="ladder-r"><i className="seg-none edged" /><span>Neither side causes a wound</span><span className="p">{pct(s.bar[3].chance)}</span></div>
        {shows(s.saved.active) && <div className="ladder-r sub"><span>Active wins, every hit saved</span><span className="p">{pct(s.saved.active)}</span></div>}
        {shows(s.saved.reactive) && <div className="ladder-r sub"><span>Reactive wins, every hit saved</span><span className="p">{pct(s.saved.reactive)}</span></div>}
      </div>
      {ladder('reactive', 'seg-r', 'Reactive')}
    </>
  );
}

ClassicBody.propTypes = {s: PropTypes.object.isRequired, woundBar: PropTypes.bool};

// Who wins the roll, and what each winner does: at least 1 / 2 / 3 wounds
// (cumulative, so the rows overlap) and every hit saved. Anything that never
// happens is left out.
function Breakdown({s}) {
  // Bars share one track, so 100% fills it.
  const row = (k, chance, cls) => (shows(chance) ? (
    <div className="row" key={`${cls}-${k}`}>
      <span className="k">{k}</span>
      <span className="track"><span className={`b ${cls}`} style={{width: `max(2px, ${100 * chance}%)`}} /></span>
      <span className="p">{pct(chance)}</span>
    </div>
  ) : null);
  const ladder = (side, cls) => [
    ...s.atLeast[side].map((p, i) => row(`${i + 1}+ wounds`, p, `${cls}${i + 1}`)),
    row('all saved', s.saved[side], 'seg-none'),
  ];
  const head = (text, cls, first) => <div className={`label ${cls}`} style={{padding: first ? '0 0 4px' : '14px 0 6px'}}>{text}</div>;
  return (
    <div className="breakdown">
      {shows(s.win.active) && head(`Active wins the roll · ${pct(s.win.active)}`, 'c-active', true)}
      {shows(s.win.active) && ladder('active', 'seg-a')}
      {shows(s.win.none) && head(`Nobody wins · ${pct(s.win.none)}`, '', !shows(s.win.active))}
      {row('both fail', s.win.none, 'seg-none n')}
      {shows(s.win.reactive) && head(`Reactive wins the roll · ${pct(s.win.reactive)}`, 'c-reactive', false)}
      {shows(s.win.reactive) && ladder('reactive', 'seg-r')}
      <span className="note" style={{paddingTop: 8}}>1+ / 2+ / 3+ = at least that many wounds, so they overlap</span>
    </div>
  );
}

Breakdown.propTypes = {s: PropTypes.object.isRequired};
