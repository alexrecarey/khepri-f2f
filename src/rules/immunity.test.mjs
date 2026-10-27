// Immunity (ARM) / (BTS) / (Enhanced) / (AP) / (Continuous Damage), Vulnerability, and the Immunities to States the calculator does not model.
// Run with: yarn test:js
import test from 'node:test';
import assert from 'node:assert/strict';
import {deriveInputs as deriveRaw} from './matchup.js';
import {derive, option, profile} from './testFixtures.mjs';
import {side, combi, DIRECT_TEMPLATE_NOTE, immune, shotAt, flamer, duel} from './testMatchups.mjs';

/** @typedef {import('../types.js').ProfileRow} ProfileRow */

test('Immunity (ARM): ARM-save ammo is treated as N', () => {
  const dog = immune('ARM');
  // Wiki example 1: one Saving Roll from a Missile Launcher instead of three.
  assert.equal(shotAt(dog, 9, '9:Hit Mode').inputs.ammoA, 'N');
  assert.equal(shotAt(profile({arm: 5}), 9, '9:Hit Mode').inputs.ammoA, 'EXP');
  // T2: one Wound per failed save.
  assert.equal(shotAt(dog, 10, '10:').inputs.ammoA, 'N');
  // AP+EXP: one save, ARM not halved.
  const pf = shotAt(dog, 12, '12:').inputs;
  assert.equal(pf.ammoA, 'N');
  assert.equal(pf.armB, 5);
  assert.equal(shotAt(profile({arm: 5}), 12, '12:').inputs.armB, 3);
  // AP from a loadout extra.
  assert.equal(shotAt(dog, 1, '1:', {extra: ['AP']}).inputs.armB, 5);
  assert.equal(shotAt(profile({arm: 5}), 1, '1:', {extra: ['AP']}).inputs.armB, 3);
  // The weapon's own PS and burst are untouched.
  assert.equal(pf.damageA, 6);
  assert.equal(shotAt(dog, 14, '14:').inputs.burstA, 2);
});

test('Immunity (ARM): ARM=0 and Continuous Damage are ignored', () => {
  const dog = immune('ARM');
  // Wiki example 2: ARM=0 does not reduce ARM.
  assert.equal(shotAt(dog, 13, '13:').inputs.armB, 5);
  assert.equal(shotAt(profile({arm: 5}), 13, '13:').inputs.armB, 0);
  const vulkan = shotAt(dog, 14, '14:').inputs;
  assert.equal(vulkan.contA, false);
  assert.equal(vulkan.ammoA, 'N');
  assert.equal(vulkan.armB, 5);
  assert.equal(shotAt(profile({arm: 5}), 14, '14:').inputs.contA, true);
  // Continuous Damage from a loadout extra.
  assert.equal(shotAt(dog, 7, '7:', {extra: ['Continuous Damage']}).inputs.contA, false);
  assert.equal(shotAt(profile(), 7, '7:', {extra: ['Continuous Damage']}).inputs.contA, true);
  // Templates too.
  const flamer = derive({active: side(profile(), option([{id: 3, name: 'Heavy Flamethrower'}]), '3:'), reactive: side(dog, combi, 'dodge'), rangeCm: 20}).inputs;
  assert.equal(flamer.contA, false);
  assert.equal(flamer.templateA, true);
  assert.equal(flamer.ammoB, 'DODGE');
});

test('Immunity (ARM): cover and the Critical save still apply', () => {
  const dog = immune('ARM');
  const r = shotAt(dog, 12, '12:', {inCover: true}).inputs;
  assert.equal(r.armB, 8);                       // 5, not halved, + 3 cover
  assert.equal(r.critImmuneB, false);
  const both = profile({arm: 5, skills: [{id: 162, name: 'Immunity', extra: ['ARM']}, {id: 162, name: 'Immunity', extra: ['Critical']}]});
  assert.equal(shotAt(both, 12, '12:').inputs.critImmuneB, true);
});

