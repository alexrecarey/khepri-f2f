// Run with: yarn test:js
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {selectionFromHit} from './actions.js';
import {effectiveWeaponKey} from './matchupView.js';

const army = JSON.parse(readFileSync(new URL('../army/army.json', import.meta.url), 'utf8'));
// Fusiliers (PanOceania) with a Combi Rifle.
const hit = {unitId: 1, armyFactionId: 101, groupId: 1, profileId: 1, optionId: 1};

test('a pick stores the weapon the query matched, never a derived default', () => {
  assert.equal(selectionFromHit(army, hit).weaponKey, null);
  assert.equal(selectionFromHit(null, hit).weaponKey, null);   // army not loaded yet
  const matched = selectionFromHit(army, {...hit, weaponId: 33});
  assert.match(matched.weaponKey, /^33:/);
});

test('the default follows the side, so it changes when the trooper swaps sides', () => {
  const sel = selectionFromHit(army, hit);
  assert.ok(effectiveWeaponKey(army, sel, 'A'));
  assert.ok(effectiveWeaponKey(army, sel, 'B'));
  // Nothing pinned: a swap re-derives the default for the new role.
  assert.equal(sel.weaponKey, null);
});
