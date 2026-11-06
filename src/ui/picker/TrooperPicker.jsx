// The trooper picker for one side: full screen on a phone, a centred panel on
// wider screens (DeskPicker.jsx). The search box sits at the top. Empty box:
// faction tiles and recent picks; in a faction, its recents, unit-type tiles
// and units A-Z. Typing searches every faction and lists units and loadouts
// in one ranked list (search.js items): a unit opens its page, a loadout is
// picked. ↑↓ move through the list, ↵ takes the highlighted row.
// Query, faction and the drill-in stack are the state document's ui.picker,
// so Back (button, Escape or the browser's) pops one screen.
import {useEffect, useMemo, useRef, useState} from 'react';
import {ROLE} from '../../state/schema.js';
import {dispatch, useAppState} from '../../state/store.js';
import FactionLogo from '../factionLogo.jsx';
import LoadFailed from '../LoadFailed.jsx';
import {Page} from '../Sheet.jsx';
import {TYPE_ORDER, typeName} from './constants.js';
import {typeScreen, unitScreen} from './PickerScreens.jsx';
import {LoadoutResult, UnitResult} from './Rows.jsx';
import SearchBar from './SearchBar.jsx';
import {factionNameOf, useRecentIds} from './useRecentIds.js';
import {useT} from '../i18n.jsx';
import {back} from '../nav.js';

/** @typedef {import('../../types.js').ProfileHit} ProfileHit */
/** @typedef {import('../../types.js').UnitHit} UnitHit */
/** @typedef {import('../../types.js').ResultItem} ResultItem */

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
 *   onPick: (hit: ProfileHit) => void, loadError?: (() => void) | null,
 *   onKeyDown?: (e: import('react').KeyboardEvent<HTMLInputElement>) => void, className?: string}} props
 */
