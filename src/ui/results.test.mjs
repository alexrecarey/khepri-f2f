// Run with: yarn test:js
import test from 'node:test';
import assert from 'node:assert/strict';
import {shadeStep} from './results.js';

const steps = (n) => Array.from({length: n}, (_, i) => shadeStep(i, n));

test('wound shades start at step 3 and only reach the light end for five or six states', () => {
  assert.deepEqual(steps(1), [6]); // Shock vs 1 VITA: Dead only
  assert.deepEqual(steps(2), [3, 6]); // Unconscious, Dead
  assert.deepEqual(steps(3), [3, 5, 6]); // 1 wound, Unconscious, Dead
  assert.deepEqual(steps(4), [3, 4, 5, 6]);
  assert.deepEqual(steps(5), [2, 3, 4, 5, 6]);
  assert.deepEqual(steps(6), [1, 2, 3, 4, 5, 6]);
});
