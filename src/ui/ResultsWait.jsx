// The results before there are any: the dice engine loading, and the wait
// for both troopers to be picked (the sheet's row, the panel's outline).
import {D20} from './icons.jsx';
import WpoRow from './WpoRow.jsx';
import {waitMessage} from './useResultsView.js';
import {useT} from './i18n.jsx';

// Until the first result shows up (the dice engine loading on a first visit,
// a few seconds) the two dice roll at each other, bump and bounce back: the
// face to face roll, before the maths. After that, recalculations shimmer.
/** @param {{label?: string}} props */
export function EngineLoading({label}) {
  const t = useT();
  return (
    <div className="engine-loading" role="status" aria-label={label}>
      <div className="clash">
        <span className="die-a"><D20 fill="var(--active)" /></span>
        <span className="die-b"><D20 fill="var(--reactive)" /></span>
      </div>
      <span className="small">{t('results.engineLoading')}</span>
    </div>
  );
}

// Each side's number while waiting: its still, dimmed die, or Ready in its
// own colour once that side is chosen (useResultsView.js waitingFor).
/** @param {{side: 'active' | 'reactive', ready?: boolean, size?: string}} props */
function SideWait({side, ready, size = ''}) {
  const t = useT();
  return ready
    ? <span className={`big ${size} c-${side} ready`}>{t('results.ready')}</span>
    : <span className={`wait-die ${size}`}><D20 fill={`var(--${side})`} /></span>;
}

/** @param {{picked: {A: boolean, B: boolean}, size?: string}} props */
export function WaitRow({picked, size}) {
  return <WpoRow active={<SideWait side="active" ready={picked.A} size={size} />} reactive={<SideWait side="reactive" ready={picked.B} size={size} />} />;
}

// Desktop and tablet: the whole results panel in outline, so its shape is
// there before the numbers are.
/** @param {{picked: {A: boolean, B: boolean}}} props */
export function WaitPanel({picked}) {
  const t = useT();
  /**
   * @param {string} side
   * @param {string[]} labels
   */
  const rows = (side, labels) => labels.map((l) => (
    <div key={`${side}${l}`} className="skel-row"><span>{l}</span><span className="skel" /><span>—%</span></div>
  ));
  return (
    <>
      <WaitRow picked={picked} size="xl" />
      <div className="skel skel-f2f" />
      <div className="skel skel-wounds" />
      <div className="skel-list">
        <span className="label c-active">{t('results.sideWins', {side: t('side.active')})} · —%</span>
        {rows('a', [t('results.atLeast', {count: 1}), t('results.atLeast', {count: 2}), t('results.atLeast', {count: 3}), t('results.allSaved')])}
        <span className="label">{t('results.nobodyWins')} · —%</span>{rows('n', [t('results.bothFail')])}
        <span className="label c-reactive">{t('results.sideWins', {side: t('side.reactive')})} · —%</span>
        {rows('r', [t('results.atLeast', {count: 1}), t('results.atLeast', {count: 2}), t('results.allSaved')])}
      </div>
      <span className="empty">{waitMessage(picked, t)}</span>
    </>
  );
}
