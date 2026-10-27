// Run with: yarn test:js
import test from 'node:test';
import assert from 'node:assert/strict';
import {bsWeapons} from '../army/weapons.js';
import {tEn} from '../i18n/index.js';
import {render} from '../i18n/message.js';
import {defaultWeapon, sortWeapons} from './defaultWeapon.js';
import {MODE_ORDER, modeKey, modeLabels, orderModes} from './weaponModes.js';
import {army} from '../army/testArmy.mjs';

const modesOf = (id) => bsWeapons(/** @type {import('../types.js').OptionRow} */ ({weapons: [{id, name: army.weapons[id][0].name}]}), army.weapons);
const order = (id, role) => orderModes(modesOf(id), role, sortWeapons).map((w) => modeKey(w.mode));

test('every listed weapon has those modes in the army data', () => {
  for (const [id, roles] of Object.entries(MODE_ORDER)) {
    const keys = modesOf(Number(id)).map((w) => modeKey(w.mode)).sort();
    assert.deepEqual([...roles.active].sort(), keys, `${id} active`);
    assert.deepEqual([...roles.reactive].sort(), keys, `${id} reactive`);
  }
});

test('MULTI: higher burst first when active, the anti-materiel mode when reactive', () => {
  assert.deepEqual(order(41, 'active'), ['ap', 'shock', 'am']);    // MULTI Rifle
  assert.deepEqual(order(41, 'reactive'), ['am', 'ap', 'shock']);
  assert.deepEqual(order(36, 'active'), ['am', 'ap', 'shock']);    // MULTI Sniper: all B2, DA first
});

test('Blast before Hit; Feuerbach by burst', () => {
  assert.deepEqual(order(58, 'reactive'), ['blast', 'hit']);       // Missile Launcher
  assert.deepEqual(order(30, 'active'), ['burst', 'explosive']);
  assert.deepEqual(order(30, 'reactive'), ['explosive', 'burst']);
});

test('the default weapon starts on the first mode: Boarding Pistol on its template', () => {
  /** @param {import('../types.js').WeaponEntry | null} w */
  const mode = (w) => modeKey(/** @type {import('../types.js').WeaponEntry} */ (w).mode);
  for (const role of /** @type {import('./defaultWeapon.js').Role[]} */ (['active', 'reactive'])) assert.equal(mode(defaultWeapon(modesOf(212), role)), 'blast');
  assert.equal(mode(defaultWeapon(modesOf(41), 'active')), 'ap');
  assert.equal(mode(defaultWeapon(modesOf(41), 'reactive')), 'am');
});

test('mode buttons read the ammo, except next to a template', () => {
  const labels = (id) => [...modeLabels(modesOf(id)).values()].map((m) => render(tEn, m)).sort();
  assert.deepEqual(labels(36), ['AP', 'DA', 'Shock']);             // MULTI Sniper
  assert.deepEqual(labels(4), ['AP', 'EXP', 'Shock']);             // MULTI HMG: its AM mode is EXP
  assert.deepEqual(labels(30), ['AP+DA', 'EXP']);                  // Feuerbach
  assert.deepEqual(labels(58), ['Blast', 'Hit']);                  // Missile Launcher
  assert.deepEqual(labels(212), ['Blast', 'Hit']);                 // Boarding Pistol
});
