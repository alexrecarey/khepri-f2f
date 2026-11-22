// The trooper picker for one side: full screen on a phone, a centred panel on
// wider screens (DeskPicker.jsx). The search box sits at the top. Empty box:
// the side's recent picks. Typing searches every faction and lists units and
// loadouts in one ranked list (search.js items): a unit opens its page, a
// loadout is picked. ↑↓ move through the list, ↵ takes the highlighted row.
// Query and the drill-in stack are the state document's ui.picker,
// so Back (button, Escape or the browser's) pops one screen.
import {useEffect, useMemo, useRef} from 'react';
import {ROLE} from '../../state/schema.js';
import {dispatch, useAppState} from '../../state/store.js';
import LoadFailed from '../LoadFailed.jsx';
import {Page} from '../Sheet.jsx';
import {drillIn, unitScreen} from './PickerScreens.jsx';
import usePickerCursor from './usePickerCursor.js';
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
/** @param {import('../../types.js').PickerView} view */
const push = (view) => dispatch({type: 'pickerPush', view});

/**
 * @param {{side: import('../../types.js').Side, searcher: import('../../types.js').Searcher | null, army: import('../../types.js').Army | null,
 *   onPick: (hit: ProfileHit) => void, loadError?: (() => void) | null,
 *   onKeyDown?: (e: import('react').KeyboardEvent<HTMLInputElement>) => void, className?: string}} props
 */
export default function TrooperPicker({side, searcher, army, onPick, loadError, onKeyDown, className}) {
  const t = useT();
  const color = ROLE[side];
  // Shown while the picker is open (ui.picker set).
  const {query, stack} = useAppState((s) => /** @type {import('../../types.js').PickerState} */ (s.ui.picker));
  // Drill-in stack: {view: 'unit', unitId, name}
  const top = stack.at(-1) ?? null;
  const inputRef = useRef(/** @type {HTMLInputElement | null} */ (null));
  // preventScroll: focusing must not scroll the page to the input (the page
  // already fits above the keyboard, useVisualViewport.js).
  useEffect(() => { if (!top) inputRef.current?.focus({preventScroll: true}); }, [top, side]);

  const recentIds = useRecentIds(searcher, side);
  const typing = query.trim().length > 0;
  const results = useMemo(() => (searcher && typing ? searcher.search({query, recentIds}) : null), [searcher, typing, query, recentIds]);
  const recent = useMemo(() => (searcher && !typing ? searcher.recentHits(recentIds) : null), [searcher, typing, recentIds]);
  // Drilled in: what the unit page lists (PickerScreens.jsx).
  const drill = useMemo(() => (searcher && top ? drillIn(searcher, army, top) : null), [searcher, army, top]);
  // The rows the arrow keys walk: the unit's loadouts, the results, or the recent picks.
  /** @type {ResultItem[]} */
  const rows = useMemo(() => drill?.items ?? results?.items ?? (recent ?? []).map((hit) => ({kind: 'loadout', hit, recent: true})),
    [drill, results, recent]);

  /** @param {number | null | undefined} id */
  const factionName = (id) => factionNameOf(searcher, id);
  /** @param {UnitHit} u */
  const openUnit = (u) => push({view: 'unit', unitId: u.unitId, name: u.title});
  /** @param {ResultItem} item */
  const take = (item) => (item.kind === 'unit' ? openUnit(item.u) : onPick(item.hit));
  // A new query or screen starts again at the top.
  const {at, shown, arrows, submit, rowProps} = usePickerCursor(rows, `${query}|${stack.length}`, take, {typing: typing && !top, drilled: top != null});
  /** @param {import('react').KeyboardEvent<HTMLInputElement>} e */
  const keys = (e) => { if (!arrows(e)) onKeyDown?.(e); };
  /** @param {ResultItem} item @param {number} i */
  const row = (item, i) => {
    const common = {army, factionName, ...rowProps(i)};
    return item.kind === 'unit'
      ? <UnitResult key={`u${item.u.unitId}`} u={item.u} onOpen={openUnit} {...common} />
      : <LoadoutResult key={`l${item.hit.rowId}`} hit={item.hit} recent={item.recent} onPick={onPick} {...common} />;
  };

  if (top && drill) return unitScreen({t, army, color, top, drill, factionName, pop: back, pick: onPick, rowProps});

  const bar = (
    <SearchBar key={side} side={side} color={color} query={query} onQuery={setQuery} onSubmit={submit} onKeyDown={keys} onCancel={back}
      inputRef={inputRef} activeId={shown && rows.length ? `picker-row-${at}` : undefined} />
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
        {recent && (rows.length
          ? <><div className="list-head">{t('picker.recent')}</div>{rows.map(row)}</>
          : <div className="empty">{t('picker.noRecent')}</div>)}
      </div>
    </Page>
  );
}
