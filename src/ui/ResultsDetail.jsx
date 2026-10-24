// The results below the headline numbers: the labelled wound bar, the
// Matchup breakdown (who wins, then at least 1 / 2 / 3 wounds) and the
// Classic ladders.
import PropTypes from 'prop-types';
import {pct, shows} from '../results/summary.js';
import {useT} from './i18n.jsx';

/** @typedef {import('../types.js').Summary} Summary */
/** @typedef {'active' | 'reactive'} Role */

/** @param {number | null | undefined} n */
const wpo = (n) => (n == null ? '—' : n.toFixed(2));

/** @type {Record<Role, string[]>} */
const SEG = {active: ['', 'seg-a1', 'seg-a2', 'seg-a3'], reactive: ['', 'seg-r1', 'seg-r2', 'seg-r3']};
/** @param {import('../types.js').BarSegment} s */
const segClass = (s) => (s.side === 'none' ? 'seg-none' : SEG[s.side][s.wounds]);

// The most wounds each side can cause in this roll (up to 3): that bucket is
// labelled "N+" ("2+" when 3 or more never happens).
/**
 * @param {Summary} s
 * @param {Role} side
 */
const topWounds = (s, side) => Math.max(0, ...s.bar.filter((b) => b.side === side && shows(b.chance)).map((b) => b.wounds));
/**
 * @param {number} w
 * @param {number} top
 */
const woundsLabel = (w, top) => (w === top ? `${w}+` : `${w}`);

// `grow`: the phone sheet's bar, sized by CSS from --open, its labels fading
// in with it; else a fixed `height`, or none and `className` sizes it.
/** @param {{summary: Summary, labels?: boolean, grow?: boolean, className?: string}} props */
export function WoundBar({summary, labels = false, grow = false, className = ''}) {
  const top = topWounds(summary, 'active');
  return (
    <div className={`bar${grow ? ' rs-wbar' : ''}${className ? ` ${className}` : ''}`}>
      {summary.bar.filter((s) => shows(s.chance)).map((s) => (
        <span key={`${s.side}${s.wounds}`} className={`${segClass(s)} seg-l`} style={{width: `${100 * s.chance}%`}}>
          <span className="lbl">
            {labels && s.side === 'active' && s.chance > 0.05 ? woundsLabel(s.wounds, top) : ''}
            {labels && s.side === 'none' && s.chance > 0.05 ? '0' : ''}
          </span>
        </span>
      ))}
    </div>
  );
}

WoundBar.propTypes = {summary: PropTypes.object.isRequired, height: PropTypes.number, labels: PropTypes.bool, grow: PropTypes.bool, className: PropTypes.string};

