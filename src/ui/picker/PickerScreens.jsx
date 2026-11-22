// The trooper picker's unit page (TrooperPicker.jsx): a unit's loadouts, and
// what it lists (drillIn). The screen is a plain function returning the
// <Page>, not a component: the picker's root element must stay a <Page> from
// one screen to the next so React updates it in place and its focus and
// viewport hooks don't start over on every drill-in or Back.
// It takes the picker's `t`, `color`, `army`, the stack's top entry, what it
// lists (`drill`), `factionName(id)`, `pop` (Back), `pick` and `rowProps`
// (the arrow keys' highlight).
import {crestForRow} from '../../army/crests.js';
import {CardCrest} from '../Crest.jsx';
import {Page} from '../Sheet.jsx';
import {orderLoadouts, profileGroups, statLine} from '../../state/pickerView.js';
import ProfileGroup from './ProfileGroup.jsx';
import {LoadoutRow, factionsLabel} from './Rows.jsx';

/** @typedef {import('../../types.js').Translator} Translator */
/** @typedef {import('../../types.js').Searcher} Searcher */
/** @typedef {import('../../types.js').Army} Army */
/** @typedef {import('../../types.js').ProfileHit} ProfileHit */
/** @typedef {import('../../types.js').ResultItem} ResultItem */
/** @typedef {(id: number | null | undefined) => string} FactionName */
/** The highlighted-row props of the screen's i-th item (usePickerCursor).
 * @typedef {(i: number) => {id: string, on: boolean}} RowProps */
/** What the unit page lists (drillIn): `items` in screen order, for the arrow keys.
 * @typedef {{items: ResultItem[], rows: ProfileHit[], pgroups: import('../../state/pickerView.js').ProfileGroupView[] | null}} Drill */

// Derived once per screen: TrooperPicker renders it and its arrow keys walk `items`.
/**
 * @param {Searcher} searcher
 * @param {Army | null} army
 * @param {import('../../types.js').PickerView} top
 * @returns {Drill}
 */
export function drillIn(searcher, army, top) {
  const rows = searcher.unitRows(top.unitId);
  const pgroups = army ? profileGroups(army, rows) : null;
  // In the Infinity Army app's order (cheapest first), no groups: what players know from building lists.
  const loadouts = pgroups ? pgroups.flatMap((g) => g.items.map((x) => x.hit)) : orderLoadouts(army, rows);
  return {rows, pgroups, items: loadouts.map((hit) => ({kind: 'loadout', hit}))};
}

// top: {view: 'unit', unitId, name}. pick(hit) is the player's choice.
/**
 * @param {{t: Translator, army: Army | null, color: string, top: import('../../types.js').PickerView, drill: Drill,
 *   factionName: FactionName, pop: () => void, pick: (hit: ProfileHit) => void, rowProps: RowProps}} props
 */
export function unitScreen({t, army, color, top, drill, factionName, pop, pick, rowProps}) {
  const {rows, pgroups} = drill;
  // "PanOceania +1": the armies the unit is in, like its search row.
  const factions = factionsLabel([...new Set(rows.map((r) => r.factionId))], factionName);
  const loadouts = drill.items.flatMap((it) => (it.kind === 'loadout' ? [it.hit] : []));
  /** @type {Map<number, number>} */
  const index = new Map(loadouts.map((hit, i) => [hit.rowId, i]));
  /** @param {ProfileHit} hit */
  const props = (hit) => rowProps(/** @type {number} */ (index.get(hit.rowId)));
  // The unit's crest behind the header, cut by its corner, like the side
  // cards (canvas, "Header crest B"): its first profile's, not the
  // cheapest loadout's (a Team-Ops' Asklad).
  const crest = <CardCrest slug={army ? crestForRow(army, pgroups?.[0].items[0].hit ?? rows[0]) : null} />;
  if (pgroups) {
    return (
      <Page title={top.name} subtitle={`${factions} · ${t('picker.profiles', {count: pgroups.length})} · ${t('picker.loadoutCount', {count: rows.length})}`}
        onBack={pop} action={crest} className="unit-page">
        {pgroups.map((g) => <ProfileGroup key={g.key} g={g} onPick={pick} color={color} army={army} rowProps={props} />)}
      </Page>
    );
  }
  const stats = statLine(army, top.unitId, rows[0]?.armyFactionId);
  return (
    <Page title={top.name} subtitle={`${factions} · ${t('picker.loadoutCount', {count: rows.length})}`} onBack={pop}
      action={crest} className="unit-page">
      {stats && (
        <div className="stat-line">{stats.map(([k, v]) => <span key={k}><b>{t(`stat.${k.toLowerCase()}`)}</b> {v}</span>)}</div>
      )}
      {loadouts.map((hit) => <LoadoutRow army={army} color={color} key={hit.rowId} hit={hit} onPick={pick} {...props(hit)} />)}
    </Page>
  );
}
