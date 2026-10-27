// Mimetism against the Multispectral Visor: every level against every MOD, with cover, Marksmanship, Albedo and the cap.
// Run with: yarn test:js
import test from 'node:test';
import assert from 'node:assert/strict';
import {derive, option, profile} from './testFixtures.mjs';
import {army} from '../army/testArmy.mjs';
import {mimetismMod} from './modifiers.js';
import {resolveSelection} from './trooper.js';
import {side, combi, label, minus3, duel, marksman, albedo, msv, at, MSV_VS_MIMETISM, mimetic, visor, shooter} from './testMatchups.mjs';

/** @typedef {import('../types.js').ProfileRow} ProfileRow */
/** @typedef {import('../types.js').Traits} Traits */
/** @typedef {import('../types.js').Trooper} Trooper */

test('mimetism and MSV', () => {
  const mim3 = profile({skills: [{id: 28, name: 'Mimetism', extra: ['-3']}]});
  const mim6 = profile({skills: [{id: 28, name: 'Mimetism', extra: ['-6']}]});
  const msv1 = profile({equip: [{id: 114, name: 'Multispectral Visor L1'}]});
  const msv2 = profile({equip: [{id: 115, name: 'Multispectral Visor L2'}]});
  /**
   * @param {ProfileRow} a
   * @param {ProfileRow} b
   */
  const sv = (a, b) => derive({active: side(a, combi, '1:'), reactive: side(b, combi, '1:'), rangeCm: 40}).inputs.successValueA;
  assert.equal(sv(profile(), mim3), 12);
  assert.equal(sv(profile(), mim6), 9);
  assert.equal(sv(msv1, mim3), 15);
  assert.equal(sv(msv1, mim6), 12);                  // MSV1 cancels 3 of the 6
  assert.equal(sv(msv2, mim3), 15);
  assert.equal(sv(msv2, mim6), 15);
  const msv3 = profile({equip: [{id: 116, name: 'Multispectral Visor L3'}]});
  assert.equal(sv(msv3, mim3), 15);
  assert.equal(sv(msv3, mim6), 15);
});

test('MSV x Mimetism: every combination, active and reactive shooter', () => {
  [0, -3, -6].forEach((mim, j) => {
    for (const level of [0, 1, 2, 3]) {
      const expected = MSV_VS_MIMETISM[level][j];
      const label = `MSV${level} vs Mimetism ${mim}`;
      assert.equal(mimetismMod(/** @type {Traits} */ ({skills: mimetic(mim).skills}), /** @type {Traits} */ ({equip: visor(level).equip})), expected, label);
      // Active shooter: BS 12 +3 range.
      assert.equal(duel(side(visor(level), combi, '1:'), side(mimetic(mim), combi, '1:')).inputs.successValueA, 15 + expected, `${label} (active)`);
      // Reactive shooter in ARO against the mimetic active trooper.
      assert.equal(duel(side(mimetic(mim), combi, '1:'), side(visor(level), combi, '1:')).inputs.successValueB, 15 + expected, `${label} (reactive)`);
    }
  });
});

test('MSV x Mimetism: the visor counts from the loadout too, and Mimetism only on the target', () => {
  // MSV1 on the loadout, not the profile.
  const msvLoadout = option([{id: 1, name: 'Combi Rifle'}], {equip: [msv(1)]});
  assert.equal(duel(side(profile(), msvLoadout, '1:'), side(mimetic(-6), combi, '1:')).inputs.successValueA, 12);
  // The shooter's own Mimetism does nothing for its shot; the visor on the target does nothing either.
  assert.equal(duel(side(mimetic(-6), combi, '1:'), side(visor(3), combi, '1:')).inputs.successValueA, 15);
});

test('MSV x Mimetism with cover, Marksmanship, Albedo, Dodge and the cap', () => {
  /**
   * @param {ProfileRow} shooter
   * @param {ProfileRow} target
   * @param {boolean} [inCover]
   */
  const at15 = (shooter, target, inCover = false) =>
    duel(side(shooter, combi, '1:'), side(target, combi, '1:', inCover)).inputs.successValueA;
  // Cover is separate from Mimetism: MSV doesn't touch it.
  assert.equal(at15(visor(1), mimetic(-6), true), 9);          // -3 Mimetism (left by MSV1), -3 cover
  assert.equal(at15(visor(2), mimetic(-6), true), 12);         // cover only
  // Marksmanship ignores cover but not Mimetism; with MSV2 both go.
  assert.equal(at15(profile({skills: [marksman]}), mimetic(-6), true), 9);
  assert.equal(at15(visor(2, {skills: [marksman]}), mimetic(-6), true), 15);
  // Albedo hits any MSV: the visor that cancels Mimetism pays for it.
  const both = mimetic(-6, {equip: [albedo('-3')]});
  assert.equal(at15(profile(), both), 9);                      // Mimetism -6, no Albedo (no visor)
  assert.equal(at15(visor(1), both), 9);                       // Mimetism -3, Albedo -3
  assert.equal(at15(visor(3), both), 12);                      // Mimetism 0, Albedo -3
  // Mimetism is about attacks: the mimetic trooper's Dodge isn't affected, and
  // a Dodge against a mimetic shooter isn't either.
  assert.equal(duel(side(visor(1), combi, '1:'), side(mimetic(-6), combi, 'dodge')).inputs.successValueB, 12);
  assert.equal(duel(side(mimetic(-6), combi, '1:'), side(visor(0), combi, 'dodge')).inputs.successValueB, 12);
  // Cap: HMG at 0-8" (-3), Mimetism -6, cover -3, BS Attack (-3) = -15 -> -12; MSV1 brings it to -12 anyway.
  const hmg = option([{id: 7, name: 'HMG'}]);
  const target = mimetic(-6, {skills: [minus3]});
  assert.equal(duel(side(visor(0, {bs: 14}), hmg, '7:'), side(target, combi, '1:', true), 20).inputs.successValueA, 2);
  assert.equal(duel(side(visor(1, {bs: 14}), hmg, '7:'), side(target, combi, '1:', true), 20).inputs.successValueA, 2);
  assert.equal(duel(side(visor(2, {bs: 14}), hmg, '7:'), side(target, combi, '1:', true), 20).inputs.successValueA, 5);
});

test('MSV x Mimetism with real units', () => {
  /**
   * @param {number} unitId
   * @param {number} factionId
   * @param {number} groupId
   * @param {number} optionId
   */
  const r = (unitId, factionId, groupId, optionId) =>
    /** @type {Trooper} */ (resolveSelection(army, {unitId, factionId, groupId, profileId: 1, optionId}));
  /** @type {[string, Trooper, number][]} */
  const shooters = [
    ['Chaksa (no visor)', r(1310, 801, 1, 1), 0],
    ['Aleph Team-Ops (MSV1)', r(1936, 701, 2, 1), 1],
    ['Agêma Marksmen (MSV2)', r(602, 701, 1, 1), 2],
    ['Aquila Guard (MSV3)', r(8, 101, 1, 3), 3],
  ];
  /** @type {[string, Trooper, number][]} */
  const targets = [
    ['Chaksa (no Mimetism)', r(1310, 801, 1, 1), 0],
    ["'Gator' Squadron (Mimetism -3)", r(1580, 501, 2, 1), 1],
    ['Arjuna Unit (Mimetism -6)', r(1178, 701, 2, 1), 2],
  ];
  for (const [sName, s, level] of shooters) {
    for (const [tName, t, j] of targets) {
      assert.equal(mimetismMod(t.traits, s.traits), MSV_VS_MIMETISM[level][j], `${sName} vs ${tName}`);
    }
  }
});
