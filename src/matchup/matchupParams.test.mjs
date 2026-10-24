// Run with: yarn test:js
import test from 'node:test';
import assert from 'node:assert/strict';
import {decodeMatchup, encodeMatchup} from './matchupParams.js';

/** @typedef {import('../types.js').Selection} Selection */

const selA = /** @type {Selection} */ ({unitId: 42, factionId: 1102, groupId: 1, profileId: null, optionId: 3, weaponKey: '111:Hit Mode',
  inCover: true, firewall: null, targeted: true, hackedReset: 0, immA: false, sapper: false, surpriseAttack: true, upgrade: 2, ball: null, ccAllies: 3, berserk: true});
const selB = /** @type {Selection} */ ({unitId: 7, factionId: 107, groupId: null, profileId: 2, optionId: 1, weaponKey: 'hack:carbonite',
  inCover: false, firewall: -6, targeted: false, hackedReset: -9, immA: true, sapper: true, surpriseAttack: false, upgrade: null, ball: 0, ccAllies: 0, berserk: false});

test('matchup round-trips through URL params', () => {
  const params = encodeMatchup({selA, selB, ftSize: {A: 3, B: 1}, rangeCm: 60});
  assert.equal(params.weaponA, '111:Hit Mode');
  assert.equal(params.coverA, '1');
  assert.equal(params.surpriseA, '1');
  assert.equal(params.surpriseB, undefined);
  assert.equal(params.ftA, '3');
  assert.equal(params.ftB, undefined);
  assert.equal(params.sapperB, '1');
  assert.equal(params.sapperA, undefined);
  assert.equal(params.firewallB, '6');
  assert.equal(params.targetedA, '1');
  assert.equal(params.hackedB, '9');
  assert.equal(params.immaB, '1');
  assert.equal(params.firewallA, undefined);           // the trooper's own Firewall
  assert.equal(decodeMatchup(new URLSearchParams(encodeMatchup({selA: {...selA, firewall: 0}, selB: null})))?.A.firewall, 0);
  assert.equal(params.profileA, undefined);           // unset fields are left out
  const back = decodeMatchup(new URLSearchParams(params));
  assert.ok(back);
  assert.deepEqual(back.A, selA);
  assert.deepEqual(back.B, selB);
  assert.deepEqual(back.ftSize, {A: 3, B: 1});
  assert.equal(back.rangeCm, 60);
});

test('no matchup in params: null; bad values are ignored', () => {
  assert.equal(decodeMatchup(new URLSearchParams('burstA=3&mode=matchup')), null);
  const d = decodeMatchup(new URLSearchParams('unitA=5&factionA=x&ftA=9&range=33'));
  assert.ok(d);
  assert.equal(d.A.unitId, 5);
  assert.equal(d.A.factionId, null);
  assert.equal(d.ftSize.A, 1);
  assert.equal(d.rangeCm, null);
  assert.equal(d.B.unitId, null);
});

test('an empty matchup encodes to nothing', () => {
  assert.deepEqual(encodeMatchup({selA: /** @type {Selection} */ ({unitId: null}), selB: /** @type {Selection} */ ({unitId: null}), ftSize: {A: 1, B: 1}, rangeCm: 40}), {});
});

test('Smoke and White Noise round-trip as smoke=1 / wn=1, off by default', () => {
  const params = encodeMatchup({selA, selB, ftSize: {A: 1, B: 1}, rangeCm: 40, zones: {smoke: true, whiteNoise: false}});
  assert.equal(params.smoke, '1');
  assert.equal(params.wn, undefined);
  assert.deepEqual(decodeMatchup(new URLSearchParams(params))?.zones, {smoke: true, whiteNoise: false});
  assert.deepEqual(decodeMatchup(new URLSearchParams('unitA=5&wn=1'))?.zones, {smoke: false, whiteNoise: true});
  // Nothing picked: no link, zones or not.
  assert.deepEqual(encodeMatchup({selA: /** @type {Selection} */ ({unitId: null}), selB: /** @type {Selection} */ ({unitId: null}), ftSize: {A: 1, B: 1}, rangeCm: 40, zones: /** @type {import('../types.js').Zones} */ ({smoke: true})}), {});
});

test('a split range round-trips as rangeB; left out while both share the range', () => {
  const params = encodeMatchup({selA, selB, ftSize: {A: 1, B: 1}, rangeCm: 80, rangeCmB: 100});
  assert.equal(params.rangeB, '100');
  const back = decodeMatchup(new URLSearchParams(params));
  assert.ok(back);
  assert.equal(back.rangeCm, 80);
  assert.equal(back.rangeCmB, 100);
  assert.equal(encodeMatchup({selA, selB, ftSize: {A: 1, B: 1}, rangeCm: 80, rangeCmB: null}).rangeB, undefined);
  assert.equal(decodeMatchup(new URLSearchParams('unitA=5&range=80'))?.rangeCmB, null);
  // Not a band, or no shared range to split from: ignored.
  assert.equal(decodeMatchup(new URLSearchParams('unitA=5&range=80&rangeB=33'))?.rangeCmB, null);
  assert.equal(decodeMatchup(new URLSearchParams('unitA=5&rangeB=100'))?.rangeCmB, null);
});

test('allies in CC round-trip as alliesA / alliesB, capped at 5', () => {
  const selA = /** @type {Selection} */ ({unitId: 3, ccAllies: 2});
  const enc = encodeMatchup({selA, selB: /** @type {Selection} */ ({unitId: 4}), rangeCm: 20});
  assert.equal(enc.alliesA, '2');
  assert.equal(enc.alliesB, undefined);
  const dec = decodeMatchup(new URLSearchParams({...enc, alliesB: '9'}));
  assert.ok(dec);
  assert.equal(dec.A.ccAllies, 2);
  assert.equal(dec.B.ccAllies, 5);
});
