// Run with: yarn test:js
import test from 'node:test';
import assert from 'node:assert/strict';
import {crestForRow, crestOf, crestSlugs} from './crests.js';
import {army} from './testArmy.mjs';

/** @typedef {import('../types.js').UnitRow} UnitRow */
/** @typedef {import('../types.js').ProfileRow} ProfileRow */


test('every unit has a crest slug in CB\'s file-name form', () => {
  assert.ok(army.units.every((u) => /^[a-z0-9-]+$/.test(u.crest ?? '')));
  assert.ok(crestSlugs(army).size > 800);
});

test('a profile with its own crest wins over its unit\'s', () => {
  assert.equal(crestOf(/** @type {UnitRow} */ ({crest: 'unit-1-1'}), /** @type {ProfileRow} */ ({crest: 'unit-2-1'})), 'unit-2-1');
  assert.equal(crestOf(/** @type {UnitRow} */ ({crest: 'unit-1-1'}), /** @type {ProfileRow} */ ({})), 'unit-1-1');
  assert.equal(crestOf(null, null), null);
});

test('a search row finds its profile\'s crest by group and profile', () => {
  // Zondnautica: the unit's crest for group 1, its own for the group 3 profile.
  // The unit is in the data (the test above checks every crest).
  const z = /** @type {import('../types.js').UnitRow} */ (army.units.find((u) => u.crest === 'zondnautica-rapid-offensive-unit-1-1'));
  assert.equal(crestForRow(army, {unitId: z.id, groupId: 1, profileId: 1}), 'zondnautica-rapid-offensive-unit-1-1');
  assert.equal(crestForRow(army, {unitId: z.id, groupId: 3, profileId: 1}), 'zondnautica-rapid-offensive-unit-3-1');
  assert.equal(crestForRow(army, {unitId: -1, groupId: 1, profileId: 1}), null);
});
