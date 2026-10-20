// Full-screen trooper picker for one side. The search box sits at the bottom,
// by the thumb. Empty box, no faction: faction tiles, then recent picks. With
// a faction: recent picks, unit-type tiles and its units A-Z (browsing).
// Typing: matching recents, profiles, then units (searching). Tapping a unit or a type tile drills into its own list.
// Query, faction scope and the drill-in stack are the state document's
// ui.picker, so Back (button, Escape or the browser's) pops one screen.
import {useEffect, useMemo, useRef} from 'react';
import PropTypes from 'prop-types';
import {ROLE} from '../../state/schema.js';
import {dispatch, useAppState} from '../../state/store.js';
import FactionLogo from '../factionLogo.jsx';
import {crestForRow} from '../../army/crests.js';
import {extraLoadoutName} from '../../army/names.js';
import {RowCrest} from '../Crest.jsx';
import LoadFailed from '../LoadFailed.jsx';
import {Page} from '../Sheet.jsx';
import {TYPE_ORDER, quickSearches, typeName} from './constants.js';
import {groupLoadouts, loadoutTag, orderLoadouts, statLine} from './loadouts.js';
import {factionNameOf, useRecentIds} from './useRecentIds.js';
import {useT} from '../i18n.jsx';

// The loadout's weapons, the one the query matched first: several loadouts
// often share their main weapon and only differ further down the list.
function weaponList(hit) {
  const rest = hit.weapons.filter((w) => w !== hit.weapon);
  return [hit.weapon, ...rest].filter(Boolean).join(', ');
}

