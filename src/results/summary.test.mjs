// Run with: yarn test:js
import test from 'node:test';
import assert from 'node:assert/strict';
import {shadeStep, summarize} from './summary.js';

const steps = (n) => Array.from({length: n}, (_, i) => shadeStep(i, n));

test('wound shades start at step 3 and only reach the light end for five or six states', () => {
  assert.deepEqual(steps(1), [6]); // Shock vs 1 VITA: Dead only
  assert.deepEqual(steps(2), [3, 6]); // Unconscious, Dead
  assert.deepEqual(steps(3), [3, 5, 6]); // 1 wound, Unconscious, Dead
  assert.deepEqual(steps(4), [3, 4, 5, 6]);
  assert.deepEqual(steps(5), [2, 3, 4, 5, 6]);
  assert.deepEqual(steps(6), [1, 2, 3, 4, 5, 6]);
});

// Heavy Flamethrower (active template, 1 wound on a failed save) vs a Dodge:
// 40% the template hits (30% wounds, 10% saved), 60% the Dodge gets away.
const flamerVsDodge = /** @type {import('../types.js').EngineResult} */ (/** @type {unknown} */ ({
  faceToFace: [{player: 'active', chance: 0.4}],
  expectedWounds: [{player: 'active', wounds: 1, chance: 0.3}, {player: 'active', wounds: 0, chance: 0.7}],
}));

test('a Dodge against a Direct Template is named for face to face, but the wound bar leaves it in nobody wounded', () => {
  const s = /** @type {import('../types.js').Summary} */ (summarize(flamerVsDodge, null, {templateA: true, ammoB: 'DODGE'}));
  assert.equal(s.f2f[1].dodger, 'reactive');
  // The face to face parts: the template hits, the Dodge gets away (its colour), nothing for the Dodger.
  assert.deepEqual(s.f2f.map((p) => [p.side, p.seg, Number(p.chance.toFixed(3))]), [['active', 'seg-a2', 0.4], ['none', 'seg-dodge-reactive', 0.6], ['reactive', 'seg-r3', 0]]);
  assert.equal(Number(s.win.none.toFixed(3)), 0.6);
  // A Dodge causes no wounds: one plain nobody-wounded segment, the Dodge in it.
  assert.equal(s.bar.length, 7);
  assert.deepEqual(s.bar.filter((b) => b.side === 'none').map((b) => Number(b.chance.toFixed(3))), [0.7]);
  assert.equal(summarize(flamerVsDodge, null, {templateB: true, ammoA: 'DODGE'})?.f2f[1].dodger, 'active');
});

test('without a Dodged template there is no Dodger', () => {
  assert.equal(summarize(flamerVsDodge, null, {templateA: true, ammoB: 'N'})?.f2f[1].dodger, null);
  assert.equal(summarize(flamerVsDodge)?.f2f[1].seg, 'seg-none');
  assert.equal(summarize(flamerVsDodge)?.f2f[1].dodger, null);
});
