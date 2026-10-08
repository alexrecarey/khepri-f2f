// Run with: yarn test:js
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {pickTrooper} from './actions.js';
import {matchupView} from './matchupView.js';
import {reduce} from './reduce.js';
import {EMPTY_SIDE, initialState} from './schema.js';

const army = JSON.parse(readFileSync(new URL('../army/army.json', import.meta.url), 'utf8'));
// Share-link ids: Corax-1 (Viral) and Chaksa.
const corax = {...EMPTY_SIDE, unitId: 1934, factionId: 603, groupId: 1, optionId: 4};
const chaksa = {...EMPTY_SIDE, unitId: 1310, factionId: 801, groupId: 1, optionId: 1};

test('no weapon picked: each side rolls its default weapon, and the matchup is complete', () => {
  const v = matchupView(army, {A: corax, B: chaksa, rangeCm: 40});
  assert.ok(v.A.sel.weaponKey);
  assert.ok(v.B.sel.weaponKey);
  assert.ok(v.complete);
  assert.ok(v.params.burstA >= 1);
  assert.match(v.ledger.ledger.A.dice, /^B\d/);
  // The default is derived, never written back into the document.
  assert.equal(corax.weaponKey, null);
});

test('without the army data the view is empty but keeps the selections', () => {
  const v = matchupView(null, {A: corax, B: chaksa, rangeCm: 40});
  assert.equal(v.ready, false);
  assert.equal(v.complete, false);
  assert.ok(v.hasSelection);
});

test('pickTrooper preselects the weapon the query matched', () => {
  const view = matchupView(army, {A: corax, B: chaksa, rangeCm: 40});
  const other = view.A.weapons.find((w) => w.key !== view.A.sel.weaponKey);
  const hit = {unitId: 1934, armyFactionId: 603, groupId: 1, profileId: null, optionId: 4, weaponId: other.id};
  const s = reduce(initialState(), pickTrooper(army, 'A', hit));
  assert.equal(army.weapons[other.id] !== undefined, true);
  assert.equal(matchupView(army, s.matchup).A.resolved.weapon.id, other.id);
});
