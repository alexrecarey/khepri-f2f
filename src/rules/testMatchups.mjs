// The matchups the rules tests are built from: a weapon table in army.json
// form, troopers made of the minimum the rules read, and the small builders
// the rule files share (a shot at a target, a duel, a zone duel...). Not a
// test file: `node --test` skips it, as does the layering test (a test
// fixture reads the translator like a test does). The fixtures every rules
// test file shares (profile, option, derive) are testFixtures.mjs.
import assert from 'node:assert/strict';
import {effectiveTraits} from '../army/traits.js';
import {bsWeapons} from '../army/weapons.js';
import {defaultWeapon} from './defaultWeapon.js';
import {derive, option, profile, weaponTable} from './testFixtures.mjs';
import {army} from '../army/testArmy.mjs';
import {tEn} from '../i18n/index.js';
import {render} from '../i18n/message.js';
import {pseudoWeapons, trooperCcWeapons, trooperWeapons} from './trooper.js';

/** @typedef {import('../types.js').WeaponEntry} WeaponEntry */
/** @typedef {import('../types.js').ProfileRow} ProfileRow */
/** @typedef {import('../types.js').OptionRow} OptionRow */
/** @typedef {import('../types.js').TraitRef} TraitRef */
/** @typedef {import('../types.js').Trooper} Trooper */
/** @typedef {import('../types.js').Ledger} Ledger */
/** @typedef {import('../types.js').RenderedDerived} RenderedDerived */

export const RIFLE_RANGES = [{to: 40, mod: 3}, {to: 80, mod: -3}, {to: 120, mod: -6}];

export const W = weaponTable({
  1: [{name: 'Combi Rifle', mode: null, ammo: 'N', burst: 3, dmg: 7, saving: 'ARM', saves: '1', props: ['Suppressive Fire'], ranges: RIFLE_RANGES}],
  2: [
    {name: 'MULTI Rifle', mode: 'AP Mode', ammo: 'AP', burst: 3, dmg: 7, saving: 'ARM/2', saves: '1', props: [], ranges: RIFLE_RANGES},
    {name: 'MULTI Rifle', mode: 'Shock Mode', ammo: 'Shock', burst: 3, dmg: 7, saving: 'ARM', saves: '1', props: [], ranges: RIFLE_RANGES},
  ],
  3: [{name: 'Heavy Flamethrower', mode: null, ammo: 'Fire', burst: 1, dmg: 6, saving: 'ARM', saves: '1', props: ['Direct Template (Large Teardrop)', 'Continous Damage'], ranges: null}],
  4: [{name: 'Viral Combi Rifle', mode: null, ammo: 'N', burst: 3, dmg: 7, saving: 'BTS', saves: '1', props: ['Bioweapon (DA+SHOCK)', 'Suppressive Fire'], ranges: RIFLE_RANGES}],
  5: [{name: 'Plasma Carbine', mode: 'Hit Mode', ammo: 'N', burst: 2, dmg: 6, saving: 'ARM and BTS', saves: '1 and 1', props: [], ranges: RIFLE_RANGES}],
  6: [{name: 'Heavy Pistol', mode: null, ammo: 'Shock', burst: 2, dmg: 6, saving: 'ARM', saves: '1', props: [], ranges: [{to: 20, mod: 3}, {to: 40, mod: 0}, {to: 60, mod: -6}]}],
  7: [{name: 'Heavy Machine Gun', mode: null, ammo: 'N', burst: 4, dmg: 5, saving: 'ARM', saves: '1', props: [], ranges: [{to: 20, mod: -3}, {to: 40, mod: 0}, {to: 80, mod: 3}, {to: 120, mod: -3}]}],
  8: [{name: 'CC Weapon', mode: null, ammo: 'N', burst: null, dmg: 7, saving: 'ARM', saves: '1', props: ['CC'], ranges: null}],
  9: [{name: 'Missile Launcher', mode: 'Hit Mode', ammo: 'Exp', burst: 1, dmg: 6, saving: 'ARM', saves: '3', props: [], ranges: RIFLE_RANGES}],
  10: [{name: 'T2 Rifle', mode: null, ammo: 'T2', burst: 3, dmg: 6, saving: 'ARM', saves: '1', props: [], ranges: RIFLE_RANGES}],
  11: [
    {name: 'Plasma Carbine', mode: 'Hit Mode', ammo: 'N', burst: 2, dmg: 6, saving: 'ARM and BTS', saves: '1 and 1', props: [], ranges: RIFLE_RANGES},
    {name: 'Plasma Carbine', mode: 'Blast Mode', ammo: 'N', burst: 2, dmg: 7, saving: 'ARM and BTS', saves: '1 and 1', props: ['Impact Template (Circular)'], ranges: RIFLE_RANGES},
  ],
  12: [{name: 'Panzerfaust', mode: null, ammo: 'AP+Exp', burst: 1, dmg: 6, saving: 'ARM/2', saves: '3', props: ['Anti-materiel', 'Disposable (2)'], ranges: RIFLE_RANGES}],
  13: [{name: 'K1 Combi Rifle', mode: null, ammo: 'N', burst: 3, dmg: 7, saving: 'ARM=0', saves: '1', props: ['Anti-materiel', 'Suppressive Fire'], ranges: RIFLE_RANGES}],
  14: [{name: 'Vulkan Shotgun', mode: null, ammo: 'AP', burst: 2, dmg: 6, saving: 'ARM/2', saves: '1', props: ['Continous Damage'], ranges: RIFLE_RANGES}],
  15: [{name: 'Breaker Rifle', mode: null, ammo: 'AP', burst: 3, dmg: 7, saving: 'BTS/2', saves: '1', props: ['Suppressive Fire'], ranges: RIFLE_RANGES}],
  16: [{name: 'E/Mitter', mode: null, ammo: 'E/M', burst: 2, dmg: 7, saving: 'BTS/2', saves: '2', props: ['Non-lethal', '[**]'], ranges: RIFLE_RANGES}],
  17: [{name: 'Flash Pulse', mode: null, ammo: 'Stun', burst: 1, dmg: 7, saving: 'BTS', saves: '1', props: ['BS Weapon (WIP)', 'State: Stunned', 'Non-lethal'], ranges: RIFLE_RANGES}],
  19: [{name: 'Light Rocket Launcher', mode: 'Blast Mode', ammo: 'N', burst: 2, dmg: 6, saving: 'ARM', saves: '1', props: ['Continous Damage', 'Impact Template (Circular)'], ranges: RIFLE_RANGES}],
  20: [{name: 'Boarding Pistol', mode: 'Blast Mode', ammo: 'N', burst: 1, dmg: 7, saving: 'ARM', saves: '1', props: ['Intuitive Attack', 'Direct Template (Small Teardrop)'], ranges: null}],
  21: [{name: 'Jammer', mode: null, ammo: 'N', burst: 1, dmg: 7, saving: 'BTS', saves: '1', props: ['BS Weapon (WIP)', 'Comms. Attack', 'Intuitive Attack', 'Disposable (2)', 'State: Isolated', 'Non-lethal', 'No LoF', 'Zone of Control'], ranges: null}],
  22: [{name: 'Silenced Pistol', mode: null, ammo: 'N', burst: 2, dmg: 6, saving: 'ARM', saves: '1', props: ['Silent (-6)'], ranges: [{to: 20, mod: 3}, {to: 40, mod: 0}, {to: 60, mod: -6}]}],
  18: [{name: 'Sepsitor', mode: null, ammo: null, burst: 1, dmg: 4, saving: 'BTS', saves: '1', props: ['Intuitive Attack', 'Disposable (2)', 'State: Sepsitorized', 'Direct Template (Large Teardrop)', '[*]'], ranges: null}],
});

