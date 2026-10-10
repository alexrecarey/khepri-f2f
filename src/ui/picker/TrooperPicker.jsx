// Full-screen trooper picker for one side. The search box sits at the bottom,
// by the thumb. Empty box, no faction: faction tiles, then recent picks. With
// a faction: recent picks, unit-type tiles and its units A-Z (browsing).
// Typing: matching recents, profiles, then units (searching). Tapping a unit or a type tile drills into its own list.
// Query, faction scope and the drill-in stack are the state document's
// ui.picker, so Back (button, Escape or the browser's) pops one screen.
import {useEffect, useMemo, useRef} from 'react';
import PropTypes from 'prop-types';
import {recentsFor} from '../../state/schema.js';
import {dispatch, useAppState} from '../../state/store.js';
import FactionLogo from '../factionLogo.jsx';
import {extraLoadoutName} from '../../army/names.js';
import LoadFailed from '../LoadFailed.jsx';
import {Page} from '../Sheet.jsx';
import {groupLoadouts, loadoutTag, orderLoadouts, statLine} from './loadouts.js';

export const TYPE_NAMES = {
  LI: 'Light Infantry', MI: 'Medium Infantry', HI: 'Heavy Infantry', TAG: 'TAGs',
  REM: 'REMs', SK: 'Skirmishers', WB: 'Warbands', VH: 'Vehicles',
};
const TYPE_ORDER = Object.keys(TYPE_NAMES);

// One tap fills the box with what players often look for on that side: big
// burst for the active trooper, ARO picks for the reactive one. Each query
// also finds the variants ("hmg": AP and MULTI HMG; "spitfire": AP / MULTI).
const QUICK = {
  A: [['HMG', 'hmg'], ['Spitfire', 'spitfire'], ['Red Fury', 'red fury']],
  B: [['+SD', '+SD'], ['Neurocinetics', 'neurocinetics'], ['Total Reaction', 'total reaction'],
    ['Missile Launcher', 'missile launcher'], ['HRL', 'hrl'], ['Sniper Rifle', 'sniper rifle']],
};

// The loadout's weapons, the one the query matched first: several loadouts
// often share their main weapon and only differ further down the list.
function weaponList(hit) {
  const rest = hit.weapons.filter((w) => w !== hit.weapon);
  return [hit.weapon, ...rest].filter(Boolean).join(', ');
}

function ProfileRow({hit, onPick, first, color, army}) {
  const extra = extraLoadoutName(hit.loadout, hit.unit) ?? loadoutTag(army, hit);
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
  color: PropTypes.string.isRequired, army: PropTypes.object,
};

// A loadout on its unit's page: the unit name is the page title, so just the
// weapons (and any loadout name), with the points on the right.
function LoadoutRow({hit, onPick, color, army}) {
  const extra = extraLoadoutName(hit.loadout, hit.unit) ?? loadoutTag(army, hit);
  return (
    <button type="button" className="line-btn loadout" onClick={() => onPick(hit)}>
      <span><span className={`c-${color}`}>{weaponList(hit)}</span>{extra && <span className="tag"> · {extra}</span>}</span>
      <span className="r">{hit.points}</span>
    </button>
  );
}

LoadoutRow.propTypes = {hit: PropTypes.object.isRequired, onPick: PropTypes.func.isRequired, color: PropTypes.string.isRequired, army: PropTypes.object};

function UnitRow({u, onOpen}) {
  return (
    <button type="button" className="line-btn" onClick={() => onOpen(u)}>
      <span>{u.short}</span><span className="r">{u.profileCount} ›</span>
    </button>
  );
}

UnitRow.propTypes = {u: PropTypes.object.isRequired, onOpen: PropTypes.func.isRequired};

const back = () => dispatch({type: 'back'});
const setQuery = (query) => dispatch({type: 'pickerQuery', query});
const setScope = (scope) => dispatch({type: 'pickerScope', scope});
const push = (view) => dispatch({type: 'pickerPush', view});

// Three across leaves room for recents above the fold; these two don't fit.
const SHORT_NAMES = {'Combined Army': 'Combined', 'Non-Aligned Armies': 'NA Armies'};

