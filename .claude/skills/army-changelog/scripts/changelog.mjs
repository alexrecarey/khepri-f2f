// @ts-check
// node changelog.mjs <old army.json> <new army.json> <out.json>
// Diffs two army.json snapshots into changelog data: one entry per unit, with
// armies whose changes are identical merged into one entry; each change names
// the profile or loadout it belongs to. Loadouts are labelled "NAME|pts · SWC · kit"
// because several loadouts of one unit often share a name.
import {mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import path from 'node:path';

/** @typedef {import('../../../../src/types.js').Army} Army */
/** @typedef {import('../../../../src/types.js').TraitRef} TraitRef */
/** @typedef {import('../../../../src/types.js').FactionEntry} FactionEntry */
/** @typedef {import('../../../../src/types.js').OptionRow} OptionRow */
/** @typedef {import('../../../../src/types.js').ProfileRow} ProfileRow */
/** @typedef {import('../../../../src/types.js').WeaponRow} WeaponRow */
/**
 * One line of the changelog. `target`: the profile name, or the loadout's
 * "NAME|pts · SWC · kit" label (loadoutLabel), or null for the whole unit.
 * @typedef {{kind: string, target: string | null, op: 'add' | 'remove' | 'change' | 'up' | 'down', text: string}} Change
 */
/** @typedef {Omit<Change, 'target'>} WeaponChange */

const [oldPath, newPath, outPath] = process.argv.slice(2);
/** @type {Army} */
const before = JSON.parse(readFileSync(oldPath, 'utf8'));
/** @type {Army} */
const after = JSON.parse(readFileSync(newPath, 'utf8'));

/** @typedef {'type' | 'move' | 'cc' | 'bs' | 'ph' | 'wip' | 'arm' | 'bts' | 'w' | 'str' | 's' | 'ava'} ProfileStat */
// The profile fields compared, in the order the changelog lists them, with their labels.
/** @type {Record<ProfileStat, string>} */
const STAT_LABEL = {type: 'Type', move: 'MOV', cc: 'CC', bs: 'BS', ph: 'PH', wip: 'WIP', arm: 'ARM', bts: 'BTS', w: 'W/STR', str: 'STR flag', s: 'S', ava: 'AVA'};
const STATS = /** @type {ProfileStat[]} */ (Object.keys(STAT_LABEL));
// AVA -1 is Total.
const AVA_TOTAL = -1;

/** @param {TraitRef} trait "Name (extra, extra)" */
const traitText = (trait) => trait.name + (trait.extra?.length ? ` (${trait.extra.join(', ')})` : '');

/**
 * @param {ProfileStat} stat
 * @param {unknown} value
 */
function statText(stat, value) {
  if (value === undefined) return '—';
  if (stat === 'move') return /** @type {number[]} */ (value).join('-');
  if (stat === 'ava' && value === AVA_TOTAL) return 'T';
  if (stat === 'str') return value ? 'STR' : 'W';
  return String(value);
}

/**
 * @param {unknown} a
 * @param {unknown} b
 */
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

/**
 * The traits added and removed between two lists, as changes.
 * @param {TraitRef[] | undefined} oldList
 * @param {TraitRef[] | undefined} newList
 * @param {string} kind
 * @param {string} what the line's label: Skill, Equipment, Weapon
 * @param {string} target
 * @returns {Change[]}
 */
function listDiff(oldList = [], newList = [], kind, what, target) {
  const oldTexts = oldList.map(traitText);
  const newTexts = newList.map(traitText);
  return [
    ...newTexts.filter((text) => !oldTexts.includes(text)).map((text) => ({kind, target, op: /** @type {const} */ ('add'), text: `${what}: ${text}`})),
    ...oldTexts.filter((text) => !newTexts.includes(text)).map((text) => ({kind, target, op: /** @type {const} */ ('remove'), text: `${what}: ${text}`})),
  ];
}

// A loadout's label: its name, then (after "|") points, SWC and kit, since
// several loadouts of one unit often share a name.
/** @param {OptionRow} option */
function loadoutLabel(option) {
  const kit = [...option.weapons, ...option.skills, ...option.equip].map(traitText).join(', ') || 'no extras';
  return `${option.name}|${option.points} pts · ${option.swc} SWC · ${kit}`;
}

/**
 * One profile's changes.
 * @param {ProfileRow} oldProfile
 * @param {ProfileRow} newProfile
 * @returns {Change[]}
 */
function profileDiff(oldProfile, newProfile) {
  const target = newProfile.name;
  /** @type {Change[]} */
  const out = [];
  if (oldProfile.name !== newProfile.name) out.push({kind: 'other', target, op: 'change', text: `Renamed from ${oldProfile.name}`});
  for (const stat of STATS) {
    if (same(oldProfile[stat], newProfile[stat])) continue;
    out.push({kind: 'stats', target, op: 'change', text: `${STAT_LABEL[stat]}: ${statText(stat, oldProfile[stat])} → ${statText(stat, newProfile[stat])}`});
  }
  out.push(...listDiff(oldProfile.skills, newProfile.skills, 'skills', 'Skill', target));
  out.push(...listDiff(oldProfile.equip, newProfile.equip, 'skills', 'Equipment', target));
  out.push(...listDiff(oldProfile.weapons, newProfile.weapons, 'loadouts', 'Weapon', target));
  return out;
}

/**
 * One loadout's changes.
 * @param {OptionRow} oldOption
 * @param {OptionRow} newOption
 * @returns {Change[]}
 */
function loadoutDiff(oldOption, newOption) {
  const target = loadoutLabel(newOption);
  /** @type {Change[]} */
  const out = [];
  if (oldOption.name !== newOption.name) out.push({kind: 'other', target, op: 'change', text: `Loadout renamed from ${oldOption.name}`});
  if (oldOption.points !== newOption.points) {
    out.push({kind: 'points', target, op: newOption.points > oldOption.points ? 'up' : 'down', text: `Points: ${oldOption.points} → ${newOption.points}`});
  }
  if (oldOption.swc !== newOption.swc) {
    out.push({kind: 'points', target, op: Number(newOption.swc) > Number(oldOption.swc) ? 'up' : 'down', text: `SWC: ${oldOption.swc} → ${newOption.swc}`});
  }
  out.push(...listDiff(oldOption.weapons, newOption.weapons, 'loadouts', 'Weapon', target));
  out.push(...listDiff(oldOption.skills, newOption.skills, 'skills', 'Skill', target));
  out.push(...listDiff(oldOption.equip, newOption.equip, 'skills', 'Equipment', target));
  if (!same(oldOption.statOverrides, newOption.statOverrides)) {
    out.push({kind: 'stats', target, op: 'change', text: `Loadout stat override: ${JSON.stringify(oldOption.statOverrides ?? {})} → ${JSON.stringify(newOption.statOverrides ?? {})}`});
  }
  if (Boolean(oldOption.fto) !== Boolean(newOption.fto)) {
    out.push({kind: 'other', target, op: 'change', text: newOption.fto ? 'Now an FTO loadout' : 'No longer FTO'});
  }
  return out;
}

/**
 * A unit's changes in one army. `labels`: the line for an army that gained or
 * lost the unit ("New unit" when the unit itself is new).
 * @param {FactionEntry | undefined} oldEntry
 * @param {FactionEntry | undefined} newEntry
 * @param {{added: string, removed: string}} labels
 * @returns {Change[]}
 */
function diffFaction(oldEntry, newEntry, labels) {
  if (!oldEntry) return [{kind: 'new', target: null, op: 'add', text: labels.added}];
  if (!newEntry) return [{kind: 'removed', target: null, op: 'remove', text: labels.removed}];
  /** @type {Change[]} */
  const out = [];
  const oldGroups = new Map(oldEntry.groups.map((group) => [group.id, group]));
  const newGroups = new Map(newEntry.groups.map((group) => [group.id, group]));
  for (const [id, group] of newGroups) {
    if (!oldGroups.has(id)) out.push({kind: 'loadouts', target: group.isc, op: 'add', text: `New profile group: ${group.isc}`});
  }
  for (const [id, group] of oldGroups) {
    if (!newGroups.has(id)) out.push({kind: 'loadouts', target: group.isc, op: 'remove', text: `Profile group removed: ${group.isc}`});
  }
  for (const [id, newGroup] of newGroups) {
    const oldGroup = oldGroups.get(id);
    if (!oldGroup) continue;
    if (oldGroup.category !== newGroup.category) {
      out.push({kind: 'other', target: newGroup.isc, op: 'change', text: `Category: ${oldGroup.category ?? '—'} → ${newGroup.category ?? '—'}`});
    }
    const oldProfiles = new Map(oldGroup.profiles.map((profile) => [profile.id, profile]));
    for (const newProfile of newGroup.profiles) {
      const oldProfile = oldProfiles.get(newProfile.id);
      if (oldProfile) out.push(...profileDiff(oldProfile, newProfile));
      else out.push({kind: 'loadouts', target: newProfile.name, op: 'add', text: `New profile: ${newProfile.name}`});
    }
    for (const oldProfile of oldGroup.profiles) {
      if (!newGroup.profiles.some((profile) => profile.id === oldProfile.id)) {
        out.push({kind: 'loadouts', target: oldProfile.name, op: 'remove', text: `Profile removed: ${oldProfile.name}`});
      }
    }
    const oldOptions = new Map(oldGroup.options.map((option) => [option.id, option]));
    const newOptions = new Map(newGroup.options.map((option) => [option.id, option]));
    for (const [optionId, newOption] of newOptions) {
      const oldOption = oldOptions.get(optionId);
      if (oldOption) out.push(...loadoutDiff(oldOption, newOption));
      else out.push({kind: 'loadouts', target: loadoutLabel(newOption), op: 'add', text: 'New loadout'});
    }
    for (const [optionId, oldOption] of oldOptions) {
      if (!newOptions.has(optionId)) out.push({kind: 'loadouts', target: loadoutLabel(oldOption), op: 'remove', text: 'Loadout removed'});
    }
  }
  return out;
}

// Units: diff per army, then merge the armies whose change lists are identical.
/** @typedef {{unit: string, slug: string, crest: string | null, factions: number[], changes: Change[]}} UnitEntry */
/** @type {UnitEntry[]} */
const units = [];
const oldUnits = new Map(before.units.map((unit) => [unit.id, unit]));
const newUnits = new Map(after.units.map((unit) => [unit.id, unit]));
for (const id of new Set([...oldUnits.keys(), ...newUnits.keys()])) {
  const oldUnit = oldUnits.get(id);
  const newUnit = newUnits.get(id);
  const unit = /** @type {import('../../../../src/types.js').UnitRow} */ (newUnit ?? oldUnit);
  const labels = {added: oldUnit ? 'Added to this army' : 'New unit', removed: newUnit ? 'No longer in this army' : 'Unit removed'};
  const armies = new Set([...Object.keys(oldUnit?.byFaction ?? {}), ...Object.keys(newUnit?.byFaction ?? {})]);
  /** @type {Map<string, {changes: Change[], factions: number[]}>} */
  const byChanges = new Map();
  for (const army of armies) {
    const changes = diffFaction(oldUnit?.byFaction[army], newUnit?.byFaction[army], labels);
    if (!changes.length) continue;
    const key = JSON.stringify(changes);
    const entry = byChanges.get(key) ?? {changes, factions: []};
    entry.factions.push(Number(army));
    byChanges.set(key, entry);
  }
  for (const {changes, factions} of byChanges.values()) {
    units.push({unit: unit.isc, slug: unit.slug, crest: unit.crest ?? null, factions: factions.sort((a, b) => a - b), changes});
  }
}

// Weapons: one list for every army, each entry tagged with the armies that
// field a unit carrying the weapon.
/** @type {Map<number, Set<number>>} */
const carriers = new Map();
for (const unit of after.units) {
  for (const [army, entry] of Object.entries(unit.byFaction)) {
    for (const group of entry.groups) {
      for (const holder of [...group.options, ...group.profiles]) {
        for (const weapon of holder.weapons) {
          const armies = carriers.get(weapon.id) ?? new Set();
          armies.add(Number(army));
          carriers.set(weapon.id, armies);
        }
      }
    }
  }
}

/** @param {{to: number, mod: number}[]} ranges '8":+3 16":0 ...' */
const rangesText = (ranges) => ranges.map((band) => `${band.to}":${band.mod > 0 ? '+' : ''}${band.mod}`).join(' ');

/**
 * A weapon field's value as the changelog writes it.
 * @param {string} field
 * @param {unknown} value
 */
function fieldText(field, value) {
  if (value === undefined) return '—';
  if (field === 'ranges') return rangesText(/** @type {{to: number, mod: number}[]} */ (value));
  if (Array.isArray(value)) return value.join(', ') || '—';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

/**
 * A weapon's changes, mode by mode.
 * @param {WeaponRow[]} oldModes
 * @param {WeaponRow[]} newModes
 * @returns {WeaponChange[]}
 */
function weaponDiff(oldModes, newModes) {
  /** @type {WeaponChange[]} */
  const out = [];
  const oldByMode = new Map(oldModes.map((row) => [row.mode ?? '', row]));
  const newByMode = new Map(newModes.map((row) => [row.mode ?? '', row]));
  for (const [mode, newRow] of newByMode) {
    const oldRow = oldByMode.get(mode);
    if (!oldRow) {
      out.push({kind: 'weapons', op: 'add', text: `New mode ${mode}`});
      continue;
    }
    const prefix = mode ? `${mode}: ` : '';
    const oldFields = /** @type {Record<string, unknown>} */ (oldRow);
    const newFields = /** @type {Record<string, unknown>} */ (newRow);
    for (const field of Object.keys({...oldRow, ...newRow})) {
      if (field === 'name' || field === 'mode' || same(oldFields[field], newFields[field])) continue;
      out.push({kind: 'weapons', op: 'change', text: `${prefix}${field}: ${fieldText(field, oldFields[field])} → ${fieldText(field, newFields[field])}`});
    }
  }
  for (const mode of oldByMode.keys()) {
    if (!newByMode.has(mode)) out.push({kind: 'weapons', op: 'remove', text: `Mode removed: ${mode}`});
  }
  return out;
}

/** @type {{weapon: string, factions: number[], changes: WeaponChange[]}[]} */
const weapons = [];
for (const id of new Set([...Object.keys(before.weapons), ...Object.keys(after.weapons)])) {
  const oldModes = before.weapons[id];
  const newModes = after.weapons[id];
  if (same(oldModes, newModes)) continue;
  /** @type {WeaponChange[]} */
  const changes = !oldModes ? [{kind: 'weapons', op: 'add', text: 'New weapon'}]
    : !newModes ? [{kind: 'weapons', op: 'remove', text: 'Weapon removed'}]
    : weaponDiff(oldModes, newModes);
  const name = (newModes ?? oldModes)[0].name;
  weapons.push({weapon: name, factions: [...(carriers.get(Number(id)) ?? [])].sort((a, b) => a - b), changes});
}

// The armies, for the page's facets and logos. `logo`: CB's file name
// without .svg, under which build.mjs publishes it.
const factions = Object.values(after.factions).map((faction) => ({
  id: faction.id,
  name: faction.name,
  parent: faction.parent,
  logo: faction.logo?.split('/').pop()?.replace(/\.svg$/, '') ?? null,
}));

/** @param {string} version "7.26246.158" */
const versionParts = (version) => version.split('.').map(Number);
/**
 * @param {string} a
 * @param {string} b
 */
function compareVersions(a, b) {
  const x = versionParts(a);
  const y = versionParts(b);
  for (let i = 0; i < 3; i++) if (x[i] !== y[i]) return x[i] - y[i];
  return 0;
}
// Each army has its own version; show the lowest and highest.
/** @param {Army} data */
function versionRange(data) {
  const versions = [...new Set(Object.values(data.factions).map((faction) => faction.version))].sort(compareVersions);
  return versions.length > 1 ? `${versions[0]}–${versions.at(-1)}` : versions[0];
}

units.sort((a, b) => a.unit.localeCompare(b.unit));
weapons.sort((a, b) => a.weapon.localeCompare(b.weapon));
mkdirSync(path.dirname(outPath), {recursive: true});
writeFileSync(outPath, JSON.stringify({
  from: {version: versionRange(before), date: before.generatedAt},
  to: {version: versionRange(after), date: after.generatedAt},
  factions,
  units,
  weapons,
}));

console.log('unit entries', units.length, 'weapon entries', weapons.length);
/** @type {Record<string, number>} */
const perKind = {};
for (const entry of units) for (const change of entry.changes) perKind[change.kind] = (perKind[change.kind] ?? 0) + 1;
console.log(perKind);