/**
 * @param {ProfileRow} p
 * @param {OptionRow} o
 * @param {string | null} weaponKey
 * @param {boolean} [inCover]
 * @returns {Trooper}
 */
export const side = (p, o, weaponKey, inCover = false) => {
  const traits = effectiveTraits(p, o);
  const weapon = [...trooperWeapons(o, W, traits), ...trooperCcWeapons(o, W, traits), ...pseudoWeapons(traits)].find((w) => w.key === weaponKey) ?? null;
  return /** @type {Trooper} */ ({profile: p, option: o, traits, weapon, inCover});
};

export const combi = option([{id: 1, name: 'Combi Rifle'}, {id: 8, name: 'CC Weapon'}]);

/**
 * @param {TraitRef[]} weapons
 * @param {'active' | 'reactive'} role
 */
export const pick = (weapons, role) => defaultWeapon(bsWeapons(option(weapons), W), role)?.key ?? null;

export const DIRECT_TEMPLATE_NOTE = 'Direct Template: no Face to Face Roll; each attack is rolled on its own';

/**
 * @param {string} extra
 * @param {Partial<ProfileRow>} [over]
 */
export const immune = (extra, over = {}) => profile({arm: 5, bts: 3, skills: [{id: 162, name: 'Immunity', extra: [extra]}], ...over});

// A derivation without its lines and ledger (they name the weapon), to
// compare two weapons' numbers.
/** @param {RenderedDerived & {ledger?: Ledger}} d */
export const sansLines = ({lines, ledger, ...r}) => r;

/**
 * @param {ProfileRow} target
 * @param {number} id
 * @param {string} key
 * @param {{extra?: string[], inCover?: boolean}} [opts]
 */
export const shotAt = (target, id, key, {extra, inCover = false} = {}) =>
  derive({
    active: side(profile({wip: 13}), option([{id, name: 'x', ...(extra ? {extra} : {})}]), key),
    reactive: side(target, combi, '1:', inCover),
    rangeCm: 40,
  });

/**
 * @param {string[]} extra
 * @param {number} [id]
 */
export const withExtra = (extra, id = 1) => bsWeapons(option([{id, name: 'x', extra}]), W)[0];

