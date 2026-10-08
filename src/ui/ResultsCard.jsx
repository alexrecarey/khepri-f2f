// Results, three ways over the same body:
//   ResultsCard   phone: the card pinned to the bottom, opening a sheet
//   ResultsPanel  tablet and desktop: the same content inline, in its column
// The card: wounds per order for each side over the shaded wound bar. The
// body: the Face to Face bar, the labelled wound bar and the breakdown.
import PropTypes from 'prop-types';
import {dispatch, useAppState} from '../state/store.js';
import {BookmarkIcon, ShareIcon} from './icons.jsx';
import {shareLink} from './share.js';
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

// Save and Share on the sheet's handle row. `save` = {saved, toggle} or null
// while there is nothing to save.
function SheetActions({save}) {
  return (
    <>
      {save && (
        <button type="button" className="icon-btn sm" aria-pressed={save.saved} aria-label={save.saved ? 'Saved; remove from saved rolls' : 'Save this roll'}
          onClick={save.toggle} style={{color: save.saved ? 'var(--active)' : undefined}}><BookmarkIcon filled={save.saved} /></button>
      )}
      <button type="button" className="icon-btn sm" aria-label="Share a link to this roll" onClick={shareLink}><ShareIcon /></button>
    </>
  );
}

SheetActions.propTypes = {save: PropTypes.object};

export default function ResultsCard({result, status, diceLine, classic, ledger, save}) {
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
        <Sheet onClose={() => setOpen(false)} label="Results" actions={<SheetActions save={save} />}>
          <ResultsBody s={s} classic={classic} ledger={ledger} diceLine={diceLine} />
          {ledger && !s.unopposed && <div className="mods-sep" />}
          {ledger && <Ledger {...ledger} />}
          {status && <span className="status">{status}</span>}
        </Sheet>
      )}
    </>
  );
}

// What the results say, wherever they are shown.
function ResultsBody({s, classic, ledger, diceLine}) {
  if (s.unopposed) return <UnopposedSheetBody s={s} names={ledger?.names ?? {A: 'Active', B: 'Reactive'}} diceLine={diceLine} />;
  if (classic) return <ClassicBody s={s} />;
  return (
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
  );
}

ResultsBody.propTypes = {s: PropTypes.object.isRequired, classic: PropTypes.bool, ledger: PropTypes.object, diceLine: PropTypes.object};

// Tablet and desktop: the results in their own column, always open. The mods
// go in another column unless `withLedger`.
export function ResultsPanel({result, status, diceLine, classic, ledger, save, withLedger = false}) {
  const s = summarize(result);
  return (
    <section className="results-panel" aria-label="Results">
      <div className="panel-head"><span className="label">Results</span><span className="sheet-actions"><SheetActions save={save} /></span></div>
      {s ? <ResultsBody s={s} classic={classic} ledger={ledger} diceLine={diceLine} /> : <span className="empty">{status}</span>}
      {withLedger && s && ledger && <Ledger {...ledger} />}
      {s && status && <span className="status">{status}</span>}
    </section>
  );
}

ResultsPanel.propTypes = {
  result: PropTypes.object, status: PropTypes.string, diceLine: PropTypes.object, classic: PropTypes.bool,
  ledger: PropTypes.object, save: PropTypes.object, withLedger: PropTypes.bool,
};

ResultsCard.propTypes = {
  result: PropTypes.object,
  status: PropTypes.string,
  // {active: 'B4 SV14 PS9', reactive: ...}; matchup only.
  diceLine: PropTypes.object,
  classic: PropTypes.bool,
  // {ledger: buildLedger(...), names: {A, B}, notes: [...]}; matchup only.
  ledger: PropTypes.object,
  // {saved, toggle}: the Save button; null hides it.
  save: PropTypes.object,
};

// Classic results: the face-to-face bar with its numbers, the wound bar, then
// each side's wounds per order and its at-least ladder, nobody wounded between.
function ClassicBody({s}) {
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
      <div style={{display: 'flex', flexDirection: 'column', gap: 6}}>
        <span className="label">Wounds</span>
        <WoundBar summary={s} height={28} labels />
      </div>
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

ClassicBody.propTypes = {s: PropTypes.object.isRequired};

// Who wins the roll, and what each winner does: at least 1 / 2 / 3 wounds
// (cumulative, so the rows overlap) and every hit saved. Anything that never
// happens is left out.
function Breakdown({s}) {
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
