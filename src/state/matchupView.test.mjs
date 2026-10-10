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

test('side cards: weapon groups, names, faction and the chips that apply', () => {
  const v = matchupView(army, {A: corax, B: chaksa, rangeCm: 40});
  for (const s of ['A', 'B']) {
    const side = v[s];
    assert.ok(side.groups.length > 0);
    // Every weapon and pseudo-weapon (Dodge...) is in exactly one group.
    const keys = side.groups.flatMap((g) => (g.modes ? g.modes.map((w) => w.key) : [g.w.key]));
    assert.deepEqual([...keys].sort(), [...side.weapons, ...side.pseudo].map((w) => w.key).sort());
    assert.equal(side.short, side.resolved.unit.isc.split(',')[0].trim());
    assert.ok(side.faction);
  }
  assert.equal(v.B.surprise, 0);   // Surprise Attack is offered on the active side only
});

test('range bands: each side\'s Range MOD per band; none for a Dodge', () => {
  const v = matchupView(army, {A: corax, B: {...chaksa, weaponKey: 'dodge'}, rangeCm: 40});
  assert.equal(v.bands.length, 7);
  assert.ok(v.bands.some((b) => typeof b.A === 'number'));
  assert.ok(v.bands.every((b) => b.B === undefined));
});
