// Hacking Programs (N5): which ones a trooper can run and what each one is,
// as a weapon row the rules read like any other Comms Attack (the Jammer).
//
// The Army data has no program rows: its metadata's Hacking Programs Chart
// (`hack`) isn't kept in army.json. The programs the calculator rolls are
// few and fixed, so they live here, from that chart and the wiki's (Hacking
// Programs Chart, PDF 5.3). Supportware (Fairy Dust, Assisted Fire...),
// Cybermask and White Noise roll nothing face to face: not offered as
// programs. Assisted Fire and Enhanced Reaction change a REM's roll, so the
// REM gets a chip for them (rules/supportware.js) when its army runs them.
import {EQUIP, SKILL} from './ids.js';
import {effectiveTraits, hasEquip} from './traits.js';
import {parseWeaponMods, weaponLabel} from './weapons.js';

// Troop Types with the Hackable Characteristic.
const HACKABLE_TYPES = ['TAG', 'HI', 'REM', 'VH'];
// A program's target: these Troop Types, or 'Hacker' (the Hacker skill).
// null: any trooper (Spotlight).
const HACKABLE_OR_HACKER = [...HACKABLE_TYPES, 'Hacker'];

// attack: MOD to the user's WIP. opponent: MOD to the opponent's Face to Face
// Roll. ps / burst / ammo: what a success does; the Saving Roll is BTS. state:
// the State a failed save causes (null: a Wound each, Trinity). names: the
// Army's own name in other languages.
/**
 * @typedef {object} Program
 * @property {string} name
 * @property {Record<string, string>} [names]
 * @property {number} attack
 * @property {number} opponent
 * @property {number} ps
 * @property {number} burst
 * @property {string} ammo
 * @property {string | null} state
 * @property {string[] | null} targets
 */
/** @type {Record<string, Program>} */
const PROGRAMS = {
  carbonite: {name: 'Carbonite', names: {es: 'Carbonita'}, attack: 0, opponent: 0, ps: 7, burst: 2, ammo: 'DA',
    state: 'Immobilized-B', targets: HACKABLE_OR_HACKER},
  oblivion: {name: 'Oblivion', attack: 0, opponent: 0, ps: 4, burst: 2, ammo: 'AP', state: 'Isolated', targets: HACKABLE_OR_HACKER},
  spotlight: {name: 'Spotlight', attack: 0, opponent: 0, ps: 5, burst: 2, ammo: 'AP', state: 'Targeted', targets: null},
  totalControl: {name: 'Total Control', names: {es: 'Control Total'}, attack: 0, opponent: 0, ps: 4, burst: 1, ammo: 'DA',
    state: 'Possessed', targets: ['TAG']},
  trinity: {name: 'Trinity', attack: 3, opponent: 0, ps: 6, burst: 3, ammo: 'N', state: null, targets: ['Hacker']},
};

// Zero Pain: a Reset with two WIP rolls (in ARO too) and -3 to the Comms
// Attack it evades.
export const ZERO_PAIN = {name: 'Zero Pain', burst: 2, opponent: -3};

// What each Hacking Device runs (wiki, Hacking Device). EVO's programs are
// all Supportware.
/** @type {Record<number, string[]>} */
const DEVICE_PROGRAMS = {
  [EQUIP.HACKING_DEVICE]: ['carbonite', 'spotlight', 'totalControl', 'oblivion'],
  [EQUIP.HACKING_DEVICE_PLUS]: ['carbonite', 'spotlight', 'totalControl', 'oblivion'],
  [EQUIP.KILLER_HACKING_DEVICE]: ['trinity'],
  [EQUIP.EVO_HACKING_DEVICE]: [],
};

// The factions where some trooper carries an EVO Hacking Device, the device
// that runs Supportware, by army object (the scan runs once per army).
/** @type {WeakMap<object, Set<number>>} */
const evoFactions = new WeakMap();

/** @param {import('../types.js').Army} army */
function scanEvoFactions(army) {
  const out = new Set();
  for (const u of army.units) {
    for (const [f, {groups}] of Object.entries(u.byFaction)) {
      const evo = groups.some((g) => g.profiles.some((p) =>
        hasEquip(effectiveTraits(p, null), EQUIP.EVO_HACKING_DEVICE) || g.options.some((o) => hasEquip(effectiveTraits(p, o), EQUIP.EVO_HACKING_DEVICE))));
      if (evo) out.add(Number(f));
    }
  }
  return out;
}

