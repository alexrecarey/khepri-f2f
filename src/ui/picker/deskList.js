// What the desk picker's left list holds, from the search results. Pure, so
// it can be tested without React. The searcher loads lazily: until it is
// there (a ?fixture= board or a shared link can open the picker with a query
// already typed) the results are null and the list is empty.
import {typeName} from './constants.js';
import {tEn} from '../../i18n/index.js';

// Matching units the list shows while typing. One or two letters match
// hundreds of units; nobody scrolls those, they type another letter, and
// rendering them all made each keystroke slow.
export const MAX_LIST_UNITS = 50;

// The left list: rows the arrow keys move through, with headings between.
// all/scoped: search results (scoped is all with All); browse: recents.
export function listItems({searcher, typing, scope, top, all, scoped, browse, factionName, t = tEn}) {
  if (!searcher) return [];
  if (typing) {
    if (!all || !scoped) return [];
    const head = scope != null ? [{kind: 'head', text: factionName(scope)}] : [];
    const mine = scoped.units.slice(0, MAX_LIST_UNITS).map((u) => ({kind: 'unit', u, factionId: scope ?? u.factionIds[0]}));
    const elsewhere = scope != null
      ? all.units.filter((u) => !u.factionIds.includes(scope)).slice(0, MAX_LIST_UNITS - mine.length)
        .map((u) => ({kind: 'unit', u, factionId: u.factionIds[0], away: true}))
      : [];
    return [...head, ...mine, ...(elsewhere.length ? [{kind: 'head', text: t('picker.otherFactions')}, ...elsewhere] : [])];
  }
  if (top?.view === 'type') {
    return [{kind: 'head', text: typeName(t, top.type)},
      ...searcher.unitsOfType(top.type, scope).map((u) => ({kind: 'unit', u, factionId: scope ?? u.factionIds[0]}))];
  }
  const recent = (browse?.recent ?? []).map((hit) => ({kind: 'recent', hit}));
  return recent.length ? [{kind: 'head', text: scope != null ? t('picker.recentIn', {faction: factionName(scope)}) : t('picker.recent')}, ...recent] : [];
}

// Units matching the query, in this faction and others (the list shows at
// most MAX_LIST_UNITS of them). 0 until the search has run.
export function matchedCount({typing, scope, all, scoped}) {
  if (!typing || !all || !scoped) return 0;
  return scope != null ? new Set([...scoped.units, ...all.units].map((u) => u.unitId)).size : all.units.length;
}
