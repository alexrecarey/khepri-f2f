// Run with: yarn test:js
import test from 'node:test';
import assert from 'node:assert/strict';
import {DEFAULT_PARAMS, PARAM_KEYS} from '../engine/params.js';
import {resultsToCsv} from './savedResults.js';

test('CSV: one row per wounds line, every param, titles quoted when needed', () => {
  const result = (id, title) => ({
    id, title, parameters: DEFAULT_PARAMS,
    expected_wounds: [
      {player: 'active', wounds: 1, raw_chance: 10, cumulative_chance: 0.5, chance: 0.5},
      {player: 'fail', wounds: 0, raw_chance: 10, cumulative_chance: 0.5, chance: 0.5},
    ],
  });
  const lines = resultsToCsv([result(1, undefined), result(2, 'HMG, in cover')]).split('\n');
  assert.equal(lines[0], ['result id', 'title', ...PARAM_KEYS, 'player', 'wounds', 'raw_chance', 'cumulative_chance', 'chance'].join(','));
  assert.equal(lines.length, 5);
  assert.ok(lines[1].startsWith('1,Saved Result 1,3,0,13,'));
  assert.ok(lines[3].startsWith('2,"HMG, in cover",3,'));
  assert.ok(lines[4].endsWith(',fail,0,10,0.5,0.5'));
});
