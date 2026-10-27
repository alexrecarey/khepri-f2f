// Saving Rolls: AP and halving, the ammunition the calculator rolls, BTS weapons, Shock.
// Run with: yarn test:js
import test from 'node:test';
import assert from 'node:assert/strict';
import {bsWeapons} from '../army/weapons.js';
import {derive, option, profile, weaponTable} from './testFixtures.mjs';
import {RIFLE_RANGES, W, side, combi, immune, at, shooter} from './testMatchups.mjs';

/** @typedef {import('../types.js').ProfileRow} ProfileRow */
/** @typedef {import('../types.js').Trooper} Trooper */

test('AP halves ARM (rounding up) unless immune; cover added after', () => {
  const multi = option([{id: 2, name: 'MULTI Rifle'}]);
  /**
   * @param {ProfileRow} target
   * @param {boolean} [inCover]
   */
  const arm = (target, inCover = false) =>
    derive({active: side(profile(), multi, '2:AP Mode'), reactive: side(target, combi, '1:', inCover), rangeCm: 40}).inputs.armB;
  assert.equal(arm(profile({arm: 5})), 3);
  assert.equal(arm(profile({arm: 5}), true), 6);
  assert.equal(arm(profile({arm: 5, skills: [{id: 162, name: 'Immunity', extra: ['AP']}]})), 5);
});

test('ammo mapping from saves / saving', () => {
  /**
   * @param {number} id
   * @param {string} key
   */
  const ammo = (id, key) => derive({active: side(profile(), option([{id, name: 'x'}]), key), reactive: null, rangeCm: 40}).inputs.ammoA;
  assert.equal(ammo(4, '4:'), 'DA');
  assert.equal(ammo(9, '9:Hit Mode'), 'EXP');
  assert.equal(ammo(5, '5:Hit Mode'), 'PLASMA');
  assert.equal(ammo(10, '10:'), 'T2');
  assert.equal(ammo(6, '6:'), 'N');
});

test('BTS weapons put the target BTS into the ARM input', () => {
  const viral = option([{id: 4, name: 'Viral Combi Rifle'}]);
  const r = derive({active: side(profile(), viral, '4:'), reactive: side(profile({arm: 5, bts: 9}), combi, '1:'), rangeCm: 40});
  assert.equal(r.inputs.armB, 9);
});

test('Shock takes effect on VITA 1 targets only, unless immune', () => {
  const W2 = {...W, ...weaponTable({12: [{name: 'Uragan MRL', mode: 'Hit Mode', ammo: 'AP+Shock', burst: 3, dmg: 6, saving: 'ARM/2', saves: '1', props: [], ranges: RIFLE_RANGES}]})};
  /**
   * @param {number} id
   * @param {string} key
   * @returns {Trooper}
   */
  const shooter = (id, key) => {
    const o = option([{id, name: 'x'}]);
    return /** @type {Trooper} */ ({...side(profile(), o, null), weapon: bsWeapons(o, W2).find((w) => w.key === key)});
  };
  /** @param {string} extra */
  const immunity = (extra) => ({skills: [{id: 162, name: 'Immunity', extra: [extra]}]});
  /**
   * @param {number} id
   * @param {string} key
   * @param {Partial<ProfileRow>} target
   */
  const vs = (id, key, target) =>
    derive({active: shooter(id, key), reactive: side(profile({arm: 5, bts: 6, ...target}), combi, '1:'), rangeCm: 40});

  // Shock, AP+Shock, Bioweapon (DA+SHOCK)
  for (const [id, key] of /** @type {[number, string][]} */ ([[6, '6:'], [12, '12:Hit Mode'], [4, '4:']])) {
    const plain = vs(id, key, {});
    assert.equal(plain.inputs.shockA, true, key);
    assert.ok(plain.notes.some((n) => n.startsWith('Active: Shock against VITA 1')), key);
    assert.equal(vs(id, key, {w: 2}).inputs.shockA, false, key);
    assert.equal(vs(id, key, {str: true}).inputs.shockA, false, key);
    assert.equal(vs(id, key, immunity('Enhanced')).inputs.shockA, false, key);

    // Immunity only takes the Shock away: AP still halves, Viral is still DA.
    const immune = vs(id, key, immunity('Shock'));
    assert.deepEqual(immune.warnings, [], key);
    assert.deepEqual(immune.notes, [], key);
    assert.deepEqual(immune.inputs, {...plain.inputs, shockA: false}, key);
  }
  assert.equal(vs(12, '12:Hit Mode', {}).inputs.armB, 3);
  assert.equal(vs(4, '4:', {}).inputs.ammoA, 'DA');

  // Other ammunition, and the reactive side.
  assert.equal(derive({active: side(profile(), combi, '1:'), reactive: side(profile(), combi, '1:'), rangeCm: 40}).inputs.shockA, false);
  const pistol = option([{id: 6, name: 'Heavy Pistol'}]);
  /** @param {Partial<ProfileRow>} target */
  const aro = (target) => derive({active: side(profile(target), combi, '1:'), reactive: side(profile(), pistol, '6:'), rangeCm: 20});
  assert.equal(aro({}).inputs.shockB, true);
  assert.equal(aro({}).inputs.shockA, false);
  assert.equal(aro(immunity('Shock')).inputs.shockB, false);

  // Immunity (ARM) / (BTS) treat the hit as N on their own save only.
  assert.equal(vs(6, '6:', immunity('ARM')).inputs.shockA, false);
  assert.equal(vs(12, '12:Hit Mode', immunity('ARM')).inputs.shockA, false);
  assert.equal(vs(4, '4:', immunity('ARM')).inputs.shockA, true);
  assert.equal(vs(4, '4:', immunity('BTS')).inputs.shockA, false);
  assert.equal(vs(6, '6:', immunity('BTS')).inputs.shockA, true);
  // Vulnerability (Viral) cancels the Immunity, Shock included.
  const chaksa = {skills: [{id: 162, name: 'Immunity', extra: ['BTS']}, {id: 220, name: 'Vulnerability', extra: ['Viral']}]};
  assert.equal(vs(4, '4:', chaksa).inputs.shockA, true);
});

test('Shock is cleared when the side stops shooting', () => {
  const pistol = option([{id: 6, name: 'Heavy Pistol'}]);
  const armed = option([{id: 6, name: 'Heavy Pistol'}, {id: 3, name: 'Heavy Flamethrower'}]);
  const dodgeA = derive({active: side(profile(), pistol, 'dodge'), reactive: side(profile(), combi, '1:'), rangeCm: 20});
  assert.equal(dodgeA.inputs.shockA, false);
  for (const key of ['dodge', 'none']) {
    const r = derive({active: side(profile(), combi, '1:'), reactive: side(profile(), pistol, key), rangeCm: 20});
    assert.equal(r.inputs.shockB, false, key);
  }
  // Shooting back at a template keeps the weapon's Shock.
  const back = derive({active: side(profile(), armed, '3:'), reactive: side(profile(), pistol, '6:'), rangeCm: 20});
  assert.equal(back.inputs.templateA, true);
  assert.equal(back.inputs.shockB, true);
});
