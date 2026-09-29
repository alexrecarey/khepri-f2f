// Run with: yarn test:js
// The Army data pipeline: normalize.js (used by scripts/fetch-army.mjs) and
// the checks in scripts/army-validate.mjs.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {UnknownValue, fixName, normalizeAmmo, normalizeSave, normalizeWeaponRow, statOverrides} from './normalize.js';
import {validateArmy} from '../../scripts/army-validate.mjs';

const army = JSON.parse(readFileSync(new URL('./army.json', import.meta.url), 'utf8'));

test('Saving Roll columns become {attr, halved, armZero, alsoBts} and a roll count', () => {
  assert.deepEqual(normalizeSave('ARM', '1'), {save: {attr: 'ARM'}, saveRolls: 1});
  assert.deepEqual(normalizeSave('ARM/2', '3'), {save: {attr: 'ARM', halved: true}, saveRolls: 3});
  assert.deepEqual(normalizeSave('BTS/2', '2'), {save: {attr: 'BTS', halved: true}, saveRolls: 2});
  assert.deepEqual(normalizeSave('ARM=0', '1'), {save: {attr: 'ARM', armZero: true}, saveRolls: 1});
  assert.deepEqual(normalizeSave('ARM and BTS', '1 and 1'), {save: {attr: 'ARM', alsoBts: true}, saveRolls: 1});
  assert.deepEqual(normalizeSave('PH-6', '1'), {save: {attr: 'PH', mod: -6}, saveRolls: 1});
  assert.deepEqual(normalizeSave('-', '-'), {save: null, saveRolls: null});
  assert.throws(() => normalizeSave('ARM/3', '1'), UnknownValue);
  assert.throws(() => normalizeSave('ARM', '4'), UnknownValue);
  assert.throws(() => normalizeSave('ARM', '1 and 1'), UnknownValue);
});

test('ammo becomes a list, misspelt names are fixed', () => {
  assert.deepEqual(normalizeAmmo('AP+Exp'), ['AP', 'Exp']);
  assert.equal(normalizeAmmo(null), null);
  assert.equal(fixName('Continous Damage'), 'Continuous Damage');
  const row = normalizeWeaponRow({name: 'X', ammo: 'N', saving: 'ARM', saves: '1', props: ['Continous Damage']});
  assert.deepEqual(row, {name: 'X', ammo: ['N'], save: {attr: 'ARM'}, saveRolls: 1, props: ['Continuous Damage']});
});

test('"BS=12"-style loadout skills become statOverrides', () => {
  assert.deepEqual(statOverrides([{name: 'BS=12'}, {name: 'BTS=3'}, {name: 'Lieutenant'}]), {bs: 12, bts: 3});
  assert.equal(statOverrides([{name: 'Lieutenant'}]), null);
  assert.throws(() => statOverrides([{name: 'XYZ=3'}]), UnknownValue);
});

test('the committed army.json passes validation', () => {
  assert.deepEqual(validateArmy(army), []);
});

// A copy of the data with one change, and the problems it causes.
function problemsAfter(change) {
  const copy = structuredClone(army);
  change(copy);
  return validateArmy(copy);
}
const firstProfile = (a) => Object.values(a.units[0].byFaction)[0].groups[0].profiles[0];
const combiRifleOption = (a) => {
  for (const u of a.units) for (const {groups} of Object.values(u.byFaction)) for (const g of groups) {
    for (const o of g.options) if (o.weapons.some((w) => w.name === 'Combi Rifle')) return o;
  }
  return null;
};

test('validation catches what a new release could change under the rules', () => {
  // A skill id the rules use now means something else.
  const renamed = problemsAfter((a) => {
    for (const u of a.units) for (const {groups} of Object.values(u.byFaction)) for (const g of groups) {
      for (const p of g.profiles) for (const s of p.skills) if (s.id === 28) s.name = 'Camouflage';
    }
  });
  assert.ok(renamed.some((p) => p.includes('skill id 28 is now "Camouflage"')), renamed.join('\n'));

  // New weapon property, new ammunition.
  const weapon = problemsAfter((a) => {
    a.weapons[Object.keys(a.weapons)[0]][0].props.push('Fancy New Trait');
    a.weapons[Object.keys(a.weapons)[0]][0].ammo = ['Nanotech'];
  });
  assert.ok(weapon.some((p) => p.startsWith('weapon property "Fancy New Trait"')), weapon.join('\n'));
  assert.ok(weapon.some((p) => p.startsWith('ammunition "Nanotech"')), weapon.join('\n'));

  // A loadout extra on a BS weapon that parseWeaponMods can't read.
  const extra = problemsAfter((a) => {
    const w = combiRifleOption(a).weapons.find((x) => x.name === 'Combi Rifle');
    w.extra = ['+1 Burst'];
  });
  assert.ok(extra.some((p) => p.startsWith('weapon extra "+1 Burst" on Combi Rifle')), extra.join('\n'));

  // A new bracketed value on a skill the rules read.
  const immunity = problemsAfter((a) => firstProfile(a).skills.push({id: 162, name: 'Immunity', extra: ['Plasma']}));
  assert.ok(immunity.some((p) => p.startsWith('Immunity (Plasma)')), immunity.join('\n'));
});
