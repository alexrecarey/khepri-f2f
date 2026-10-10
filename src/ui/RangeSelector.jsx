// The shared distance between the two side cards, and the swap button.
import PropTypes from 'prop-types';
import {RANGE_BANDS} from '../rules/ranges.js';
import {dispatch, useAppState} from '../state/store.js';
import {bandColor} from './bands.js';
import {weaponText} from './SideCard.jsx';

const signed = (n) => (n == null ? '—' : `${n > 0 ? '+' : ''}${n}`);

const reducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

// Swap: each trooper's card content moves to the other card, so slide each
// card in from where its trooper was (FLIP), along a slight arc.
function flipSwap(run) {
  const card = (s) => document.querySelector(`.card[data-side="${s}"]`);
  const A = card('A');
  const B = card('B');
  if (!A || !B || reducedMotion() || !A.animate) { run(); return; }
  const from = {A: B.getBoundingClientRect(), B: A.getBoundingClientRect()};
  run();
  requestAnimationFrame(() => {
    for (const [el, f] of [[A, from.A], [B, from.B]]) {
      const to = el.getBoundingClientRect();
      const dx = f.left - to.left;
      const dy = f.top - to.top;
      el.animate([
        {transform: `translate(${dx}px, ${dy}px)`},
        {transform: `translate(${dx / 2 + (dx ? 0 : 16)}px, ${dy / 2}px) scale(.96)`},
        {transform: 'none'},
      ], {duration: 340, easing: 'cubic-bezier(.5,0,.3,1)'});
    }
  });
}

// "Missile Launcher (Hit)", "Dodge": what the footer's Range MOD belongs to.
const weaponName = (side) => {
  const w = side.resolved?.weapon;
  if (!w) return '—';
  if (w.pseudo) return w.pseudo === 'dodge' ? 'Dodge' : 'No ARO';
  return weaponText(w);
};

// The shared distance. Closed: one slim row of bands. Tapping a band picks it
// straight away and opens the selector, which adds a header above and a
// legend below and lights up each weapon's Range MOD as a stripe (active above,
// reactive below). The row of bands itself never moves or resizes, open or
// closed. Lines of fire are reciprocal, so both sides share the distance.
export default function RangeSelector({view}) {
  const open = useAppState((st) => st.ui.rangeOpen);
  const rangeCm = useAppState((st) => st.matchup.rangeCm);
  const setOpen = (o) => dispatch({type: 'setRangeOpen', open: o});
  const selected = Math.max(0, RANGE_BANDS.findIndex((b) => b.to === rangeCm));
  const band = RANGE_BANDS[selected];
  const from = selected ? RANGE_BANDS[selected - 1].inches : 0;
  // Range MODs per band (matchupView bands): undefined = no range bands.
  const mods = view.bands[selected];
  const hasA = mods.A !== undefined;
  const hasB = mods.B !== undefined;

  // Open, a tap anywhere outside the selector closes it (the scrim).
  return (
    <>
    {open && <button type="button" className="range-scrim" aria-label="Close range" onClick={() => setOpen(false)} />}
    <div className={`range${open ? ' open' : ''}`}>
      <div className="collapse" style={{maxHeight: open ? 48 : 0, opacity: open ? 1 : 0}} aria-hidden={!open}>
        <div className="range-head">
          <span className="label">Range</span>
          <button type="button" className="range-close" onClick={() => setOpen(false)} tabIndex={open ? 0 : -1}>
            {from}–{band.inches}" ⌃
          </button>
        </div>
      </div>
      <div className="range-row">
        <div className="bands" role="group" aria-label="Range">
          {/* The selected band's highlight glides to the tapped band. */}
          <span className="band-pill" aria-hidden="true" style={{left: `calc(${selected} * 100% / ${RANGE_BANDS.length})`, width: `calc(100% / ${RANGE_BANDS.length})`}} />
          {RANGE_BANDS.map((b, i) => (
            <button type="button" key={b.to} className={`band${i === selected ? ' on' : ''}`} aria-pressed={i === selected}
              aria-label={`${b.label}: active ${signed(view.bands[i].A)}, reactive ${signed(view.bands[i].B)}`}
              onClick={() => dispatch({type: 'setRange', rangeCm: b.to, open: true})}>
              <span className="stripe" style={{background: open ? bandColor(view.bands[i].A) : 'transparent'}} />
              <span className="dist">{i === selected ? `${b.inches}"` : b.inches}</span>
              <span className="stripe" style={{background: open ? bandColor(view.bands[i].B) : 'transparent'}} />
            </button>
          ))}
        </div>
        <button type="button" className="icon-btn swap" aria-label="Swap active and reactive" onClick={() => flipSwap(() => dispatch({type: 'swapSides'}))}>⇅</button>
      </div>
      <div className="collapse" style={{maxHeight: open ? 64 : 0, opacity: open ? 1 : 0}} aria-hidden={!open}>
        <div className="range-foot">
          <div className="mods">
            <span className="c-active">{weaponName(view.A)} <b>{hasA ? signed(mods.A) : '—'}</b></span>
            <span className="c-reactive">{weaponName(view.B)} <b>{hasB ? signed(mods.B) : '—'}</b></span>
          </div>
          <div className="key">
            <span><i style={{background: 'var(--band-plus)'}} />+3</span>
            <span><i style={{background: 'var(--band-zero)'}} />0</span>
            <span><i style={{background: 'var(--band-minus3)'}} />−3</span>
            <span><i style={{background: 'var(--band-minus6)'}} />−6</span>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}

RangeSelector.propTypes = {view: PropTypes.object.isRequired};
