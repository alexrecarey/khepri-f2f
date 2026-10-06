// The results card pinned to the bottom of both calculators, and the sheet it
// opens. The card: wounds per order for each side over the shaded wound bar.
// The sheet: the Face to Face bar, the labelled wound bar and the breakdown.
import {useState} from 'react';
import PropTypes from 'prop-types';
import {Sheet} from './Sheet.jsx';
import {pct, summarize} from './results.js';

const SEG = {active: ['', 'seg-a1', 'seg-a2', 'seg-a3'], reactive: ['', 'seg-r1', 'seg-r2', 'seg-r3']};
const segClass = (s) => (s.side === 'none' ? 'seg-none' : SEG[s.side][s.wounds]);
const wpo = (n) => (n == null ? '—' : n.toFixed(2));

function WoundBar({summary, height, labels = false}) {
  return (
    <div className="bar" style={{height, borderRadius: height > 10 ? 8 : 3}}>
      {summary.bar.filter((s) => s.chance > 0).map((s) => (
        <span key={`${s.side}${s.wounds}`} className={segClass(s)} style={{width: `${100 * s.chance}%`, display: 'grid', placeItems: 'center',
          fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600, color: s.side === 'none' ? 'var(--muted)' : 'var(--active-ink)'}}>
          {labels && s.side === 'active' && s.chance > 0.05 ? (s.wounds === 3 ? '3+' : s.wounds) : ''}
          {labels && s.side === 'none' && s.chance > 0.05 ? '0' : ''}
        </span>
      ))}
    </div>
  );
}

WoundBar.propTypes = {summary: PropTypes.object.isRequired, height: PropTypes.number.isRequired, labels: PropTypes.bool};

export default function ResultsCard({result, status, diceLine, classic}) {
  const [open, setOpen] = useState(false);
  const s = summarize(result);
  return (
    <>
      <button type="button" className="peek" onClick={() => s && setOpen(true)} aria-label="Show full results">
        <span className="handle" />
        <div className="wpo-row">
          <div className="wpo"><span className="big c-active">{wpo(s?.wpo.active)}</span><span className="small">wounds / order</span></div>
          <div className="wpo right"><span className="big c-reactive">{wpo(s?.wpo.reactive)}</span><span className="small">wounds / order</span></div>
        </div>
        {s ? <WoundBar summary={s} height={6} /> : <div className="bar" style={{height: 6, background: 'var(--none)', borderRadius: 3}} />}
        <div className="split">
          {s ? <><span>{pct(s.atLeast.active[0])} at least one wound</span><span>{pct(s.atLeast.reactive[0])}</span></>
            : <span>{status}</span>}
        </div>
      </button>
      {open && s && (
        <Sheet onClose={() => setOpen(false)} label="Results">
          {diceLine && (
            <div className="dice-line"><span className="c-active">{diceLine.active}</span><span className="c-reactive">{diceLine.reactive}</span></div>
          )}
          <div style={{display: 'flex', flexDirection: 'column', gap: 6}}>
            {classic && <span className="label">Face to face</span>}
            <div className="bar" style={{height: classic ? 28 : 4, borderRadius: classic ? 7 : 2}}>
              <span className="seg-a2" style={{width: `${100 * s.win.active}%`}} />
              <span className="seg-none" style={{width: `${100 * s.win.none}%`}} />
              <span className="seg-r3" style={{width: `${100 * s.win.reactive}%`}} />
            </div>
            <div className="split" style={{color: 'var(--text-2)'}}>
              <span>Active wins {pct(s.win.active)}</span><span>{pct(s.win.none)} nobody</span><span>{pct(s.win.reactive)}</span>
            </div>
          </div>
          <div style={{display: 'flex', flexDirection: 'column', gap: 6}}>
            {classic && <span className="label">Wounds</span>}
            <WoundBar summary={s} height={classic ? 28 : 40} labels />
            {!s.unopposed && <span className="note">Grey = nobody is wounded ({pct(s.bar[3].chance)}): missed, tied, or every hit saved</span>}
          </div>
          <div className="mini">
            <div><b className="c-active">{wpo(s.wpo.active)}</b> <span className="small">wounds / order</span></div>
            <div><b className="c-reactive">{wpo(s.wpo.reactive)}</b> <span className="small">wounds / order</span></div>
          </div>
          <Breakdown s={s} />
          {status && <span className="status">{status}</span>}
        </Sheet>
      )}
    </>
  );
}

ResultsCard.propTypes = {
  result: PropTypes.object,
  status: PropTypes.string,
  // {active: 'B4 SV14 PS9', reactive: ...}; matchup only.
  diceLine: PropTypes.object,
  classic: PropTypes.bool,
};

function Breakdown({s}) {
  const scale = 250; // px for 100%
  const row = (k, chance, cls) => (
    <div className="row" key={`${cls}-${k}`}>
      <span className="k">{k}</span>
      <span className={`b ${cls}`} style={{width: Math.max(2, scale * chance)}} />
      <span className="p">{pct(chance)}</span>
    </div>
  );
  const seg = (side, w) => s.bar.find((b) => b.side === side && b.wounds === w).chance;
  return (
    <div className="breakdown">
      <div className="label c-active" style={{paddingBottom: 4}}>Active wins the roll · {pct(s.win.active)}</div>
      {row('3+ wounds', seg('active', 3), 'seg-a3')}
      {row('2 wounds', seg('active', 2), 'seg-a2')}
      {row('1 wound', seg('active', 1), 'seg-a1')}
      {row('all saved', s.saved.active, 'seg-none a')}
      <div className="label" style={{padding: '14px 0 6px'}}>Nobody hits · {pct(s.win.none)}</div>
      {row('both fail', s.win.none, 'seg-none n')}
      <div className="label c-reactive" style={{padding: '14px 0 6px'}}>Reactive wins the roll · {pct(s.win.reactive)}</div>
      {row('all saved', s.saved.reactive, 'seg-none r')}
      {row('1 wound', seg('reactive', 1), 'seg-r1')}
      {row('2 wounds', seg('reactive', 2), 'seg-r2')}
      {row('3+ wounds', seg('reactive', 3), 'seg-r3')}
    </div>
  );
}

Breakdown.propTypes = {s: PropTypes.object.isRequired};
