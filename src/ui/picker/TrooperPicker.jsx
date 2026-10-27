// Full-screen trooper picker for one side. The search box sits at the bottom,
// by the thumb. Empty box, no faction: faction tiles, then recent picks. With
// a faction: recent picks, unit-type tiles and its units A-Z (browsing).
// Typing: matching recents, profiles, then units (searching). Tapping a unit
// or a type tile drills into its own list (PickerScreens.jsx); the rows are
// Rows.jsx.
// Query, faction scope and the drill-in stack are the state document's
// ui.picker, so Back (button, Escape or the browser's) pops one screen.
import {useEffect, useMemo, useRef} from 'react';
import PropTypes from 'prop-types';
import {ROLE} from '../../state/schema.js';
import {dispatch, useAppState} from '../../state/store.js';
import FactionLogo from '../factionLogo.jsx';
import LoadFailed from '../LoadFailed.jsx';
import {Page} from '../Sheet.jsx';
import {TYPE_ORDER, quickSearches, typeName} from './constants.js';
import {factionsScreen, typeScreen, unitScreen} from './PickerScreens.jsx';
import {ProfileRow, UnitRow} from './Rows.jsx';
import {factionNameOf, useRecentIds} from './useRecentIds.js';
import {useT} from '../i18n.jsx';
import {back} from '../nav.js';

/** @typedef {import('../../types.js').ProfileHit} ProfileHit */
/** @typedef {import('../../types.js').UnitHit} UnitHit */

/** @param {string} query */
const setQuery = (query) => dispatch({type: 'pickerQuery', query});
/** @param {number | null} scope */
const setScope = (scope) => dispatch({type: 'pickerScope', scope});
/** @param {import('../../types.js').PickerView} view */
const push = (view) => dispatch({type: 'pickerPush', view});

// Three across leaves room for recents above the fold; these don't fit.
// Keyed by faction id (vanilla Combined Army, Non-Aligned Armies), so any
// language's long name is replaced.
/** @type {Record<number, string>} */
const SHORT_NAMES = {601: 'picker.shortCombined', 901: 'picker.shortNa'};

/**
 * @param {{side: import('../../types.js').Side, searcher: import('../../types.js').Searcher | null, army: import('../../types.js').Army | null,
 *   onPick: (hit: ProfileHit) => void, loadError?: (() => void) | null}} props
 */
export default function TrooperPicker({side, searcher, army, onPick, loadError}) {
  const t = useT();
  const color = ROLE[side];
  // Shown while the picker is open (ui.picker set).
  const {query, scope, stack} = useAppState((s) => /** @type {import('../../types.js').PickerState} */ (s.ui.picker));
  const recentFactions = useAppState((s) => s.lists.recentFactions);
  // Drill-in stack: {view: 'factions'} | {view: 'type', type} | {view: 'unit', unitId, name}
  const top = stack.at(-1) ?? null;
  const pop = back;
  const onClose = back;
  const inputRef = useRef(/** @type {HTMLInputElement | null} */ (null));
  // preventScroll: focusing must not scroll the page to the input (the page
  // already fits above the keyboard, useVisualViewport.js).
  useEffect(() => { if (!top) inputRef.current?.focus({preventScroll: true}); }, [top]);

  const recentIds = useRecentIds(searcher, side);
  const results = useMemo(() => {
    if (!searcher) return null;
    return query.trim()
      ? {mode: /** @type {const} */ ('search'), ...searcher.search({query, factionId: scope, recentIds})}
      : {mode: /** @type {const} */ ('browse'), ...searcher.browse({factionId: scope, recentIds})};
  }, [searcher, query, scope, recentIds]);

  /** @param {number | null | undefined} id */
  const factionName = (id) => factionNameOf(searcher, id, t);
  /** @param {ProfileHit} hit */
  const pick = (hit) => onPick(hit);
  /** @param {UnitHit} u */
  const openUnit = (u) => push({view: 'unit', unitId: u.unitId, name: u.short});

  // Enter takes the top result, but never a typo guess: the player confirms those.
  const firstHit = results?.mode === 'search' ? (results.recent[0] ?? results.profiles[0]) : null;
  /** @param {import('react').FormEvent} e */
  const onSubmit = (e) => {
    e.preventDefault();
    if (firstHit && !firstHit.loose) pick(firstHit);
  };

  const sideName = t(`side.${color}`);
  const title = <span className={`role ${color}`}>{t('side.trooper', {side: sideName}).toLocaleUpperCase(t.lang)}</span>;

  // Drilled in: one of the screens in PickerScreens.jsx.
  if (top?.view === 'factions') return factionsScreen({t, searcher, scope, color, recentFactions, pop, setScope});
  // Drilling in needs the searcher (the screens were pushed from its lists).
  if (top?.view === 'type') return typeScreen({t, searcher: /** @type {import('../../types.js').Searcher} */ (searcher), scope, top, factionName, pop, openUnit});
  if (top?.view === 'unit') return unitScreen({t, searcher: /** @type {import('../../types.js').Searcher} */ (searcher), army, scope, color, top, factionName, pop, pick});

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
      <label htmlFor={`trooper-search-${side}`} className="label vh">{t('picker.search')}</label>
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
                <button type="button" key={o.factionId} className="line-btn boxed"
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
            {/** @type {import('../../types.js').Searcher} */ (searcher).factions.map((f) => (
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