// An entry's label is a Message; the tests read it in English.
/** @param {WeaponEntry} w */
export const label = (w) => render(tEn, w.label);

/** @type {import('../types.js').Army} */
/**
 * The unit the test names (it is in the data).
 * @param {string} isc
 */
export const byIsc = (isc) => /** @type {import('../types.js').UnitRow} */ (army.units.find((u) => u.isc === isc));

export const bsAttackAP = {id: 201, name: 'BS Attack', extra: ['AP']};

/** @param {...string} extra */
export const bsAttack = (...extra) => ({id: 201, name: 'BS Attack', extra});

/**
 * @param {TraitRef[]} shooterSkills
 * @param {TraitRef[]} weapons
 * @param {string} key
 * @param {ProfileRow} [target]
 * @param {Partial<OptionRow>} [extra]
 */
export const shoot = (shooterSkills, weapons, key, target = profile({arm: 3}), extra = {}) => derive({
  active: side(profile({skills: shooterSkills}), option(weapons, extra), key),
  reactive: side(target, combi, '1:'), rangeCm: 40,
});

export const minus3 = {id: 201, name: 'BS Attack', extra: ['-3']};

export const warhorse = {id: 267, name: 'Warhorse'};

export const flamer = option([{id: 3, name: 'Heavy Flamethrower'}]);

/**
 * @param {Trooper} a
 * @param {Trooper} b
 * @param {number} [rangeCm]
 */
export const duel = (a, b, rangeCm = 40) => derive({active: a, reactive: b, rangeCm});

/** @param {...string} extra */
export const dodgeSkill = (...extra) => extra.map((e) => ({id: 40, name: 'Dodge', extra: [e]}));

export const marksman = {id: 156, name: 'Marksmanship'};

export const limitedCover = {id: 268, name: 'Limited Cover'};

export const noCover = {id: 264, name: 'No Cover'};

export const nanoscreen = {id: 108, name: 'Nanoscreen'};

/** @param {string} mod */
export const albedo = (mod) => ({id: 183, name: 'Albedo', extra: [mod]});

/** @param {number} level */
export const msv = (level) => ({id: 113 + level, name: `Multispectral Visor L${level}`});

// Active Combi Rifle at 8-16" (BS 12 +3 = 15) against a reactive ARM 2 target.
/**
 * @param {ProfileRow} shooter
 * @param {ProfileRow} target
 * @param {boolean} [inCover]
 */
export const at = (shooter, target, inCover = false) => {
  const r = duel(side(shooter, combi, '1:'), side(target, combi, '1:', inCover));
  return [r.inputs.successValueA, r.inputs.armB];
};

/** @param {string} [mod] */
export const surprise = (mod = '-3') => ({id: 191, name: 'Surprise Attack', extra: [mod]});

export const combatInstinct = {id: 262, name: 'Combat Instinct'};

// A side with the Surprise Attack toggle set.
/**
 * @param {Trooper} s
 * @param {boolean} [on]
 */
export const using = (s, on = true) => ({...s, surpriseAttack: on});

// MSV level (0 = none) x Mimetism (0 = none): the MOD on the attacker's roll.
export const MSV_VS_MIMETISM = [
  //        none  -3   -6
  [/* 0 */ 0, -3, -6],
  [/* 1 */ 0, 0, -3],
  [/* 2 */ 0, 0, 0],
  [/* 3 */ 0, 0, 0],
];

/**
 * @param {number} mod
 * @param {Partial<ProfileRow>} [over]
 */
export const mimetic = (mod, over = {}) => profile({...over, skills: [...(over.skills ?? []), ...(mod ? [{id: 28, name: 'Mimetism', extra: [String(mod)]}] : [])]});

/**
 * @param {number} level
 * @param {Partial<ProfileRow>} [over]
 */
export const visor = (level, over = {}) => profile({...over, equip: [...(over.equip ?? []), ...(level ? [msv(level)] : [])]});

// Smoke and White Noise (rules/visibility.js), combi vs combi at 8-16" (+3).
/**
 * @param {Trooper} a
 * @param {Trooper} b
 * @param {Partial<import('../types.js').Zones>} zones
 */
export const zoneDuel = (a, b, zones) => derive({active: a, reactive: b, rangeCm: 40, zones});

/** @param {Partial<ProfileRow>} [over] */
export const shooter = (over) => side(profile(over), combi, '1:');

/** @param {Partial<ProfileRow>} [over] */
export const dodger = (over) => side(profile(over), combi, 'dodge');

export const SMOKE = {smoke: true};

export const WHITE_NOISE = {whiteNoise: true};

// Comms Attacks (Alex, 2026-10-20): the Jammer rolls WIP within ZoC; Reset
// opposes it, Dodge can't; a failed BTS save is Isolated.
export const jammer = option([{id: 21, name: 'Jammer'}, {id: 1, name: 'Combi Rifle'}]);

/** @param {Partial<ProfileRow>} [over] */
export const hacker = (over = {}) => profile({wip: 13, ...over});