test('Immunity (ARM) does nothing against BTS saves; Plasma still rolls ARM and BTS', () => {
  const dog = immune('ARM', {bts: 6});
  const viral = shotAt(dog, 4, '4:');
  assert.equal(viral.inputs.ammoA, 'DA');
  assert.equal(viral.inputs.armB, 6);
  assert.deepEqual(viral.notes, ['Active: Shock against VITA 1; a failed save is Dead (no Unconscious, NWI or Dogged)']);
  // Before rendering, the note is a descriptor: no language in the rules.
  assert.deepEqual(deriveRaw({active: side(profile(), option([{id: 4, name: 'Viral Combi Rifle'}]), '4:'), reactive: side(dog, combi, '1:'), rangeCm: 40}).notes,
    [{key: 'note.side', params: {side: {key: 'side.active'}, text: {key: 'note.shock'}}}]);
  // Wiki example 3.
  const plasma = shotAt(dog, 5, '5:Hit Mode');
  assert.equal(plasma.inputs.ammoA, 'PLASMA');
  assert.equal(plasma.inputs.armB, 5);
  assert.equal(plasma.inputs.btsB, 6);
  assert.deepEqual(plasma.notes, []);
});

test('Immunity (ARM) protects whichever side has it', () => {
  const dog = immune('ARM');
  const rem = profile({skills: [{id: 61, name: 'Total Reaction'}]});
  const r = derive({active: side(dog, combi, '1:'), reactive: side(rem, option([{id: 14, name: 'Vulkan Shotgun'}]), '14:'), rangeCm: 40});
  assert.equal(r.inputs.ammoB, 'N');
  assert.equal(r.inputs.contB, false);
  assert.equal(r.inputs.armA, 5);
  assert.equal(r.inputs.ammoA, 'N');
  assert.equal(r.inputs.armB, 2);
  assert.deepEqual(r.notes, ['Reactive: target has Immunity (ARM); AP treated as N; Continuous Damage ignored']);
});

test('Immunity (ARM) is listed as used, with a note of what it ignored', () => {
  const dog = immune('ARM');
  const r = shotAt(dog, 12, '12:');
  assert.deepEqual(r.notes, ['Active: target has Immunity (ARM); AP+EXP treated as N']);
  assert.deepEqual(r.warnings, []);
  assert.deepEqual(shotAt(dog, 13, '13:').notes, ['Active: target has Immunity (ARM); ARM=0 ignored']);
  assert.deepEqual(shotAt(dog, 1, '1:', {extra: ['AP', 'Continuous Damage']}).notes,
    ['Active: target has Immunity (ARM); AP treated as N; Continuous Damage ignored']);
  assert.deepEqual(shotAt(dog, 1, '1:').notes, []);   // plain N: nothing to ignore
});

test('Immunity (Enhanced) includes Immunity (ARM), and covers BTS saves too', () => {
  const hoplite = immune('Enhanced', {bts: 6});
  assert.equal(shotAt(hoplite, 13, '13:').inputs.armB, 5);
  const vulkan = shotAt(hoplite, 14, '14:').inputs;
  assert.equal(vulkan.contA, false);
  assert.equal(vulkan.armB, 5);
  const viral = shotAt(hoplite, 4, '4:');
  assert.equal(viral.inputs.ammoA, 'N');
  assert.equal(viral.inputs.armB, 6);
  assert.deepEqual(viral.notes, ['Active: target has Immunity (Enhanced); Bioweapon (DA+SHOCK) treated as N']);
  assert.equal(shotAt(hoplite, 5, '5:Hit Mode').inputs.ammoA, 'PLASMA');
});

test('Immunity (BTS): BTS-save ammo is treated as N, BTS not halved', () => {
  const jinwei = immune('BTS', {bts: 5});
  const breaker = shotAt(jinwei, 15, '15:');
  assert.equal(breaker.inputs.ammoA, 'N');
  assert.equal(breaker.inputs.armB, 5);            // BTS goes into the ARM input
  assert.deepEqual(breaker.notes, ['Active: target has Immunity (BTS); AP treated as N']);
  assert.equal(shotAt(profile({bts: 5}), 15, '15:').inputs.armB, 3);
  // Bioweapon (DA+Shock): one Saving Roll.
  const viral = shotAt(jinwei, 4, '4:');
  assert.equal(viral.inputs.ammoA, 'N');
  assert.equal(viral.inputs.armB, 5);
  assert.deepEqual(viral.notes, ['Active: target has Immunity (BTS); Bioweapon (DA+SHOCK) treated as N']);
  // Cover and the Critical save still apply.
  const covered = shotAt(jinwei, 15, '15:', {inCover: true}).inputs;
  assert.equal(covered.armB, 8);
  assert.equal(covered.critImmuneB, false);
  assert.deepEqual(breaker.warnings, []);
});

