// Matchups between real units from the committed army data, end to end.
// Run with: yarn test:js
import test from 'node:test';
import assert from 'node:assert/strict';
import {effectiveTraits} from '../army/traits.js';
import {bsWeapons, isBsAttackWeapon} from '../army/weapons.js';
import {defaultWeapon} from './defaultWeapon.js';
import {derive, option, profile} from './testFixtures.mjs';
import {army} from '../army/testArmy.mjs';
import {resolveSelection} from './trooper.js';
import {label, byIsc, at, shooter} from './testMatchups.mjs';

/** @typedef {import('../types.js').WeaponRow} WeaponRow */
/** @typedef {import('../types.js').WeaponEntry} WeaponEntry */
/** @typedef {import('../types.js').ProfileRow} ProfileRow */
/** @typedef {import('../types.js').OptionRow} OptionRow */
/** @typedef {import('../types.js').Trooper} Trooper */

test('Hatamoto: only BS weapons listed', () => {
  const hatamoto = byIsc('Hatamoto Imperial Guard');
  const group = hatamoto.byFaction['1102'].groups[0];
  const names = bsWeapons(group.options[0], army.weapons).map(label);
  assert.equal(names.length, 3);
  assert.ok(names.every((n) => /Plasma Carbine|Heavy Pistol/.test(n)));
});

test('Hatamoto plasma vs Sierra Dronbot HMG at 8-16"', () => {
  const hatamoto = byIsc('Hatamoto Imperial Guard');
  const sierra = byIsc('Sierra Dronbot');
  const active = /** @type {Trooper} */ (resolveSelection(army, {unitId: hatamoto.id, factionId: 1102, optionId: 1, weaponKey: '111:Hit Mode'}));
  const sierraGroup = sierra.byFaction['107'].groups[0];
  const hmg = /** @type {WeaponEntry} */ (bsWeapons(sierraGroup.options[0], army.weapons).find((w) => /Machine Gun/.test(w.name)));
  const reactive = /** @type {Trooper} */ (resolveSelection(army, {unitId: sierra.id, factionId: 107, optionId: sierraGroup.options[0].id, weaponKey: hmg.key, inCover: true}));
  assert.equal(active.factionId, 1102);
  const r = derive({active, reactive, rangeCm: 40});
  assert.equal(r.ok, true, r.errors.join('; '));
  assert.equal(r.inputs.successValueA, 13);         // BS13 +3 -3 cover
  assert.equal(r.inputs.ammoA, 'PLASMA');
  assert.equal(r.inputs.damageA, 6);
  assert.equal(r.inputs.burstB, hmg.row.burst);     // Total Reaction
  // mimetism -3 and Hatamoto's Nanoscreen -3
  assert.equal(r.inputs.successValueB, sierra.byFaction['107'].groups[0].profiles[0].bs + /** @type {NonNullable<WeaponRow['ranges']>} */ (hmg.row.ranges)[1].mod - 6);
  assert.equal(r.inputs.armA, 2 + 3);               // Nanoscreen on saves
  assert.equal(r.inputs.armB, sierraGroup.profiles[0].arm + 3);
});

test('Dog-Warrior shrugs off a Panzerfaust and a K1 (Immunity (ARM))', () => {
  const dog = byIsc('Dog-Warriors');
  const f = dog.inFactions[0];
  const group = dog.byFaction[f].groups[0];
  const form = /** @type {ProfileRow} */ (group.profiles.find((p) => p.name === 'DOG-WARRIOR FORM'));
  const o = group.options[0];
  const reactive = /** @type {Trooper} */ (resolveSelection(army, {unitId: dog.id, factionId: f, groupId: group.id, profileId: form.id, optionId: o.id, weaponKey: 'dodge'}));
  /** @param {string} name a weapon in the data */
  const find = (name) => /** @type {[string, WeaponRow[]]} */ (Object.entries(army.weapons).find(([, rows]) => rows[0].name === name));
  /**
   * @param {string} name
   * @returns {Trooper}
   */
  const shooter = (name) => {
    const [id, rows] = find(name);
    const opt = option([{id: Number(id), name}]);
    const weapon = bsWeapons(opt, army.weapons).find((w) => w.row === rows.find(isBsAttackWeapon));
    return /** @type {Trooper} */ ({profile: profile(), option: opt, traits: effectiveTraits(profile(), opt), weapon});
  };
  const pf = derive({active: shooter('Panzerfaust'), reactive, rangeCm: 40});
  assert.equal(pf.ok, true, pf.errors.join('; '));
  assert.equal(pf.inputs.ammoA, 'N');
  assert.equal(pf.inputs.armB, form.arm);
  assert.ok(!pf.warnings.some((w) => w.includes('Immunity')), pf.warnings.join(' | '));
  const k1 = derive({active: shooter('K1 Combi Rifle'), reactive, rangeCm: 40});
  assert.equal(k1.inputs.armB, form.arm);
});

