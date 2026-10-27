// Smoke and White Noise between the troopers: who can shoot through, at what MOD, and what a template needs.
// Run with: yarn test:js
import test from 'node:test';
import assert from 'node:assert/strict';
import {buildLedger} from './ledger.js';
import {derive, option, profile} from './testFixtures.mjs';
import {side, combi, label, shoot, flamer, albedo, msv, at, zoneDuel, shooter, dodger, SMOKE, WHITE_NOISE} from './testMatchups.mjs';

/** @typedef {import('../types.js').LedgerSide} LedgerSide */

test('Smoke: without MSV nobody can shoot through it', () => {
  const r = zoneDuel(shooter(), shooter(), SMOKE);
  assert.equal(r.ok, true);
  assert.equal(r.inputs.burstA, 0);
  assert.equal(r.inputs.burstB, 0);
  assert.ok(r.notes.includes("Active: no line of fire through Smoke; its attack can't be declared"), r.notes.join(' | '));
  // The ledger reads the sides and the derivation; the rest is the setup it came from.
  const l = buildLedger(/** @type {Parameters<typeof buildLedger>[0]} */ ({active: shooter(), reactive: shooter(), rangeCm: 40, derived: r, zones: SMOKE}));
  assert.equal(/** @type {LedgerSide} */ (l.A).dice, 'No LoF (Smoke)');
  // A Dodge isn't an attack: the shooter still can't see.
  assert.equal(zoneDuel(shooter(), dodger(), SMOKE).inputs.burstA, 0);
});

test('Smoke: MSV2 / MSV3 see through; the target shoots back at -6, Sixth Sense cancels it', () => {
  const r = zoneDuel(shooter({equip: [msv(2)]}), shooter(), SMOKE);
  assert.equal(r.inputs.successValueA, 15);
  assert.equal(r.inputs.successValueB, 9);
  assert.equal(zoneDuel(shooter({equip: [msv(3)]}), shooter(), SMOKE).inputs.successValueA, 15);
  const sixth = zoneDuel(shooter({equip: [msv(2)]}), shooter({skills: [{id: 67, name: 'Sixth Sense'}]}), SMOKE);
  assert.equal(sixth.inputs.successValueB, 15);
  // The reactive side sees, the active shoots back (Alex: the active trooper can shoot if the reactive shoots it).
  assert.equal(zoneDuel(shooter(), shooter({equip: [msv(2)]}), SMOKE).inputs.successValueA, 9);
});

test('Smoke: MSV1 takes -3 when shot at, -6 (Zero Visibility) when the target Dodges', () => {
  const shot = zoneDuel(shooter({equip: [msv(1)]}), shooter(), SMOKE);
  assert.equal(shot.inputs.successValueA, 12);
  assert.equal(shot.inputs.successValueB, 9);
  assert.equal(zoneDuel(shooter({equip: [msv(1)]}), dodger(), SMOKE).inputs.successValueA, 9);
  // Sixth Sense cancels the Poor Visibility -3, not the Zero Visibility -6.
  const sixth = {equip: [msv(1)], skills: [{id: 67, name: 'Sixth Sense'}]};
  assert.equal(zoneDuel(shooter(sixth), shooter(), SMOKE).inputs.successValueA, 15);
  assert.equal(zoneDuel(shooter(sixth), dodger(), SMOKE).inputs.successValueA, 9);
});

test('Smoke: a Direct Template needs LoF too, and counts as an attack', () => {
  const flamer = side(profile(), option([{id: 3, name: 'Heavy Flamethrower'}]), '3:');
  assert.equal(zoneDuel(flamer, shooter(), SMOKE).inputs.burstA, 0);
  // Templated through smoke by an MSV2 trooper: the shooter fires back at -6.
  const msvFlamer = side(profile({equip: [msv(2)]}), option([{id: 3, name: 'Heavy Flamethrower'}]), '3:');
  assert.equal(zoneDuel(msvFlamer, shooter(), SMOKE).inputs.successValueB, 9);
});

test('White Noise: blocks MSV and Marksmanship, not other troopers', () => {
  assert.equal(zoneDuel(shooter(), shooter(), WHITE_NOISE).inputs.successValueA, 15);
  const r = zoneDuel(shooter({equip: [msv(2)]}), shooter(), WHITE_NOISE);
  assert.equal(r.inputs.successValueA, 9);                     // shot at: -6
  assert.equal(r.inputs.successValueB, 15);
  assert.equal(zoneDuel(shooter({equip: [msv(1)]}), shooter(), WHITE_NOISE).inputs.successValueA, 9);   // MSV1 can't soften it
  assert.equal(zoneDuel(shooter({skills: [{id: 156, name: 'Marksmanship'}]}), dodger(), WHITE_NOISE).inputs.burstA, 0);
  assert.equal(zoneDuel(shooter({equip: [msv(3)]}), dodger(), WHITE_NOISE).inputs.burstA, 0);
  const sixth = zoneDuel(shooter(), shooter({equip: [msv(2)], skills: [{id: 67, name: 'Sixth Sense'}]}), WHITE_NOISE);
  assert.equal(sixth.inputs.successValueB, 15);
});

test('White Noise and Albedo stack; with Smoke and White Noise nobody sees', () => {
  const albedo = {equip: [{id: 183, name: 'Albedo', extra: ['-3']}]};
  // MSV1 shot at by an Albedo trooper through White Noise: 15 - 6 - 3.
  const r = zoneDuel(shooter({equip: [msv(1)]}), shooter(albedo), WHITE_NOISE);
  assert.equal(r.inputs.successValueA, 6);
  const l = buildLedger(/** @type {Parameters<typeof buildLedger>[0]} */ ({active: shooter({equip: [msv(1)]}), reactive: shooter(albedo), rangeCm: 40, derived: r, zones: WHITE_NOISE}));
  assert.deepEqual(/** @type {import('../types.js').Section} */ (/** @type {LedgerSide} */ (l.A).sv).lines.filter((x) => /** @type {number} */ (x.value) < 0).map((x) => x.label), ['Albedo', 'White Noise, Poor Visibility']);
  // Smoke blocks troopers without MSV, White Noise those with it.
  const both = {smoke: true, whiteNoise: true};
  for (const a of [{}, {equip: [msv(1)]}, {equip: [msv(2)]}]) {
    const b = zoneDuel(shooter(a), shooter(), both).inputs;
    assert.deepEqual([b.burstA, b.burstB], [0, 0]);
  }
  // Attacked in CC (no zone between them) through both, MSV1 shoots back at
  // the worse of the two (-6), not their sum: the Smoke line is struck by it.
  const cc = derive({active: side(profile(), combi, '8:'), reactive: shooter({equip: [msv(1)]}), rangeCm: 40, zones: both});
  assert.equal(cc.inputs.successValueB, 12 + 3 - 6);
  const zoneLines = /** @type {import('../types.js').Section} */ (/** @type {import('../types.js').SideLines} */ (cc.lines.B).sv).lines.filter((l) => /Smoke|White Noise/.test(/** @type {string} */ (l.label)));
  assert.deepEqual(zoneLines, [
    {value: -3, label: 'Smoke, Poor Visibility', by: 'B', struck: 'White Noise, Poor Visibility'},
    {value: -6, label: 'White Noise, Poor Visibility', by: 'B'},
  ]);
});
