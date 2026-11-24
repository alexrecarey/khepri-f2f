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

// A part wide enough for its percentage (labels).
const LABEL_FITS = 0.12;

// labels: each part's percentage written in (Classic), the plain grey nobody
// part left blank.
/** @param {{s: import('../types.js').Summary, labels?: boolean, className?: string}} props */
export function F2FBar({s, labels = false, className = ''}) {
  const t = useT();
  const [active, none, reactive] = s.f2f;
  const p = {active: pct(active.chance), none: pct(none.chance), reactive: pct(reactive.chance)};
  return (
    <div className={`bar${className ? ` ${className}` : ''}`} role="img"
      aria-label={none.dodger ? t('results.f2fBarDodge', {...p, side: t(`side.${none.dodger}`)}) : t('results.f2fBar', p)}>
      {s.f2f.map((part) => (
        <span key={part.side} className={part.seg} style={{width: `${100 * part.chance}%`}}>
          {labels && part.seg !== 'seg-none' && part.chance > LABEL_FITS ? pct(part.chance) : ''}
        </span>
      ))}
    </div>
  );
}

// The nobody part's title in the lists under the bars, and its row's label
// when the list's own ("both fail") doesn't fit: a Dodger that got away.
/**
 * @param {import('../types.js').F2FPart} none
 * @param {import('../types.js').Translator} t
 * @returns {{title: string, row: string | null}}
 */
export const noneText = (none, t) => (none.dodger
  ? {title: t('results.sideDodges', {side: t(`side.${none.dodger}`)}), row: t('results.noHits')}
  : {title: t('results.nobodyWins'), row: null});

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
function BarButton({on, faded, ring, onPick, children}) {
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
