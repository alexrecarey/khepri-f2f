// The results card pinned to the bottom of both calculators, and the sheet it
// opens. The card: wounds per order for each side over the shaded wound bar.
// The sheet: the Face to Face bar, the labelled wound bar and the breakdown.
import PropTypes from 'prop-types';
import {dispatch, useAppState} from '../state/store.js';
import Ledger from './Ledger.jsx';
import {Sheet} from './Sheet.jsx';
import {pct, shows, summarize} from './results.js';
import {UnopposedCardBody, UnopposedSheetBody} from './Unopposed.jsx';

const SEG = {active: ['', 'seg-a1', 'seg-a2', 'seg-a3'], reactive: ['', 'seg-r1', 'seg-r2', 'seg-r3']};
const segClass = (s) => (s.side === 'none' ? 'seg-none' : SEG[s.side][s.wounds]);
const wpo = (n) => (n == null ? '—' : n.toFixed(2));

// The most wounds each side can cause in this roll (up to 3): that bucket is
// labelled "N+" ("2+" when 3 or more never happens).
const topWounds = (s, side) => Math.max(0, ...s.bar.filter((b) => b.side === side && shows(b.chance)).map((b) => b.wounds));
const woundsLabel = (w, top) => (w === top ? `${w}+` : `${w}`);

function WoundBar({summary, height, labels = false}) {
  const top = topWounds(summary, 'active');
  return (
    <div className="bar" style={{height, borderRadius: height > 10 ? 8 : 3}}>
      {summary.bar.filter((s) => shows(s.chance)).map((s) => (
        <span key={`${s.side}${s.wounds}`} className={segClass(s)} style={{width: `${100 * s.chance}%`, display: 'grid', placeItems: 'center',
          fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600, color: s.side === 'none' ? 'var(--muted)' : 'var(--active-ink)'}}>
          {labels && s.side === 'active' && s.chance > 0.05 ? woundsLabel(s.wounds, top) : ''}
          {labels && s.side === 'none' && s.chance > 0.05 ? '0' : ''}
        </span>
      ))}
    </div>
  );
}

WoundBar.propTypes = {summary: PropTypes.object.isRequired, height: PropTypes.number.isRequired, labels: PropTypes.bool};