test('Immunity (BTS) does nothing against ARM saves; Plasma still rolls ARM and BTS', () => {
  const jinwei = immune('BTS', {bts: 6});
  const pf = shotAt(jinwei, 12, '12:');
  assert.equal(pf.inputs.ammoA, 'EXP');
  assert.equal(pf.inputs.armB, 3);
  assert.deepEqual(pf.notes, []);
  assert.equal(shotAt(jinwei, 13, '13:').inputs.armB, 0);
  assert.equal(shotAt(jinwei, 14, '14:').inputs.contA, true);
  const plasma = shotAt(jinwei, 5, '5:Hit Mode');
  assert.equal(plasma.inputs.ammoA, 'PLASMA');
  assert.equal(plasma.inputs.armB, 5);
  assert.equal(plasma.inputs.btsB, 6);
  assert.deepEqual(plasma.notes, []);
});

test('Immunity (BTS): E/M has no effect, but it is still rolled and opposed', () => {
  const jinwei = immune('BTS', {bts: 6});
  // E/M is treated as N, and Non-Lethal means no Wounds either: its hits cause
  // no Saving Rolls (NONE), but the roll still cancels the target's ARO.
  const em = shotAt(jinwei, 16, '16:', {extra: ['+1SD']});
  assert.equal(em.ok, true);
  assert.equal(em.inputs.burstA, 2);
  assert.equal(em.inputs.bonusBurstA, 1);
  assert.equal(em.inputs.ammoA, 'NONE');
  assert.equal(em.inputs.burstB, 1);               // the ARO, opposed
  assert.equal(em.inputs.ammoB, 'N');
  assert.deepEqual(em.warnings, ['Active: E/Mitter has no effect on a target with Immunity (BTS); its hits cause no damage']);
  assert.deepEqual(em.notes, []);
  const plain = shotAt(profile({bts: 6}), 16, '16:', {extra: ['+1SD']});
  assert.equal(plain.inputs.burstA, 2);
  assert.equal(plain.inputs.bonusBurstA, 1);
  assert.equal(plain.inputs.ammoA, 'DA');
  assert.equal(plain.inputs.armB, 3);
  assert.deepEqual(plain.warnings, ['Active: E/Mitter is non-lethal; results shown as wounds']);
  // In ARO too.
  const emitter = side(profile(), option([{id: 16, name: 'E/Mitter'}]), '16:');
  const aro = derive({active: side(jinwei, combi, '1:'), reactive: emitter, rangeCm: 40});
  assert.equal(aro.inputs.burstB, 1);
  assert.equal(aro.inputs.ammoB, 'NONE');
  assert.equal(aro.inputs.burstA, 3);
  assert.deepEqual(aro.warnings, ['Reactive: E/Mitter has no effect on a target with Immunity (BTS); its hits cause no damage']);
  // Both rolled even when neither attack can do anything.
  const both = derive({active: side(jinwei, option([{id: 16, name: 'E/Mitter'}]), '16:'), reactive: side(jinwei, option([{id: 16, name: 'E/Mitter'}]), '16:'), rangeCm: 40});
  assert.equal(both.ok, true);
  assert.deepEqual([both.inputs.burstA, both.inputs.burstB, both.inputs.ammoA, both.inputs.ammoB], [2, 1, 'NONE', 'NONE']);
  // Immunity (ARM) is no help, Immunity (Enhanced) is.
  assert.equal(shotAt(immune('ARM'), 16, '16:').inputs.ammoA, 'DA');
  assert.deepEqual(shotAt(immune('Enhanced'), 16, '16:').warnings,
    ['Active: E/Mitter has no effect on a target with Immunity (Enhanced); its hits cause no damage']);
});

