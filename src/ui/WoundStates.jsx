// Results by the target's wound states (rules/woundStates.js): a clean bar
// with the out-of-action glyphs under it, and one row per state with what
// share of the rolls ends exactly there and how many end there or worse.
//
// The bar and the list point at each other (useStatesUi): hovering a segment
// lights its row; hovering a row lights every segment that counts towards it
// (that is what "at least" means); tapping a side's heading fades the other
// side; Unconscious and Dead, the states that take a trooper out of the fight,
// also give the chance over three orders. Phones tap where desktops hover.
import {useState, useSyncExternalStore} from 'react';
import PropTypes from 'prop-types';
import {StateGlyph} from './icons.jsx';
import {pct, shows} from './results.js';

const ORDERS = 3;
const overOrders = (p) => 1 - (1 - p) ** ORDERS;

// The bar and the list share this small store instead of React state in the
// sheet: hovering re-renders only the bar and the list that read it, not the
// whole results sheet and its ledger. The object itself never changes.
//   hover  {kind: 'seg' | 'row', side, index}
//   focus  'active' | 'reactive'
//   open   `${side}:${key}`, tapped open
function createStatesUi() {
  let state = {hover: null, focus: null, open: null};
  const subs = new Set();
  const set = (patch) => {
    state = {...state, ...patch};
    subs.forEach((f) => f());
  };
  return {
    get: () => state,
    subscribe: (f) => { subs.add(f); return () => subs.delete(f); },
    setHover: (hover) => set({hover}),
    setFocus: (focus) => set({focus}),
    setOpen: (open) => set({open}),
  };
}

export function useStatesUi() {
  const [ui] = useState(createStatesUi);
  return ui;
}

const NO_UI = {hover: null, focus: null, open: null};
const noSubscribe = () => () => {};
// The current hover / focus / open of `ui` (null: none, nothing changes).
const useUiState = (ui) => useSyncExternalStore(ui ? ui.subscribe : noSubscribe, ui ? ui.get : () => NO_UI);

const dimSeg = (cur, seg) => {
  if (cur.focus && seg.side !== cur.focus) return true;
  const h = cur.hover;
  if (h?.kind !== 'row') return false;
  return seg.side !== h.side || seg.index < h.index;
};
const dimRow = (cur, side, index) => {
  if (cur.focus && side !== cur.focus) return true;
  const h = cur.hover;
  if (h?.kind === 'seg') return h.side !== side || h.index !== index;
  return false;
};

// glyphs: false (bar only), true (bar, glyphs under it) or 'only' (just the
// glyph row: the phone sheet draws the bar in its top and the glyphs below).
// ui null: a plain bar (the closed phone card, where a tap opens the sheet).
export function StateBar({s, ui, glyphs = false, className = '', style}) {
  const cur = useUiState(ui);
  const segs = s.stateBar.filter((b) => shows(b.chance));
  let x = 0;
  const marks = [];
  for (const b of segs) {
    const st = b.side === 'none' ? null : s.states[b.side][b.index];
    if (st?.glyph) marks.push({b, glyph: st.glyph, left: x + 50 * b.chance});
    x += 100 * b.chance;
  }
  const tip = (b) => {
    if (b.side === 'none') return `Nobody wounded · ${pct(b.chance)}`;
    const st = s.states[b.side][b.index];
    return `${st.label} · exactly ${pct(st.exactly)} · at least ${pct(st.atLeast)}`;
  };
  const hov = (b) => (ui && b.side !== 'none' ? {
    onMouseEnter: () => ui.setHover({kind: 'seg', side: b.side, index: b.index}),
    onMouseLeave: () => ui.setHover(null),
    onClick: (e) => { e.stopPropagation(); ui.setHover({kind: 'seg', side: b.side, index: b.index}); },
  } : {});
  return (
    <>
      {glyphs !== 'only' && <div className={`bar sbar ${className}`} style={style} role="img" aria-label="Wounds by state">
        {segs.map((b) => (
          <span key={`${b.side}${b.key}`} className={`sseg${b.side === 'none' ? ' seg-none' : ''}${dimSeg(cur, b) ? ' dim' : ''}`}
            style={{width: `${100 * b.chance}%`, background: b.shade ?? undefined}} title={tip(b)} {...hov(b)} />
        ))}
      </div>}
      {glyphs && (
        <div className="sglyphs" aria-hidden="true">
          {marks.map(({b, glyph, left}) => (
            <span key={`${b.side}${b.key}`} className={`c-${b.side}${dimSeg(cur, b) ? ' dim' : ''}`} style={{left: `${left}%`}}><StateGlyph glyph={glyph} size={14} /></span>
          ))}
        </div>
      )}
    </>
  );
}

