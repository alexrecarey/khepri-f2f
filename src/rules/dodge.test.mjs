// Dodge: its bracketed values (PH=14, +3, -3, +1SD, ARM +3) and the Bangbomb Dodge.
// Run with: yarn test:js
import test from 'node:test';
import assert from 'node:assert/strict';
import {effectiveTraits} from '../army/traits.js';
import {buildLedger} from './ledger.js';
import {derive, option, profile} from './testFixtures.mjs';
import {tEn} from '../i18n/index.js';
import {render} from '../i18n/message.js';
import {pseudoName, pseudoWeapons} from './trooper.js';
import {noLofHelps} from './modifiers.js';
import {side, combi, pick, label, warhorse, flamer, duel, dodgeSkill} from './testMatchups.mjs';

/** @typedef {import('../types.js').TraitRef} TraitRef */
/** @typedef {import('../types.js').LedgerSide} LedgerSide */

test('Dodge reads every bracketed value; movement ones change nothing', () => {
  /** @param {TraitRef[]} skills */
  const dodgeSv = (skills) => duel(side(profile(), combi, '1:'), side(profile({ph: 10, skills}), combi, 'dodge')).inputs.successValueB;
  // Confessor-style: Dodge (+1") listed before Dodge (+3). Both read.
  assert.equal(dodgeSv(dodgeSkill('+1"', '+3')), 13);
  assert.equal(dodgeSv(dodgeSkill('+2"')), 10);
  // PH=11 and +3 together: replaced PH, then the MOD.
  assert.equal(dodgeSv(dodgeSkill('PH=11', '+3')), 14);
});

test('Dodge (-3): the attacker takes -3 while the user Dodges; not its own Dodge', () => {
  const firebat = profile({ph: 12, skills: dodgeSkill('-3')});
  const r = duel(side(profile(), combi, '1:'), side(firebat, combi, 'dodge'));
  assert.equal(r.inputs.successValueB, 12);               // own Dodge untouched
  assert.equal(r.inputs.successValueA, 12);               // BS 12 +3 range -3
  // Active Dodging with it: the reactive shot takes it.
  assert.equal(duel(side(firebat, combi, 'dodge'), side(profile(), combi, '1:')).inputs.successValueB, 12);
  // Shooting instead of dodging: nothing.
  assert.equal(duel(side(profile(), combi, '1:'), side(firebat, combi, '1:')).inputs.successValueA, 15);
  // Against a template (no roll): nothing to apply to.
  assert.equal(duel(side(profile(), flamer, '3:'), side(firebat, combi, 'dodge')).inputs.successValueB, 12);
  // Not Warhorse's business.
  assert.equal(duel(side(profile({skills: [warhorse]}), combi, '1:'), side(firebat, combi, 'dodge')).inputs.successValueA, 12);
});

test('Dodge (+1SD): a Special Die on the Dodge Roll, template or not', () => {
  const kazak = profile({skills: dodgeSkill('+1SD')});
  assert.equal(duel(side(profile(), combi, '1:'), side(kazak, combi, 'dodge')).inputs.bonusBurstB, 1);
  const vsTemplate = duel(side(profile(), flamer, '3:'), side(kazak, combi, 'dodge'));
  assert.equal(vsTemplate.inputs.ammoB, 'DODGE');
  assert.equal(vsTemplate.inputs.bonusBurstB, 1);
  assert.equal(duel(side(kazak, combi, 'dodge'), side(profile(), combi, '1:')).inputs.bonusBurstA, 1);
  assert.equal(duel(side(profile(), combi, '1:'), side(profile(), combi, 'dodge')).inputs.bonusBurstB, 0);
});

