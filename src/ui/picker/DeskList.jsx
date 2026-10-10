// The desk picker's left pane: recents, a unit type's units, or the matches
// (this faction first, then other factions), with headings between.
import PropTypes from 'prop-types';
import {TIER} from '../../search/search.js';
import {words} from '../../search/text.js';
import LoadFailed from '../LoadFailed.jsx';
import {TYPE_NAMES} from './constants.js';
import {unitDetail} from './loadouts.js';
import {setCursor} from './useDeskPicker.js';

// The typed letters, marked where a word of the name starts with them.
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

const REASON = {[TIER.TYPO1]: 'close match', [TIER.SOUND]: 'sounds like', [TIER.TYPO2]: 'close match'};

// "BS12 ARM1 W1" for a unit's first profile.
function shortStats(detail) {
  const st = Object.fromEntries(detail?.profiles[0]?.stats ?? []);
  return detail ? `BS${st.BS} ARM${st.ARM} ${st.STR != null ? 'STR' : 'W'}${st.STR ?? st.W}` : '';
}

// m: useDeskPicker(); loadError: retry for a search index that failed.
export default function DeskList({m, loadError}) {
  const {searcher, army, typing, query, items, rows, current, at, factionName, pick} = m;
  let i = -1;
  return (
    <div className="dp-list" id="dp-list" role="listbox" aria-label="Troopers">
      {!searcher && (loadError
        ? <LoadFailed what="the trooper list" onRetry={loadError} className="empty" />
        : <span className="empty">Loading units…</span>)}
      {searcher && typing && rows.length === 0 && <span className="empty">Nothing matches “{query}”</span>}
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
              <span className="t">{x.hit.unit} · {x.hit.weapon}</span><span className="s">{shortStats(d)}</span>
              <span className="sub">{factionName(x.hit.factionId)}</span>
            </div>
          );
        }
        const d = unitDetail(army, x.u.unitId, null);
        const reason = REASON[x.u.tier];
        return (
          <div key={`u${x.u.unitId}${x.away ? 'x' : ''}`} id={`dp-row-${idx}`} role="option" aria-selected={on}
            className={`dp-row${on ? ' on' : ''}`} onClick={select} onDoubleClick={() => { select(); }}>
            <span className="t"><Highlight text={x.u.short} query={query} />{x.away ? ` · ${factionName(x.factionId)}` : ''}</span>
            <span className="s">{shortStats(d)}</span>
            <span className="sub">{TYPE_NAMES[x.u.type] ?? x.u.type ?? ''}{reason && <span className="reason"> · {reason}</span>}</span>
          </div>
        );
      })}
      {rows.length > 0 && <span className="dp-hint"><kbd>↑↓</kbd> move <kbd>→</kbd> into loadouts <kbd>↵</kbd> pick</span>}
    </div>
  );
}

DeskList.propTypes = {m: PropTypes.object.isRequired, loadError: PropTypes.func};