StateBar.propTypes = {s: PropTypes.object.isRequired, ui: PropTypes.object, glyphs: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]), className: PropTypes.string, style: PropTypes.object};

function StateRow({st, side, ui, cur}) {
  const id = `${side}:${st.key}`;
  const segHover = cur.hover?.kind === 'seg' && cur.hover.side === side && cur.hover.index === st.index;
  const rowHover = cur.hover?.kind === 'row' && cur.hover.side === side && cur.hover.index === st.index;
  const more = st.outOfFight && (cur.open === id || segHover || rowHover);
  return (
    <div className={`srow${dimRow(cur, side, st.index) ? ' dim' : ''}${rowHover || segHover ? ' on' : ''}`} tabIndex={0}
      onMouseEnter={() => ui.setHover({kind: 'row', side, index: st.index})} onMouseLeave={() => ui.setHover(null)}
      onFocus={() => ui.setHover({kind: 'row', side, index: st.index})} onBlur={() => ui.setHover(null)}
      onClick={() => ui.setOpen(cur.open === id ? null : id)}>
      <span className={`c-${side}`}><StateGlyph glyph={st.glyph} /></span>
      <span className={`k${st.key === 'dead' ? ' dead' : ''}`}>{st.label}{st.shock && <span className="stag">Shock</span>}</span>
      <span className="track"><span className="b" style={{width: `max(2px, ${100 * st.atLeast}%)`, background: st.shade}} /></span>
      <span className="ex">{pct(st.exactly)}</span>
      <span className="p">{pct(st.atLeast)}</span>
      {more && <span className="more">{pct(st.atLeast)} this order · {pct(overOrders(st.atLeast))} over {ORDERS} orders</span>}
    </div>
  );
}

StateRow.propTypes = {st: PropTypes.object.isRequired, side: PropTypes.string.isRequired, ui: PropTypes.object.isRequired, cur: PropTypes.object.isRequired};

export function StateList({s, ui}) {
  const cur = useUiState(ui);
  const head = (side, text) => (
    <button type="button" className={`shead${cur.focus && cur.focus !== side ? ' dim' : ''}`} aria-pressed={cur.focus === side}
      onClick={() => ui.setFocus(cur.focus === side ? null : side)}>
      <span className={`t c-${side}`}>{text}</span><span className="lab">Exactly</span><span className="lab">At least</span>
    </button>
  );
  const rows = (side) => s.states[side].filter((st) => shows(st.atLeast)).map((st) => <StateRow key={st.key} st={st} side={side} ui={ui} cur={cur} />);
  return (
    <div className="slist">
      {shows(s.win.active) && head('active', `Active wins · ${pct(s.win.active)}`)}
      {shows(s.win.active) && rows('active')}
      {shows(s.win.none) && <div className={`shead static${cur.focus ? ' dim' : ''}`}><span className="t">Nobody wins · {pct(s.win.none)}</span></div>}
      {shows(s.win.reactive) && head('reactive', `Reactive wins · ${pct(s.win.reactive)}`)}
      {shows(s.win.reactive) && rows('reactive')}
    </div>
  );
}

StateList.propTypes = {s: PropTypes.object.isRequired, ui: PropTypes.object.isRequired};
