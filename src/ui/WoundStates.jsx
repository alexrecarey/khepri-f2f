// Results by the target's wound states (rules/woundStates.js): a clean bar
// with the out-of-action glyphs under it, and one row per state with what
// share of the rolls ends exactly there and how many end there or worse.
//
// The bar and the list point at each other (useStatesUi): hovering a segment
// lights its row; hovering a row lights every segment that counts towards it
// (that is what "at least" means); tapping a side's heading fades the other
// side; Unconscious and Dead, the states that take a trooper out of the fight,
// also give the chance over three orders. Phones tap where desktops hover.
import {useState} from 'react';
import PropTypes from 'prop-types';
import {StateGlyph} from './icons.jsx';
import {pct, shows} from './results.js';

const ORDERS = 3;
const overOrders = (p) => 1 - (1 - p) ** ORDERS;

export function useStatesUi() {
  const [hover, setHover] = useState(null); // {kind: 'seg' | 'row', side, index}
  const [focus, setFocus] = useState(null); // 'active' | 'reactive'
  const [open, setOpen] = useState(null); // `${side}:${key}`, tapped open
  return {hover, setHover, focus, setFocus, open, setOpen};
}

const dimSeg = (ui, seg) => {
  if (!ui) return false;
  if (ui.focus && seg.side !== ui.focus) return true;
  const h = ui.hover;
  if (h?.kind !== 'row') return false;
  return seg.side !== h.side || seg.index < h.index;
};
const dimRow = (ui, side, index) => {
  if (ui.focus && side !== ui.focus) return true;
  const h = ui.hover;
  if (h?.kind === 'seg') return h.side !== side || h.index !== index;
  return false;
};

// glyphs: false (bar only), true (bar, glyphs under it) or 'only' (just the
// glyph row: the phone sheet draws the bar in its top and the glyphs below).
// ui null: a plain bar (the closed phone card, where a tap opens the sheet).
export function StateBar({s, ui, glyphs = false, className = '', style}) {
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
          <span key={`${b.side}${b.key}`} className={`sseg${b.side === 'none' ? ' seg-none' : ''}${dimSeg(ui, b) ? ' dim' : ''}`}
            style={{width: `${100 * b.chance}%`, background: b.shade ?? undefined}} title={tip(b)} {...hov(b)} />
        ))}
      </div>}
      {glyphs && (
        <div className="sglyphs" aria-hidden="true">
          {marks.map(({b, glyph, left}) => (
            <span key={`${b.side}${b.key}`} className={`c-${b.side}${dimSeg(ui, b) ? ' dim' : ''}`} style={{left: `${left}%`}}><StateGlyph glyph={glyph} size={14} /></span>
          ))}
        </div>
      )}
    </>
  );
}

StateBar.propTypes = {s: PropTypes.object.isRequired, ui: PropTypes.object, glyphs: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]), className: PropTypes.string, style: PropTypes.object};

function StateRow({st, side, ui}) {
  const id = `${side}:${st.key}`;
  const segHover = ui.hover?.kind === 'seg' && ui.hover.side === side && ui.hover.index === st.index;
  const rowHover = ui.hover?.kind === 'row' && ui.hover.side === side && ui.hover.index === st.index;
  const more = st.outOfFight && (ui.open === id || segHover || rowHover);
  return (
    <div className={`srow${dimRow(ui, side, st.index) ? ' dim' : ''}${rowHover || segHover ? ' on' : ''}`} tabIndex={0}
      onMouseEnter={() => ui.setHover({kind: 'row', side, index: st.index})} onMouseLeave={() => ui.setHover(null)}
      onFocus={() => ui.setHover({kind: 'row', side, index: st.index})} onBlur={() => ui.setHover(null)}
      onClick={() => ui.setOpen(ui.open === id ? null : id)}>
      <span className={`c-${side}`}><StateGlyph glyph={st.glyph} /></span>
      <span className={`k${st.key === 'dead' ? ' dead' : ''}`}>{st.label}{st.shock && <span className="stag">Shock</span>}</span>
      <span className="track"><span className="b" style={{width: `max(2px, ${100 * st.atLeast}%)`, background: st.shade}} /></span>
      <span className="ex">{pct(st.exactly)}</span>
      <span className="p">{pct(st.atLeast)}</span>
      {more && <span className="more">{pct(st.atLeast)} this order · {pct(overOrders(st.atLeast))} over {ORDERS} orders</span>}
    </div>
  );
}

StateRow.propTypes = {st: PropTypes.object.isRequired, side: PropTypes.string.isRequired, ui: PropTypes.object.isRequired};

export function StateList({s, ui}) {
  const head = (side, text) => (
    <button type="button" className={`shead${ui.focus && ui.focus !== side ? ' dim' : ''}`} aria-pressed={ui.focus === side}
      onClick={() => ui.setFocus(ui.focus === side ? null : side)}>
      <span className={`t c-${side}`}>{text}</span><span className="lab">Exactly</span><span className="lab">At least</span>
    </button>
  );
  const rows = (side) => s.states[side].filter((st) => shows(st.atLeast)).map((st) => <StateRow key={st.key} st={st} side={side} ui={ui} />);
  return (
    <div className="slist">
      {shows(s.win.active) && head('active', `Active wins · ${pct(s.win.active)}`)}
      {shows(s.win.active) && rows('active')}
      {shows(s.win.none) && <div className={`shead static${ui.focus ? ' dim' : ''}`}><span className="t">Nobody wins · {pct(s.win.none)}</span></div>}
      {shows(s.win.reactive) && head('reactive', `Reactive wins · ${pct(s.win.reactive)}`)}
      {shows(s.win.reactive) && rows('reactive')}
    </div>
  );
}

StateList.propTypes = {s: PropTypes.object.isRequired, ui: PropTypes.object.isRequired};
