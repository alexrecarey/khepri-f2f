// army.json -> the search index: one row per loadout the picker can list, each
// with the words it can be found by. Runs at build time
// (scripts/build-search-index.mjs) so the app loads a small JSON file instead
// of the whole army; tests call it directly on army.json.
import {rootFaction} from '../army/factions.js';
import {shortIsc} from '../army/names.js';
import {isLieutenant} from '../army/traits.js';
import {KIND_ALIASES, SEARCHABLE_SKILLS, UNIT_ALIASES, WEAPON_ALIASES} from './aliases.js';
import {indexWords, initials, words} from './text.js';

// Where a word came from. Lower is a stronger match: a hit on the unit's
// short name beats one on its weapon.
export const FIELD = {SHORT: 0, NAME: 1, LOADOUT: 2, WEAPON: 3, ALIAS: 4, SKILL: 5};

/** @typedef {import('../types.js').IndexRow} IndexRow */
/** @typedef {import('../types.js').TraitRef} TraitRef */

/**
 * @param {import('../types.js').Army} army
 * @returns {import('../types.js').SearchIndex}
 */
export function buildIndex(army) {
  const factions = army.factions;
  // The calculator only deals in vanilla factions: a sectorial is folded into its parent.
  /** @param {string | number} id */
  const vanillaOf = (id) => rootFaction(factions, id);
  const vanillas = Object.values(factions)
    .filter((f) => rootFaction(factions, f.id) === f.id)
    .map((f) => ({id: f.id, name: f.name}));

  /** @type {IndexRow[]} */
  const rows = [];
  /** @type {import('../types.js').IndexUnit[]} */
  const units = [];
  // Weapon id -> {name, words}: stored once, rows refer to weapons by id.
  /** @type {import('../types.js').SearchIndex['weapons']} */
  const weapons = {};
  // Skills the same way: [{id, name, words}], rows refer to them by position.
  /** @type {import('../types.js').SearchIndex['skills']} */
  const skills = [];
  /** @type {Map<number, number>} */
  const skillIds = new Map();
  for (const unit of army.units) {
    const short = shortIsc(unit.isc);
    /** @type {Map<string, number>} */
    const unitWords = new Map(); // word -> field
    /**
     * @param {string[]} list
     * @param {number} field
     */
    const add = (list, field) => {
      for (const w of list) if (!unitWords.has(w) || /** @type {number} */ (unitWords.get(w)) > field) unitWords.set(w, field);
    };
    add(indexWords(short), FIELD.SHORT);
    add(UNIT_ALIASES[unit.isc] ?? [], FIELD.SHORT);
    add(indexWords(unit.isc), FIELD.NAME);
    add(indexWords(unit.name), FIELD.NAME);
    // In another language, the English ISC too: players know units by it.
    if (unit.code) add(indexWords(unit.code), FIELD.NAME);

    // The same loadout reached through several sectorials of one vanilla is
    // one row; `factions` remembers which real faction to load it from.
    /** @type {Map<string, IndexRow>} */
    const byKey = new Map();
    /** @type {string | null} */
    let type = null;
    for (const [factionId, entry] of Object.entries(unit.byFaction)) {
      const vanilla = vanillaOf(factionId);
      for (const group of entry.groups) {
        const profile = group.profiles[0];
        type ??= profile?.type ?? null;
        const ltTwins = lieutenantTwins(group.options);
        for (const option of group.options) {
          if (ltTwins.has(option.id)) continue;
          const key = [group.id, option.id, option.name, option.points, option.swc,
            option.weapons.map((w) => w.id).join('.')].join('|');
          let row = byKey.get(key);
          if (!row) {
            row = makeRow(rows.length, army, unit, short, group, profile, option, unitWords, weapons, ({id, name}) => {
              if (!skillIds.has(id)) skillIds.set(id, skills.push({id, name, words: indexWords(name)}) - 1);
              return /** @type {number} */ (skillIds.get(id));
            });
            byKey.set(key, row);
            rows.push(row);
          }
          if (!(vanilla in row.factions)) row.factions[vanilla] = Number(factionId);
        }
      }
    }
    const factionIds = [...new Set(Object.keys(unit.byFaction).map(vanillaOf))];
    units.push({id: unit.id, name: unit.isc, short, type, factions: factionIds,
      words: [...unitWords]});
  }
  return {version: 1, factions: vanillas, units, weapons, skills, rows};
}