export default function TrooperPicker({side, searcher, army, onPick, loadError}) {
  const color = side === 'A' ? 'active' : 'reactive';
  const {query, scope, stack} = useAppState((s) => s.ui.picker);
  const recents = useAppState((s) => s.lists.recents);
  const recentFactions = useAppState((s) => s.lists.recentFactions);
  // Drill-in stack: {view: 'factions'} | {view: 'type', type} | {view: 'unit', unitId, name}
  const top = stack.at(-1) ?? null;
  const pop = back;
  const onClose = back;
  const inputRef = useRef(null);
  // preventScroll: focusing must not scroll the page to the input (the page
  // already fits above the keyboard, useVisualViewport.js).
  useEffect(() => { if (!top) inputRef.current?.focus({preventScroll: true}); }, [top]);

  const recentIds = useMemo(
    () => (searcher ? recentsFor(recents, side).map((r) => searcher.findRow(r)).filter((id) => id != null) : []),
    [searcher, recents, side],
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
    const choose = (id) => setScope(id);
    const factions = searcher?.factions ?? [];
    const row = (f, key) => (
      <button type="button" key={key} className="line-btn" onClick={() => choose(f.id)}>
        <span className="with-logo"><FactionLogo id={f.id} size={24} />{f.name}</span>
        <span className="r">{key.startsWith('all') ? searcher.unitCount(f.id) : ''} <span className={`c-${color}`}>{scope === f.id ? '✓' : ''}</span></span>
      </button>
    );
    const recent = recentFactions.map((id) => factions.find((f) => f.id === id)).filter(Boolean);
    return (
      <Page title="Faction" onBack={pop}>
        {recent.length > 0 && <div className="list-head">Recent</div>}
        {recent.map((f) => row(f, `recent-${f.id}`))}
        <div className="list-head">All</div>
        <button type="button" className="line-btn" onClick={() => choose(null)}>
          <span>All factions</span><span className={`r c-${color}`}>{scope == null ? '✓' : ''}</span>
        </button>
        {factions.map((f) => row(f, `all-${f.id}`))}
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
    const stats = statLine(army, top.unitId, rows[0]?.armyFactionId);
    const groups = army ? groupLoadouts(army, orderLoadouts(army, rows)) : [{key: 'all', name: null, items: rows}];
    return (
      <Page title={top.name} subtitle={`${factionName(scope)} · ${rows.length} profiles`} onBack={pop}>
        {stats && (
          <div className="stat-line">{stats.map(([k, v]) => <span key={k}><b>{k}</b> {v}</span>)}</div>
        )}
        {groups.map((g) => (
          <div key={g.key}>
            {g.name && <div className="list-head">{g.name}</div>}
            {g.items.map((h) => <LoadoutRow army={army} color={color} key={h.rowId} hit={h} onPick={pick} />)}
          </div>
        ))}
      </Page>
    );
  }

  const searchBar = (
    <form className="search-bar" role="search" autoComplete="off" onSubmit={onSubmit}>
      <div className="scope">
        <button type="button" className={`chip on ${color}`} onClick={() => push({view: 'factions'})}>
          {factionName(scope)} ▾
        </button>
        {QUICK[side].map(([label, q]) => (
          // Tapping the lit chip again clears it.
          <button type="button" key={q} className={`chip${query.trim() === q ? ` on ${color}` : ''}`} aria-pressed={query.trim() === q}
            onClick={() => setQuery(query.trim() === q ? '' : q)}>{label}</button>
        ))}
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
    <Page title={title} label={`${side === 'A' ? 'Active' : 'Reactive'} trooper`} onBack={onClose} footer={searchBar} closeLabel="Cancel">
      {!results && (loadError
        ? <LoadFailed what="the trooper list" onRetry={loadError} className="empty" />
        : <div className="empty">Loading units…</div>)}
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
          {results.recent.map((h, i) => <ProfileRow army={army} color={color} key={`r${h.rowId}`} hit={h} onPick={pick} first={i === 0} />)}
          {results.profiles.length > 0 && <div className="list-head">Profiles · {results.total}</div>}
          {results.profiles.map((h, i) => (
            <ProfileRow army={army} color={color} key={h.rowId} hit={h} onPick={pick} first={!results.recent.length && i === 0} />
          ))}
          {results.units.length > 0 && <div className="list-head">Units</div>}
          {results.units.slice(0, 20).map((u) => <UnitRow key={u.unitId} u={u} onOpen={openUnit} />)}
        </>
      )}
      {results?.mode === 'browse' && scope == null && (
        // First screen for everyone: no faction yet, so pick one; an A-Z of
        // every army is no help. Recent picks come after.
        <>
          <div className="list-head">Pick a faction</div>
          <div className="tiles three">
            {searcher.factions.map((f) => (
              <button type="button" key={f.id} className="tile crest" onClick={() => setScope(f.id)}>
                <FactionLogo id={f.id} size={30} /><span>{SHORT_NAMES[f.name] ?? f.name}</span>
              </button>
            ))}
          </div>
          {results.recent.length > 0 && <div className="list-head">Recent</div>}
          {results.recent.map((h) => <ProfileRow army={army} color={color} key={`r${h.rowId}`} hit={h} onPick={pick} />)}
        </>
      )}
      {results?.mode === 'browse' && scope != null && (
        <>
          {results.recent.length > 0 && <div className="list-head">Recent</div>}
          {results.recent.map((h) => <ProfileRow army={army} color={color} key={`r${h.rowId}`} hit={h} onPick={pick} />)}
          {results.types.length > 0 && (
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
  loadError: PropTypes.func,   // the search index failed: retry it
  side: PropTypes.oneOf(['A', 'B']).isRequired,
  searcher: PropTypes.object,
  army: PropTypes.object,
  onPick: PropTypes.func.isRequired,
};