test('Dodge (ARM +3): +3 ARM against the attack it Dodges', () => {
  const coyote = profile({arm: 2, skills: dodgeSkill('ARM +3')});
  assert.equal(duel(side(profile(), combi, '1:'), side(coyote, combi, 'dodge')).inputs.armB, 5);
  assert.equal(duel(side(profile(), combi, '1:'), side(coyote, combi, '1:')).inputs.armB, 2);       // shooting back
  assert.equal(duel(side(profile(), flamer, '3:'), side(coyote, combi, 'dodge')).inputs.armB, 5);    // Dodging a template
  assert.equal(duel(side(profile(), flamer, '3:'), side(coyote, combi, '1:')).inputs.armB, 2);      // shooting the template user
  // AP halves the whole ARM: (2 + 3) / 2 = 3.
  const multi = option([{id: 2, name: 'MULTI Rifle'}]);
  assert.equal(duel(side(profile(), multi, '2:AP Mode'), side(coyote, combi, 'dodge')).inputs.armB, 3);
  // BTS saves are untouched.
  assert.equal(duel(side(profile(), option([{id: 15, name: 'Breaker Rifle'}]), '15:'), side(coyote, combi, 'dodge')).inputs.armB, 2);
});

test('Bangbomb (+X) is its own Dodge choice: +X, but not against Template Weapons', () => {
  const bandit = profile({ph: 13, equip: [{id: 246, name: 'Bangbomb', extra: ['+4']}]});
  const choices = pseudoWeapons(effectiveTraits(bandit, combi), 'B');
  assert.deepEqual(choices.map((w) => render(tEn, pseudoName(w))), ['Dodge', 'Bangbomb', 'Reset', 'No ARO']);
  assert.equal(pseudoWeapons({skills: [], equip: []}).some((w) => w.bangbomb), false);
  /**
   * @param {TraitRef[]} weapons
   * @param {string} key
   * @param {string} [pick]
   */
  const dodgeVs = (weapons, key, pick = 'bangbomb') =>
    derive({active: side(profile(), option(weapons), key), reactive: side(bandit, combi, pick), rangeCm: 20}).inputs.successValueB;
  assert.equal(dodgeVs([{id: 1, name: 'Combi Rifle'}], '1:'), 17);
  // A plain Dodge (e.g. shot in the back, outside its LoF): no Bangbomb.
  assert.equal(dodgeVs([{id: 1, name: 'Combi Rifle'}], '1:', 'dodge'), 13);
  assert.equal(dodgeVs([{id: 3, name: 'Heavy Flamethrower'}], '3:'), 13);
  // The ledger shows the cancelled bonus struck out.
  const vsFlamer = {active: side(profile(), option([{id: 3, name: 'Heavy Flamethrower'}]), '3:'), reactive: side(bandit, combi, 'bangbomb'), rangeCm: 20};
  const sv = /** @type {import('../types.js').Section} */ (/** @type {LedgerSide} */ (buildLedger({...vsFlamer, derived: derive(vsFlamer)}).B).sv).lines;
  assert.deepEqual(sv.find((x) => x.label === 'Bangbomb (+4)'), {value: 4, label: 'Bangbomb (+4)', by: 'B', struck: 'Template'});
  assert.equal(dodgeVs([{id: 19, name: 'Light Rocket Launcher'}], '19:Blast Mode'), 13);
  // Bangbomb in the Active Turn against a shot.
  const r = derive({active: side(bandit, combi, 'bangbomb'), reactive: side(profile(), combi, '1:'), rangeCm: 20});
  assert.equal(r.inputs.successValueA, 17);
});