// Classic results: the face-to-face bar with its numbers, the wound bar, then
// each side's wounds per order and its at-least ladder, nobody wounded between.
// woundBar false: the phone sheet already shows the wound bar at its top.
/** @param {{s: Summary, woundBar?: boolean}} props */
export function ClassicBody({s, woundBar = true}) {
  const t = useT();
  /**
   * @param {Role} side
   * @param {string} cls
   * @param {string} name
   */
  const ladder = (side, cls, name) => (
    <div className="ladder">
      <div className={`ladder-h c-${side}`}><b>{wpo(s.wpo[side])}</b><span>{t('classic.sideWpo', {side: name})}</span></div>
      {s.atLeast[side].map((p, i) => (shows(p) ? (
        <div key={i} className="ladder-r"><i className={`${cls}${i + 1}`} /><span>{t('classic.orMore', {count: i + 1})}</span><span className="p">{pct(p)}</span></div>
      ) : null))}
    </div>
  );
  /** @param {number} p */
  const big = (p) => p > 0.12;
  return (
    <>
      <div className="field">
        <span className="label">{t('results.faceToFace')}</span>
        <div className="bar labelled">
          <span className="seg-a2" style={{width: `${100 * s.win.active}%`}}>{big(s.win.active) ? pct(s.win.active) : ''}</span>
          <span className="seg-none" style={{width: `${100 * s.win.none}%`}} />
          <span className="seg-r3" style={{width: `${100 * s.win.reactive}%`}}>{big(s.win.reactive) ? pct(s.win.reactive) : ''}</span>
        </div>
        <div className="split"><span>{t('results.sideWins', {side: t('side.active')})}</span><span>{t('classic.nobody', {p: pct(s.win.none)})}</span>
          <span>{t('results.sideWins', {side: t('side.reactive')})}</span></div>
      </div>
      {woundBar && (
        <div className="field">
          <span className="label">{t('classic.wounds')}</span>
          <WoundBar summary={s} className="classic-wounds" labels />
        </div>
      )}
      {ladder('active', 'seg-a', t('side.active'))}
      <div className="ladder">
        <div className="label">{t('results.nobodyWounded')}</div>
        <div className="ladder-r"><i className="seg-none edged" /><span>{t('classic.neither')}</span><span className="p">{pct(s.bar[3].chance)}</span></div>
        {shows(s.saved.active) && <div className="ladder-r sub"><span>{t('classic.winsAllSaved', {side: t('side.active')})}</span><span className="p">{pct(s.saved.active)}</span></div>}
        {shows(s.saved.reactive) && <div className="ladder-r sub"><span>{t('classic.winsAllSaved', {side: t('side.reactive')})}</span><span className="p">{pct(s.saved.reactive)}</span></div>}
      </div>
      {ladder('reactive', 'seg-r', t('side.reactive'))}
    </>
  );
}

ClassicBody.propTypes = {s: PropTypes.object.isRequired, woundBar: PropTypes.bool};

// Who wins the roll, and what each winner does: at least 1 / 2 / 3 wounds
// (cumulative, so the rows overlap) and every hit saved. Anything that never
// happens is left out.
/** @param {{s: Summary}} props */
export function Breakdown({s}) {
  const t = useT();
  /**
   * Bars share one track, so 100% fills it.
   * @param {string} k
   * @param {number} chance
   * @param {string} cls
   */
  const row = (k, chance, cls) => (shows(chance) ? (
    <div className="row" key={`${cls}-${k}`}>
      <span className="k">{k}</span>
      <span className="track"><span className={`b ${cls}`} style={{width: `max(2px, ${100 * chance}%)`}} /></span>
      <span className="p">{pct(chance)}</span>
    </div>
  ) : null);
  /**
   * @param {Role} side
   * @param {string} cls
   */
  const ladder = (side, cls) => [
    ...s.atLeast[side].map((p, i) => row(t('results.atLeast', {count: i + 1}), p, `${cls}${i + 1}`)),
    row(t('results.allSaved'), s.saved[side], 'seg-none'),
  ];
  /**
   * @param {string} text
   * @param {string} cls
   * @param {boolean} first
   */
  const head = (text, cls, first) => <div className={`label head${first ? ' first' : ''}${cls ? ` ${cls}` : ''}`}>{text}</div>;
  return (
    <div className="breakdown">
      {shows(s.win.active) && head(`${t('results.sideWinsRoll', {side: t('side.active')})} · ${pct(s.win.active)}`, 'c-active', true)}
      {shows(s.win.active) && ladder('active', 'seg-a')}
      {shows(s.win.none) && head(`${t('results.nobodyWins')} · ${pct(s.win.none)}`, '', !shows(s.win.active))}
      {row(t('results.bothFail'), s.win.none, 'seg-none n')}
      {shows(s.win.reactive) && head(`${t('results.sideWinsRoll', {side: t('side.reactive')})} · ${pct(s.win.reactive)}`, 'c-reactive', false)}
      {shows(s.win.reactive) && ladder('reactive', 'seg-r')}
      <span className="note overlap-note">{t('results.overlapNote')}</span>
    </div>
  );
}

Breakdown.propTypes = {s: PropTypes.object.isRequired};
