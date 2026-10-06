// Full-screen trooper picker for one side. The search box sits at the bottom,
// by the thumb. Empty box: recent picks, unit-type tiles for the faction, and
// every unit A-Z (browsing). Typing: matching recents, profiles, then units
// (searching). Tapping a unit or a type tile drills into its own list.
import {useEffect, useMemo, useRef, useState} from 'react';
import PropTypes from 'prop-types';
import {extraLoadoutName} from '../names.js';
import {Page} from '../Sheet.jsx';

export const TYPE_NAMES = {
  LI: 'Light Infantry', MI: 'Medium Infantry', HI: 'Heavy Infantry', TAG: 'TAGs',
  REM: 'REMs', SK: 'Skirmishers', WB: 'Warbands', VH: 'Vehicles',
};
const TYPE_ORDER = Object.keys(TYPE_NAMES);

// The loadout's weapons, the one the query matched first: several loadouts
// often share their main weapon and only differ further down the list.
function weaponList(hit) {
  const rest = hit.weapons.filter((w) => w !== hit.weapon);
  return [hit.weapon, ...rest].filter(Boolean).join(', ');
}

function ProfileRow({hit, onPick, first, color}) {
  const extra = extraLoadoutName(hit.loadout, hit.unit);
  return (
    <button type="button" className={`hit${first ? ' first' : ''}`} onClick={() => onPick(hit)}>
      <span className="t">{hit.unit}{extra && <span className="tag"> · {extra}</span>}</span>
      <span className={`w c-${color}`}>{weaponList(hit)}</span>
      <span className="m">BS {hit.bs ?? '—'} · {hit.swc} SWC · {hit.points} pts{hit.loose && <span className="loose"> · close match</span>}</span>
    </button>
  );
}

ProfileRow.propTypes = {
  hit: PropTypes.object.isRequired, onPick: PropTypes.func.isRequired, first: PropTypes.bool,
  color: PropTypes.string.isRequired,
};

function UnitRow({u, onOpen}) {
  return (
    <button type="button" className="line-btn" onClick={() => onOpen(u)}>
      <span>{u.short}</span><span className="r">{u.profileCount} ›</span>
    </button>
  );
}

UnitRow.propTypes = {u: PropTypes.object.isRequired, onOpen: PropTypes.func.isRequired};

