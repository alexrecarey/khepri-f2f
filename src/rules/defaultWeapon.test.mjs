// The default weapon: what a trooper rolls with until the player picks (rules/defaultWeapon.js), and the weapon list it picks from.
// Run with: yarn test:js
import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeWeaponRow} from '../army/normalize.js';
import {bsWeapons, isBsAttackWeapon, parseWeaponMods} from '../army/weapons.js';
import {defaultWeapon} from './defaultWeapon.js';
import {option} from './testFixtures.mjs';
import {RIFLE_RANGES, W, pick, at} from './testMatchups.mjs';

/** @typedef {import('../types.js').WeaponRow} WeaponRow */
/** @typedef {import('../types.js').WeaponEntry} WeaponEntry */

test('bsWeapons expands modes and drops CC weapons', () => {
  const o = option([{id: 2, name: 'MULTI Rifle'}, {id: 3, name: 'Heavy Flamethrower'}, {id: 8, name: 'CC Weapon'}]);
  const keys = bsWeapons(o, W).map((w) => w.key);
  assert.deepEqual(keys, ['2:AP Mode', '2:Shock Mode', '3:']);
  assert.equal(isBsAttackWeapon(W[8][0]), false);
});

test('defaultWeapon (active) takes the highest burst, loadout +B included', () => {
  assert.equal(pick([{id: 6, name: 'Heavy Pistol'}, {id: 1, name: 'Combi Rifle'}, {id: 7, name: 'HMG'}], 'active'), '7:');
  assert.equal(pick([{id: 1, name: 'Combi Rifle'}, {id: 6, name: 'Heavy Pistol', extra: ['+2B']}], 'active'), '6:');
});

test('defaultWeapon (active) breaks burst ties by Impact Template (Circular), then ammo', () => {
  assert.equal(pick([{id: 11, name: 'Plasma Carbine'}], 'active'), '11:Blast Mode');
  // A Blast Mode that is a Direct Template is not an Impact Template.
  assert.equal(pick([{id: 20, name: 'Boarding Pistol'}, {id: 9, name: 'Missile Launcher'}], 'active'), '9:Hit Mode');
  assert.equal(pick([{id: 1, name: 'Combi Rifle'}, {id: 2, name: 'MULTI Rifle'}], 'active'), '2:AP Mode');
  assert.equal(pick([{id: 2, name: 'MULTI Rifle'}, {id: 4, name: 'Viral Combi Rifle'}], 'active'), '4:');
  assert.equal(pick([{id: 1, name: 'Combi Rifle'}, {id: 10, name: 'T2 Rifle'}], 'active'), '10:');
});

test('defaultWeapon (reactive) prefers +SD, then best range band, then Impact Template, then ammo', () => {
  assert.equal(pick([{id: 7, name: 'HMG'}, {id: 6, name: 'Heavy Pistol', extra: ['+1SD']}], 'reactive'), '6:');
  assert.equal(pick([{id: 6, name: 'Heavy Pistol'}, {id: 1, name: 'Combi Rifle'}], 'reactive'), '1:');
  assert.equal(pick([{id: 1, name: 'Combi Rifle'}, {id: 7, name: 'HMG'}], 'reactive'), '7:');
  assert.equal(pick([{id: 3, name: 'Heavy Flamethrower'}, {id: 1, name: 'Combi Rifle'}], 'reactive'), '1:');
  assert.equal(pick([{id: 12, name: 'Panzerfaust'}, {id: 19, name: 'Light Rocket Launcher'}], 'reactive'), '19:Blast Mode');
  assert.equal(pick([{id: 1, name: 'Combi Rifle'}, {id: 4, name: 'Viral Combi Rifle'}], 'reactive'), '4:');
});

