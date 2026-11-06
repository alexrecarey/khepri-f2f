// The trooper picker's drill-in screens (TrooperPicker.jsx): a unit type's
// units, a unit's loadouts, and what each lists (drillIn). Each screen is a
// plain function returning the <Page>, not a component: the picker's root
// element must stay a <Page> from one screen to the next so React updates it
// in place and its focus and viewport hooks don't start over on every
// drill-in or Back.
// Each takes the picker's `t`, `scope`, `color`, `army`, the stack's top
// entry, what it lists (`drill`), `factionName(id)`, `pop` (Back), the
// callbacks it dispatches with and `rowProps` (the arrow keys' highlight).
import {crestForRow} from '../../army/crests.js';
import {CardCrest} from '../Crest.jsx';
import {Page} from '../Sheet.jsx';
import {typeName} from './constants.js';
import {orderLoadouts, profileGroups, statLine} from '../../state/pickerView.js';
import ProfileGroup from './ProfileGroup.jsx';
import {LoadoutRow, UnitResult} from './Rows.jsx';

/** @typedef {import('../../types.js').Translator} Translator */
/** @typedef {import('../../types.js').Searcher} Searcher */
/** @typedef {import('../../types.js').Army} Army */
/** @typedef {import('../../types.js').ProfileHit} ProfileHit */
/** @typedef {import('../../types.js').UnitHit} UnitHit */
/** @typedef {import('../../types.js').ResultItem} ResultItem */
/** @typedef {(id: number | null | undefined) => string} FactionName */
/** The highlighted-row props of the screen's i-th item (usePickerCursor).
 * @typedef {(i: number) => {id: string, on: boolean}} RowProps */
/** What a drilled-in screen lists (drillIn): `items` in screen order, for the arrow keys.
 * @typedef {{items: ResultItem[], units?: UnitHit[], rows?: ProfileHit[], pgroups?: import('../../state/pickerView.js').ProfileGroupView[] | null}} Drill */

// Derived once per screen: TrooperPicker renders it and its arrow keys walk `items`.
/**
 * @param {Searcher} searcher
 * @param {Army | null} army
 * @param {import('../../types.js').PickerView} top
 * @param {number | null} scope
 * @returns {Drill}
 */
export function drillIn(searcher, army, top, scope) {
  if (top.view === 'type') {
    const units = searcher.unitsOfType(top.type, scope);
    return {units, items: units.map((u) => ({kind: 'unit', u}))};
  }
  const rows = searcher.unitRows(top.unitId, scope);
  const pgroups = army ? profileGroups(army, rows) : null;
  // In the Infinity Army app's order (cheapest first), no groups: what players know from building lists.
  const loadouts = pgroups ? pgroups.flatMap((g) => g.items.map((x) => x.hit)) : orderLoadouts(army, rows);
  return {rows, pgroups, items: loadouts.map((hit) => ({kind: 'loadout', hit}))};
}

// top: {view: 'type', type}. openUnit(u) drills into the unit.
/**
 * @param {{t: Translator, army: Army | null, scope: number | null, top: {view: 'type', type: string}, drill: Drill, factionName: FactionName,
 *   pop: () => void, openUnit: (u: UnitHit) => void, rowProps: RowProps}} props
 */
export function typeScreen({t, army, scope, top, drill, factionName, pop, openUnit, rowProps}) {
  const units = drill.units ?? [];
  return (
    <Page title={typeName(t, top.type)} subtitle={`${factionName(scope)} · ${t('picker.units', {count: units.length})}`} onBack={pop}>
      {units.map((u, i) => <UnitResult key={u.unitId} u={u} onOpen={openUnit} army={army} factionName={factionName} {...rowProps(i)} />)}
    </Page>
  );
}

// top: {view: 'unit', unitId, name}. pick(hit) is the player's choice.
/**
 * @param {{t: Translator, army: Army | null, scope: number | null, color: string, top: {view: 'unit', unitId: number, name: string}, drill: Drill,
 *   factionName: FactionName, pop: () => void, pick: (hit: ProfileHit) => void, rowProps: RowProps}} props
 */
export function unitScreen({t, army, scope, color, top, drill, factionName, pop, pick, rowProps}) {
  const rows = drill.rows ?? [];
  const pgroups = drill.pgroups ?? null;
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
      <Page title={top.name} subtitle={`${factionName(scope)} · ${t('picker.profiles', {count: pgroups.length})} · ${t('picker.loadoutCount', {count: rows.length})}`}
        onBack={pop} action={crest} className="unit-page">
        {pgroups.map((g) => <ProfileGroup key={g.key} g={g} onPick={pick} color={color} army={army} rowProps={props} />)}
      </Page>
    );
  }
  const stats = statLine(army, top.unitId, rows[0]?.armyFactionId);
  return (
    <Page title={top.name} subtitle={`${factionName(scope)} · ${t('picker.loadoutCount', {count: rows.length})}`} onBack={pop}
      action={crest} className="unit-page">
      {stats && (
        <div className="stat-line">{stats.map(([k, v]) => <span key={k}><b>{t(`stat.${k.toLowerCase()}`)}</b> {v}</span>)}</div>
      )}
      {loadouts.map((hit) => <LoadoutRow army={army} color={color} key={hit.rowId} hit={hit} onPick={pick} {...props(hit)} />)}
    </Page>
  );
}