export default function TrooperPicker({side, searcher, army, onPick, loadError, onKeyDown, className}) {
  const t = useT();
  const color = ROLE[side];
  // Shown while the picker is open (ui.picker set).
  const {query, scope, stack} = useAppState((s) => /** @type {import('../../types.js').PickerState} */ (s.ui.picker));
  // Drill-in stack: {view: 'type', type} | {view: 'unit', unitId, name}
  const top = stack.at(-1) ?? null;
  const inputRef = useRef(/** @type {HTMLInputElement | null} */ (null));
  // preventScroll: focusing must not scroll the page to the input (the page
  // already fits above the keyboard, useVisualViewport.js).
  useEffect(() => { if (!top) inputRef.current?.focus({preventScroll: true}); }, [top, side]);

  const recentIds = useRecentIds(searcher, side);
  const typing = query.trim().length > 0;
  const results = useMemo(() => (searcher && typing ? searcher.search({query, recentIds}) : null), [searcher, typing, query, recentIds]);
  const browse = useMemo(() => (searcher && !typing ? searcher.browse({factionId: scope, recentIds}) : null), [searcher, typing, scope, recentIds]);
  // The rows the arrow keys walk: the results, or the recent picks.
  /** @type {ResultItem[]} */
  const rows = useMemo(() => results?.items ?? (browse?.recent ?? []).map((hit) => ({kind: 'loadout', hit, recent: true})), [results, browse]);

  // The highlighted row: the first until an arrow key moves it; a new query starts again at the top.
  const [cursor, setCursor] = useState({at: 0, moved: false});
  useEffect(() => setCursor({at: 0, moved: false}), [query, scope]);
  const at = Math.min(cursor.at, Math.max(0, rows.length - 1));
  useEffect(() => {
    if (cursor.moved) document.getElementById(`picker-row-${at}`)?.scrollIntoView({block: 'nearest'});
  }, [at, cursor.moved]);

  /** @param {number | null | undefined} id */
  const factionName = (id) => factionNameOf(searcher, id, t);
  /** @param {UnitHit} u */
  const openUnit = (u) => push({view: 'unit', unitId: u.unitId, name: u.title});
  /** @param {ResultItem | undefined} item */
  const take = (item) => {
    if (item?.kind === 'unit') openUnit(item.u);
    else if (item) onPick(item.hit);
  };
  // Enter takes the highlighted row, but never an unasked-for typo guess: the player confirms those.
  const submit = () => {
    const item = rows[at];
    if (item?.kind === 'loadout' && item.hit.loose && !cursor.moved) return;
    take(item);
  };
  /** @param {import('react').KeyboardEvent<HTMLInputElement>} e */
  const keys = (e) => {
    if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && rows.length) {
      e.preventDefault();
      setCursor({at: Math.max(0, Math.min(rows.length - 1, at + (e.key === 'ArrowDown' ? 1 : -1))), moved: true});
    } else onKeyDown?.(e);
  };
  const showCursor = typing || cursor.moved;
  /** @param {ResultItem} item @param {number} i */
  const row = (item, i) => {
    const common = {army, factionName, id: `picker-row-${i}`, on: showCursor && i === at};
    return item.kind === 'unit'
      ? <UnitResult key={`u${item.u.unitId}`} u={item.u} onOpen={openUnit} {...common} />
      : <LoadoutResult key={`l${item.hit.rowId}`} hit={item.hit} recent={item.recent} onPick={onPick} {...common} />;
  };

  // Drilled in: one of the screens in PickerScreens.jsx (they need the searcher: they were pushed from its lists).
  const s = /** @type {import('../../types.js').Searcher} */ (searcher);
  if (top?.view === 'type') return typeScreen({t, searcher: s, army, scope, top, factionName, pop: back, openUnit});
  if (top?.view === 'unit') return unitScreen({t, searcher: s, army, scope, color, top, factionName, pop: back, pick: onPick});

  const bar = (
    <SearchBar key={side} side={side} color={color} query={query} onQuery={setQuery} onSubmit={submit} onKeyDown={keys} onCancel={back}
      inputRef={inputRef} activeId={showCursor && rows.length ? `picker-row-${at}` : undefined} />
  );
  const sideName = t(`side.${color}`);
  return (
    <Page bar={bar} label={t('side.trooper', {side: sideName})} onBack={back} className={`picker ${color} ${className ?? ''}`}>
      <div id="picker-results" role="listbox" aria-label={t('picker.troopers')} className="results">
        {!searcher && (loadError
          ? <LoadFailed what={t('load.trooperList')} onRetry={loadError} className="empty" />
          : <div className="empty">{t('picker.loading')}</div>)}
        {results && results.items.length === 0 && <div className="empty">{t('picker.nothingMatches', {query})}</div>}
        {results?.items.map(row)}
        {browse && scope == null && (
          <>
            <div className="list-head">{t('picker.browseByFaction')}</div>
            <div className="tiles three">
              {s.factions.map((f) => (
                <button type="button" key={f.id} className="tile faction-pick" onClick={() => setScope(f.id)}>
                  <FactionLogo id={f.id} size={30} /><span>{SHORT_NAMES[f.id] ? t(SHORT_NAMES[f.id]) : f.name}</span>
                </button>
              ))}
            </div>
            {rows.length > 0 && <div className="list-head">{t('picker.recent')}</div>}
            {rows.map(row)}
          </>
        )}
        {browse && scope != null && (
          <>
            <button type="button" className="faction-head" onClick={() => setScope(null)}>
              <span className="with-logo"><FactionLogo id={scope} size={22} />{factionName(scope)}</span>
              <span className={`c-${color}`}>{t('picker.allFactions')}</span>
            </button>
            {rows.length > 0 && <div className="list-head">{t('picker.recent')}</div>}
            {rows.map(row)}
            {browse.types.length > 0 && (
              <>
                <div className="list-head">{t('picker.unitType')}</div>
                <div className="tiles">
                  {[...browse.types].sort((a, b) => TYPE_ORDER.indexOf(a.type) - TYPE_ORDER.indexOf(b.type)).map((ty) => (
                    <button type="button" key={ty.type} className="tile" onClick={() => push({view: 'type', type: ty.type})}>
                      <span>{typeName(t, ty.type)}</span><span className="r">{ty.count}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
            <div className="list-head">{t('picker.allUnits')}</div>
            {browse.units.map((u) => <UnitResult key={u.unitId} u={u} onOpen={openUnit} army={army} factionName={factionName} />)}
          </>
        )}
      </div>
    </Page>
  );
}