test('defaultWeapon (reactive) ranks range band above ammo, Non-lethal weapons included', () => {
  const flashPulse = normalizeWeaponRow({name: 'Flash Pulse', mode: null, ammo: 'Stun', burst: 1, dmg: 7, saving: 'BTS', saves: '1', props: ['BS Weapon (WIP)', 'State: Stunned', 'Non-lethal'], ranges: [{to: 20, mod: 0}, {to: 60, mod: 3}, {to: 120, mod: -3}, {to: 240, mod: -6}]});
  const o = option([{id: 1, name: 'Combi Rifle'}, {id: 21, name: 'Flash Pulse'}]);
  assert.equal(/** @type {WeaponEntry} */ (defaultWeapon(bsWeapons(o, {...W, 21: [/** @type {WeaponRow} */ (flashPulse)]}), 'reactive')).key, '21:');
  assert.equal(pick([{id: 17, name: 'Flash Pulse', extra: ['+1SD']}, {id: 7, name: 'HMG'}], 'reactive'), '17:');
});

test('defaultWeapon ammo precedence is PLASMA > EXP > DA > Viral > T2 > AP > Shock > N > E/M > Stun', () => {
  /**
   * @param {string} key
   * @param {Partial<Parameters<typeof normalizeWeaponRow>[0]>} over
   * @returns {WeaponEntry}
   */
  const entry = (key, over) => /** @type {WeaponEntry} */ ({key, row: normalizeWeaponRow({burst: 3, saving: 'ARM', saves: '1', ammo: 'N', props: [], ranges: RIFLE_RANGES, ...over}), mods: parseWeaponMods([])});
  const ranked = [
    entry('PLASMA', {saving: 'ARM and BTS', saves: '1 and 1'}), entry('EXP', {ammo: 'AP+Exp'}), entry('DA', {ammo: 'DA'}),
    entry('VIRAL', {props: ['Bioweapon (DA+SHOCK)']}), entry('T2', {ammo: 'T2'}), entry('AP', {ammo: 'AP'}),
    entry('SHOCK', {ammo: 'Shock'}), entry('N', {ammo: null}), entry('E/M', {ammo: 'E/M'}), entry('STUN', {ammo: 'Stun'}),
  ];
  for (const role of /** @type {('active' | 'reactive')[]} */ (['active', 'reactive'])) {
    const left = [...ranked].reverse();
    const picks = [];
    while (left.length > 0) {
      // A non-empty list has a default.
      const w = /** @type {WeaponEntry} */ (defaultWeapon(left, role));
      picks.push(w.key);
      left.splice(left.indexOf(w), 1);
    }
    assert.deepEqual(picks, ranked.map((w) => w.key), role);
  }
  // A loadout "AP" extra counts as AP ammo.
  assert.equal(pick([{id: 6, name: 'Heavy Pistol'}, {id: 1, name: 'Combi Rifle', extra: ['AP']}], 'active'), '1:');
});

test('defaultWeapon keeps menu order on ties', () => {
  assert.equal(pick([{id: 1, name: 'Combi Rifle'}, {id: 13, name: 'K1 Combi Rifle'}], 'reactive'), '1:');
  assert.equal(pick([{id: 13, name: 'K1 Combi Rifle'}, {id: 1, name: 'Combi Rifle'}], 'reactive'), '13:');
  assert.equal(defaultWeapon([], 'active'), null);
});

test('defaultWeapon ranks loadout ammo extras by the ammo they give', () => {
  // Viral and T2 beat the MULTI Rifle's AP Mode at equal burst; N does not.
  const multi = {id: 2, name: 'MULTI Rifle'};
  assert.equal(pick([multi, {id: 1, name: 'Combi Rifle'}], 'active'), '2:AP Mode');
  assert.equal(pick([multi, {id: 1, name: 'Combi Rifle', extra: ['Viral']}], 'active'), '1:');
  assert.equal(pick([multi, {id: 1, name: 'Combi Rifle', extra: ['T2']}], 'active'), '1:');
  // Viral beats T2.
  assert.equal(pick([{id: 10, name: 'T2 Rifle'}, {id: 1, name: 'Combi Rifle', extra: ['Viral']}], 'active'), '1:');
  // Shock beats N at the same range bands.
  const k1 = {id: 13, name: 'K1 Combi Rifle'};
  assert.equal(pick([k1, {id: 1, name: 'Combi Rifle'}], 'reactive'), '13:');
  assert.equal(pick([k1, {id: 1, name: 'Combi Rifle', extra: ['Shock']}], 'reactive'), '1:');
});