test('No LoF: -3 to a Dodge in ARO or against a template, plus the weapon\'s Silent (X) inside ZoC', () => {
  const silenced = option([{id: 22, name: 'Silenced Pistol'}]);
  const lrl = option([{id: 19, name: 'Light Rocket Launcher'}]);
  const jammer = option([{id: 21, name: 'Jammer'}]);
  /** @param {import('../types.js').Trooper} t */
  const blind = (t) => ({...t, noLof: true});
  /**
   * The Dodger's Success Value.
   * @param {import('../types.js').Trooper} a
   * @param {import('../types.js').Trooper} b
   * @param {import('../types.js').Side} s
   * @param {number} [rangeCm]
   * @param {number | null} [rangeCmB]
   */
  const sv = (a, b, s, rangeCm = 40, rangeCmB = null) => derive({active: a, reactive: b, rangeCm, rangeCmB}).inputs[`successValue${s}`];
  const dodger = side(profile({ph: 12}), combi, 'dodge');
  // ARO against a shot: -3, and nothing without the chip.
  assert.equal(sv(side(profile(), combi, '1:'), blind(dodger), 'B'), 9);
  assert.equal(sv(side(profile(), combi, '1:'), dodger, 'B'), 12);
  // Active Turn against a shot: no -3 (it is for AROs).
  assert.equal(sv(blind(dodger), side(profile(), combi, '1:'), 'A'), 12);
  // Against a template, either turn: -3. Direct or Impact.
  assert.equal(sv(blind(dodger), side(profile(), flamer, '3:'), 'A'), 9);
  assert.equal(sv(blind(dodger), side(profile(), lrl, '19:Blast Mode'), 'A'), 9);
  // Silent (-6) inside ZoC (0-8"): on top of the -3 in ARO, alone in the Active Turn.
  assert.equal(sv(side(profile(), silenced, '22:'), blind(dodger), 'B', 20), 3);
  assert.equal(sv(blind(dodger), side(profile(), silenced, '22:'), 'A', 20), 6);
  // Beyond ZoC: no Silent. A split range reads the attacker's own distance.
  assert.equal(sv(side(profile(), silenced, '22:'), blind(dodger), 'B', 40), 9);
  assert.equal(sv(blind(dodger), side(profile(), silenced, '22:'), 'A', 20, 40), 12);
  // Sixth Sense (or a Fireteam of 5): 360° LoF, never out of it.
  const sixth = side(profile({ph: 12, skills: [{id: 67, name: 'Sixth Sense'}]}), combi, 'dodge');
  assert.equal(sv(side(profile(), silenced, '22:'), blind(sixth), 'B', 20), 12);
  assert.equal(sv(side(profile(), combi, '1:'), {...blind(dodger), ftSize: 5}, 'B'), 13);  // +1 Dodge, no -3
  // A Dodge can't evade a Comms Attack: nothing to apply it to.
  assert.equal(derive({active: side(profile({wip: 13}), jammer, '21:'), reactive: blind(dodger), rangeCm: 20}).inputs.burstB, 0);
  // MODs: IMM-A (-6), No LoF (-3) and Silent (-6) cap at -12.
  assert.equal(sv(side(profile(), silenced, '22:'), {...blind(side(profile({ph: 13}), combi, 'dodge')), immA: true}, 'B', 20), 1);
  // The ledger: the -3 is the Dodger's, Silent the attacker's.
  const r = derive({active: side(profile(), silenced, '22:'), reactive: blind(dodger), rangeCm: 20});
  const lines = /** @type {import('../types.js').Section} */ (/** @type {LedgerSide} */ (r.ledger.B).sv).lines;
  assert.deepEqual(lines.find((x) => x.label === 'No LoF'), {value: -3, label: 'No LoF', by: 'B'});
  assert.deepEqual(lines.find((x) => x.label === 'Silent (-6)'), {value: -6, label: 'Silent (-6)', by: 'A'});
});

test('No LoF chip: only on a Dodge it can change', () => {
  const silenced = option([{id: 22, name: 'Silenced Pistol'}]);
  const dodger = side(profile(), combi, 'dodge');
  const shot = side(profile(), combi, '1:');
  assert.equal(noLofHelps(dodger, shot.weapon, true), true);
  assert.equal(noLofHelps(dodger, shot.weapon, false), false);
  assert.equal(noLofHelps(dodger, side(profile(), flamer, '3:').weapon, false), true);
  assert.equal(noLofHelps(dodger, side(profile(), silenced, '22:').weapon, false), true);
  assert.equal(noLofHelps(dodger, side(profile(), combi, 'dodge').weapon, true), false);     // not attacked
  assert.equal(noLofHelps(shot, shot.weapon, true), false);                                    // shooting back
  assert.equal(noLofHelps(side(profile({skills: [{id: 67, name: 'Sixth Sense'}]}), combi, 'dodge'), shot.weapon, true), false);
});
