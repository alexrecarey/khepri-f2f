// The desk picker's state, without the markup: what the left list holds,
// which row and loadout are highlighted, the unit in the right pane, and what
// Enter picks. Query, scope, highlight and side are the state document's
// ui.picker; everything here is derived from it.
import {useMemo} from 'react';
import {pickTrooper} from '../../state/actions.js';
import {ROLE, other} from '../../state/schema.js';
import {dispatch, getState, useAppState} from '../../state/store.js';
import {listItems, matchedCount} from './deskList.js';
import {orderLoadouts, profileGroups, unitDetail} from '../../state/pickerView.js';
import {factionNameOf, useRecentIds} from './useRecentIds.js';
import {useT} from '../i18n.jsx';

/** @typedef {import('../../types.js').ProfileHit} ProfileHit */
/** @typedef {import('../../types.js').Searcher} Searcher */
/** @typedef {import('../../types.js').Army} Army */
/** The desk picker's state, as useDeskPicker returns it.
 * @typedef {ReturnType<typeof useDeskPicker>} DeskPickerModel */

/** @param {Partial<import('../../types.js').PickerState>} cursor */
export const setCursor = (cursor) => dispatch({type: 'pickerCursor', cursor});

/** @param {{searcher: Searcher | null, army: Army | null}} props */
export default function useDeskPicker({searcher, army}) {
  const t = useT();
  // Shown while the picker is open (ui.picker set).
  const picker = useAppState((s) => /** @type {import('../../types.js').PickerState} */ (s.ui.picker));
  const sides = useAppState((s) => s.matchup);
  const {side, query, scope, stack} = picker;
  const cursor = picker.cursor ?? 0;
  const pane = picker.pane ?? 'list';
  const lcursor = picker.lcursor ?? 0;
  const color = ROLE[side];
  const top = stack.at(-1) ?? null;
  const typing = query.trim().length > 0;

  /** @param {number | null | undefined} id */
  const factionName = (id) => factionNameOf(searcher, id, t);
  const recentIds = useRecentIds(searcher, side);

  // Every match in every faction, for the chip counts and "in other factions".
  const all = useMemo(() => (searcher && typing ? searcher.search({query, factionId: null, recentIds}) : null), [searcher, typing, query, recentIds]);
  // In a faction: the same search, scoped. With All, that is `all` itself.
  const scoped = useMemo(() => (searcher && typing && scope != null ? searcher.search({query, factionId: scope, recentIds}) : all),
    [searcher, typing, query, scope, recentIds, all]);
  const browse = useMemo(() => (searcher && !typing ? searcher.browse({factionId: scope, recentIds}) : null), [searcher, typing, scope, recentIds]);

  // The left list (empty until the searcher has loaded).
  const items = useMemo(() => listItems({searcher, typing, scope, top, all, scoped, browse, factionName, t}),
    [searcher, typing, scoped, all, browse, top, scope, t]); // eslint-disable-line react-hooks/exhaustive-deps

  const rows = items.filter((x) => x.kind !== 'head');
  const matched = matchedCount({typing, scope, all, scoped});
  const at = Math.min(cursor, Math.max(0, rows.length - 1));
  // Before typing, the right pane browses factions and unit types until a
  // recent is highlighted (cursor set by a click or an arrow key).
  const browsing = !typing && top?.view !== 'type';
  const current = browsing && picker.cursor == null ? null : rows[at] ?? null;

  // The unit in the right pane and its loadouts in scope.
  const unitId = current?.kind === 'unit' ? current.u.unitId : current?.kind === 'recent' ? current.hit.unitId : null;
  const factionId = current?.kind === 'unit' ? current.factionId : current?.kind === 'recent' ? current.hit.factionId : null;
  const unitRows = useMemo(() => (searcher && unitId != null ? searcher.unitRows(unitId, factionId) : []), [searcher, unitId, factionId]);
  // A unit with several profile groups (Team-Ops, a TAG and its peripheral):
  // the pane shows a section per group, and the arrow keys walk the loadouts
  // in that order.
  const pgroups = useMemo(() => (army ? profileGroups(army, unitRows) : null), [army, unitRows]);
  const loadouts = useMemo(() => (pgroups ? pgroups.flatMap((g) => g.items.map((x) => x.hit)) : orderLoadouts(army, unitRows)),
    [army, unitRows, pgroups]);
  // A unit with rows has a loadout to take the faction from.
  const detail = useMemo(() => (unitId != null ? unitDetail(army, unitId, /** @type {number} */ (loadouts[0]?.armyFactionId)) : null), [army, unitId, loadouts]);
  const profile = detail?.profiles.find((p) => p.id === picker.profileId) ?? detail?.profiles[0] ?? null;
  const lat = Math.min(lcursor, Math.max(0, loadouts.length - 1));
  // On a unit row while typing: the loadout the query matched ("fus ml").
  const best = current?.kind === 'unit' ? current.u.best ?? null : null;
  const bestAt = best ? Math.max(0, loadouts.findIndex((l) => l.rowId === best.rowId)) : 0;

  // The hit Enter picks: the highlighted loadout in the loadouts pane; on a
  // unit row, the loadout the query matched ("fus ml"), else its first.
  // The profile tabs belong to the first group; with sections each hit
  // already names its own group.
  /** @param {ProfileHit} hit */
  const withProfile = (hit) => (profile && /** @type {NonNullable<typeof detail>} */ (detail).profiles.length > 1 && !pgroups ? {...hit, profileId: profile.id} : hit);
  /** @returns {ProfileHit | null} */
  const hitFor = () => {
    if (pane === 'loadouts' && loadouts[lat]) return withProfile(loadouts[lat]);
    if (current?.kind === 'recent') return current.hit;
    if (current?.kind === 'unit') return withProfile(best ?? loadouts[0]);
    return null;
  };
  /**
   * @param {ProfileHit | null} hit
   * @param {boolean} [next]
   */
  const pick = (hit, next = false) => hit && dispatch(pickTrooper(army, side, hit, {next, state: getState()}));
  const otherSide = other(side);
  // With the other side still empty the default (Enter) moves on to it, so
  // two Enters fill both; once it is set, the default goes back to the
  // calculator and moving on is the secondary (Shift+Enter).
  const otherSet = sides[otherSide]?.unitId != null;
  const otherName = t(`side.${ROLE[otherSide]}`).toLocaleLowerCase(t.lang);

  // Chips: All, then the factions, by hits while typing.
  const chips = useMemo(() => {
    const factions = searcher?.factions ?? [];
    if (!all) return factions.map((f) => ({id: f.id, name: f.name, count: /** @type {number | null} */ (null)}));
    /** @type {Map<number, number>} */
    const counts = new Map();
    for (const u of all.units) for (const f of u.factionIds) counts.set(f, (counts.get(f) ?? 0) + 1);
    return factions.map((f) => ({id: f.id, name: f.name, count: counts.get(f.id) ?? 0}))
      .filter((f) => f.count > 0 || f.id === scope)
      .sort((a, b) => b.count - a.count);
  }, [searcher, all, scope]);

  return {
    searcher, army, sides, side, color, query, scope, pane, typing, browsing, factionName, matched,
    all, browse, items, rows, at, current, unitId, factionId, loadouts, pgroups, detail, profile, lat, best, bestAt,
    withProfile, hitFor, pick, otherSide, otherSet, otherName, chips,
  };
}