export default function ResultsCard({result, status, diceLine, classic, ledger}) {
  const open = useAppState((st) => st.ui.overlay === 'results');
  const setOpen = (o) => dispatch(o ? {type: 'openOverlay', overlay: 'results'} : {type: 'back'});
  const s = summarize(result);
  return (
    <>
      <button type="button" className="peek" onClick={() => s && setOpen(true)} aria-label="Show full results">
        <span className="handle" />
        {s?.unopposed ? <UnopposedCardBody s={s} /> : (
          <>
        <div className="wpo-row">
          <div className="wpo"><span className="big c-active">{wpo(s?.wpo.active)}</span><span className="small">wounds / order</span></div>
          <div className="wpo right"><span className="big c-reactive">{wpo(s?.wpo.reactive)}</span><span className="small">wounds / order</span></div>
        </div>
        {s ? <WoundBar summary={s} height={6} /> : <div className="bar" style={{height: 6, background: 'var(--none)', borderRadius: 3}} />}
        <div className="split">
          {s ? <><span>{pct(s.atLeast.active[0])} at least one wound</span><span>{pct(s.atLeast.reactive[0])}</span></>
            : <span>{status}</span>}
        </div>
          </>
        )}
      </button>
      {open && s && (
        <Sheet onClose={() => setOpen(false)} label="Results">
          {s.unopposed ? (
            <UnopposedSheetBody s={s} names={ledger?.names ?? {A: 'Active', B: 'Reactive'}} diceLine={diceLine} />
          ) : classic ? (
            <>
          <div style={{display: 'flex', flexDirection: 'column', gap: 6}}>
            <span className="label">Face to face</span>
            <div className="bar" style={{height: 28, borderRadius: 7}}>
              <span className="seg-a2" style={{width: `${100 * s.win.active}%`}} />
              <span className="seg-none" style={{width: `${100 * s.win.none}%`}} />
              <span className="seg-r3" style={{width: `${100 * s.win.reactive}%`}} />
            </div>
            <div className="split" style={{color: 'var(--text-2)'}}>
              <span>{shows(s.win.active) ? `Active wins ${pct(s.win.active)}` : ''}</span>
              <span>{shows(s.win.none) ? `${pct(s.win.none)} nobody` : ''}</span>
              <span>{shows(s.win.reactive) ? `Reactive ${pct(s.win.reactive)}` : ''}</span>
            </div>
          </div>
          <div style={{display: 'flex', flexDirection: 'column', gap: 6}}>
            <span className="label">Wounds</span>
            <WoundBar summary={s} height={28} labels />
          </div>
          <div className="mini">
            <div><b className="c-active">{wpo(s.wpo.active)}</b> <span className="small">wounds / order</span></div>
            <div><b className="c-reactive">{wpo(s.wpo.reactive)}</b> <span className="small">wounds / order</span></div>
          </div>
              <Breakdown s={s} />
            </>
          ) : (
            <>
          <div className="wpo-row">
            <div className="wpo"><span className="big xl c-active">{wpo(s.wpo.active)}</span><span className="small">wounds / order</span></div>
            <div className="wpo right"><span className="big xl c-reactive">{wpo(s.wpo.reactive)}</span><span className="small">wounds / order</span></div>
          </div>
          <div className="bar" style={{height: 4, borderRadius: 2}} role="img"
            aria-label={`Face to face: active wins ${pct(s.win.active)}, nobody ${pct(s.win.none)}, reactive wins ${pct(s.win.reactive)}`}>
            <span className="seg-a2" style={{width: `${100 * s.win.active}%`}} />
            <span className="seg-none" style={{width: `${100 * s.win.none}%`}} />
            <span className="seg-r3" style={{width: `${100 * s.win.reactive}%`}} />
          </div>
          <WoundBar summary={s} height={40} labels />
              <Breakdown s={s} />
            </>
          )}
          {ledger && !s.unopposed && <div className="mods-sep" />}
          {ledger && <Ledger {...ledger} />}
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
  // {ledger: buildLedger(...), names: {A, B}, notes: [...]}; matchup only.
  ledger: PropTypes.object,
};

// Who wins the roll, and what each winner does: at least 1 / 2 / 3 wounds
// (cumulative, so the rows overlap) and every hit saved. Anything that never
// happens is left out.
function Breakdown({s}) {
  const scale = 250; // px for 100%
  const row = (k, chance, cls) => (shows(chance) ? (
    <div className="row" key={`${cls}-${k}`}>
      <span className="k">{k}</span>
      <span className={`b ${cls}`} style={{width: Math.max(2, scale * chance)}} />
      <span className="p">{pct(chance)}</span>
    </div>
  ) : null);
  const ladder = (side, cls) => [
    ...s.atLeast[side].map((p, i) => row(`${i + 1}+ wounds`, p, `${cls}${i + 1}`)),
    row('all saved', s.saved[side], 'seg-none'),
  ];
  const head = (text, cls, first) => <div className={`label ${cls}`} style={{padding: first ? '0 0 4px' : '14px 0 6px'}}>{text}</div>;
  return (
    <div className="breakdown">
      {shows(s.win.active) && head(`Active wins the roll · ${pct(s.win.active)}`, 'c-active', true)}
      {shows(s.win.active) && ladder('active', 'seg-a')}
      {shows(s.win.none) && head(`Nobody wins · ${pct(s.win.none)}`, '', !shows(s.win.active))}
      {row('both fail', s.win.none, 'seg-none n')}
      {shows(s.win.reactive) && head(`Reactive wins the roll · ${pct(s.win.reactive)}`, 'c-reactive', false)}
      {shows(s.win.reactive) && ladder('reactive', 'seg-r')}
      <span className="note" style={{paddingTop: 8}}>1+ / 2+ / 3+ = at least that many wounds, so they overlap</span>
    </div>
  );
}

Breakdown.propTypes = {s: PropTypes.object.isRequired};
