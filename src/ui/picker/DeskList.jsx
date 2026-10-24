// The desk picker's left pane: recents, a unit type's units, or the matches
// (this faction first, then other factions), with headings between.
import {useEffect} from 'react';
import PropTypes from 'prop-types';
import {TIER} from '../../search/search.js';
import {words} from '../../search/text.js';
import {crestForRow} from '../../army/crests.js';
import {RowCrest} from '../Crest.jsx';
import LoadFailed from '../LoadFailed.jsx';
import {typeName} from './constants.js';
import {useT} from '../i18n.jsx';
import {unitDetail} from '../../state/pickerView.js';
import {setCursor} from './useDeskPicker.js';

// The typed letters, marked where a word of the name starts with them.
/** @typedef {import('./useDeskPicker.js').DeskPickerModel} DeskPickerModel */

/** @param {{text: string, query: string}} props */
function Highlight({text, query}) {
  const tokens = words(query);
  if (!tokens.length) return text;
  return text.split(/(\s+)/).map((part, i) => {
    const folded = words(part)[0] ?? '';
    const t = tokens.find((tok) => folded.startsWith(tok));
    if (!t) return <span key={i}>{part}</span>;
    return <span key={i}><b className="hl">{part.slice(0, t.length)}</b>{part.slice(t.length)}</span>;
  });
}

Highlight.propTypes = {text: PropTypes.string.isRequired, query: PropTypes.string.isRequired};

/** @type {Record<number, string>} */
const REASON = {[TIER.TYPO1]: 'picker.closeMatch', [TIER.SOUND]: 'picker.soundsLike', [TIER.TYPO2]: 'picker.closeMatch'};

// "BS12 ARM1 W1" for a unit's first profile.
/**
 * @param {import('../../state/pickerView.js').UnitDetail | null} detail
 * @param {import('../../types.js').Translator} t
 */
function shortStats(detail, t) {
  /** @type {Record<string, number | number[] | undefined>} */
  const st = Object.fromEntries(detail?.profiles[0]?.stats ?? []);
  return detail ? `${t('stat.bs')}${st.BS} ${t('stat.arm')}${st.ARM} ${t(st.STR != null ? 'stat.str' : 'stat.w')}${st.STR ?? st.W}` : '';
}

// m: useDeskPicker(); loadError: retry for a search index that failed.
/** @param {{m: DeskPickerModel, loadError?: (() => void) | null}} props */
export default function DeskList({m, loadError}) {
  const t = useT();
  const {searcher, army, typing, query, items, rows, current, at, factionName, pick, matched} = m;
  // The arrow keys move the highlight; keep it in view.
  useEffect(() => {
    if (current) document.getElementById(`dp-row-${at}`)?.scrollIntoView({block: 'nearest'});
  }, [current != null, at]); // eslint-disable-line react-hooks/exhaustive-deps
  let i = -1;
  return (
    <div className="dp-list" id="dp-list" role="listbox" aria-label={t('picker.troopers')}>
      {!searcher && (loadError
        ? <LoadFailed what={t('load.trooperList')} onRetry={loadError} className="empty" />
        : <span className="empty">{t('picker.loading')}</span>)}
      {searcher && typing && rows.length === 0 && <span className="empty">{t('picker.nothingMatches', {query})}</span>}
      {items.map((x, k) => {
        if (x.kind === 'head') return <span key={`h${k}`} className="dp-head">{x.text}</span>;
        i += 1;
        const idx = i;
        const on = current != null && idx === at;
        const select = () => setCursor({cursor: idx, pane: 'list', lcursor: 0, profileId: null});
        if (x.kind === 'recent') {
          const d = unitDetail(army, x.hit.unitId, x.hit.armyFactionId);
          return (
            <div key={`r${x.hit.rowId}`} id={`dp-row-${idx}`} role="option" aria-selected={on} className={`dp-row${on ? ' on' : ''}`}
              onClick={select} onDoubleClick={() => pick(x.hit)}>
              <RowCrest slug={crestForRow(army, x.hit)} />
              <span className="t">{x.hit.unit} · {x.hit.weapon}</span><span className="s">{shortStats(d, t)}</span>
              <span className="sub">{factionName(x.hit.factionId)}</span>
            </div>
          );
        }
        const d = unitDetail(army, x.u.unitId, null);
        // A unit from browsing has no tier: no reason.
        const reason = REASON[/** @type {number} */ (x.u.tier)] && t(REASON[/** @type {number} */ (x.u.tier)]);
        return (
          <div key={`u${x.u.unitId}${x.away ? 'x' : ''}`} id={`dp-row-${idx}`} role="option" aria-selected={on}
            className={`dp-row${on ? ' on' : ''}`} onClick={select} onDoubleClick={() => (x.u.best ? pick(x.u.best) : select())}>
            <RowCrest slug={d?.profiles[0]?.crest} />
            <span className="t"><Highlight text={x.u.short} query={query} />{x.away ? ` · ${factionName(x.factionId)}` : ''}</span>
            <span className="s">{shortStats(d, t)}</span>
            <span className="sub">{typeName(t, x.u.type)}{reason && <span className="reason"> · {reason}</span>}</span>
          </div>
        );
      })}
      {typing && matched > rows.length && (
        <span className="dp-hint">{t('picker.showing', {shown: rows.length, matched})}</span>
      )}
      {rows.length > 0 && <span className="dp-hint"><kbd>↑↓</kbd> {t('keys.move')} <kbd>→</kbd> {t('keys.intoLoadouts')} <kbd>↵</kbd> {t('keys.pick')}</span>}
    </div>
  );
}

DeskList.propTypes = {m: PropTypes.object.isRequired, loadError: PropTypes.func};
