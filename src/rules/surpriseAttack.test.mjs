// Surprise Attack (-X): the player's toggle on the active side, what ignores it, the cap, real units.
// Run with: yarn test:js
import test from 'node:test';
import assert from 'node:assert/strict';
import {defaultWeapon} from './defaultWeapon.js';
import {derive, option, profile} from './testFixtures.mjs';
import {army} from '../army/testArmy.mjs';
import {surpriseAttackMod} from './modifiers.js';
import {resolveSelection, trooperWeapons} from './trooper.js';
import {side, combi, immune, minus3, warhorse, flamer, duel, dodgeSkill, msv, at, surprise, combatInstinct, using} from './testMatchups.mjs';

/** @typedef {import('../types.js').WeaponEntry} WeaponEntry */
/** @typedef {import('../types.js').OptionRow} OptionRow */
/** @typedef {import('../types.js').TraitRef} TraitRef */
/** @typedef {import('../types.js').Traits} Traits */
/** @typedef {import('../types.js').Trooper} Trooper */

// MSV3 against a shot ignores Surprise Attack only on table conditions: the
// player leaves the chip on or off. Its CC case is in closeCombat.test.mjs.
test('MSV3 against a shooting Surprise Attack: the -3 stands while the chip is on', () => {
  const infiltrator = profile({skills: [surprise()]});
  const msv3 = side(profile({equip: [msv(3)]}), combi, 'dodge');
  assert.equal(duel(using(side(infiltrator, combi, '1:')), msv3).inputs.successValueB, 9);
  assert.equal(duel(using(side(infiltrator, combi, '1:'), false), msv3).inputs.successValueB, 12);
});

test('Surprise Attack (-3): only when toggled on, the opponent takes -3 attacking or Dodging', () => {
  const infiltrator = profile({skills: [surprise()]});
  // Off: nothing.
  assert.equal(duel(using(side(infiltrator, combi, '1:'), false), side(profile(), combi, '1:')).inputs.successValueB, 15);
  // On: the reactive ARO and the reactive Dodge take -3; the attacker's own roll is untouched.
  const on = duel(using(side(infiltrator, combi, '1:')), side(profile(), combi, '1:'));
  assert.equal(on.inputs.successValueB, 12);
  assert.equal(on.inputs.successValueA, 15);
  assert.equal(duel(using(side(infiltrator, combi, '1:')), side(profile(), combi, 'dodge')).inputs.successValueB, 9);
  // Surprise Attack (-6).
  assert.equal(duel(using(side(profile({skills: [surprise('-6')]}), combi, '1:')), side(profile(), combi, '1:')).inputs.successValueB, 9);
});

test('Surprise Attack: not from the reactive side, not with a template, not when Dodging, not without the skill', () => {
  const infiltrator = profile({skills: [surprise()]});
  // Reactive trooper with the skill and the toggle: nothing.
  assert.equal(duel(side(profile(), combi, '1:'), using(side(infiltrator, combi, '1:'))).inputs.successValueA, 15);
  // Direct Template: automatic hit, not a Face to Face Roll.
  assert.equal(duel(using(side(infiltrator, flamer, '3:')), side(profile(), combi, 'dodge')).inputs.successValueB, 12);
  assert.equal(duel(using(side(infiltrator, flamer, '3:')), side(profile(), combi, '1:')).inputs.successValueB, 15);
  // Active Dodge: no attack to surprise with.
  assert.equal(duel(using(side(infiltrator, combi, 'dodge')), side(profile(), combi, '1:')).inputs.successValueB, 15);
  // Toggle left on for a trooper without the skill.
  assert.equal(duel(using(side(profile(), combi, '1:')), side(profile(), combi, '1:')).inputs.successValueB, 15);
});

