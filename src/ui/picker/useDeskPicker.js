// The desk picker's state, without the markup: what the left list holds,
// which row and loadout are highlighted, the unit in the right pane, and what
// Enter picks. Query, scope, highlight and side are the state document's
// ui.picker; everything here is derived from it.
import {useMemo} from 'react';
import {pickTrooper} from '../../state/actions.js';
import {ROLE, other} from '../../state/schema.js';
import {dispatch, getState, useAppState} from '../../state/store.js';
import {TYPE_NAMES} from './constants.js';
import {orderLoadouts, unitDetail} from './loadouts.js';
import {factionNameOf, useRecentIds} from './useRecentIds.js';

export const setCursor = (cursor) => dispatch({type: 'pickerCursor', cursor});

export default function useDeskPicker({searcher, army}) {
  const picker = useAppState((s) => s.ui.picker);
  const sides = useAppState((s) => s.matchup);
  const {side, query, scope, stack} = picker;
  const cursor = picker.cursor ?? 0;
  const pane = picker.pane ?? 'list';
  const lcursor = picker.lcursor ?? 0;
  const color = ROLE[side];
  const top = stack.at(-1) ?? null;
  const typing = query.trim().length > 0;

  const factionName = (id) => factionNameOf(searcher, id);
  const recentIds = useRecentIds(searcher, side);

  // Every match in every faction, for the chip counts and "in other factions".
  const all = useMemo(() => (searcher && typing ? searcher.search({query, factionId: null, recentIds}) : null), [searcher, typing, query, recentIds]);
  // In a faction: the same search, scoped. With All, that is `all` itself.
  const scoped = useMemo(() => (searcher && typing && scope != null ? searcher.search({query, factionId: scope, recentIds}) : all),
    [searcher, typing, query, scope, recentIds, all]);
  const browse = useMemo(() => (searcher && !typing ? searcher.browse({factionId: scope, recentIds}) : null), [searcher, typing, scope, recentIds]);

  // The left list: rows the arrow keys move through, with headings between.
  const items = useMemo(() => {
    if (!searcher) return [];
    if (typing) {
      const head = scope != null ? [{kind: 'head', text: factionName(scope)}] : [];
      const mine = scoped.units.map((u) => ({kind: 'unit', u, factionId: scope ?? u.factionIds[0]}));
      const elsewhere = scope != null
        ? all.units.filter((u) => !u.factionIds.includes(scope)).map((u) => ({kind: 'unit', u, factionId: u.factionIds[0], away: true}))
        : [];
      return [...head, ...mine, ...(elsewhere.length ? [{kind: 'head', text: 'In other factions'}, ...elsewhere] : [])];
    }
    if (top?.view === 'type') {
      return [{kind: 'head', text: TYPE_NAMES[top.type] ?? top.type},
        ...searcher.unitsOfType(top.type, scope).map((u) => ({kind: 'unit', u, factionId: scope ?? u.factionIds[0]}))];
    }
    const recent = browse.recent.map((hit) => ({kind: 'recent', hit}));
    return recent.length ? [{kind: 'head', text: scope != null ? `Recent in ${factionName(scope)}` : 'Recent'}, ...recent] : [];
  }, [searcher, typing, scoped, all, browse, top, scope]); // eslint-disable-line react-hooks/exhaustive-deps

  const rows = items.filter((x) => x.kind !== 'head');
  const at = Math.min(cursor, Math.max(0, rows.length - 1));
  // Before typing, the right pane browses factions and unit types until a
  // recent is highlighted (cursor set by a click or an arrow key).
  const browsing = !typing && top?.view !== 'type';
  const current = browsing && picker.cursor == null ? null : rows[at] ?? null;

  // The unit in the right pane and its loadouts in scope.
  const unitId = current?.kind === 'unit' ? current.u.unitId : current?.kind === 'recent' ? current.hit.unitId : null;
  const factionId = current?.kind === 'unit' ? current.factionId : current?.kind === 'recent' ? current.hit.factionId : null;
  const loadouts = useMemo(() => (searcher && unitId != null ? orderLoadouts(army, searcher.unitRows(unitId, factionId)) : []), [searcher, army, unitId, factionId]);
  const detail = useMemo(() => (unitId != null ? unitDetail(army, unitId, loadouts[0]?.armyFactionId) : null), [army, unitId, loadouts]);
  const profile = detail?.profiles.find((p) => p.id === picker.profileId) ?? detail?.profiles[0] ?? null;
  const lat = Math.min(lcursor, Math.max(0, loadouts.length - 1));
  // On a unit row while typing: the loadout the query matched ("fus ml").
  const best = current?.kind === 'unit' ? current.u.best ?? null : null;
  const bestAt = best ? Math.max(0, loadouts.findIndex((l) => l.rowId === best.rowId)) : 0;

  // The hit Enter picks: the highlighted loadout in the loadouts pane; on a
  // unit row, the loadout the query matched ("fus ml"), else its first.
  const withProfile = (hit) => (profile && detail.profiles.length > 1 ? {...hit, profileId: profile.id} : hit);
  const hitFor = () => {
    if (pane === 'loadouts' && loadouts[lat]) return withProfile(loadouts[lat]);
    if (current?.kind === 'recent') return current.hit;
    if (current?.kind === 'unit') return withProfile(best ?? loadouts[0]);
    return null;
  };
  const pick = (hit, next = false) => hit && dispatch(pickTrooper(army, side, hit, {next, state: getState()}));
  const otherSide = other(side);
  // With the other side still empty the default (Enter) moves on to it, so
  // two Enters fill both; once it is set, the default goes back to the
  // calculator and moving on is the secondary (Shift+Enter).
  const otherSet = sides[otherSide]?.unitId != null;
  const otherName = ROLE[otherSide];

  // Chips: All, then the factions, by hits while typing.
  const chips = useMemo(() => {
    const factions = searcher?.factions ?? [];
    if (!all) return factions.map((f) => ({id: f.id, name: f.name, count: null}));
    const counts = new Map();
    for (const u of all.units) for (const f of u.factionIds) counts.set(f, (counts.get(f) ?? 0) + 1);
    return factions.map((f) => ({id: f.id, name: f.name, count: counts.get(f.id) ?? 0}))
      .filter((f) => f.count > 0 || f.id === scope)
      .sort((a, b) => b.count - a.count);
  }, [searcher, all, scope]);

  return {
    searcher, army, sides, side, color, query, scope, pane, typing, browsing, factionName,
    all, browse, items, rows, at, current, unitId, factionId, loadouts, detail, profile, lat, bestAt,
    withProfile, hitFor, pick, otherSide, otherSet, otherName, chips,
  };
}
