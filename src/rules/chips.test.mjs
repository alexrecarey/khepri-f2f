// A situation chip shows exactly when switching it on changes the pick's MOD:
// the chip (state/matchupView.js) and the roll read the same `...Helps`.
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  hackedHelps, hackedResetMod, hasNoCover, immADodgeMod, immAHelps, surpriseAttackOffered, targetedResetHelps, targetedResetMod,
} from './modifiers.js';
import {berserkHelps, usesBerserk} from './closeCombat.js';
import {profile} from './testFixtures.mjs';
import {combi, flamer, side} from './testMatchups.mjs';

/** @typedef {import('../types.js').ResolvedSide} ResolvedSide */

const shot = side(profile(), combi, '1:');
const PICKS = {
  shot,
  cc: side(profile(), combi, '8:'),
  template: side(profile(), flamer, '3:'),
  dodge: side(profile(), combi, 'dodge'),
  reset: side(profile(), combi, 'reset'),
  zeroPain: {...shot, weapon: {key: 'zeroPain', kind: 'reset', zeroPain: true}},
  none: side(profile(), combi, 'none'),
};
const picks = /** @type {[string, ResolvedSide][]} */ (Object.entries(PICKS));

test('IMM-A, Hacked and Targeted (on a Reset): the chip shows exactly when it changes the roll', () => {
  for (const [name, x] of picks) {
    assert.equal(immAHelps(x), immADodgeMod({...x, immA: true}) !== 0, `IMM-A on ${name}`);
    assert.equal(hackedHelps(x), hackedResetMod({...x, hackedReset: -3}) !== 0, `Hacked on ${name}`);
    assert.equal(targetedResetHelps(x), targetedResetMod({...x, targeted: true}) !== 0, `Targeted on ${name}`);
  }
  // The deterministic cases.
  assert.deepEqual(picks.filter(([, x]) => immAHelps(x)).map(([n]) => n), ['dodge']);
  assert.deepEqual(picks.filter(([, x]) => hackedHelps(x)).map(([n]) => n), ['reset', 'zeroPain']);
  assert.deepEqual(picks.filter(([, x]) => targetedResetHelps(x)).map(([n]) => n), ['reset']);
});

test('Berserk: offered on an active CC Attack by a trooper with the skill, and used only then', () => {
  const berserker = profile({skills: [{id: 24, name: 'Berserk', extra: ['+6']}]});
  const cc = {...side(berserker, combi, '8:'), berserk: true};
  const shooting = {...side(berserker, combi, '1:'), berserk: true};
  for (const [x, active] of /** @type {[ResolvedSide, boolean][]} */ ([[cc, true], [cc, false], [shooting, true], [{...PICKS.cc, berserk: true}, true]])) {
    assert.equal(usesBerserk(x, active), berserkHelps(x, active));
  }
  assert.equal(berserkHelps(cc, true), true);
  assert.equal(berserkHelps(cc, false), false);
});

test('Surprise Attack: offered on the active side only; No Cover: no cover, no chip', () => {
  const surprise = profile({skills: [{id: 191, name: 'Surprise Attack', extra: ['-3']}]});
  assert.equal(surpriseAttackOffered(side(surprise, combi, '1:'), true), -3);
  assert.equal(surpriseAttackOffered(side(surprise, combi, '1:'), false), 0);
  assert.equal(hasNoCover(side(profile({skills: [{id: 264, name: 'No Cover'}]}), combi, '1:')), true);
  assert.equal(hasNoCover(shot), false);
});
