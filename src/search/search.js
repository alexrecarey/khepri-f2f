// The trooper search behind the picker. createSearch(index) builds the word
// list once; search() then runs on every keystroke, so it only scans that word
// list (under 2,000 distinct words) and never the rows themselves.
import {FIELD} from './buildIndex.js';
import {prefixDistance, soundKey, typoBudget, words} from './text.js';

// Match tiers, strongest first. A row's rank comes from its weakest typed word.
export const TIER = {EXACT: 0, PREFIX: 1, TYPO1: 2, SOUND: 3, TYPO2: 4};
const TIER_COST = [0, 1, 3, 4, 6];
const FIELD_COST = {[FIELD.SHORT]: 0, [FIELD.NAME]: 1, [FIELD.LOADOUT]: 1, [FIELD.WEAPON]: 2, [FIELD.ALIAS]: 2, [FIELD.SKILL]: 3};
const MAX_PROFILES = 30;

export function createSearch(index) {
  const rows = index.rows;
  const unitById = new Map(index.units.map((u) => [u.id, u]));
  const factionName = new Map(index.factions.map((f) => [f.id, f.name]));

  // word -> postings [rowId, field, weaponIndex], plus its sound key. Unit and
  // weapon words are stored once in the index; here they fan out to rows.
  const vocab = new Map();
  const post = (w, rowId, field, weapon) => {
    let v = vocab.get(w);
    if (!v) vocab.set(w, v = {postings: [], sound: soundKey(w), best: new Map()});
    // One posting per row and word: the strongest field wins.
    const had = v.best.get(rowId);
    if (had && had[1] <= field) return;
    if (had) { had[1] = field; had[2] = weapon; return; }
    const p = [rowId, field, weapon];
    v.best.set(rowId, p);
    v.postings.push(p);
  };
  const rowsByUnit = new Map();
  for (const row of rows) {
    if (!rowsByUnit.has(row.unitId)) rowsByUnit.set(row.unitId, []);
    rowsByUnit.get(row.unitId).push(row);
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
  const memo = new Map();
  function matchWord(t) {
    if (memo.has(t)) return memo.get(t);
    const budget = typoBudget(t.length);
    const tSound = t.length >= 3 ? soundKey(t) : null;
    const hits = new Map();
    for (const [w, {postings, sound}] of vocabList) {
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
  function matchRows(tokens) {
    const per = tokens.map(matchWord);
    per.sort((a, b) => a.size - b.size); // intersect from the rarest word
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
    return out;
  }

  const inScope = (row, factionId) => factionId == null || factionId in row.factions;

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
  const counts = new Map();
  for (const r of rows) {
    const c = counts.get(r.unitId) ?? counts.set(r.unitId, {all: 0}).get(r.unitId);
    c.all++;
    for (const f of Object.keys(r.factions)) c[f] = (c[f] ?? 0) + 1;
  }
  const countInScope = (unitId, factionId) => counts.get(unitId)?.[factionId ?? 'all'] ?? 0;

  function unitHit(unitId, factionId) {
    const u = unitById.get(unitId);
    return {unitId, name: u.name, short: u.short, type: u.type, factionIds: u.factions,
      profileCount: countInScope(unitId, factionId)};
  }

  // {query, factionId, recentIds} -> {recent, profiles, units, elsewhere, total}
  function search({query = '', factionId = null, recentIds = []} = {}) {
    const tokens = words(query);
    if (!tokens.length) return {recent: [], profiles: [], units: [], elsewhere: [], total: 0};
    const all = matchRows(tokens);
    const scoped = all.filter((m) => inScope(m.row, factionId));

    const recentSet = new Set(recentIds);
    const recent = recentIds
      .map((id) => scoped.find((m) => m.row.id === id))
      .filter(Boolean)
      .map((m) => profileHit(m, factionId));

    const units = [];
    const seen = new Set();
    // `scoped` is best first, so a unit's first match is its best loadout:
    // the one Enter on the unit row picks (the profiles list is capped).
    for (const m of scoped) {
      if (seen.has(m.row.unitId)) continue;
      seen.add(m.row.unitId);
      units.push({...unitHit(m.row.unitId, factionId), tier: m.tier, best: profileHit(m, factionId)});
    }

    let elsewhere = [];
    if (factionId != null && !scoped.length && all.length) {
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
  function browse({factionId = null, recentIds = []} = {}) {
    const recent = recentIds.map((id) => rows[id]).filter((r) => r && inScope(r, factionId))
      .map((row) => asHit(row, factionId));
    const scopeUnits = index.units.filter((u) => factionId == null || u.factions.includes(factionId));
    const types = new Map();
    for (const u of scopeUnits) if (u.type) types.set(u.type, (types.get(u.type) ?? 0) + 1);
    return {
      recent,
      types: [...types].map(([type, count]) => ({type, count})),
      units: scopeUnits.map((u) => unitHit(u.id, factionId)).sort((a, b) => a.short.localeCompare(b.short)),
    };
  }

  const asHit = (row, factionId) => profileHit({row, weapon: -1, tier: TIER.EXACT, matched: []}, factionId);

  // Every loadout of one unit in scope, cheapest first: the unit drill-in page.
  function unitRows(unitId, factionId = null) {
    return (rowsByUnit.get(unitId) ?? []).filter((r) => inScope(r, factionId))
      .sort((a, b) => a.points - b.points || a.id - b.id)
      .map((r) => asHit(r, factionId));
  }

  // Units of one type (LI, HI, TAG...) in scope, A-Z: a browse tile's list.
  function unitsOfType(type, factionId = null) {
    return index.units.filter((u) => u.type === type && (factionId == null || u.factions.includes(factionId)))
      .map((u) => unitHit(u.id, factionId))
      .sort((a, b) => a.short.localeCompare(b.short));
  }

  // A saved pick -> its row id today. Row ids are positions in the index and
  // change whenever the army data is rebuilt, so recents store the real ids.
  function findRow({unitId, groupId, optionId, armyFactionId}) {
    return rows.find((r) => r.unitId === unitId && r.groupId === groupId && r.optionId === optionId
      && Object.values(r.factions).includes(armyFactionId))?.id ?? null;
  }

  // Units per vanilla faction, for the faction list.
  const unitCounts = new Map();
  for (const u of index.units) for (const f of u.factions) unitCounts.set(f, (unitCounts.get(f) ?? 0) + 1);
  const unitCount = (factionId) => unitCounts.get(factionId) ?? 0;

  return {search, browse, unitRows, unitsOfType, findRow, unitCount, factions: index.factions};
}