test('Combat Instinct ignores Surprise Attack; stacks with BS Attack (-3) otherwise, under the cap', () => {
  const infiltrator = profile({skills: [surprise(), minus3]});
  const r = duel(using(side(infiltrator, combi, '1:')), side(profile({skills: [combatInstinct]}), combi, '1:'));
  assert.equal(r.inputs.successValueB, 12);                     // BS Attack (-3) only
  assert.ok(r.notes.includes("Reactive: Combat Instinct; the opponent's Surprise Attack (-3) has no effect"), r.notes.join(' | '));
  assert.equal(duel(using(side(infiltrator, combi, '1:')), side(profile(), combi, '1:')).inputs.successValueB, 9);
  // Warhorse drops the BS Attack (-3) but not the Surprise Attack.
  assert.equal(duel(using(side(infiltrator, combi, '1:')), side(profile({skills: [warhorse]}), combi, '1:')).inputs.successValueB, 12);
});

test('Surprise Attack in the Army data and in a share link', () => {
  // A unit with Surprise Attack (id 191) is in the data.
  const u = /** @type {import('../types.js').UnitRow} */ (army.units.find((x) => x.byFaction[x.inFactions[0]].groups.some((g) => g.profiles.some((p) => p.skills.some((s) => s.id === 191)))));
  const f = u.inFactions[0];
  const g = /** @type {import('../types.js').GroupRow} */ (u.byFaction[f].groups.find((gr) => gr.profiles.some((p) => p.skills.some((s) => s.id === 191))));
  const sel = {unitId: u.id, factionId: f, groupId: g.id, profileId: g.profiles[0].id, optionId: g.options[0].id, surpriseAttack: true};
  assert.equal(/** @type {Trooper} */ (resolveSelection(army, sel)).surpriseAttack, true);
  assert.equal(/** @type {Trooper} */ (resolveSelection(army, {...sel, surpriseAttack: false})).surpriseAttack, false);
});

test('Surprise Attack: still -3 out of range and against an attack the target is immune to', () => {
  const infiltrator = profile({skills: [surprise()]});
  // Out of range: declared, fails automatically, the opponent's Dodge still takes -3.
  const far = duel(using(side(infiltrator, combi, '1:')), side(profile(), combi, 'dodge'), 240);
  assert.equal(far.inputs.successValueA, 0);
  assert.equal(far.inputs.successValueB, 9);
  // E/Mitter vs Immunity (BTS): harmless, but still an opposed roll.
  const emitter = option([{id: 16, name: 'E/Mitter'}]);
  const r = duel(using(side(infiltrator, emitter, '16:')), side(immune('BTS'), combi, '1:'));
  assert.equal(r.inputs.ammoA, 'NONE');
  assert.equal(r.inputs.successValueB, 12);
});

test('Surprise Attack counts toward the +/-12 cap on the opponent\'s roll', () => {
  // Reactive HMG at 0-8" (-3) against Mimetism (-6), in cover (-3), plus Surprise Attack (-3): -15 -> -12.
  const infiltrator = profile({skills: [surprise(), {id: 28, name: 'Mimetism', extra: ['-6']}]});
  const r = duel(using(side(infiltrator, combi, '1:', true)), side(profile({bs: 14}), option([{id: 7, name: 'HMG'}]), '7:'), 20);
  assert.equal(r.inputs.successValueB, 2);
  assert.ok(r.notes.includes('Reactive: MODs add up to -15, capped at -12'), r.notes.join(' | '));
});

test('Surprise Attack and the reactive Dodge (-3): each side takes the other\'s MOD', () => {
  const infiltrator = profile({skills: [surprise()]});
  const firebat = profile({skills: dodgeSkill('-3')});
  const r = duel(using(side(infiltrator, combi, '1:')), side(firebat, combi, 'dodge'));
  assert.equal(r.inputs.successValueA, 12);   // BS 12 +3 range, Dodge (-3)
  assert.equal(r.inputs.successValueB, 9);    // PH 12, Surprise Attack (-3)
});

