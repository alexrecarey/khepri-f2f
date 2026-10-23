// The trooper search behind the picker. createSearch(index) builds the word
// list once; search() then runs on every keystroke, so it only scans that word
// list (under 2,000 distinct words) and never the rows themselves.
import {SKILL} from '../army/ids.js';
import {FIELD} from './buildIndex.js';
import {prefixDistance, soundKey, typoBudget, words} from './text.js';

// Match tiers, strongest first. A row's rank comes from its weakest typed word.
export const TIER = {EXACT: 0, PREFIX: 1, TYPO1: 2, SOUND: 3, TYPO2: 4};
const TIER_COST = [0, 1, 3, 4, 6];
/** @typedef {import('../types.js').IndexRow} IndexRow */
/** @typedef {import('../types.js').ProfileHit} ProfileHit */
/** One typed word's best match on a row.
 * @typedef {{tier: number, field: number, weapon: number, word: string, cost: number}} WordHit */
/** A row matching the whole query, scored (lower ranks higher).
 * @typedef {{row: IndexRow, score?: number, tier: number, weapon: number, matched: string[]}} RowMatch */
/** A word's postings: [rowId, field, weaponIndex] each.
 * @typedef {{postings: [number, number, number][], sound: string, best?: Map<number, [number, number, number]>}} Vocab */

/** @type {Record<number, number>} */
const FIELD_COST = {[FIELD.SHORT]: 0, [FIELD.NAME]: 1, [FIELD.LOADOUT]: 1, [FIELD.WEAPON]: 2, [FIELD.ALIAS]: 2, [FIELD.SKILL]: 3};
const MAX_PROFILES = 30;

/**
 * @param {import('../types.js').SearchIndex} index
 * @returns {import('../types.js').Searcher}
 */
