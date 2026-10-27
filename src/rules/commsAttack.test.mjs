// Comms Attacks: the Jammer, Reset against them, what cover and the zones do not do to them, Isolated.
// Run with: yarn test:js
import test from 'node:test';
import assert from 'node:assert/strict';
import {defaultWeapon} from './defaultWeapon.js';
import {buildLedger} from './ledger.js';
import {derive, profile} from './testFixtures.mjs';
import {rangeModFor} from './ranges.js';
import {trooperWeapons} from './trooper.js';
import {W, side, combi, immune, at, jammer, hacker} from './testMatchups.mjs';

/** @typedef {import('../types.js').WeaponEntry} WeaponEntry */
/** @typedef {import('../types.js').Trooper} Trooper */
/** @typedef {import('../types.js').LedgerSide} LedgerSide */

test('Jammer: a WIP roll within Zone of Control (8"), out of range beyond', () => {
  const x = /** @type {Trooper & {weapon: WeaponEntry}} */ (side(hacker(), jammer, '21:'));
  assert.ok(x.weapon, 'the Jammer is a weapon choice');
  /** @param {number} rangeCm */
  const at = (rangeCm) => derive({active: x, reactive: side(profile(), combi, '1:'), rangeCm}).inputs;
  assert.equal(at(20).successValueA, 13);
  assert.equal(at(20).burstA, 1);
  assert.equal(at(40).successValueA, 0);
  assert.equal(rangeModFor(x.weapon.row, 20), 0);
  assert.equal(rangeModFor(x.weapon.row, 21), null);
  // Not the default: it isolates, it doesn't wound.
  assert.equal(/** @type {WeaponEntry} */ (defaultWeapon(trooperWeapons(jammer, W, x.traits), 'active')).name, 'Combi Rifle');
  assert.equal(/** @type {WeaponEntry} */ (defaultWeapon(trooperWeapons(jammer, W, x.traits), 'reactive')).name, 'Combi Rifle');
});

test('Comms Attack vs Reset: Face to Face, WIP against WIP, no saves for the Reset', () => {
  const r = derive({active: side(hacker(), jammer, '21:'), reactive: side(profile({wip: 14}), combi, 'reset'), rangeCm: 20});
  assert.equal(r.ok, true, r.errors.join('; '));
  assert.equal(r.inputs.successValueB, 14);
  assert.equal(r.inputs.burstB, 1);
  assert.equal(r.inputs.ammoB, 'DODGE');
  assert.equal(r.inputs.successValueA, 13);
  // BS Attack (-3) still goes on the Reset (a Face to Face Roll).
  const bsAtk = hacker({skills: [{id: 201, name: 'BS Attack', extra: ['-3']}]});
  assert.equal(derive({active: side(bsAtk, jammer, '21:'), reactive: side(profile({wip: 14}), combi, 'reset'), rangeCm: 20}).inputs.successValueB, 11);
});

test('a capped Reset says so too: Hacked (-12) and Targeted (-3) (Alex, 2026-10-23)', () => {
  const hacked = {...side(profile({wip: 13}), combi, 'reset'), hackedReset: -12, targeted: true};
  const r = derive({active: side(hacker(), jammer, '21:'), reactive: hacked, rangeCm: 20});
  assert.equal(r.inputs.successValueB, 1);
  assert.ok(r.notes.includes('Reactive: MODs add up to -15, capped at -12'), r.notes.join(' | '));
});

test('Dodge can\'t evade a Comms Attack; Reset evades nothing else', () => {
  const dodging = derive({active: side(hacker(), jammer, '21:'), reactive: side(profile(), combi, 'dodge'), rangeCm: 20});
  assert.equal(dodging.inputs.burstB, 0);
  assert.ok(dodging.notes.some((n) => n.includes('Dodge can\'t evade a Comms Attack')), dodging.notes.join(' | '));
  const resetting = derive({active: side(hacker(), combi, '1:'), reactive: side(profile(), combi, 'reset'), rangeCm: 20});
  assert.equal(resetting.inputs.burstB, 0);
  assert.ok(resetting.notes.some((n) => n.includes('Reset only evades Comms Attacks')), resetting.notes.join(' | '));
  const l = buildLedger(/** @type {Parameters<typeof buildLedger>[0]} */ ({active: side(hacker(), combi, '1:'), reactive: side(profile(), combi, 'reset'), rangeCm: 20, derived: resetting}));
  assert.deepEqual([/** @type {LedgerSide} */ (l.B).kind, /** @type {LedgerSide} */ (l.B).dice], ['none', 'Reset: not rolled']);
  // Shooting back at the Jammer is still a Face to Face Roll.
  assert.equal(derive({active: side(hacker(), jammer, '21:'), reactive: side(profile(), combi, '1:'), rangeCm: 20}).inputs.burstB, 1);
});

