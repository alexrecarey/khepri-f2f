// Face to face breakdown: each side's best die, mirrored on one row of
// readings (active above, reactive below). A bar is the chance that reading is
// the side's best die; its bright part is where that best die wins the roll.
// The numbers come from rules/bestDie.js. It takes the place of the wound
// list when the face to face bar is tapped (ResultsCard), so it ends with what
// the wound list would have said per outcome: who wins, and why.
import PropTypes from 'prop-types';
import {CRIT, MISS, breakdownParts, breakdownWins} from '../rules/bestDie.js';
import {pct, shows} from '../results/summary.js';
import {useT} from './i18n.jsx';

/** @typedef {import('../rules/bestDie.js').Breakdown} Breakdown */
/** @typedef {import('../rules/bestDie.js').Reading} Reading */

/** @type {Record<string, string>} */
const LABEL = {[MISS]: '✕', [CRIT]: 'C'};
// Bars this likely or more carry their number.
const TAG_MIN = 0.08;
/**
 * @param {number} n
 * @param {import('../types.js').Translator} t
 */
const dice = (n, t) => (n === 1 ? t('f2f.oneDie') : t('f2f.bestOf', {count: n}));
// Past this many columns two-digit numbers run into each other: only the
// even ones are written.
const ALL_LABELS_MAX = 16;
/**
 * @param {Reading} r
 * @param {number} cols
 */
// LABEL names the two readings that aren't numbers.
const axisLabel = (r, cols) => LABEL[r] ?? (cols > ALL_LABELS_MAX && /** @type {number} */ (r) % 2 ? '' : r);
/** @param {number} p */
const whole = (p) => `${Math.round(100 * p)}%`;

/** @param {{side: 'active' | 'reactive', best: Breakdown['active']['best'], scale: number}} props */
function Bars({side, best, scale}) {
  return (
    <div className={`f2f-bars ${side}`}>
      {best.map(({reading, chance, wins}) => (
        <span key={reading} className="f2f-col">
          <span className="f2f-bar" style={{height: `calc(var(--f2f-h) * ${chance / scale})`}}>
            <span className="lose" style={{height: `${chance ? 100 * (1 - wins / chance) : 0}%`}} />
            <span className="win" style={{height: `${chance ? 100 * wins / chance : 0}%`}} />
          </span>
          <span className="f2f-tag">{chance >= TAG_MIN ? whole(chance) : ''}</span>
        </span>
      ))}
    </div>
  );
}

Bars.propTypes = {side: PropTypes.string.isRequired, best: PropTypes.array.isRequired, scale: PropTypes.number.isRequired};

// Under the chart: each outcome's chance and where it comes from (a side's
// Critical; for nobody, the three ways the best dice cancel).
/** @param {{b: Breakdown, w: ReturnType<typeof breakdownWins>, names: {A: string, B: string}}} props */
function WhyLines({b, w, names}) {
  const t = useT();
  const {critWins, cancel} = breakdownParts(b);
  /** @param {number} p */
  const crit = (p) => (shows(p) ? t('f2f.withCrit', {p: pct(p)}) : '');
  const cancels = /** @type {[string, number][]} */ ([['f2f.same', cancel.same], ['f2f.bothCrit', cancel.crits], ['f2f.bothMiss', cancel.misses]])
    .filter(([, p]) => shows(p)).map(([k, p]) => t(k, {p: pct(p)})).join(' · ');
  /**
   * @param {string} cls
   * @param {string} title
   * @param {number} p
   * @param {string} why
   */
  const line = (cls, title, p, why) => (shows(p) ? (
    <div className="f2f-why"><div><b className={cls}>{title}</b><span className="p">{pct(p)}</span></div>{why && <span className="sub">{why}</span>}</div>
  ) : null);
  return (
    <div className="f2f-whys">
      {line('c-active', t('results.sideWins', {side: names.A}), w.active, crit(critWins.active))}
      {line('', t('results.nobodyWins'), w.none, cancels)}
      {line('c-reactive', t('results.sideWins', {side: names.B}), w.reactive, crit(critWins.reactive))}
    </div>
  );
}

WhyLines.propTypes = {b: PropTypes.object.isRequired, w: PropTypes.object.isRequired, names: PropTypes.object.isRequired};

// b: faceToFaceBreakdown(params), worked out once by the results.
/** @param {{b: Breakdown, names: {A: string, B: string}}} props */
export default function FaceToFaceChart({b, names}) {
  const t = useT();
  const scale = Math.max(...[...b.active.best, ...b.reactive.best].map((x) => x.chance));
  const w = breakdownWins(b);
  const summary = t('f2f.summary', {active: pct(w.active), none: pct(w.none), reactive: pct(w.reactive)});
  return (
    <section className="f2f-break" id="f2f-breakdown" aria-label={t('f2f.title')}>
      <div className="f2f-head"><span className="label">{t('f2f.title')}</span><span className="hint">{t('f2f.backHint')}</span></div>
      <p className="f2f-lead">{t('f2f.lead')}</p>
      <div className="f2f-chart" role="img" aria-label={summary} style={/** @type {import('react').CSSProperties} */ ({'--cols': b.readings.length})}>
        <span className="f2f-name c-active">{names.A} · {dice(b.active.dice, t)}</span>
        <Bars side="active" best={b.active.best} scale={scale} />
        <div className="f2f-axis">{b.readings.map((r) => <span key={r} className={r === CRIT ? 'crit' : ''}>{axisLabel(r, b.readings.length)}</span>)}</div>
        <Bars side="reactive" best={b.reactive.best} scale={scale} />
        <span className="f2f-name c-reactive">{names.B} · {dice(b.reactive.dice, t)}</span>
      </div>
      <WhyLines b={b} w={w} names={names} />
    </section>
  );
}

FaceToFaceChart.propTypes = {b: PropTypes.object.isRequired, names: PropTypes.object.isRequired};
