// The results below the headline numbers: the labelled wound bar, the
// Matchup breakdown (who wins, then at least 1 / 2 / 3 wounds) and the
// Classic ladders.
import PropTypes from 'prop-types';
import {pct, shows} from './results.js';

const wpo = (n) => (n == null ? '—' : n.toFixed(2));

const SEG = {active: ['', 'seg-a1', 'seg-a2', 'seg-a3'], reactive: ['', 'seg-r1', 'seg-r2', 'seg-r3']};
const segClass = (s) => (s.side === 'none' ? 'seg-none' : SEG[s.side][s.wounds]);

// The most wounds each side can cause in this roll (up to 3): that bucket is
// labelled "N+" ("2+" when 3 or more never happens).
const topWounds = (s, side) => Math.max(0, ...s.bar.filter((b) => b.side === side && shows(b.chance)).map((b) => b.wounds));
const woundsLabel = (w, top) => (w === top ? `${w}+` : `${w}`);

// `grow`: the phone sheet's bar, sized by CSS from --open (6 px resting, 40
// open), its labels fading in with it; else a fixed `height`.
export function WoundBar({summary, height, labels = false, grow = false}) {
  const top = topWounds(summary, 'active');
  return (
    <div className={`bar${grow ? ' rs-wbar' : ''}`} style={grow ? undefined : {height, borderRadius: height > 10 ? 8 : 3}}>
      {summary.bar.filter((s) => shows(s.chance)).map((s) => (
        <span key={`${s.side}${s.wounds}`} className={segClass(s)} style={{width: `${100 * s.chance}%`, display: 'grid', placeItems: 'center',
          fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600, color: s.side === 'none' ? 'var(--muted)' : 'var(--active-ink)'}}>
          <span className="lbl">
            {labels && s.side === 'active' && s.chance > 0.05 ? woundsLabel(s.wounds, top) : ''}
            {labels && s.side === 'none' && s.chance > 0.05 ? '0' : ''}
          </span>
        </span>
      ))}
    </div>
  );
}

WoundBar.propTypes = {summary: PropTypes.object.isRequired, height: PropTypes.number, labels: PropTypes.bool, grow: PropTypes.bool};

// Classic results: the face-to-face bar with its numbers, the wound bar, then
// each side's wounds per order and its at-least ladder, nobody wounded between.
// woundBar false: the phone sheet already shows the wound bar at its top.
export function ClassicBody({s, woundBar = true}) {
  const ladder = (side, cls, name) => (
    <div className="ladder">
      <div className={`ladder-h c-${side}`}><b>{wpo(s.wpo[side])}</b><span>{name} wounds / order</span></div>
      {s.atLeast[side].map((p, i) => (shows(p) ? (
        <div key={i} className="ladder-r"><i className={`${cls}${i + 1}`} /><span>{i + 1} or more wounds</span><span className="p">{pct(p)}</span></div>
      ) : null))}
    </div>
  );
  const big = (p) => p > 0.12;
  return (
    <>
      <div style={{display: 'flex', flexDirection: 'column', gap: 6}}>
        <span className="label">Face to face</span>
        <div className="bar labelled" style={{height: 28, borderRadius: 7}}>
          <span className="seg-a2" style={{width: `${100 * s.win.active}%`, color: 'var(--active-ink)'}}>{big(s.win.active) ? pct(s.win.active) : ''}</span>
          <span className="seg-none" style={{width: `${100 * s.win.none}%`}} />
          <span className="seg-r3" style={{width: `${100 * s.win.reactive}%`, color: 'var(--reactive-ink)'}}>{big(s.win.reactive) ? pct(s.win.reactive) : ''}</span>
        </div>
        <div className="split"><span>Active wins</span><span>{pct(s.win.none)} nobody</span><span>Reactive wins</span></div>
      </div>
      {woundBar && (
        <div style={{display: 'flex', flexDirection: 'column', gap: 6}}>
          <span className="label">Wounds</span>
          <WoundBar summary={s} height={28} labels />
        </div>
      )}
      {ladder('active', 'seg-a', 'Active')}
      <div className="ladder">
        <div className="label">Nobody wounded</div>
        <div className="ladder-r"><i className="seg-none edged" /><span>Neither side causes a wound</span><span className="p">{pct(s.bar[3].chance)}</span></div>
        {shows(s.saved.active) && <div className="ladder-r sub"><span>Active wins, every hit saved</span><span className="p">{pct(s.saved.active)}</span></div>}
        {shows(s.saved.reactive) && <div className="ladder-r sub"><span>Reactive wins, every hit saved</span><span className="p">{pct(s.saved.reactive)}</span></div>}
      </div>
      {ladder('reactive', 'seg-r', 'Reactive')}
    </>
  );
}

ClassicBody.propTypes = {s: PropTypes.object.isRequired, woundBar: PropTypes.bool};

// Who wins the roll, and what each winner does: at least 1 / 2 / 3 wounds
// (cumulative, so the rows overlap) and every hit saved. Anything that never
// happens is left out.
export function Breakdown({s}) {
  // Bars share one track, so 100% fills it.
  const row = (k, chance, cls) => (shows(chance) ? (
    <div className="row" key={`${cls}-${k}`}>
      <span className="k">{k}</span>
      <span className="track"><span className={`b ${cls}`} style={{width: `max(2px, ${100 * chance}%)`}} /></span>
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