test('Immunity (BTS): a Sepsitor has no effect, but is still a template to Dodge', () => {
  const jinwei = immune('BTS', {bts: 6});
  /** @param {ProfileRow} p */
  const sepsitor = (p) => side(p, option([{id: 18, name: 'Sepsitor'}]), '18:');
  const r = derive({active: sepsitor(profile()), reactive: side(jinwei, combi, 'dodge'), rangeCm: 20});
  assert.equal(r.ok, true);
  assert.equal(r.inputs.burstA, 1);
  assert.equal(r.inputs.templateA, true);
  assert.equal(r.inputs.ammoA, 'NONE');
  assert.equal(r.inputs.ammoB, 'DODGE');
  assert.deepEqual(r.notes, [DIRECT_TEMPLATE_NOTE]);
  assert.deepEqual(r.warnings, ['Active: Sepsitor has no effect on a target with Immunity (BTS); its hits cause no damage']);
  const plain = derive({active: sepsitor(profile()), reactive: side(profile(), combi, '1:'), rangeCm: 20});
  assert.equal(plain.inputs.burstA, 1);
  assert.equal(plain.inputs.templateA, true);
  assert.equal(plain.inputs.ammoB, 'N');
  // An active Dodge against a reactive template, harmless or not.
  const dodging = derive({active: side(jinwei, combi, 'dodge'), reactive: sepsitor(profile()), rangeCm: 20});
  assert.equal(dodging.ok, true);
  assert.equal(dodging.inputs.templateB, true);
  assert.equal(dodging.inputs.ammoB, 'NONE');
  assert.equal(derive({active: side(profile(), combi, 'dodge'), reactive: sepsitor(profile()), rangeCm: 20}).inputs.ammoA, 'DODGE');
});

test('Immunity (BTS): Flash Pulse still stuns, as a Face to Face Roll', () => {
  // Wiki example 4: Non-Lethal and State: Stunned are always applied.
  const flash = shotAt(immune('BTS', {bts: 6}), 17, '17:');
  assert.equal(flash.inputs.burstA, 1);
  assert.equal(flash.inputs.damageA, 7);
  assert.equal(flash.inputs.ammoA, 'N');
  assert.equal(flash.inputs.armB, 6);
  assert.deepEqual(flash.warnings, []);
  assert.deepEqual(flash.notes, ['Active: Flash Pulse; a failed save leaves the target Stunned, not wounded']);
});

test('Vulnerability (Viral): no Immunity against Viral weapons', () => {
  const skills = [
    {id: 162, name: 'Immunity', extra: ['BTS']},
    {id: 162, name: 'Immunity', extra: ['Critical']},
    {id: 220, name: 'Vulnerability', extra: ['Viral']},
  ];
  const chaksa = profile({bts: 5, skills});
  const viral = shotAt(chaksa, 4, '4:');
  assert.equal(viral.inputs.ammoA, 'DA');
  assert.equal(viral.inputs.critImmuneB, false);
  assert.deepEqual(viral.notes, [
    'Active: Shock against VITA 1; a failed save is Dead (no Unconscious, NWI or Dogged)',
    'Active: target has Vulnerability (Viral); Immunity (BTS) does not apply',
  ]);
  const breaker = shotAt(chaksa, 15, '15:');
  assert.equal(breaker.inputs.ammoA, 'N');
  assert.equal(breaker.inputs.armB, 5);
  assert.equal(breaker.inputs.critImmuneB, true);
});

test('Immunity (IMM-B / Isolated / POS) changes nothing: the calculator models no States', () => {
  const emitter = option([{id: 16, name: 'E/Mitter'}]);
  const plain = duel(side(profile(), emitter, '16:'), side(profile({bts: 6}), combi, '1:'));
  for (const state of ['IMM-B', 'Isolated', 'POS']) {
    const r = duel(side(profile(), emitter, '16:'), side(immune(state, {bts: 6}), combi, '1:'));
    assert.deepEqual(r.inputs, plain.inputs, state);
    assert.deepEqual(r.notes, plain.notes, state);
  }
});
