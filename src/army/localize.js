// army.json carries rules and English names together. The app ships them
// apart: one language-neutral core (stats, ids, and the English tokens the
// rules read: weapon rows, extras, types) plus a names file per language, so
// a player only downloads the names in their own language. withNames puts a
// names file back on the core, giving the army.json shape every module reads.
//
// Weapon rows keep their English name in the core: the rules read it
// (Vulnerability (Viral)). A names file in another language swaps it for the
// local one and keeps the English as `en`.
//
// Names are keyed by id: unit, unit:group, unit:group:profile and
// unit:group:option are each the same in every faction a unit appears in,
// and a skill, equipment or weapon id has one name wherever it's referenced.

/** @typedef {'skills' | 'equip' | 'weapons'} RefTable */
/** @typedef {import('../types.js').NamesFile} NamesFile */
/** @typedef {import('../types.js').TraitRef} TraitRef */
/** A profile or loadout row, read by the keys that hold refs (REF_KINDS).
 * @typedef {Record<string, unknown> & {id: number, name?: string}} RefRow */

/** @type {Record<RefTable, RefTable>} */
const REF_KINDS = {skills: 'skills', equip: 'equip', weapons: 'weapons'};
// Upgrade attrs name their table by type.
/** @type {Record<string, RefTable>} */
const ATTR_KINDS = {skill: 'skills', equip: 'equip', weapon: 'weapons'};

/**
 * @param {TraitRef[]} list
 * @param {Record<string, string>} table
 */
const stripRefs = (list, table) => list.map(({name, ...ref}) => {
  table[ref.id] ??= name;
  return ref;
});

/**
 * army.json -> {core, names}. The core keeps every key but the names.
 * @param {import('../types.js').Army} army
 * @returns {{core: import('../types.js').ArmyCore, names: NamesFile}}
 */
export function splitNames(army) {
  /** @type {NamesFile} */
  const names = {factions: {}, skills: {}, equip: {}, weapons: {}, units: {}};
  const factions = Object.fromEntries(Object.entries(army.factions).map(([id, {name, ...f}]) => {
    names.factions[id] = name;
    return [id, f];
  }));
  /**
   * @template {RefRow} R
   * @param {R} x
   * @returns {R}
   */
  const withoutRefNames = (x) => {
    /** @type {Record<string, unknown>} */
    const out = {...x};
    for (const [key, table] of Object.entries(REF_KINDS)) if (x[key]) out[key] = stripRefs(/** @type {TraitRef[]} */ (x[key]), names[table]);
    return /** @type {R} */ (out);
  };
  const units = army.units.map(({isc, name, byFaction, upgrades, ...unit}) => {
    /** @type {NamesFile['units'][string]['groups']} */
    const groups = {};
    const outByFaction = Object.fromEntries(Object.entries(byFaction).map(([fid, entry]) => [fid, {
      ...entry,
      groups: entry.groups.map(({isc: gIsc, profiles, options, ...group}) => {
        const g = groups[group.id] ??= {isc: gIsc, profiles: {}, options: {}};
        return {
          ...group,
          profiles: profiles.map(({name: pName, ...p}) => {
            g.profiles[p.id] = pName;
            return withoutRefNames(p);
          }),
          options: options.map(({name: oName, ...o}) => {
            g.options[o.id] = oName;
            return withoutRefNames(o);
          }),
        };
      }),
    }]));
    /** @type {import('../types.js').UnitNames} */
    const u = {isc, name, groups};
    /** @type {import('../types.js').UnitRow} */
    // Without its names: the core's row (ArmyCore).
    const out = /** @type {import('../types.js').UnitRow} */ ({...unit, byFaction: outByFaction});
    if (upgrades) {
      /** @param {import('../types.js').UpgradeItem[]} items */
      const strip = (items) => items.map(({label, attrs}) => ({
        attrs: attrs.map(({name: aName, ...a}) => {
          if (a.type !== 'stat') names[ATTR_KINDS[a.type]][a.id] ??= /** @type {string} */ (aName);
          return /** @type {import('../types.js').UpgradeAttr} */ (a);
        }),
      }));
      u.upgrades = {chart: upgrades.chart.map((i) => i.label), ball: upgrades.ball.map((i) => i.label)};
      out.upgrades = {chart: /** @type {import('../types.js').UpgradeItem[]} */ (strip(upgrades.chart)), ball: /** @type {import('../types.js').UpgradeItem[]} */ (strip(upgrades.ball))};
    }
    names.units[unit.id] = u;
    return out;
  });
  for (const [id, rows] of Object.entries(army.weapons)) names.weapons[id] ??= /** @type {string} */ (rows[0]?.name);
  return {core: /** @type {import('../types.js').ArmyCore} */ ({...army, factions, units}), names};
}

