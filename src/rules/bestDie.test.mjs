// The best-die breakdown must say what the engine says: for every reference
// input with a Face to Face Roll, the same win / nobody / lose chances.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {CRIT, MISS, bestOf, breakdownWins, faceToFaceBreakdown, readRoll} from './bestDie.js';

const golden = JSON.parse(readFileSync(new URL('../engine/engine.golden.json', import.meta.url), 'utf8'));

test('a die reads as f2f.py reads it: the SV is a Critical, over 20 shifts every roll', () => {
  assert.equal(readRoll(10, 10), CRIT);
  assert.equal(readRoll(9, 10), 9);
  assert.equal(readRoll(11, 10), MISS);
  assert.equal(readRoll(11, 28), 19);
  assert.equal(readRoll(12, 28), CRIT);
  assert.equal(readRoll(1, 0), MISS);
});

test('the best of 3 dice at SV 28 is a Critical 1 - (11/20)^3 of the time', () => {
  assert.ok(Math.abs(bestOf(28, 3).get(CRIT) - (1 - (11 / 20) ** 3)) < 1e-12);
});

test('Face to Face chances match the engine on every reference input', () => {
  let checked = 0;
  for (const [i, {input, outcomes}] of golden.entries()) {
    const b = faceToFaceBreakdown(input);
    if (!b) continue;
    const engine = {active: 0, reactive: 0, none: 0};
    for (const o of outcomes) engine[o.player === 'fail' ? 'none' : o.player] += o.chance;
    const got = breakdownWins(b);
    for (const k of ['active', 'reactive', 'none']) assert.ok(Math.abs(got[k] - engine[k]) < 1e-9, `case ${i} ${k}: ${got[k]} vs ${engine[k]}`);
    checked++;
  }
  assert.ok(checked > 50, `only ${checked} cases checked`);
});

test('Mushashi (SV 28, 3 dice) vs a dodging Crabbot (SV 10): 95% / 4.17% / 0.83%', () => {
  const b = faceToFaceBreakdown({successValueA: 28, burstA: 2, bonusBurstA: 1, successValueB: 10, burstB: 1, bonusBurstB: 0});
  const w = breakdownWins(b);
  assert.ok(Math.abs(w.reactive - (1 / 20) * (11 / 20) ** 3) < 1e-12);
  // Nobody: both Critical, or a 9 against a best die of 9 (all three roll a 1).
  assert.ok(Math.abs(w.none - ((1 / 20) * (1 - (11 / 20) ** 3) + (1 / 20) ** 4)) < 1e-12);
  // Only its Critical can win for the Crabbot.
  assert.deepEqual(b.reactive.best.filter((x) => x.wins > 0).map((x) => x.reading), [CRIT]);
  // Columns: a miss, 1-19, a Critical.
  assert.equal(b.readings.length, 21);
});

test('no breakdown without a Face to Face Roll', () => {
  const p = {successValueA: 13, burstA: 3, bonusBurstA: 0, successValueB: 12, burstB: 1, bonusBurstB: 0};
  assert.equal(faceToFaceBreakdown({...p, burstB: 0}), null);
  assert.equal(faceToFaceBreakdown({...p, templateA: true}), null);
  assert.equal(faceToFaceBreakdown({...p, fixedFaceToFace: true}), null);
});