test('Surprise Attack with real units: Lù Duān, Hassassin Áyyār (-6), Combat Instinct (Al Fasid)', () => {
  /**
   * @param {number} unitId
   * @param {number} factionId
   * @param {string | null} weaponKey
   * @param {Partial<import('../types.js').Selection>} [extra]
   * @returns {Partial<import('../types.js').Selection>}
   */
  const sel = (unitId, factionId, weaponKey, extra = {}) =>
    ({unitId, factionId, groupId: 1, profileId: 1, optionId: 1, weaponKey, ...extra});
  /** @param {Partial<import('../types.js').Selection>} s a trooper with a loadout and a weapon */
  const weaponOf = (s) => {
    const r = /** @type {Trooper & {option: OptionRow}} */ (resolveSelection(army, s));
    return /** @type {WeaponEntry} */ (defaultWeapon(trooperWeapons(r.option, army.weapons, r.traits), 'active')).key;
  };
  /**
   * @param {Partial<import('../types.js').Selection>} a
   * @param {Partial<import('../types.js').Selection>} b
   */
  const vs = (a, b) => derive({active: resolveSelection(army, a), reactive: resolveSelection(army, b), rangeCm: 40});
  // Fennec: a plain Dodge (Chaksa, with Sixth Sense, is checked below).
  const fennec = {unitId: 1803, factionId: 101, groupId: 1, profileId: 1, optionId: 1, weaponKey: 'dodge'};
  const chaksa = {unitId: 1310, factionId: 801, groupId: 1, optionId: 1, weaponKey: 'dodge'};

  const luDuan = sel(160, 201, null);
  luDuan.weaponKey = weaponOf(luDuan);
  const off = vs(luDuan, fennec);
  const on = vs({...luDuan, surpriseAttack: true}, fennec);
  assert.equal(on.inputs.successValueB, /** @type {number} */ (off.inputs.successValueB) - 3);
  assert.equal(on.inputs.successValueA, off.inputs.successValueA);

  const ayyar = sel(779, 402, null);
  ayyar.weaponKey = weaponOf(ayyar);
  assert.equal(vs({...ayyar, surpriseAttack: true}, fennec).inputs.successValueB, /** @type {number} */ (vs(ayyar, fennec).inputs.successValueB) - 6);

  // Sixth Sense: a Dodge takes no negative MODs, Surprise Attack included.
  const sixth = vs({...luDuan, surpriseAttack: true}, chaksa);
  assert.equal(sixth.inputs.successValueB, vs(luDuan, chaksa).inputs.successValueB);
  assert.ok(sixth.notes.includes("Reactive: Sixth Sense (Dodge); the opponent's Surprise Attack (-3) has no effect"), sixth.notes.join(' | '));

  const alFasid = {unitId: 343, factionId: 404, groupId: 1, profileId: 1, optionId: 1, weaponKey: 'dodge'};
  const ci = vs({...luDuan, surpriseAttack: true}, alFasid);
  assert.equal(ci.inputs.successValueB, vs(luDuan, alFasid).inputs.successValueB);
  assert.ok(ci.notes.includes("Reactive: Combat Instinct; the opponent's Surprise Attack (-3) has no effect"), ci.notes.join(' | '));

  // Swapped: Lù Duān reacting with the switch still on imposes nothing.
  const reactive = derive({active: resolveSelection(army, {...chaksa, weaponKey: 'dodge'}),
    reactive: resolveSelection(army, {...luDuan, surpriseAttack: true}), rangeCm: 40});
  const reactiveOff = derive({active: resolveSelection(army, {...chaksa, weaponKey: 'dodge'}),
    reactive: resolveSelection(army, luDuan), rangeCm: 40});
  assert.deepEqual(reactive.inputs, reactiveOff.inputs);
});

test('surpriseAttackMod: the switch only exists for troopers with the skill', () => {
  // Traits with skills only: all it reads.
  assert.equal(surpriseAttackMod(/** @type {Traits} */ ({skills: [surprise('-3')]})), -3);
  assert.equal(surpriseAttackMod(/** @type {Traits} */ ({skills: [surprise('-6')]})), -6);
  assert.equal(surpriseAttackMod(/** @type {Traits} */ ({skills: /** @type {TraitRef[]} */ ([])})), 0);
  assert.equal(surpriseAttackMod(null), 0);
});