function ProfileRow({hit, onPick, first, color, army}) {
  const t = useT();
  const extra = extraLoadoutName(hit.loadout, hit.unit) ?? loadoutTag(army, hit);
  return (
    <button type="button" className={`hit${first ? ' first' : ''}`} onClick={() => onPick(hit)}>
      <RowCrest slug={crestForRow(army, hit)} />
      <span className="t">{hit.unit}{extra && <span className="tag"> · {extra}</span>}</span>
      <span className={`w c-${color}`}>{weaponList(hit)}</span>
      <span className="m">{t('stat.bs')} {hit.bs ?? '—'} · {hit.swc} {t('picker.swc')} · {hit.points} {t('picker.pts')}{hit.loose && <span className="loose"> · {t('picker.closeMatch')}</span>}</span>
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

// Three across leaves room for recents above the fold; these don't fit.
// Keyed by faction id (vanilla Combined Army, Non-Aligned Armies), so any
// language's long name is replaced.
const SHORT_NAMES = {601: 'picker.shortCombined', 901: 'picker.shortNa'};

export default function TrooperPicker({side, searcher, army, onPick, loadError}) {
  const t = useT();
  const color = ROLE[side];
  const {query, scope, stack} = useAppState((s) => s.ui.picker);
  const recentFactions = useAppState((s) => s.lists.recentFactions);
  // Drill-in stack: {view: 'factions'} | {view: 'type', type} | {view: 'unit', unitId, name}
  const top = stack.at(-1) ?? null;
  const pop = back;
  const onClose = back;
  const inputRef = useRef(null);
  // preventScroll: focusing must not scroll the page to the input (the page
  // already fits above the keyboard, useVisualViewport.js).
  useEffect(() => { if (!top) inputRef.current?.focus({preventScroll: true}); }, [top]);

  const recentIds = useRecentIds(searcher, side);
  const results = useMemo(() => {
    if (!searcher) return null;
    return query.trim()
      ? {mode: 'search', ...searcher.search({query, factionId: scope, recentIds})}
      : {mode: 'browse', ...searcher.browse({factionId: scope, recentIds})};
  }, [searcher, query, scope, recentIds]);

  const factionName = (id) => factionNameOf(searcher, id, t);
  const pick = (hit) => onPick(hit);
  const openUnit = (u) => push({view: 'unit', unitId: u.unitId, name: u.short});

  // Enter takes the top result, but never a typo guess: the player confirms those.
  const firstHit = results?.mode === 'search' ? (results.recent[0] ?? results.profiles[0]) : null;
  const onSubmit = (e) => {
    e.preventDefault();
    if (firstHit && !firstHit.loose) pick(firstHit);
  };

  const sideName = t(`side.${color}`);
  const title = <span className={`role ${color}`}>{t('side.trooper', {side: sideName}).toLocaleUpperCase(t.lang)}</span>;

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
      <Page title={t('picker.faction')} onBack={pop}>
        {recent.length > 0 && <div className="list-head">{t('picker.recent')}</div>}
        {recent.map((f) => row(f, `recent-${f.id}`))}
        <div className="list-head">{t('picker.all')}</div>
        <button type="button" className="line-btn" onClick={() => choose(null)}>
          <span>{t('picker.allFactions')}</span><span className={`r c-${color}`}>{scope == null ? '✓' : ''}</span>
        </button>
        {factions.map((f) => row(f, `all-${f.id}`))}
      </Page>
    );
  }

  if (top?.view === 'type') {
    const units = searcher.unitsOfType(top.type, scope);
    return (
      <Page title={typeName(t, top.type)} subtitle={`${factionName(scope)} · ${t('picker.units', {count: units.length})}`} onBack={pop}>
        {units.map((u) => <UnitRow key={u.unitId} u={u} onOpen={openUnit} />)}
      </Page>
    );
  }

  if (top?.view === 'unit') {
    const rows = searcher.unitRows(top.unitId, scope);
    const stats = statLine(army, top.unitId, rows[0]?.armyFactionId);
    const groups = army ? groupLoadouts(army, orderLoadouts(army, rows)) : [{key: 'all', name: null, items: rows}];
    return (
      <Page title={top.name} subtitle={`${factionName(scope)} · ${t('picker.profiles', {count: rows.length})}`} onBack={pop}>
        {stats && (
          <div className="stat-line">{stats.map(([k, v]) => <span key={k}><b>{t(`stat.${k.toLowerCase()}`)}</b> {v}</span>)}</div>
        )}
        {groups.map((g) => (
          <div key={g.key}>
            {g.key !== 'all' && <div className="list-head">{t(`reach.${g.key}`)}</div>}
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
        {quickSearches(t.lang, side).map(([label, q]) => (
          // Tapping the lit chip again clears it.
          <button type="button" key={q} className={`chip${query.trim() === q ? ` on ${color}` : ''}`} aria-pressed={query.trim() === q}
            onClick={() => setQuery(query.trim() === q ? '' : q)}>{label}</button>
        ))}
      </div>
      <label htmlFor={`trooper-search-${side}`} className="label" style={{position: 'absolute', left: -9999}}>{t('picker.search')}</label>
      <input
        id={`trooper-search-${side}`}
        ref={inputRef}
        className={`search-input ${color}`}
        // No "name" in the placeholder: it made browsers offer contact AutoFill.
        placeholder={t('picker.placeholder')}
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
    <Page title={title} label={t('side.trooper', {side: sideName})} onBack={onClose} footer={searchBar} closeLabel={t('picker.cancel')}>
      {!results && (loadError
        ? <LoadFailed what={t('load.trooperList')} onRetry={loadError} className="empty" />
        : <div className="empty">{t('picker.loading')}</div>)}
      {results?.mode === 'search' && (
        <>
          {results.elsewhere.length > 0 && (
            <>
              <div className="empty">{t('picker.noMatchesIn', {faction: factionName(scope), query})}</div>
              {results.elsewhere.map((o) => (
                <button type="button" key={o.factionId} className="line-btn" style={{border: '1px solid var(--line-control)', margin: '4px 0'}}
                  onClick={() => setScope(o.factionId)}>
                  <span>{t('picker.countIn', {count: o.count, faction: o.name})}</span><span className={`r c-${color}`}>{t('picker.show')} ›</span>
                </button>
              ))}
              {results.elsewhere.length > 1 && (
                <button type="button" className="line-btn" onClick={() => setScope(null)}>
                  <span>{t('picker.searchAll')}</span><span className="r">›</span>
                </button>
              )}
            </>
          )}
          {results.total === 0 && results.elsewhere.length === 0 && <div className="empty">{t('picker.nothingMatches', {query})}</div>}
          {results.recent.length > 0 && <div className="list-head">{t('picker.recent')}</div>}
          {results.recent.map((h, i) => <ProfileRow army={army} color={color} key={`r${h.rowId}`} hit={h} onPick={pick} first={i === 0} />)}
          {results.profiles.length > 0 && <div className="list-head">{t('picker.profilesHead')} · {results.total}</div>}
          {results.profiles.map((h, i) => (
            <ProfileRow army={army} color={color} key={h.rowId} hit={h} onPick={pick} first={!results.recent.length && i === 0} />
          ))}
          {results.units.length > 0 && <div className="list-head">{t('picker.unitsHead')}</div>}
          {results.units.slice(0, 20).map((u) => <UnitRow key={u.unitId} u={u} onOpen={openUnit} />)}
        </>
      )}
      {results?.mode === 'browse' && scope == null && (
        // First screen for everyone: no faction yet, so pick one; an A-Z of
        // every army is no help. Recent picks come after.
        <>
          <div className="list-head">{t('picker.pickFaction')}</div>
          <div className="tiles three">
            {searcher.factions.map((f) => (
              <button type="button" key={f.id} className="tile faction-pick" onClick={() => setScope(f.id)}>
                <FactionLogo id={f.id} size={30} /><span>{SHORT_NAMES[f.id] ? t(SHORT_NAMES[f.id]) : f.name}</span>
              </button>
            ))}
          </div>
          {results.recent.length > 0 && <div className="list-head">{t('picker.recent')}</div>}
          {results.recent.map((h) => <ProfileRow army={army} color={color} key={`r${h.rowId}`} hit={h} onPick={pick} />)}
        </>
      )}
      {results?.mode === 'browse' && scope != null && (
        <>
          {results.recent.length > 0 && <div className="list-head">{t('picker.recent')}</div>}
          {results.recent.map((h) => <ProfileRow army={army} color={color} key={`r${h.rowId}`} hit={h} onPick={pick} />)}
          {results.types.length > 0 && (
            <>
              <div className="list-head">{t('picker.browseByType', {faction: factionName(scope)})}</div>
              <div className="tiles">
                {[...results.types].sort((a, b) => TYPE_ORDER.indexOf(a.type) - TYPE_ORDER.indexOf(b.type)).map((ty) => (
                  <button type="button" key={ty.type} className="tile" onClick={() => push({view: 'type', type: ty.type})}>
                    <span>{typeName(t, ty.type)}</span><span className="r">{ty.count}</span>
                  </button>
                ))}
              </div>
            </>
          )}
          <div className="list-head">{t('picker.allUnits')}</div>
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