export default function TrooperPicker({side, searcher, initialScope, recents, onPick, onClose}) {
  const color = side === 'A' ? 'active' : 'reactive';
  const [query, setQuery] = useState('');
  const [scope, setScope] = useState(initialScope ?? null);
  // Drill-in stack: {view: 'factions'} | {view: 'type', type} | {view: 'unit', unitId, name}
  const [stack, setStack] = useState([]);
  const top = stack.at(-1) ?? null;
  const push = (v) => setStack((s) => [...s, v]);
  const pop = () => setStack((s) => s.slice(0, -1));
  const inputRef = useRef(null);
  useEffect(() => { if (!top) inputRef.current?.focus(); }, [top]);

  const recentIds = useMemo(
    () => (searcher ? recents.map((r) => searcher.findRow(r)).filter((id) => id != null) : []),
    [searcher, recents],
  );
  const results = useMemo(() => {
    if (!searcher) return null;
    return query.trim()
      ? {mode: 'search', ...searcher.search({query, factionId: scope, recentIds})}
      : {mode: 'browse', ...searcher.browse({factionId: scope, recentIds})};
  }, [searcher, query, scope, recentIds]);

  const factionName = (id) => searcher?.factions.find((f) => f.id === id)?.name ?? 'All factions';
  const pick = (hit) => onPick(hit);
  const openUnit = (u) => push({view: 'unit', unitId: u.unitId, name: u.short});

  // Enter takes the top result, but never a typo guess: the player confirms those.
  const firstHit = results?.mode === 'search' ? (results.recent[0] ?? results.profiles[0]) : null;
  const onSubmit = (e) => {
    e.preventDefault();
    if (firstHit && !firstHit.loose) pick(firstHit);
  };

  const title = <span className={`role ${color}`}>{side === 'A' ? 'ACTIVE' : 'REACTIVE'} TROOPER</span>;

  if (top?.view === 'factions') {
    const choose = (id) => { setScope(id); pop(); };
    return (
      <Page title="Faction" onBack={pop}>
        <button type="button" className="line-btn" onClick={() => choose(null)}>
          <span>All factions</span><span className="r">{scope == null ? '✓' : ''}</span>
        </button>
        {(searcher?.factions ?? []).map((f) => (
          <button type="button" key={f.id} className="line-btn" onClick={() => choose(f.id)}>
            <span>{f.name}</span><span className={`r c-${color}`}>{scope === f.id ? '✓' : ''}</span>
          </button>
        ))}
      </Page>
    );
  }

  if (top?.view === 'type') {
    const units = searcher.unitsOfType(top.type, scope);
    return (
      <Page title={TYPE_NAMES[top.type] ?? top.type} subtitle={`${factionName(scope)} · ${units.length} units`} onBack={pop}>
        {units.map((u) => <UnitRow key={u.unitId} u={u} onOpen={openUnit} />)}
      </Page>
    );
  }

  if (top?.view === 'unit') {
    const rows = searcher.unitRows(top.unitId, scope);
    return (
      <Page title={top.name} subtitle={`${factionName(scope)} · ${rows.length} profiles`} onBack={pop}>
        {rows.map((h) => <ProfileRow color={color} key={h.rowId} hit={h} onPick={pick} />)}
      </Page>
    );
  }

  const searchBar = (
    <form className="search-bar" role="search" autoComplete="off" onSubmit={onSubmit}>
      <div className="scope">
        <button type="button" className={`chip on ${color}`} onClick={() => push({view: 'factions'})}>
          {factionName(scope)} ▾
        </button>
      </div>
      <label htmlFor={`trooper-search-${side}`} className="label" style={{position: 'absolute', left: -9999}}>Search troopers</label>
      <input
        id={`trooper-search-${side}`}
        ref={inputRef}
        className={`search-input ${color}`}
        // No "name" in the placeholder: it made browsers offer contact AutoFill.
        placeholder="Unit or weapon, e.g. fus ml"
        name={`trooper-search-${side}`}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        enterKeyHint="go"
      />
    </form>
  );

  return (
    <Page title={title} onBack={onClose} footer={searchBar}>
      {!results && <div className="empty">Loading units…</div>}
      {results?.mode === 'search' && (
        <>
          {results.elsewhere.length > 0 && (
            <>
              <div className="empty">No {factionName(scope)} matches for “{query}”</div>
              {results.elsewhere.map((o) => (
                <button type="button" key={o.factionId} className="line-btn" style={{border: '1px solid #333', margin: '4px 0'}}
                  onClick={() => setScope(o.factionId)}>
                  <span>{o.count} in {o.name}</span><span className={`r c-${color}`}>Show ›</span>
                </button>
              ))}
              {results.elsewhere.length > 1 && (
                <button type="button" className="line-btn" onClick={() => setScope(null)}>
                  <span>Search all factions</span><span className="r">›</span>
                </button>
              )}
            </>
          )}
          {results.total === 0 && results.elsewhere.length === 0 && <div className="empty">Nothing matches “{query}”</div>}
          {results.recent.length > 0 && <div className="list-head">Recent</div>}
          {results.recent.map((h, i) => <ProfileRow color={color} key={`r${h.rowId}`} hit={h} onPick={pick} first={i === 0} />)}
          {results.profiles.length > 0 && <div className="list-head">Profiles · {results.total}</div>}
          {results.profiles.map((h, i) => (
            <ProfileRow color={color} key={h.rowId} hit={h} onPick={pick} first={!results.recent.length && i === 0} />
          ))}
          {results.units.length > 0 && <div className="list-head">Units</div>}
          {results.units.slice(0, 20).map((u) => <UnitRow key={u.unitId} u={u} onOpen={openUnit} />)}
        </>
      )}
      {results?.mode === 'browse' && (
        <>
          {results.recent.length > 0 && <div className="list-head">Recent</div>}
          {results.recent.map((h) => <ProfileRow color={color} key={`r${h.rowId}`} hit={h} onPick={pick} />)}
          {scope != null && results.types.length > 0 && (
            <>
              <div className="list-head">Browse {factionName(scope)} by type</div>
              <div className="tiles">
                {[...results.types].sort((a, b) => TYPE_ORDER.indexOf(a.type) - TYPE_ORDER.indexOf(b.type)).map((t) => (
                  <button type="button" key={t.type} className="tile" onClick={() => push({view: 'type', type: t.type})}>
                    <span>{TYPE_NAMES[t.type] ?? t.type}</span><span className="r">{t.count}</span>
                  </button>
                ))}
              </div>
            </>
          )}
          <div className="list-head">All units A–Z</div>
          {results.units.map((u) => <UnitRow key={u.unitId} u={u} onOpen={openUnit} />)}
        </>
      )}
    </Page>
  );
}

TrooperPicker.propTypes = {
  side: PropTypes.oneOf(['A', 'B']).isRequired,
  searcher: PropTypes.object,
  initialScope: PropTypes.number,
  recents: PropTypes.array.isRequired,
  onPick: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};