// Can the army list `factionId` field a Supportware hacker (an EVO Hacking
// Device)? Its Programs only target troopers of the user's army list.
/**
 * @param {import('../types.js').Army} army
 * @param {number} factionId
 */
export function runsSupportware(army, factionId) {
  let set = evoFactions.get(army);
  if (!set) evoFactions.set(army, set = scanEvoFactions(army));
  return set.has(factionId);
}

// Extras on a device or the Hacker skill that change nothing face to face:
// programs that roll nothing, a Firewall (rules/modifiers.js reads it), the
// EVO device's Disposable.
const IGNORED_EXTRAS = /^(Firewall|White Noise|Cybermask|Fairy Dust|Disposable)\b/;

const PROGRAM_BY_NAME = new Map(Object.entries(PROGRAMS).map(([id, p]) => [p.name.toLowerCase(), id]));

// The traits that carry programs and their upgrades: the Hacking Devices and
// the Hacker skill.
/** @param {import('../types.js').Traits | null | undefined} traits */
const hackingTraits = (traits) => [
  ...(traits?.equip ?? []).filter((e) => e.id in DEVICE_PROGRAMS),
  ...(traits?.skills ?? []).filter((s) => s.id === SKILL.HACKER),
];

// A program upgrade's MOD as the weapon extras write it: "+1 B" -> "+1B".
/** @param {string} mod */
const extraText = (mod) => mod.replace(/^\+(\d+) (B|SD)$/, '+$1$2');

// Reads one MOD on a program into `mods`; false if it isn't one.
//   +1B, +1SD, PS=6, AP   as on a weapon
//   SR-1, SR-2            -1 / -2 to the target's Saving Rolls (the PS drops)
//   -3                    a MOD to the opponent's Face to Face Roll
/** A program's mods: a weapon's plus the MOD to the opponent's roll.
 * @typedef {import('../types.js').WeaponMods & {opponent: number}} ProgramMods */

/**
 * @param {ProgramMods} mods
 * @param {string} raw
 */
function addProgramMod(mods, raw) {
  const e = extraText(raw);
  let m;
  if ((m = /^SR-(\d+)$/.exec(e))) mods.psMod -= Number(m[1]);
  else if ((m = /^-(\d+)$/.exec(e))) mods.opponent -= Number(m[1]);
  else if (/^(\+\d+(B|SD)|PS=\d+|AP)$/.test(e)) Object.assign(mods, merge(mods, parseWeaponMods([e])));
  else return false;
  return true;
}

/**
 * @param {ProgramMods} a
 * @param {import('../types.js').WeaponMods} b
 */
function merge(a, b) {
  return {...a, burst: a.burst + b.burst, sd: a.sd + b.sd, ps: b.ps ?? a.ps, forceAP: a.forceAP || b.forceAP};
}

/** @returns {ProgramMods} */
const NO_MODS = () => ({...parseWeaponMods([]), opponent: 0});

// One extra on a device or the Hacker skill, as a list of items:
//   "+1B", "PS=6"                          a MOD to every program
//   "UPGRADE: SR-1"                        the same
//   "UPGRADE: Trinity (PS=5)", "Carbonite" a program (granted), with its MOD
//   "UPGRADES: Carbonite, Firewall (-3)"   several
//   "Zero Pain", "UPGRADE: Zero Pain"      Zero Pain
// Each item: {program, mod} | {zeroPain} | {mod} | {ignored} | {unread}.
/** @typedef {{program?: string, mod?: string | null, zeroPain?: true, ignored?: true, unread?: string}} ExtraItem */
/**
 * @param {string} extra
 * @returns {ExtraItem[]}
 */
function readExtra(extra) {
  const body = extra.replace(/^UPGRADES?:\s*/, '');
  return body.split(/,\s*/).map((item) => {
    // The pattern matches any text: `.+?` can be the whole item.
    const m = /** @type {RegExpExecArray} */ (/^(.+?)(?: \(([^)]+)\))?$/.exec(item.trim()));
    const [name, mod] = [m[1], m[2] ?? null];
    if (name === ZERO_PAIN.name) return {zeroPain: true};
    const program = PROGRAM_BY_NAME.get(name.toLowerCase());
    if (program) return {program, mod};
    if (IGNORED_EXTRAS.test(name)) return {ignored: true};
    if (!mod && addProgramMod(NO_MODS(), name)) return {mod: name};
    return {unread: item};
  });
}