export function createSearch(index) {
  const rows = index.rows;
  const unitById = new Map(index.units.map((u) => [u.id, u]));
  // Peripherals (Crabbots, Auxbots...) ride in their controller's unit entry (see matchRows).
  const peripheralSkill = index.skills.findIndex((sk) => sk.id === SKILL.PERIPHERAL);
  /** @param {IndexRow} row */
  const isPeripheral = (row) => row.skills.includes(peripheralSkill);
  const factionName = new Map(index.factions.map((f) => [f.id, f.name]));

  // word -> postings [rowId, field, weaponIndex], plus its sound key. Unit and
  // weapon words are stored once in the index; here they fan out to rows.
  /** @type {Map<string, Vocab>} */
  const vocab = new Map();
  /**
   * @param {string} w
   * @param {number} rowId
   * @param {number} field
   * @param {number} weapon
   */
  const post = (w, rowId, field, weapon) => {
    let v = vocab.get(w);
    if (!v) vocab.set(w, v = {postings: [], sound: soundKey(w), best: new Map()});
    // One posting per row and word: the strongest field wins. `best` is
    // there while the vocabulary is built (deleted below).
    const had = /** @type {NonNullable<Vocab['best']>} */ (v.best).get(rowId);
    if (had && had[1] <= field) return;
    if (had) { had[1] = field; had[2] = weapon; return; }
    /** @type {[number, number, number]} */
    const p = [rowId, field, weapon];
    /** @type {NonNullable<Vocab['best']>} */ (v.best).set(rowId, p);
    v.postings.push(p);
  };
  /** @type {Map<number, IndexRow[]>} */
  const rowsByUnit = new Map();
  for (const row of rows) {
    if (!rowsByUnit.has(row.unitId)) rowsByUnit.set(row.unitId, []);
    /** @type {IndexRow[]} */ (rowsByUnit.get(row.unitId)).push(row);
  }
  for (const unit of index.units) {
    for (const row of rowsByUnit.get(unit.id) ?? []) {
      for (const [w, field] of unit.words) post(w, row.id, field, -1);
      for (const w of row.loadoutWords) post(w, row.id, FIELD.LOADOUT, -1);
      row.weapons.forEach((wid, i) => {
        for (const [w, field] of index.weapons[wid].words) post(w, row.id, field, i);
      });
      for (const sid of row.skills ?? []) for (const w of index.skills[sid].words) post(w, row.id, FIELD.SKILL, -1);
    }
  }
  for (const v of vocab.values()) delete v.best;
  const vocabList = [...vocab.entries()];

  // Typed word -> Map(rowId -> best {tier, field, weapon, word}). Memoised, so
  // the words already typed cost nothing when the next one is added.
  /** @type {Map<string, Map<number, WordHit>>} */
  const memo = new Map();
  /**
   * @param {string} t
   * @returns {Map<number, WordHit>}
   */
  function matchWord(t) {
    if (memo.has(t)) return /** @type {Map<number, WordHit>} */ (memo.get(t));
    const budget = typoBudget(t.length);
    const tSound = t.length >= 3 ? soundKey(t) : null;
    /** @type {Map<number, WordHit>} */
    const hits = new Map();
    for (const [w, {postings, sound}] of vocabList) {
      /** @type {number | undefined} */
      let tier;
      if (w === t) tier = TIER.EXACT;
      else if (w.startsWith(t)) tier = TIER.PREFIX;
      else {
        // Typos are rarely in the first letter; requiring it (or a swap of
        // the first two) keeps short words from matching everything.
        if (budget && (w[0] === t[0] || (w[0] === t[1] && w[1] === t[0]))) {
          const d = prefixDistance(t, w, budget); // budget + 1 means "too far"
          if (d === 1) tier = TIER.TYPO1;
          else if (d === 2 && budget >= 2) tier = TIER.TYPO2;
        }
        if ((tier === undefined || tier > TIER.SOUND) && tSound && sound.startsWith(tSound)) tier = TIER.SOUND;
        if (tier === undefined) continue;
      }
      for (const [rowId, field, weapon] of postings) {
        // Skills are many and shared: no typo or sounds-like matches there,
        // or a misspelt unit name would pull in every trooper with a skill.
        if (field === FIELD.SKILL && tier > TIER.PREFIX) continue;
        // Weapon names are long and share their first word ("Fusil Combi",
        // "Fusil Breaker"): two typos away, a unit's name ("fusilero") would
        // pull in every trooper carrying one. One typo is still forgiven.
        if ((field === FIELD.WEAPON || field === FIELD.ALIAS) && tier >= TIER.SOUND) continue;
        // A prefix of the unit's name (10) beats an exact weapon word (12):
        // "mine" means Minescorp before it means every unit carrying mines.
        const cost = TIER_COST[tier] * 10 + FIELD_COST[field] * 6;
        const had = hits.get(rowId);
        if (!had || had.cost > cost) hits.set(rowId, {tier, field, weapon, word: w, cost});
      }
    }
    if (memo.size > 500) memo.clear();
    memo.set(t, hits);
    return hits;
  }

  // Rows matching every typed word, scored. Lower score ranks higher.
  /**
   * @param {string[]} tokens
   * @returns {RowMatch[]}
   */
  function matchRows(tokens) {
    const per = tokens.map(matchWord);
    per.sort((a, b) => a.size - b.size); // intersect from the rarest word
    /** @type {(RowMatch & {score: number})[]} */
    const out = [];
    for (const [rowId, first] of per[0]) {
      const parts = [first];
      let ok = true;
      for (let i = 1; i < per.length && ok; i++) {
        const h = per[i].get(rowId);
        if (h) parts.push(h); else ok = false;
      }
      if (!ok) continue;
      const row = rows[rowId];
      let score = parts.reduce((s, p) => s + p.cost, 0);
      // The whole query spells the unit's short name: rank it on top.
      if (parts.every((p) => p.field === FIELD.SHORT) && parts.every((p) => p.tier <= TIER.PREFIX)) score -= 5;
      const weaponPart = parts.find((p) => p.weapon >= 0);
      out.push({
        row,
        score,
        tier: Math.max(...parts.map((p) => p.tier)),
        weapon: weaponPart ? weaponPart.weapon : -1,
        matched: parts.map((p) => p.word),
      });
    }
    out.sort((a, b) => a.score - b.score || a.row.points - b.row.points
      || a.row.unit.localeCompare(b.row.unit) || a.row.id - b.row.id);
    // Within the places one unit's rows already hold, its own loadouts come before its peripherals: a cheap,
    // weaponless Crabbot matching only the unit's name scored best and became the pick. Units keep their rank.
    /** @type {Map<number, number[]>} */
    const slots = new Map();
    out.forEach((m, i) => {
      if (!slots.has(m.row.unitId)) slots.set(m.row.unitId, []);
      /** @type {number[]} */ (slots.get(m.row.unitId)).push(i);
    });
    const reordered = [...out];
    for (const places of slots.values()) {
      const mine = places.map((i) => out[i]);
      const own = [...mine.filter((m) => !isPeripheral(m.row)), ...mine.filter((m) => isPeripheral(m.row))];
      places.forEach((i, k) => { reordered[i] = own[k]; });
    }
    return reordered;
  }

  /**
   * @param {IndexRow} row
   * @param {number | null} factionId
   */
  const inScope = (row, factionId) => factionId == null || factionId in row.factions;

  /**
   * @param {RowMatch} m
   * @param {number | null} factionId
   * @returns {ProfileHit}
   */
  function profileHit(m, factionId) {
    const {row} = m;
    const scope = factionId ?? Number(Object.keys(row.factions)[0]);
    const wid = row.weapons[m.weapon >= 0 ? m.weapon : 0];
    const weapon = wid != null ? {id: wid, name: index.weapons[wid].name} : null;
    return {
      rowId: row.id,
      unitId: row.unitId,
      factionId: scope,
      armyFactionId: row.factions[scope],
      groupId: row.groupId,
      profileId: row.profileId,
      optionId: row.optionId,
      unit: row.unit,
      loadout: row.loadout,
      weapon: weapon?.name ?? null,
      weaponId: m.weapon >= 0 ? weapon?.id ?? null : null,
      weapons: row.weapons.map((id) => index.weapons[id].name),
      weaponIds: row.weapons,
      type: row.type,
      bs: row.bs,
      points: row.points,
      swc: row.swc,
      tier: m.tier,
      loose: m.tier >= TIER.TYPO1,
      matched: m.matched,
    };
  }

  // Loadouts per unit, overall and per vanilla faction, counted once up front.
  /** @type {Map<number, Record<string, number>>} */
  const counts = new Map();
  for (const r of rows) {
    // set() then get(): the count is there.
    const c = /** @type {Record<string, number>} */ (counts.get(r.unitId) ?? counts.set(r.unitId, {all: 0}).get(r.unitId));
    c.all++;
    for (const f of Object.keys(r.factions)) c[f] = (c[f] ?? 0) + 1;
  }
  /**
   * @param {number} unitId
   * @param {number | null} factionId
   */
  const countInScope = (unitId, factionId) => counts.get(unitId)?.[factionId ?? 'all'] ?? 0;

  /**
   * @param {number} unitId
   * @param {number | null} factionId
   * @returns {import('../types.js').UnitHit}
   */
  function unitHit(unitId, factionId) {
    // Every row's unit is in the index.
    const u = /** @type {import('../types.js').IndexUnit} */ (unitById.get(unitId));
    return {unitId, name: u.name, short: u.short, type: u.type, factionIds: u.factions,
      profileCount: countInScope(unitId, factionId)};
  }

  // {query, factionId, recentIds} -> {recent, profiles, units, elsewhere, total}
  /**
   * @param {{query?: string, factionId?: number | null, recentIds?: number[]}} [q]
   * @returns {import('../types.js').SearchResult}
   */
  function search({query = '', factionId = null, recentIds = []} = {}) {
    const tokens = words(query);
    if (!tokens.length) return {recent: [], profiles: [], units: [], elsewhere: [], total: 0};
    const all = matchRows(tokens);
    const scoped = all.filter((m) => inScope(m.row, factionId));

    const recentSet = new Set(recentIds);
    const recent = /** @type {RowMatch[]} */ (recentIds
      .map((id) => scoped.find((m) => m.row.id === id))
      .filter(Boolean))
      .map((m) => profileHit(m, factionId));

    /** @type {import('../types.js').UnitHit[]} */
    const units = [];
    const seen = new Set();
    // `scoped` is best first, so a unit's first match is its best loadout:
    // the one Enter on the unit row picks (the profiles list is capped).
    for (const m of scoped) {
      if (seen.has(m.row.unitId)) continue;
      seen.add(m.row.unitId);
      units.push({...unitHit(m.row.unitId, factionId), tier: m.tier, best: profileHit(m, factionId)});
    }

    /** @type {import('../types.js').SearchResult['elsewhere']} */
    let elsewhere = [];
    if (factionId != null && !scoped.length && all.length) {
      /** @type {Map<number, number>} */
      const counts = new Map();
      for (const m of all) for (const f of Object.keys(m.row.factions)) counts.set(Number(f), (counts.get(Number(f)) ?? 0) + 1);
      elsewhere = [...counts].sort((a, b) => b[1] - a[1])
        .map(([id, count]) => ({factionId: id, name: factionName.get(id), count}));
    }

    return {
      recent,
      profiles: scoped.filter((m) => !recentSet.has(m.row.id)).slice(0, MAX_PROFILES).map((m) => profileHit(m, factionId)),
      units,
      elsewhere,
      total: scoped.length,
    };
  }

  // The empty-box view: recents, unit-type tiles, every unit A-Z.
  /** @param {{factionId?: number | null, recentIds?: number[]}} [q] */
  function browse({factionId = null, recentIds = []} = {}) {
    const recent = recentIds.map((id) => rows[id]).filter((r) => r && inScope(r, factionId))
      .map((row) => asHit(row, factionId));
    const scopeUnits = index.units.filter((u) => factionId == null || u.factions.includes(factionId));
    /** @type {Map<string, number>} */
    const types = new Map();
    for (const u of scopeUnits) if (u.type) types.set(u.type, (types.get(u.type) ?? 0) + 1);
    return {
      recent,
      types: [...types].map(([type, count]) => ({type, count})),
      units: scopeUnits.map((u) => unitHit(u.id, factionId)).sort((a, b) => a.short.localeCompare(b.short)),
    };
  }

  /**
   * @param {IndexRow} row
   * @param {number | null} factionId
   */
  const asHit = (row, factionId) => profileHit({row, weapon: -1, tier: TIER.EXACT, matched: []}, factionId);

  // Every loadout of one unit in scope, cheapest first: the unit drill-in page.
  /**
   * @param {number} unitId
   * @param {number | null} [factionId]
   */
  function unitRows(unitId, factionId = null) {
    return (rowsByUnit.get(unitId) ?? []).filter((r) => inScope(r, factionId))
      .sort((a, b) => a.points - b.points || a.id - b.id)
      .map((r) => asHit(r, factionId));
  }

  // Units of one type (LI, HI, TAG...) in scope, A-Z: a browse tile's list.
  /**
   * @param {string} type
   * @param {number | null} [factionId]
   */
  function unitsOfType(type, factionId = null) {
    return index.units.filter((u) => u.type === type && (factionId == null || u.factions.includes(factionId)))
      .map((u) => unitHit(u.id, factionId))
      .sort((a, b) => a.short.localeCompare(b.short));
  }

  // A saved pick -> its row id today. Row ids are positions in the index and
  // change whenever the army data is rebuilt, so recents store the real ids.
  /** @param {{unitId: number, groupId: number, optionId: number, armyFactionId: number}} pick */
  function findRow({unitId, groupId, optionId, armyFactionId}) {
    return rows.find((r) => r.unitId === unitId && r.groupId === groupId && r.optionId === optionId
      && Object.values(r.factions).includes(armyFactionId))?.id ?? null;
  }

  // Units per vanilla faction, for the faction list.
  /** @type {Map<number, number>} */
  const unitCounts = new Map();
  for (const u of index.units) for (const f of u.factions) unitCounts.set(f, (unitCounts.get(f) ?? 0) + 1);
  /** @param {number} factionId */
  const unitCount = (factionId) => unitCounts.get(factionId) ?? 0;

  return {search, browse, unitRows, unitsOfType, findRow, unitCount, factions: index.factions};
}
