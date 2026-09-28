// Run with: yarn test:units
import test from 'node:test';
import assert from 'node:assert/strict';
import {decodeMatchup, encodeMatchup} from './matchupParams.js';

const selA = {unitId: 42, factionId: 1102, groupId: 1, profileId: null, optionId: 3, weaponKey: '111:Hit Mode',
  inCover: true, upgrade: 2, ball: null};
const selB = {unitId: 7, factionId: 107, groupId: null, profileId: 2, optionId: 1, weaponKey: 'dodge',
  inCover: false, upgrade: null, ball: 0};

test('matchup round-trips through URL params', () => {
  const params = encodeMatchup({selA, selB, ftSize: {A: 3, B: 1}, rangeCm: 60});
  assert.equal(params.weaponA, '111:Hit Mode');
  assert.equal(params.coverA, '1');
  assert.equal(params.ftA, '3');
  assert.equal(params.ftB, undefined);
  assert.equal(params.profileA, undefined);           // unset fields are left out
  const back = decodeMatchup(new URLSearchParams(params));
  assert.deepEqual(back.A, selA);
  assert.deepEqual(back.B, selB);
  assert.deepEqual(back.ftSize, {A: 3, B: 1});
  assert.equal(back.rangeCm, 60);
});

test('no matchup in params: null; bad values are ignored', () => {
  assert.equal(decodeMatchup(new URLSearchParams('burstA=3&mode=matchup')), null);
  const d = decodeMatchup(new URLSearchParams('unitA=5&factionA=x&ftA=9&range=33'));
  assert.equal(d.A.unitId, 5);
  assert.equal(d.A.factionId, null);
  assert.equal(d.ftSize.A, 1);
  assert.equal(d.rangeCm, null);
  assert.equal(d.B.unitId, null);
});

test('an empty matchup encodes to nothing', () => {
  assert.deepEqual(encodeMatchup({selA: {unitId: null}, selB: {unitId: null}, ftSize: {A: 1, B: 1}, rangeCm: 40}), {});
});