test('Chaksa Longarm: Immunity (BTS) against a Breaker, not against Viral', () => {
  const chaksa = byIsc('Chaksa Longarms');
  const f = chaksa.inFactions[0];
  const group = chaksa.byFaction[f].groups[0];
  const reactive = /** @type {Trooper} */ (resolveSelection(army, {unitId: chaksa.id, factionId: f, groupId: group.id, optionId: group.options[0].id, weaponKey: 'dodge'}));
  const bts = reactive.profile.bts;
  /**
   * @param {string} name a weapon in the data
   * @returns {Trooper}
   */
  const shooter = (name) => {
    const [id] = /** @type {[string, WeaponRow[]]} */ (Object.entries(army.weapons).find(([, rows]) => rows[0].name === name));
    const opt = option([{id: Number(id), name}]);
    return /** @type {Trooper} */ ({profile: profile(), option: opt, traits: effectiveTraits(profile(), opt), weapon: bsWeapons(opt, army.weapons)[0]});
  };
  const breaker = derive({active: shooter('Breaker Rifle'), reactive, rangeCm: 40});
  assert.equal(breaker.ok, true, breaker.errors.join('; '));
  assert.equal(breaker.inputs.ammoA, 'N');
  assert.equal(breaker.inputs.armB, bts);
  const viral = derive({active: shooter('VIRAL Sniper Rifle'), reactive, rangeCm: 40});
  assert.equal(viral.inputs.ammoA, 'DA');
  assert.ok(viral.notes.some((n) => n.includes('Vulnerability (Viral)')), viral.notes.join(' | '));
});

test('army ammo extras: Corax Combi Rifle (Viral), Treitak Combi Rifle (T2), Iguana Mine Dispenser (Shock)', () => {
  const corax = byIsc('Shasvastii Team-Ops');
  const active = /** @type {Trooper & {weapon: WeaponEntry}} */ (resolveSelection(army, {unitId: corax.id, factionId: 603, groupId: 1, optionId: 4, weaponKey: '33:'}));
  assert.equal(label(active.weapon), 'Viral Combi Rifle · B3 · PS7 · N');
  const chaksa = byIsc('Chaksa Longarms');
  const f = chaksa.inFactions[0];
  const group = chaksa.byFaction[f].groups[0];
  const reactive = /** @type {Trooper} */ (resolveSelection(army, {unitId: chaksa.id, factionId: f, groupId: group.id, optionId: group.options[0].id, weaponKey: 'dodge'}));
  const r = derive({active, reactive, rangeCm: 40});
  assert.equal(r.inputs.ammoA, 'DA');
  assert.equal(r.inputs.armB, reactive.profile.bts);
  assert.ok(r.notes.some((n) => n.includes('Vulnerability (Viral)')), r.notes.join(' | '));

  const treitak = byIsc('Treitak Spec-Ops');
  const t2 = /** @type {Trooper & {weapon: WeaponEntry, option: OptionRow}} */ (resolveSelection(army, {unitId: treitak.id, factionId: 601, groupId: 1, profileId: 1, optionId: 4, weaponKey: '33:'}));
  assert.equal(label(t2.weapon), 'Combi Rifle · B3 · PS7 · T2');
  assert.equal(derive({active: t2, reactive: null, rangeCm: 40}).inputs.ammoA, 'T2');
  assert.equal(/** @type {WeaponEntry} */ (defaultWeapon(bsWeapons(t2.option, army.weapons), 'active')).key, '33:');

  // Robin Hook: Tactical Bow (+3 BS). BS11, +3 range at 0-8".
  const robin = byIsc('Robin Hook, outlaw AI');
  const bow = /** @type {Trooper} */ (resolveSelection(army, {unitId: robin.id, factionId: 503, groupId: 1, profileId: 1, optionId: 1, weaponKey: '193:'}));
  assert.equal(derive({active: bow, reactive: null, rangeCm: 20}).inputs.successValueA, 11 + 3 + 3);

  // The Mine Dispenser is not a BS Attack, whatever mines it lays.
  const iguana = byIsc("'Iguana' Squadron").byFaction['403'].groups[0].options[0];
  assert.ok(iguana.weapons.some((w) => w.name === 'Mine Dispenser' && w.extra?.includes('Shock')));
  assert.ok(bsWeapons(iguana, army.weapons).every((w) => w.name !== 'Mine Dispenser'));
});

test('Moonraker: the Adhesive Launcher Rifle is one of its BS weapons', () => {
  const moonraker = byIsc('Moonrakers, Forward Remote Devices');
  for (const f of moonraker.inFactions) {
    for (const o of moonraker.byFaction[f].groups[0].options) {
      assert.ok(bsWeapons(o, army.weapons).some((w) => w.name === 'Adhesive Launcher Rifle'), `${f} ${o.id}`);
    }
  }
});
