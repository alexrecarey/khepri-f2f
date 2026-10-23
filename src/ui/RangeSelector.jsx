// The shared distance between the two side cards, and the swap button.
import {useEffect} from 'react';
import PropTypes from 'prop-types';
import {isPseudo} from '../army/weapons.js';
import {RANGE_BANDS, bandFrom, bandLabel} from '../rules/ranges.js';
import {pseudoName} from '../rules/trooper.js';
import {render} from '../i18n/message.js';
import {dispatch, useAppState} from '../state/store.js';
import {bandColor, signedMod as signed} from './bands.js';
import RangeScale, {SplitChip} from './RangeScale.jsx';
import {ZoneChips, ZoneMarks, zoneText} from './RangeZones.jsx';
import {weaponText} from './WeaponButtons.jsx';
import {useT} from './i18n.jsx';

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
const weaponName = (side, t) => {
  const w = side.resolved?.weapon;
  if (!w) return '—';
  if (isPseudo(w)) return render(t, pseudoName(w));
  return weaponText(w, t);
};

const bandIndex = (cm) => Math.max(0, RANGE_BANDS.findIndex((b) => b.to === cm));
// "24–32"" ("60–80 cm") for a band index.
const span = (i, t) => t('dist.value', {n: `${t.distance(bandFrom(i))}–${t.distance(RANGE_BANDS[i].to)}`});

// The distance. Closed: one slim row of bands. Tapping a band picks it
// straight away and opens the selector, which adds a header above and a
// legend below and lights up each weapon's Range MOD as a stripe (active above,
// reactive below). The row of bands itself never moves or resizes, open or
// closed. Lines of fire are reciprocal, so both sides usually share the
// distance; Split range gives each its own (RangeScale), as when the reactive
// answers from somewhere else.
export default function RangeSelector({view}) {
  const t = useT();
  const open = useAppState((st) => st.ui.rangeOpen);
  const rangeCm = useAppState((st) => st.matchup.rangeCm);
  const rangeCmB = useAppState((st) => st.matchup.rangeCmB ?? null);
  const split = rangeCmB != null;
  const setOpen = (o) => dispatch({type: 'setRangeOpen', open: o});
  // Open, Escape closes it like a tap outside.
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') dispatch({type: 'setRangeOpen', open: false}); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);
  const selected = bandIndex(rangeCm);
  const selB = split ? bandIndex(rangeCmB) : selected;
  // Range MODs per band (matchupView bands): undefined = no range bands.
  const modA = view.bands[selected].A;
  const modB = view.bands[selB].B;
  // What Smoke / White Noise do to each side (null before the army loads).
  const vis = view.vis ?? null;

  // Open, a tap anywhere outside the selector closes it (the scrim).
  return (
    <>
    {open && <button type="button" className="range-scrim" aria-label={t('range.close')} onClick={() => setOpen(false)} />}
    {/* Both sides in close combat: the distance changes nothing, so it dims. */}
    <div className={`range${open ? ' open' : ''}${view.rangeUnused ? ' unused' : ''}`}
      title={view.rangeUnused ? t('range.unused') : undefined}>
      <div className="collapse head" aria-hidden={!open}>
        <div className="range-head">
          <span className="label">{t('range.title')}</span>
          <button type="button" className="range-close" onClick={() => setOpen(false)} tabIndex={open ? 0 : -1}>
            {split ? <><span className="c-active">{span(selected, t)}</span> <span className="c-reactive">{span(selB, t)}</span></> : span(selected, t)} ⌃
          </button>
        </div>
      </div>
      <div className="range-row">
        {split ? <RangeScale bands={view.bands} open={open} selA={selected} selB={selB} /> : (
        <div className="bands" role="group" aria-label={t('range.title')}>
          {/* The selected band's highlight glides to the tapped band. */}
          <span className="band-pill" aria-hidden="true" style={{left: `calc(${selected} * 100% / ${RANGE_BANDS.length})`, width: `calc(100% / ${RANGE_BANDS.length})`}} />
          {RANGE_BANDS.map((b, i) => (
            <button type="button" key={b.to} className={`band${i === selected ? ' on' : ''}`} aria-pressed={i === selected}
              aria-label={t('range.band', {band: bandLabel(i, t), active: signed(view.bands[i].A), reactive: signed(view.bands[i].B)})}
              onClick={() => dispatch({type: 'setRange', rangeCm: b.to, open: true})}>
              <span className="stripe" style={{background: open ? bandColor(view.bands[i].A) : 'transparent'}} />
              <span className="dist">{i === selected ? t('dist.picked', {n: t.distance(b.to)}) : t.distance(b.to)}</span>
              <span className="stripe" style={{background: open ? bandColor(view.bands[i].B) : 'transparent'}} />
            </button>
          ))}
        </div>
        )}
        <ZoneMarks zones={view.zones} open={open} />
        <button type="button" className="icon-btn swap" aria-label={t('range.swap')} onClick={() => flipSwap(() => dispatch({type: 'swapSides'}))}>⇅</button>
      </div>
      <div className="collapse foot" aria-hidden={!open}>
        <div className="range-foot">
          <div className="mods">
            <span className="c-active">{weaponName(view.A, t)} <b>{signed(modA)}</b><small>{vis && zoneText(vis.A, t)}</small></span>
            <span className="c-reactive">{weaponName(view.B, t)} <b>{signed(modB)}</b><small>{vis && zoneText(vis.B, t)}</small></span>
          </div>
          <div className="key">
            <span><i className="plus" />+3</span>
            <span><i className="zero" />0</span>
            <span><i className="minus3" />−3</span>
            <span><i className="minus6" />−6</span>
          </div>
        </div>
        <div className="range-chips">
          <SplitChip split={split} open={open} />
          <ZoneChips zones={view.zones} open={open} />
        </div>
      </div>
    </div>
    </>
  );
}

RangeSelector.propTypes = {view: PropTypes.object.isRequired};