/** @param {import('../types.js').Traits | null | undefined} traits */
const items = (traits) => hackingTraits(traits).flatMap((t) => (t.extra ?? []).flatMap(readExtra));

// Extras on a Hacking Device or the Hacker skill nothing here reads, for the
// pipeline's check (scripts/army-validate.mjs).
/** @param {string[] | null} [extra] */
export const unreadHackingExtras = (extra = []) => (extra ?? []).filter((e) =>
  readExtra(e).some((i) => i.unread || (i.program && i.mod && !addProgramMod(NO_MODS(), i.mod))));

// Can the trooper run Zero Pain?
/** @param {import('../types.js').Traits | null | undefined} traits */
export const hasZeroPain = (traits) => items(traits).some((i) => i.zeroPain);

/**
 * The program as a weapon row: a Comms Attack with no LoF, a WIP roll, a BTS
 * Saving Roll (halved for AP, two for DA). `hack` carries what the rules read
 * that no weapon row has. `lang`: the army's language, for the name.
 * @param {string} id a PROGRAMS key
 * @param {string} [lang]
 * @returns {import('../types.js').WeaponRow}
 */
export function programRow(id, lang = 'en') {
  const p = PROGRAMS[id];
  const name = p.names?.[lang] ?? p.name;
  return {
    name, ...(name !== p.name && {en: p.name}), mode: null, burst: p.burst, dmg: p.ps, ranges: null,
    ammo: [p.ammo], save: {attr: 'BTS', ...(p.ammo === 'AP' && {halved: true})}, saveRolls: p.ammo === 'DA' ? 2 : 1,
    props: ['Hacking Program', 'Comms. Attack', 'No LoF', ...(p.state ? ['Non-lethal', `State: ${p.state}`] : [])],
    hack: {id, attack: p.attack, opponent: p.opponent, state: p.state, targets: p.targets},
  };
}

/** @param {import('../types.js').WeaponRow | null | undefined} row */
export const isHackingProgram = (row) => Boolean(row?.hack);

/**
 * The programs a trooper can run, one weapon entry each (as army/weapons.js
 * builds them), in the chart's order: its devices' programs and the ones its
 * upgrades grant, with their MODs (a MOD on the device or "UPGRADE: SR-1"
 * goes on every program; the program's opponent MOD and its upgrade's add up).
 * @param {import('../types.js').Traits | null | undefined} traits
 * @param {string} [lang]
 * @returns {import('../types.js').WeaponEntry[]}
 */
export function trooperPrograms(traits, lang = 'en') {
  const list = items(traits);
  const granted = new Set(hackingTraits(traits).flatMap((t) => DEVICE_PROGRAMS[t.id] ?? []));
  for (const i of list) if (i.program) granted.add(i.program);
  const general = list.filter((i) => i.mod && !i.program).map((i) => i.mod);
  return Object.keys(PROGRAMS).filter((id) => granted.has(id)).map((id) => {
    const row = programRow(id, lang);
    const mods = {...NO_MODS(), opponent: PROGRAMS[id].opponent};
    for (const mod of [...general, ...list.filter((i) => i.program === id && i.mod).map((i) => i.mod)]) addProgramMod(mods, /** @type {string} */ (mod));
    const key = `hack:${id}`;
    return {key, kind: 'program', id: key, name: row.name, mode: null, row, mods, label: weaponLabel(row, mods)};
  });
}

// Can this program target `target` (a resolved side)? Its Troop Type or the
// Hacker skill must be in the program's Target list; Spotlight hits anyone.
/**
 * @param {import('../types.js').WeaponRow | null | undefined} row
 * @param {Pick<import('../types.js').ResolvedSide, 'profile' | 'traits'> | null | undefined} target
 */
export function canTarget(row, target) {
  const targets = row?.hack?.targets;
  if (!targets || !target?.profile) return true;
  if (targets.includes(target.profile.type)) return true;
  return targets.includes('Hacker') && (target.traits?.skills ?? []).some((s) => s.id === SKILL.HACKER);
}
