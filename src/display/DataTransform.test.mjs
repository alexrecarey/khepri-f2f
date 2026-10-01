import test from 'node:test';
import assert from 'node:assert/strict';
import {unopposedSummary} from './DataTransform.js';

const row = (player, wounds, chance) => ({player, wounds, chance, raw_chance: chance * 20, cumulative_chance: 0});

test('unopposedSummary: one side on its own, chances of N or more wounds up to the cap', () => {
  const side = {
    face_to_face: [{player: 'reactive', chance: 0.6}, {player: 'fail', chance: 0.4}, {player: 'active', chance: 0}],
    expected_wounds: [row('fail', 0, 0.4), row('reactive', 0, 0.1), row('reactive', 1, 0.2), row('reactive', 2, 0.15),
      row('reactive', 5, 0.15)],
  };
  const s = unopposedSummary(side, 'reactive', 3);
  assert.equal(s.success, 0.6);
  assert.ok(Math.abs(s.noWounds - 0.5) < 1e-9);
  assert.ok(Math.abs(s.wpo - (0.2 + 0.3 + 0.75)) < 1e-9);
  assert.deepEqual(s.atLeast.map((x) => x.wounds), [1, 2, 3]);
  assert.deepEqual(s.atLeast.map((x) => +x.chance.toFixed(2)), [0.5, 0.3, 0.15]);
  // Never more lines than the wounds it can cause.
  assert.deepEqual(unopposedSummary({...side, expected_wounds: side.expected_wounds.slice(0, 3)}, 'reactive', 3)
    .atLeast.map((x) => x.wounds), [1]);
});
