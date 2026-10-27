// Cover, Limited Cover, No Cover, Nanoscreen, Marksmanship and Albedo: the -3 to the attacker and the +3 to the saves, and what cancels which.
// Run with: yarn test:js
import test from 'node:test';
import assert from 'node:assert/strict';
import {derive, option, profile} from './testFixtures.mjs';
import {side, combi, flamer, marksman, limitedCover, noCover, nanoscreen, albedo, msv, at, visor} from './testMatchups.mjs';

/** @typedef {import('../types.js').ProfileRow} ProfileRow */

test('templates ignore the +3 ARM/BTS from cover but still eat the -3 BS MOD', () => {
  const plasma = option([{id: 11, name: 'Plasma Carbine'}]);
  const target = profile({arm: 4, bts: 6});
  const hit = derive({active: side(profile(), plasma, '11:Hit Mode'), reactive: side(target, combi, '1:', true), rangeCm: 40});
  const blast = derive({active: side(profile(), plasma, '11:Blast Mode'), reactive: side(target, combi, '1:', true), rangeCm: 40});
  assert.equal(hit.inputs.armB, 7);
  assert.equal(hit.inputs.btsB, 9);
  assert.equal(blast.inputs.armB, 4);
  assert.equal(blast.inputs.btsB, 6);
  assert.equal(blast.inputs.successValueA, hit.inputs.successValueA);   // cover -3 still applies
  const flamer = derive({active: side(profile(), option([{id: 3, name: 'Heavy Flamethrower'}]), '3:'), reactive: side(target, combi, '1:', true), rangeCm: 20});
  assert.equal(flamer.inputs.armB, 4);
});

test('No Cover units get nothing from "in cover"', () => {
  const tag = profile({arm: 8, bts: 6, skills: [{id: 264, name: 'No Cover'}]});
  const r = derive({active: side(profile(), combi, '1:'), reactive: side(tag, combi, '1:', true), rangeCm: 40});
  assert.equal(r.inputs.successValueA, 15);   // no -3 for cover
  assert.equal(r.inputs.armB, 8);
  assert.equal(r.inputs.btsB, 6);
  const normal = derive({active: side(profile(), combi, '1:'), reactive: side(profile({arm: 8}), combi, '1:', true), rangeCm: 40});
  assert.equal(normal.inputs.successValueA, 12);
  assert.equal(normal.inputs.armB, 11);
});

test('Albedo penalises MSV and Marksmanship attackers only', () => {
  const albedo6 = profile({equip: [{id: 183, name: 'Albedo', extra: ['-6']}]});
  const plain = profile();
  const msv1 = profile({equip: [{id: 114, name: 'Multispectral Visor L1'}]});
  const msv2 = profile({equip: [{id: 115, name: 'Multispectral Visor L2'}]});
  const marksman = profile({skills: [{id: 156, name: 'Marksmanship'}]});
  /**
   * @param {ProfileRow} a
   * @param {ProfileRow} b
   */
  const sv = (a, b) => derive({active: side(a, combi, '1:'), reactive: side(b, combi, '1:'), rangeCm: 40});
  assert.equal(sv(plain, albedo6).inputs.successValueA, 15);          // no visor, no effect
  assert.equal(sv(msv1, albedo6).inputs.successValueA, 9);            // 12 + 3 - 6
  assert.equal(sv(marksman, albedo6).inputs.successValueA, 9);
  const mimAlbedo = profile({skills: [{id: 28, name: 'Mimetism', extra: ['-3']}], equip: [{id: 183, name: 'Albedo', extra: ['-3']}]});
  assert.equal(sv(msv2, mimAlbedo).inputs.successValueA, 12);        // mimetism cancelled, albedo -3
  assert.equal(sv(plain, mimAlbedo).inputs.successValueA, 12);       // mimetism -3, no albedo
});

test('Nanoscreen works like cover, also against templates, and does not stack with cover', () => {
  const nano = profile({arm: 4, bts: 6, equip: [{id: 108, name: 'Nanoscreen'}]});
  const open = derive({active: side(profile(), combi, '1:'), reactive: side(nano, combi, '1:'), rangeCm: 40});
  assert.equal(open.inputs.successValueA, 12);   // 12 + 3 range - 3 nanoscreen
  assert.equal(open.inputs.armB, 7);
  assert.equal(open.inputs.btsB, 9);
  const covered = derive({active: side(profile(), combi, '1:'), reactive: side(nano, combi, '1:', true), rangeCm: 40});
  assert.equal(covered.inputs.successValueA, 12);
  assert.equal(covered.inputs.armB, 7);
  const plasma = option([{id: 11, name: 'Plasma Carbine'}]);
  const blast = derive({active: side(profile(), plasma, '11:Blast Mode'), reactive: side(nano, combi, '1:', true), rangeCm: 40});
  assert.equal(blast.inputs.armB, 7);            // cover ignored by the template, nanoscreen still applies
  assert.equal(blast.inputs.btsB, 9);
  const noCoverNano = profile({arm: 2, skills: [{id: 264, name: 'No Cover'}], equip: [{id: 108, name: 'Nanoscreen'}]});
  const r = derive({active: side(profile(), combi, '1:'), reactive: side(noCoverNano, combi, '1:', true), rangeCm: 40});
  assert.equal(r.inputs.successValueA, 12);
  assert.equal(r.inputs.armB, 5);
});

test('cover: -3 BS to the attacker, +3 to the saves', () => {
  assert.deepEqual(at(profile(), profile(), false), [15, 2]);
  assert.deepEqual(at(profile(), profile(), true), [12, 5]);
});

test('Limited Cover: +3 to the saves, but no -3 to the attacker', () => {
  assert.deepEqual(at(profile(), profile({skills: [limitedCover]}), true), [15, 5]);
  assert.deepEqual(at(profile(), profile({skills: [limitedCover]}), false), [15, 2]);
});

test('No Cover: neither; Nanoscreen still works', () => {
  assert.deepEqual(at(profile(), profile({skills: [noCover]}), true), [15, 2]);
  assert.deepEqual(at(profile(), profile({skills: [noCover], equip: [nanoscreen]}), true), [12, 5]);
});

test('Nanoscreen: like cover, and not on top of it', () => {
  assert.deepEqual(at(profile(), profile({equip: [nanoscreen]})), [12, 5]);
  assert.deepEqual(at(profile(), profile({equip: [nanoscreen]}), true), [12, 5]);
});

test('Marksmanship ignores the -3 from cover and Nanoscreen, not the +3 to saves', () => {
  const m = profile({skills: [marksman]});
  assert.deepEqual(at(m, profile(), true), [15, 5]);
  assert.deepEqual(at(m, profile({equip: [nanoscreen]})), [15, 5]);
  assert.deepEqual(at(m, profile({skills: [{id: 28, name: 'Mimetism', extra: ['-3']}]})), [12, 2]);   // not Mimetism
});

test('Albedo (-X) hits MSV L1/L2/L3 and Marksmanship attackers; Marksmanship still cancels cover', () => {
  for (const level of [1, 2, 3]) assert.deepEqual(at(profile({equip: [msv(level)]}), profile({equip: [albedo('-6')]})), [9, 2], `MSV${level}`);
  assert.deepEqual(at(profile(), profile({equip: [albedo('-6')]})), [15, 2]);
  assert.deepEqual(at(profile({skills: [marksman]}), profile({equip: [albedo('-3')]}), true), [12, 5]);   // Albedo, no cover
});
