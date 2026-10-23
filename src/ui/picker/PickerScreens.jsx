// The trooper picker's drill-in screens (TrooperPicker.jsx): the faction
// list, a unit type's units, a unit's loadouts. Each is a plain function
// returning the <Page>, not a component: the picker's root element must stay
// a <Page> from one screen to the next so React updates it in place and its
// focus and viewport hooks don't start over on every drill-in or Back.
// Each takes the picker's `t`, `searcher`, `scope`, `color`, `army`, the
// stack's top entry, `factionName(id)`, `pop` (Back) and the callbacks it
// dispatches with.
import {crestForRow} from '../../army/crests.js';
import FactionLogo from '../factionLogo.jsx';
import {CardCrest} from '../Crest.jsx';
import {Page} from '../Sheet.jsx';
import {typeName} from './constants.js';
import {groupLoadouts, orderLoadouts, profileGroups, statLine} from './loadouts.js';
import ProfileGroup from './ProfileGroup.jsx';
import {LoadoutRow, UnitRow} from './Rows.jsx';

// recentFactions: state lists.recentFactions. setScope(id | null) chooses.
export function factionsScreen({t, searcher, scope, color, recentFactions, pop, setScope}) {
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

// top: {view: 'type', type}. openUnit(u) drills into the unit.
export function typeScreen({t, searcher, scope, top, factionName, pop, openUnit}) {
  const units = searcher.unitsOfType(top.type, scope);
  return (
    <Page title={typeName(t, top.type)} subtitle={`${factionName(scope)} · ${t('picker.units', {count: units.length})}`} onBack={pop}>
      {units.map((u) => <UnitRow key={u.unitId} u={u} onOpen={openUnit} />)}
    </Page>
  );
}

// top: {view: 'unit', unitId, name}. pick(hit) is the player's choice.
export function unitScreen({t, searcher, army, scope, color, top, factionName, pop, pick}) {
  const rows = searcher.unitRows(top.unitId, scope);
  const pgroups = army ? profileGroups(army, rows) : null;
  // The unit's crest behind the header, cut by its corner, like the side
  // cards (canvas, "Header crest B"): its first profile's, not the
  // cheapest loadout's (a Team-Ops' Asklad).
  const crest = <CardCrest slug={army ? crestForRow(army, pgroups?.[0].items[0].hit ?? rows[0]) : null} />;
  if (pgroups) {
    return (
      <Page title={top.name} subtitle={`${factionName(scope)} · ${t('picker.profiles', {count: pgroups.length})} · ${t('picker.loadoutCount', {count: rows.length})}`}
        onBack={pop} action={crest} className="unit-page">
        {pgroups.map((g) => <ProfileGroup key={g.key} g={g} onPick={pick} color={color} army={army} />)}
      </Page>
    );
  }
  const stats = statLine(army, top.unitId, rows[0]?.armyFactionId);
  const groups = army ? groupLoadouts(army, orderLoadouts(army, rows)) : [{key: 'all', name: null, items: rows}];
  return (
    <Page title={top.name} subtitle={`${factionName(scope)} · ${t('picker.profiles', {count: rows.length})}`} onBack={pop}
      action={crest} className="unit-page">
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