// Lieutenant changes nothing on the table, so a Lieutenant loadout with the
// same weapons, equipment and other skills as a plain one (points and SWC may
// differ) is left out: the picker would list the same trooper twice.
/** @param {import('../types.js').OptionRow} o */
const kit = (o) => JSON.stringify([
  o.weapons.map((w) => w.id).sort(),
  (o.equip ?? []).map((e) => e.name).sort(),
  (o.skills ?? []).filter((s) => !isLieutenant(s)).map((s) => `${s.name}${(s.extra ?? []).join(',')}`).sort(),
]);
/** @param {import('../types.js').OptionRow[]} options */
export function lieutenantTwins(options) {
  const plain = new Set(options.filter((o) => !(o.skills ?? []).some(isLieutenant)).map(kit));
  return new Set(options.filter((o) => (o.skills ?? []).some(isLieutenant) && plain.has(kit(o))).map((o) => o.id));
}

// enName: the weapon's English name when the index is in another language;
// the aliases are players' shorthand for the English names ("hmg"), which
// they use in any language.
/**
 * @param {string} name
 * @param {string} [enName]
 * @returns {[string, number][]}
 */
function weaponWords(name, enName = name) {
  /** @type {Map<string, number>} */
  const out = new Map();
  for (const w of indexWords(name)) out.set(w, FIELD.WEAPON);
  const init = initials(name);
  if (init && !out.has(init)) out.set(init, FIELD.ALIAS);
  for (const a of WEAPON_ALIASES[enName] ?? []) if (!out.has(a)) out.set(a, FIELD.ALIAS);
  return [...out];
}

/**
 * @param {number} id
 * @param {import('../types.js').Army} army
 * @param {import('../types.js').UnitRow} unit
 * @param {string} short
 * @param {import('../types.js').GroupRow} group
 * @param {import('../types.js').ProfileRow | undefined} profile
 * @param {import('../types.js').OptionRow} option
 * @param {Map<string, number>} unitWords
 * @param {import('../types.js').SearchIndex['weapons']} weapons
 * @param {(skill: TraitRef) => number} skillId
 * @returns {IndexRow}
 */
function makeRow(id, army, unit, short, group, profile, option, unitWords, weapons, skillId) {
  for (const w of option.weapons) weapons[w.id] ??= {name: w.name, words: weaponWords(w.name, army.weapons[w.id]?.[0]?.en)};
  // Loadout names are mostly the unit's name in capitals; keep only the words
  // they add ("BIPANDRA", "Hacker").
  const loadoutWords = indexWords(option.name).filter((w) => !unitWords.has(w));
  // Kind nicknames ("tr bot") and searchable skills ride with the loadout
  // words: the skill can come with the loadout, not the unit (Probots, Mulebots).
  const skillIds = new Set([...(profile?.skills ?? []), ...(option.skills ?? [])].map((s) => s.id));
  /** @param {string} w */
  const addWord = (w) => { if (!unitWords.has(w) && !loadoutWords.includes(w)) loadoutWords.push(w); };
  for (const k of KIND_ALIASES) {
    if (profile?.type === k.type && skillIds.has(k.skill)) k.words.forEach(addWord);
  }
  // Searchable skills by the name the data gives them, in its language.
  for (const s of [...(profile?.skills ?? []), ...(option.skills ?? [])]) {
    if (SEARCHABLE_SKILLS.includes(s.id)) indexWords(s.name).forEach(addWord);
  }
  // "+SD": a weapon or the BS Attack skill with Special Dice (reactive picks).
  /** @param {string[] | undefined} extra */
  const sd = (extra) => (extra ?? []).some((e) => /^\+\d+SD$/.test(e));
  const skills = [...(profile?.skills ?? []), ...(option.skills ?? [])];
  if (option.weapons.some((w) => sd(w.extra)) || skills.some((k) => k.id === 201 && sd(k.extra))) addWord('sd');
  // Every skill of the profile and loadout ("mimetism", "sixth sense"):
  // a weak field, found exactly or by prefix only (search.js).
  const skillList = [...new Map(skillsOf(profile, option).map((s) => [s.id, s])).values()].map(skillId);
  return {
    id,
    unitId: unit.id,
    groupId: group.id,
    profileId: profile?.id ?? null,
    optionId: option.id,
    factions: {},
    unit: short,
    loadout: option.name,
    weapons: option.weapons.map((w) => w.id),
    type: profile?.type ?? null,
    bs: profile?.bs ?? null,
    points: option.points,
    swc: option.swc,
    loadoutWords,
    skills: skillList,
  };
}

/**
 * @param {import('../types.js').ProfileRow | undefined} profile
 * @param {import('../types.js').OptionRow} option
 */
const skillsOf = (profile, option) => [...(profile?.skills ?? []), ...(option.skills ?? [])];

// For tests and the eval harness: the folded short name of a unit.
/** @param {string} isc */
export const foldedShort = (isc) => words(shortIsc(isc)).join(' ');
