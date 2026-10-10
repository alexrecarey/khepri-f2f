// army.json -> the search index: one row per loadout the picker can list, each
// with the words it can be found by. Runs at build time
// (scripts/build-search-index.mjs) so the app loads a small JSON file instead
// of the whole army; tests call it directly on army.json.
import {shortIsc} from '../army/names.js';
import {isLieutenant} from '../army/traits.js';
import {KIND_ALIASES, SEARCHABLE_SKILLS, UNIT_ALIASES, WEAPON_ALIASES} from './aliases.js';
import {indexWords, initials, words} from './text.js';

// Where a word came from. Lower is a stronger match: a hit on the unit's
// short name beats one on its weapon.
export const FIELD = {SHORT: 0, NAME: 1, LOADOUT: 2, WEAPON: 3, ALIAS: 4, SKILL: 5};

// The vanilla army a faction belongs to: follow `parent` up to a faction that
// is its own parent, or whose parent isn't a faction. The mercenary companies
// (Starco, Ikari...) sit under Non-Aligned Armies, whose own parent (900) is
// not in the data, so NA2 is the eleventh "vanilla".
export function rootFaction(factions, id) {
  let cur = Number(id);
  for (let i = 0; i < 5; i++) {
    const parent = factions[cur]?.parent;
    if (parent == null || parent === cur || !factions[parent]) return cur;
    cur = parent;
  }
  return cur;
}


export function buildIndex(army) {
  const factions = army.factions;
  // The calculator only deals in vanilla factions: a sectorial is folded into its parent.
  const vanillaOf = (id) => rootFaction(factions, id);
  const vanillas = Object.values(factions)
    .filter((f) => rootFaction(factions, f.id) === f.id)
    .map((f) => ({id: f.id, name: f.name}));

  const rows = [];
  const units = [];
  // Weapon id -> {name, words}: stored once, rows refer to weapons by id.
  const weapons = {};
  // Skills the same way: [{name, words}], rows refer to them by position.
  const skills = [];
  const skillIds = new Map();
  for (const unit of army.units) {
    const short = shortIsc(unit.isc);
    const unitWords = new Map(); // word -> field
    const add = (list, field) => {
      for (const w of list) if (!unitWords.has(w) || unitWords.get(w) > field) unitWords.set(w, field);
    };
    add(indexWords(short), FIELD.SHORT);
    add(UNIT_ALIASES[unit.isc] ?? [], FIELD.SHORT);
    add(indexWords(unit.isc), FIELD.NAME);
    add(indexWords(unit.name), FIELD.NAME);

    // The same loadout reached through several sectorials of one vanilla is
    // one row; `factions` remembers which real faction to load it from.
    const byKey = new Map();
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
            row = makeRow(rows.length, unit, short, group, profile, option, unitWords, weapons, (name) => {
              if (!skillIds.has(name)) skillIds.set(name, skills.push({name, words: indexWords(name)}) - 1);
              return skillIds.get(name);
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
const kit = (o) => JSON.stringify([
  o.weapons.map((w) => w.id).sort(),
  (o.equip ?? []).map((e) => e.name).sort(),
  (o.skills ?? []).filter((s) => !isLieutenant(s)).map((s) => `${s.name}${(s.extra ?? []).join(',')}`).sort(),
]);
export function lieutenantTwins(options) {
  const plain = new Set(options.filter((o) => !(o.skills ?? []).some(isLieutenant)).map(kit));
  return new Set(options.filter((o) => (o.skills ?? []).some(isLieutenant) && plain.has(kit(o))).map((o) => o.id));
}

function weaponWords(name) {
  const out = new Map();
  for (const w of indexWords(name)) out.set(w, FIELD.WEAPON);
  const init = initials(name);
  if (init && !out.has(init)) out.set(init, FIELD.ALIAS);
  for (const a of WEAPON_ALIASES[name] ?? []) if (!out.has(a)) out.set(a, FIELD.ALIAS);
  return [...out];
}

function makeRow(id, unit, short, group, profile, option, unitWords, weapons, skillId) {
  for (const w of option.weapons) weapons[w.id] ??= {name: w.name, words: weaponWords(w.name)};
  // Loadout names are mostly the unit's name in capitals; keep only the words
  // they add ("BIPANDRA", "Hacker").
  const loadoutWords = indexWords(option.name).filter((w) => !unitWords.has(w));
  // Kind nicknames ("tr bot") and searchable skills ride with the loadout
  // words: the skill can come with the loadout, not the unit (Probots, Mulebots).
  const skillIds = new Set([...(profile?.skills ?? []), ...(option.skills ?? [])].map((s) => s.id));
  const addWord = (w) => { if (!unitWords.has(w) && !loadoutWords.includes(w)) loadoutWords.push(w); };
  for (const k of KIND_ALIASES) {
    if (profile?.type === k.type && skillIds.has(k.skill)) k.words.forEach(addWord);
  }
  for (const [id, name] of Object.entries(SEARCHABLE_SKILLS)) {
    if (skillIds.has(Number(id))) indexWords(name).forEach(addWord);
  }
  // "+SD": a weapon or the BS Attack skill with Special Dice (reactive picks).
  const sd = (extra) => (extra ?? []).some((e) => /^\+\d+SD$/.test(e));
  const skills = [...(profile?.skills ?? []), ...(option.skills ?? [])];
  if (option.weapons.some((w) => sd(w.extra)) || skills.some((k) => k.id === 201 && sd(k.extra))) addWord('sd');
  // Every skill of the profile and loadout ("mimetism", "sixth sense"):
  // a weak field, found exactly or by prefix only (search.js).
  const skillList = [...new Set(skillNamesOf(profile, option))].map(skillId);
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

const skillNamesOf = (profile, option) => [...(profile?.skills ?? []), ...(option.skills ?? [])].map((s) => s.name);

// For tests and the eval harness: the folded short name of a unit.
export const foldedShort = (isc) => words(shortIsc(isc)).join(' ');
