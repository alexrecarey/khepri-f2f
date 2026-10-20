// Face to face breakdown: each side's best die, mirrored on one row of
// readings (active above, reactive below). A bar is the chance that reading is
// the side's best die; its bright part is where that best die wins the roll.
// The numbers come from rules/bestDie.js.
import PropTypes from 'prop-types';
import {CRIT, MISS, breakdownWins, faceToFaceBreakdown} from '../rules/bestDie.js';
import {pct} from './results.js';

const LABEL = {[MISS]: '✕', [CRIT]: 'C'};
// Bars this likely or more carry their number.
const TAG_MIN = 0.08;
const dice = (n) => (n === 1 ? '1 die' : `best of ${n} dice`);
// Past this many columns two-digit numbers run into each other: only the
// even ones are written.
const ALL_LABELS_MAX = 16;
const axisLabel = (r, cols) => LABEL[r] ?? (cols > ALL_LABELS_MAX && r % 2 ? '' : r);
const whole = (p) => `${Math.round(100 * p)}%`;

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

export default function FaceToFaceChart({params, names}) {
  const b = faceToFaceBreakdown(params);
  if (!b) return null;
  const scale = Math.max(...[...b.active.best, ...b.reactive.best].map((x) => x.chance));
  const w = breakdownWins(b);
  const summary = `Active wins ${pct(w.active)}, nobody ${pct(w.none)}, reactive ${pct(w.reactive)}`;
  return (
    <section className="f2f-break" aria-label="Face to face breakdown">
      <span className="label">Face to face breakdown</span>
      <p className="f2f-lead">Chance of obtaining the best die. The higher best die wins the roll, equal cancel. The bright part of the bar is when that best die wins.</p>
      <div className="f2f-chart" role="img" aria-label={summary} style={{'--cols': b.readings.length}}>
        <span className="f2f-name c-active">{names.A} · {dice(b.active.dice)}</span>
        <Bars side="active" best={b.active.best} scale={scale} />
        <div className="f2f-axis">{b.readings.map((r) => <span key={r} className={r === CRIT ? 'crit' : ''}>{axisLabel(r, b.readings.length)}</span>)}</div>
        <Bars side="reactive" best={b.reactive.best} scale={scale} />
        <span className="f2f-name c-reactive">{names.B} · {dice(b.reactive.dice)}</span>
      </div>
    </section>
  );
}

FaceToFaceChart.propTypes = {params: PropTypes.object, names: PropTypes.object.isRequired};