test('Comms Attack: no cover, Nanoscreen or Mimetism; Firewall takes their place', () => {
  const hidden = profile({bts: 3, skills: [{id: 28, name: 'Mimetism', extra: ['-6']}], equip: [{id: 108, name: 'Nanoscreen'}]});
  const r = derive({active: side(hacker(), jammer, '21:'), reactive: side(hidden, combi, '1:', true), rangeCm: 20});
  assert.equal(r.inputs.successValueA, 13);
  assert.equal(r.inputs.armB, 3);
  const walled = profile({bts: 3, equip: [{id: 169, name: 'TinBot: Firewall', extra: ['-6']}]});
  const f = derive({active: side(hacker(), jammer, '21:'), reactive: side(walled, combi, '1:', true), rangeCm: 20});
  assert.equal(f.inputs.successValueA, 7);
  assert.equal(f.inputs.armB, 6);
  // A Hacking Device's upgrade counts too; against a shot, Firewall does nothing.
  const device = profile({equip: [{id: 100, name: 'Hacking Device', extra: ['UPGRADE: Firewall (-3)']}]});
  assert.equal(derive({active: side(hacker(), jammer, '21:'), reactive: side(device, combi, '1:'), rangeCm: 20}).inputs.successValueA, 10);
  assert.equal(derive({active: side(hacker(), combi, '1:'), reactive: side(device, combi, '1:'), rangeCm: 20}).inputs.successValueA, 15);
});

test('Comms Attack: needs no LoF, so Smoke and White Noise don\'t stop it', () => {
  const r = derive({active: side(hacker(), jammer, '21:'), reactive: side(profile(), combi, 'reset'), rangeCm: 20, zones: {smoke: true, whiteNoise: true}});
  assert.equal(r.inputs.burstA, 1);
  assert.equal(r.inputs.successValueA, 13);
});

test('Jammer: a failed save is Isolated; only Immunity (Isolated) stops it, not (BTS) or (Critical)', () => {
  const r = derive({active: side(hacker(), jammer, '21:'), reactive: side(profile(), combi, '1:'), rangeCm: 20});
  assert.ok(r.notes.some((n) => n.includes('Isolated, not wounded')), r.notes.join(' | '));
  assert.ok(!r.warnings.some((w) => w.includes('non-lethal')), r.warnings.join(' | '));
  const immune = profile({skills: [{id: 162, name: 'Immunity', extra: ['Isolated']}]});
  const i = derive({active: side(hacker(), jammer, '21:'), reactive: side(immune, combi, '1:'), rangeCm: 20});
  assert.equal(i.inputs.ammoA, 'NONE');
  assert.ok(i.warnings.some((w) => w.includes('Immunity (Isolated)')), i.warnings.join(' | '));
  // Warhorse makes its user immune to Isolated, so to the Jammer (Alex, 2026-10-20).
  const horse = derive({active: side(hacker(), jammer, '21:'), reactive: side(profile({skills: [{id: 267, name: 'Warhorse'}]}), combi, '1:'), rangeCm: 20});
  assert.equal(horse.inputs.ammoA, 'NONE');
  assert.ok(horse.warnings.some((w) => w.includes('no effect on a target with Warhorse')), horse.warnings.join(' | '));
  // Against a Comms Attack no other Immunity works (Alex, 2026-10-20).
  const tough = profile({bts: 3, skills: [{id: 162, name: 'Immunity', extra: ['BTS', 'Critical', 'Enhanced']}]});
  const t = derive({active: side(hacker(), jammer, '21:'), reactive: side(tough, combi, '1:'), rangeCm: 20});
  assert.equal(t.inputs.ammoA, 'N');
  assert.equal(t.inputs.critImmuneB, false);
  assert.equal(t.inputs.armB, 3);
  assert.ok(!t.warnings.some((w) => w.includes('Immunity')), t.warnings.join(' | '));
  // A shot still meets them.
  assert.equal(derive({active: side(hacker(), combi, '1:'), reactive: side(tough, combi, '1:'), rangeCm: 20}).inputs.critImmuneB, true);
});
