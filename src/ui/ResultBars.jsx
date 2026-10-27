// The two bars at the top of the results, and which breakdown shows under
// them. Each bar owns one: the wound bar the wound list, the face to face bar
// the best-die chart (FaceToFaceChart). Tapping a bar shows its breakdown in
// the same place; the other bar fades.
import {useState} from 'react';
import {pct} from '../results/summary.js';
import {useT} from './i18n.jsx';

// Who wins the Face to Face Roll, as one thin bar.
/** Which breakdown shows under the bars.
 * @typedef {'wounds' | 'f2f'} BreakdownView */

/** @param {{s: import('../types.js').Summary, className?: string}} props */
export function F2FBar({s, className = ''}) {
  const t = useT();
  return (
    <div className={`bar${className ? ` ${className}` : ''}`} role="img"
      aria-label={t('results.f2fBar', {active: pct(s.win.active), none: pct(s.win.none), reactive: pct(s.win.reactive)})}>
      <span className="seg-a2" style={{width: `${100 * s.win.active}%`}} />
      <span className="seg-none" style={{width: `${100 * s.win.none}%`}} />
      <span className="seg-r3" style={{width: `${100 * s.win.reactive}%`}} />
    </div>
  );
}

// 'wounds' | 'f2f': the breakdown under the bars. Back to the wounds when
// `reset` turns true (the phone sheet closing). Set during the render, not in
// an effect, so the closed sheet never paints the old breakdown first.
/**
 * @param {boolean} [reset]
 * @returns {[BreakdownView, (view: BreakdownView) => void]}
 */
export function useBreakdownView(reset = false) {
  const [view, setView] = useState(/** @type {BreakdownView} */ ('wounds'));
  if (reset && view !== 'wounds') setView('wounds');
  return [view, setView];
}

// A bar as the switch for its breakdown. on: its breakdown is the one shown;
// off ones fade while the other shows.
// Its name is the bar's own (its role=img label); aria-pressed says it is the
// one shown. ring: outline the bar while on (the face to face bar, whose
// breakdown is the one that isn't there by default).
/** @param {{on?: boolean, faded?: boolean, ring?: boolean, onPick: () => void, children?: import('react').ReactNode}} props */
export function BarButton({on, faded, ring, onPick, children}) {
  return (
    <button type="button" className={`bar-btn${faded ? ' faded' : ''}${ring ? ' ring' : ''}`} aria-pressed={on} onClick={onPick}>{children}</button>
  );
}

// The two bars, each a switch when `pick` (there is a chart to switch to):
// face to face toggles its breakdown, the wound bar goes back to the wounds.
/** @param {{f2fBar?: import('react').ReactNode, woundBar?: import('react').ReactNode, view: BreakdownView, onView: (view: BreakdownView) => void, pick: boolean}} props */
export function PickBars({f2fBar, woundBar, view, onView, pick}) {
  if (!pick) return <>{f2fBar}{woundBar}</>;
  const f2f = view === 'f2f';
  return (
    <>
      {f2fBar && <BarButton on={f2f} ring onPick={() => onView(f2f ? 'wounds' : 'f2f')}>{f2fBar}</BarButton>}
      <BarButton on={!f2f} faded={f2f} onPick={() => onView('wounds')}>{woundBar}</BarButton>
    </>
  );
}