// {core, names} -> the army.json shape, names in the names file's language
// (`lang`). `terms`: the names file's display maps for the English tokens
// the rules read (extras, weapon modes, unit types, stats), null in English;
// src/i18n's t.term reads them.
/**
 * @param {import('../types.js').ArmyCore} core
 * @param {NamesFile} names
 * @param {string} [lang]
 * @returns {import('../types.js').Army}
 */
export function withNames(core, names, lang = 'en') {
  /** @param {Record<string, string>} table */
  const ref = (table) => /** @param {TraitRef} r */ (r) => ({...r, name: table[r.id] ?? String(r.id)});
  /**
   * @template {RefRow} R
   * @param {R} x
   * @returns {R}
   */
  const withRefNames = (x) => {
    /** @type {Record<string, unknown>} */
    const out = {...x};
    for (const [key, table] of Object.entries(REF_KINDS)) if (x[key]) out[key] = /** @type {TraitRef[]} */ (x[key]).map(ref(names[table]));
    return /** @type {R} */ (out);
  };
  const factions = Object.fromEntries(Object.entries(core.factions).map(([id, f]) =>
    [id, {...f, name: names.factions[id] ?? `Faction ${id}`}]));
  const units = core.units.map((unit) => {
    const n = names.units[unit.id];
    const byFaction = Object.fromEntries(Object.entries(unit.byFaction).map(([fid, entry]) => [fid, {
      ...entry,
      groups: entry.groups.map((group) => {
        const g = n.groups[group.id];
        return {
          ...group,
          isc: /** @type {string} */ (g.isc),
          profiles: group.profiles.map((p) => withRefNames({...p, name: g.profiles[p.id]})),
          options: group.options.map((o) => withRefNames({...o, name: g.options[o.id]})),
        };
      }),
    }]));
    // `code`: the English ISC, kept in other languages for search.
    const out = {...unit, isc: n.isc, name: n.name, ...(n.code ? {code: n.code} : {}), byFaction};
    if (unit.upgrades) {
      /**
       * @param {import('../types.js').UpgradeItem[]} list
       * @param {string[]} labels
       * @returns {import('../types.js').UpgradeItem[]}
       */
      const items = (list, labels) => list.map(({attrs}, i) => ({
        label: labels[i],
        attrs: attrs.map((a) => (a.type === 'stat' ? a : {...a, name: names[ATTR_KINDS[a.type]][a.id] ?? String(a.id)})),
      }));
      // A unit with upgrades has their labels in its names.
      out.upgrades = {chart: items(unit.upgrades.chart, /** @type {NonNullable<typeof n.upgrades>} */ (n.upgrades).chart),
        ball: items(unit.upgrades.ball, /** @type {NonNullable<typeof n.upgrades>} */ (n.upgrades).ball)};
    }
    return out;
  });
  const weapons = Object.fromEntries(Object.entries(core.weapons).map(([id, rows]) => [id, rows.map((row) => {
    const name = names.weapons[id];
    return name && name !== row.name ? {...row, name, en: row.name} : row;
  })]));
  const terms = names.extras ? {extras: names.extras, modes: names.modes, types: names.types, stats: names.stats} : null;
  return {...core, factions, units, weapons, lang, terms};
}
