// The BS Attack skill: its ammunition and PS extras on every weapon, +B / +SD with the Fireteam and loadout, BS Attack (-X) on the opponent, Neurocinetics.
// Run with: yarn test:js
import test from 'node:test';
import assert from 'node:assert/strict';
import {effectiveTraits} from '../army/traits.js';
import {bsWeapons} from '../army/weapons.js';
import {buildLedger} from './ledger.js';
import {deriveInputs as deriveRaw} from './matchup.js';
import {derive, option, profile} from './testFixtures.mjs';
import {army} from '../army/testArmy.mjs';
import {resolveSelection, trooperWeapons} from './trooper.js';
import {W, side, combi, immune, sansLines, shotAt, withExtra, label, byIsc, bsAttackAP, bsAttack, shoot, minus3, warhorse, flamer, duel, at, shooter} from './testMatchups.mjs';

/** @typedef {import('../types.js').ProfileRow} ProfileRow */
/** @typedef {import('../types.js').OptionRow} OptionRow */
/** @typedef {import('../types.js').TraitRef} TraitRef */
/** @typedef {import('../types.js').Trooper} Trooper */
/** @typedef {import('../types.js').LedgerSide} LedgerSide */

test('ammo extras: the weapon menu label shows the ammo', () => {
  assert.equal(label(withExtra([])), 'Combi Rifle · B3 · PS7 · N');
  assert.equal(label(withExtra(['T2'])), 'Combi Rifle · B3 · PS7 · T2');
  assert.equal(label(withExtra(['Shock'])), 'Combi Rifle · B3 · PS7 · Shock');
  assert.equal(label(withExtra(['AP'])), 'Combi Rifle · B3 · PS7 · AP');
  assert.equal(label(withExtra(['+1B', 'T2'])), 'Combi Rifle · B4 · PS7 · T2');
  // Added to other ammo, not in place of it; an AP weapon doesn't say AP twice.
  assert.equal(label(withExtra(['T2'], 6)), 'Heavy Pistol · B2 · PS6 · Shock+T2');
  assert.equal(label(withExtra(['AP'], 15)), 'Breaker Rifle · B3 · PS7 · AP');
  // Viral is N ammo on a BTS save, like the chart's Viral Combi Rifle.
  assert.equal(label(withExtra(['Viral'])), 'Viral Combi Rifle · B3 · PS7 · N');
  assert.equal(label(withExtra(['Viral'])), label(withExtra([], 4)));
});

test('ammo extras: T2 fires T2 ammo, treated as N by Immunity (ARM)', () => {
  const t2 = {extra: ['T2']};
  assert.equal(shotAt(profile({arm: 5}), 1, '1:', t2).inputs.ammoA, 'T2');
  assert.equal(shotAt(profile({arm: 5}), 1, '1:').inputs.ammoA, 'N');
  const r = shotAt(immune('ARM'), 1, '1:', t2);
  assert.equal(r.inputs.ammoA, 'N');
  assert.deepEqual(r.notes, ['Active: target has Immunity (ARM); T2 treated as N']);
  // Same as the (PS6) T2 Rifle (the ledger lines name the weapon).
  for (const target of [profile({arm: 5}), immune('ARM'), immune('BTS')]) {
    assert.deepEqual(sansLines(shotAt(target, 1, '1:', {extra: ['T2', 'PS=6']})), sansLines(shotAt(target, 10, '10:')));
  }
});

test('ammo extras: Viral plays as Bioweapon (DA+SHOCK), like the Viral Combi Rifle', () => {
  const viral = {extra: ['Viral']};
  const plain = shotAt(profile({arm: 5, bts: 6}), 1, '1:', viral).inputs;
  assert.equal(plain.ammoA, 'DA');
  assert.equal(plain.shockA, true);
  assert.equal(plain.armB, 6); // BTS save
  const targets = {
    plain: profile({arm: 5, bts: 6}),
    vita2: profile({w: 2}),
    immuneARM: immune('ARM'),
    immuneBTS: immune('BTS'),
    immuneShock: immune('Shock'),
    immuneEnhanced: immune('Enhanced'),
    chaksa: profile({bts: 5, skills: [{id: 162, name: 'Immunity', extra: ['BTS']}, {id: 220, name: 'Vulnerability', extra: ['Viral']}]}),
  };
  for (const [name, target] of Object.entries(targets)) {
    assert.deepEqual(sansLines(shotAt(target, 1, '1:', viral)), sansLines(shotAt(target, 4, '4:')), name);
  }
});

test('ammo extras: Shock turns on the Shock rule', () => {
  /** @param {ProfileRow} target */
  const vs = (target) => shotAt(target, 1, '1:', {extra: ['Shock']}).inputs;
  assert.equal(vs(profile()).shockA, true);
  assert.equal(vs(profile()).ammoA, 'N');
  assert.equal(vs(profile({w: 2})).shockA, false);
  assert.equal(vs(immune('Shock')).shockA, false);
  assert.equal(vs(immune('ARM')).shockA, false);
  assert.equal(shotAt(profile(), 1, '1:').inputs.shockA, false);
  // Same as a Shock weapon from the chart.
  assert.deepEqual(vs(profile({arm: 5})), shotAt(profile({arm: 5}), 2, '2:Shock Mode').inputs);
});

test('fireteam size sets cumulative bonuses', () => {
  /**
   * @param {number} ftSize
   * @param {string} [weaponKey]
   */
  const at = (ftSize, weaponKey = '1:') => ({...side(profile({ph: 11}), combi, weaponKey), ftSize});
  /** @param {number} n */
  const shoot = (n) => derive({active: at(n), reactive: at(n), rangeCm: 40}).inputs;
  assert.deepEqual([0, 2, 3, 4, 5].map((n) => shoot(n).bonusBurstA), [0, 1, 1, 1, 1]);
  assert.deepEqual([0, 2, 3, 4, 5].map((n) => shoot(n).successValueA), [15, 15, 15, 16, 16]);
  assert.equal(shoot(4).bonusBurstB, 1);
  assert.equal(shoot(4).burstB, 1);

  /** @param {number} n */
  const dodge = (n) => derive({active: at(1), reactive: at(n, 'dodge'), rangeCm: 40}).inputs.successValueB;
  assert.deepEqual([0, 2, 3].map(dodge), [11, 11, 12]);

  // A Fireteam of 5 gives Sixth Sense: its Dodge takes no negative MODs.
  const bsAttacker = {...side(profile({skills: [{id: 201, name: 'BS Attack', extra: ['-3']}]}), combi, '1:'), ftSize: 1};
  /** @param {number} n */
  const dodgeVs = (n) => derive({active: bsAttacker, reactive: at(n, 'dodge'), rangeCm: 40}).inputs.successValueB;
  assert.equal(dodgeVs(5), /** @type {number} */ (dodgeVs(4)) + 3);

  const flamer = option([{id: 3, name: 'Heavy Flamethrower'}]);
  const t = derive({active: {...side(profile(), flamer, '3:'), ftSize: 4}, reactive: at(1), rangeCm: 20});
  assert.equal(t.inputs.bonusBurstA, 0);
});

test('a Direct Template in a Fireteam has no Fireteam SD line to cancel (Alex, 2026-10-23)', () => {
  const flamer = option([{id: 3, name: 'Heavy Flamethrower'}]);
  const r = deriveRaw({active: {...side(profile(), flamer, '3:'), ftSize: 2}, reactive: {...side(profile(), combi, '1:'), ftSize: 2}, rangeCm: 20});
  assert.equal(r.inputs.bonusBurstA, 0);
  assert.deepEqual(/** @type {import('../types.js').SideLines} */ (r.lines.A).sd, {lines: [], total: 0});
  // The BS Attack facing it still gets its Fireteam's +1 SD line.
  assert.deepEqual(/** @type {import('../types.js').Section} */ (/** @type {import('../types.js').SideLines} */ (r.lines.B).sd).lines.map((l) => l.value), [1]);
});

test('BS Attack skill SD / B stack with Fireteam and loadout extras', () => {
  const crux = profile({skills: [{id: 201, name: 'BS Attack', extra: ['+1SD']}]});
  const x = {...side(crux, combi, '1:'), ftSize: 2};
  const r = derive({active: x, reactive: x, rangeCm: 40}).inputs;
  assert.equal(r.bonusBurstA, 2);
  assert.equal(r.bonusBurstB, 2);

  const gecko = profile({skills: [{id: 201, name: 'BS Attack', extra: ['+1B']}]});
  const g = side(gecko, combi, '1:');
  const rg = derive({active: g, reactive: g, rangeCm: 40}).inputs;
  assert.equal(rg.burstA, 4);
  assert.equal(rg.burstB, 1);
});

test('template burst comes from loadout extras (Dog-Warrior B2 Chain Rifle)', () => {
  const chain = option([{id: 3, name: 'Heavy Flamethrower', extra: ['+1B']}]);
  const x = {...side(profile(), chain, '3:'), ftSize: 4};
  assert.match(label(bsWeapons(chain, W)[0]), / · B2 · /);
  const r = derive({active: x, reactive: side(profile(), combi, '1:'), rangeCm: 20}).inputs;
  assert.equal(r.burstA, 2);
  assert.equal(r.bonusBurstA, 0);
  assert.equal(r.templateA, true);
});

test('BS Attack (AP) on the profile gives every BS weapon AP', () => {
  const p = profile({skills: [bsAttackAP]});
  const o = option([{id: 1, name: 'Combi Rifle'}, {id: 3, name: 'Heavy Flamethrower'}, {id: 2, name: 'MULTI Rifle'}]);
  const labels = trooperWeapons(o, W, effectiveTraits(p, o)).map(label);
  assert.deepEqual(labels, [
    'Combi Rifle · B3 · PS7 · AP',
    'Heavy Flamethrower · B1 · PS6 · AP+Fire',
    'MULTI Rifle (AP) · B3 · PS7 · AP',        // already AP: not doubled
    'MULTI Rifle (Shock) · B3 · PS7 · AP+Shock',
  ]);
  // ARM 5 halved, rounding up.
  const r = derive({active: side(p, o, '1:'), reactive: side(profile({arm: 5}), combi, '1:'), rangeCm: 40});
  assert.equal(r.inputs.armB, 3);
});

test('BS Attack (AP) on the loadout works the same; without it nothing changes', () => {
  const o = option([{id: 1, name: 'Combi Rifle'}], {skills: [bsAttackAP]});
  const target = side(profile({arm: 4}), combi, '1:');
  assert.equal(derive({active: side(profile(), o, '1:'), reactive: target, rangeCm: 40}).inputs.armB, 2);
  assert.equal(derive({active: side(profile(), combi, '1:'), reactive: target, rangeCm: 40}).inputs.armB, 4);
  // BTS weapons halve BTS.
  const breaker = option([{id: 4, name: 'Viral Combi Rifle'}], {skills: [bsAttackAP]});
  assert.equal(derive({active: side(profile(), breaker, '4:'), reactive: side(profile({bts: 6}), combi, '1:'), rangeCm: 40}).inputs.armB, 3);
});

test('BS Attack (AP) in the Army data: Scouts (profile) and one Bashi Bazouk loadout', () => {
  /**
   * @param {string} isc
   * @param {(os: OptionRow[]) => OptionRow | undefined} pickOption
   */
  const ap = (isc, pickOption) => {
    const u = byIsc(isc);
    const f = u.inFactions[0];
    const g = u.byFaction[f].groups[0];
    const o = /** @type {OptionRow} */ (pickOption(g.options));
    const r = /** @type {Trooper & {option: OptionRow}} */ (resolveSelection(army, {unitId: u.id, factionId: f, groupId: g.id, profileId: g.profiles[0].id, optionId: o.id}));
    return trooperWeapons(r.option, army.weapons, r.traits).map((w) => w.mods.forceAP);
  };
  assert.ok(ap('Scouts', (os) => os[0]).every(Boolean));
  /** @param {OptionRow} o */
  const hasSkill = (o) => o.skills.some((s) => s.id === 201 && (s.extra ?? []).includes('AP'));
  assert.ok(ap('Bashi Bazouks', (os) => os.find(hasSkill)).every(Boolean));
  assert.ok(ap('Bashi Bazouks', (os) => os.find((o) => !hasSkill(o) && o.weapons.length > 0)).some((x) => !x));
});

test('Immunity (AP) ignores AP halving only, not E/M BTS/2', () => {
  const target = side(immune('AP'), combi, '1:');
  /**
   * @param {TraitRef[]} weapons
   * @param {string} key
   * @param {boolean} [extra]
   */
  const vs = (weapons, key, extra) => derive({
    active: side(profile(), option(weapons, extra ? {skills: [bsAttackAP]} : {}), key), reactive: target, rangeCm: 40,
  }).inputs.armB;
  assert.equal(vs([{id: 2, name: 'MULTI Rifle'}], '2:AP Mode'), 5);            // AP ammo: ARM 5 kept
  assert.equal(vs([{id: 1, name: 'Combi Rifle'}], '1:', true), 5);             // BS Attack (AP): kept
  assert.equal(vs([{id: 15, name: 'Breaker Rifle'}], '15:'), 3);               // AP on BTS: BTS 3 kept
  assert.equal(vs([{id: 16, name: 'E/Mitter'}], '16:'), 2);                    // E/M BTS/2: halved
  const plain = side(profile({arm: 5, bts: 3}), combi, '1:');
  assert.equal(derive({active: side(profile(), option([{id: 16, name: 'E/Mitter'}]), '16:'), reactive: plain, rangeCm: 40}).inputs.armB, 2);
});

test('BS Attack (T2) adds T2 to every BS Attack', () => {
  const p = profile({skills: [bsAttack('T2')]});
  const o = option([{id: 1, name: 'Combi Rifle'}, {id: 2, name: 'MULTI Rifle'}, {id: 10, name: 'T2 Rifle'}]);
  assert.deepEqual(trooperWeapons(o, W, effectiveTraits(p, o)).map(label), [
    'Combi Rifle · B3 · PS7 · T2',
    'MULTI Rifle (AP) · B3 · PS7 · AP+T2',
    'MULTI Rifle (Shock) · B3 · PS7 · Shock+T2',
    'T2 Rifle · B3 · PS6 · T2',             // already T2: unchanged
  ]);
  assert.equal(shoot([bsAttack('T2')], [{id: 1, name: 'Combi Rifle'}], '1:').inputs.ammoA, 'T2');
  assert.equal(shoot([bsAttack('T2')], [{id: 2, name: 'MULTI Rifle'}], '2:AP Mode').inputs.ammoA, 'T2');
  // Immunity (ARM) still treats it as N.
  assert.equal(shoot([bsAttack('T2')], [{id: 1, name: 'Combi Rifle'}], '1:', immune('ARM')).inputs.ammoA, 'N');
});

test('BS Attack (SR-1) / (SR-2) lower the PS the target saves against', () => {
  assert.equal(shoot([bsAttack('SR-1')], [{id: 1, name: 'Combi Rifle'}], '1:').inputs.damageA, 6);
  assert.equal(shoot([bsAttack('SR-2')], [{id: 1, name: 'Combi Rifle'}], '1:').inputs.damageA, 5);
  // On top of a loadout PS=6, and on BTS weapons too.
  assert.equal(shoot([bsAttack('SR-1')], [{id: 1, name: 'Combi Rifle', extra: ['PS=6']}], '1:').inputs.damageA, 5);
  assert.equal(shoot([bsAttack('SR-2')], [{id: 15, name: 'Breaker Rifle'}], '15:').inputs.damageA, 5);
  // Immunity doesn't cancel a Saving Roll MOD.
  assert.equal(shoot([bsAttack('SR-1')], [{id: 1, name: 'Combi Rifle'}], '1:', immune('ARM')).inputs.damageA, 6);
  const p = profile({skills: [bsAttack('SR-1')]});
  assert.equal(label(trooperWeapons(combi, W, effectiveTraits(p, combi))[0]), 'Combi Rifle · B3 · PS6 · N');
});

test('BS Attack (Continuous Damage) gives every BS Attack the Trait', () => {
  assert.equal(shoot([], [{id: 1, name: 'Combi Rifle'}], '1:').inputs.contA, false);
  assert.equal(shoot([bsAttack('Continuous Damage')], [{id: 1, name: 'Combi Rifle'}], '1:').inputs.contA, true);
  // Immunity (ARM) ignores it, as it does the weapon's own.
  assert.equal(shoot([bsAttack('Continuous Damage')], [{id: 1, name: 'Combi Rifle'}], '1:', immune('ARM')).inputs.contA, false);
});

test('Immunity (Continuous Damage) ignores the Trait, not the hit', () => {
  const r = shoot([bsAttack('Continuous Damage')], [{id: 1, name: 'Combi Rifle'}], '1:', immune('Continuous Damage'));
  assert.equal(r.inputs.contA, false);
  assert.equal(r.inputs.ammoA, 'N');
  assert.ok(r.notes.includes('Active: target has Immunity (Continuous Damage); Continuous Damage ignored'), r.notes.join(' | '));
  assert.equal(shoot([], [{id: 14, name: 'Vulkan Shotgun'}], '14:', immune('Continuous Damage')).inputs.contA, false);
});

test('BS Attack extras combine', () => {
  const skills = [bsAttack('SR-1', 'Continuous Damage', '+1B')];
  const r = shoot(skills, [{id: 1, name: 'Combi Rifle'}], '1:');
  assert.equal(r.inputs.damageA, 6);
  assert.equal(r.inputs.contA, true);
  assert.equal(r.inputs.burstA, 4);
  const s = side(profile({skills}), combi, '1:');
});

test('BS Attack (-3): the opponent takes -3 when shooting back or dodging', () => {
  const shooter = side(profile({skills: [minus3]}), combi, '1:');
  // BS 12 +3 range = 15, the -3 makes it 12. PH 12 dodge -> 9.
  assert.equal(duel(shooter, side(profile(), combi, '1:')).inputs.successValueB, 12);
  assert.equal(duel(shooter, side(profile(), combi, 'dodge')).inputs.successValueB, 9);
  // Its own roll is untouched.
  assert.equal(duel(shooter, side(profile(), combi, '1:')).inputs.successValueA, 15);
  // From the reactive side too: the active trooper's attack and Dodge take it.
  assert.equal(duel(side(profile(), combi, '1:'), shooter).inputs.successValueA, 12);
  assert.equal(duel(side(profile(), combi, 'dodge'), shooter).inputs.successValueA, 9);
});

test('BS Attack (-3) only while its trooper makes a rolled BS Attack', () => {
  const skills = [minus3];
  // Dodging: nothing.
  assert.equal(duel(side(profile({skills}), combi, 'dodge'), side(profile(), combi, '1:')).inputs.successValueB, 15);
  // Direct Template: no roll, so the Dodge or shot back is a Normal Roll: nothing.
  assert.equal(duel(side(profile({skills}), flamer, '3:'), side(profile(), combi, 'dodge')).inputs.successValueB, 12);
  assert.equal(duel(side(profile({skills}), flamer, '3:'), side(profile(), combi, '1:')).inputs.successValueB, 15);
  // An attack its target is immune to is still an opposed BS Attack, so -3
  // applies (E/Mitter vs Immunity (BTS)): the target's ARO 15 -> 12, Dodge 12 -> 9.
  const emitter = option([{id: 16, name: 'E/Mitter'}]);
  assert.equal(duel(side(profile({skills}), emitter, '16:'), side(immune('BTS'), combi, '1:')).inputs.successValueB, 12);
  assert.equal(duel(side(profile({skills}), emitter, '16:'), side(immune('BTS'), combi, 'dodge')).inputs.successValueB, 9);
  // Out of range: declared, fails automatically, still -3 on the opponent.
  const far = duel(side(profile({skills}), combi, '1:'), side(profile(), combi, 'dodge'), 240);
  assert.equal(far.inputs.successValueA, 0);
  assert.equal(far.inputs.successValueB, 9);              // PH 12, BS Attack -3
});

test('Warhorse ignores BS Attack (-3), however it is gained', () => {
  const fromLoadout = side(profile(), option([{id: 1, name: 'Combi Rifle'}], {skills: [minus3]}), '1:');
  const r = duel(fromLoadout, side(profile({skills: [warhorse]}), combi, '1:'));
  assert.equal(r.inputs.successValueB, 15);
  assert.ok(r.notes.includes("Reactive: Warhorse; the opponent's BS Attack (-3) has no effect"), r.notes.join(' | '));
  // The struck line and its note name the skill by key, not by its English name.
  const raw = deriveRaw({active: fromLoadout, reactive: side(profile({skills: [warhorse]}), combi, '1:'), rangeCm: 40});
  assert.deepEqual(/** @type {import('../types.js').Section} */ (/** @type {import('../types.js').SideLines} */ (raw.lines.B).sv).lines.find((l) => l.struck), {value: -3, label: {key: 'skill.bsAttackMod', params: {mod: -3}}, by: 'A', struck: {key: 'skill.warhorse'}});
  assert.deepEqual(/** @type {Required<import('../types.js').MessageKey>} */ (raw.notes[0]).params.text, {key: 'note.ignoresMod', params: {by: {key: 'skill.warhorse'}, mod: {key: 'skill.bsAttackMod', params: {mod: -3}}}});
  assert.equal(duel(fromLoadout, side(profile({skills: [warhorse]}), combi, 'dodge')).inputs.successValueB, 12);
});

test('Neurocinetics: Burst 1 in the Active Turn, Burst MODs and Fireteam SD aside', () => {
  const neuro = profile({skills: [{id: 109, name: 'Neurocinetics'}]});
  const hmg = option([{id: 7, name: 'Heavy Machine Gun', extra: ['+1B']}]);
  const r = derive({active: side(neuro, hmg, '7:'), reactive: side(profile(), combi, '1:'), rangeCm: 40});
  assert.equal(r.inputs.burstA, 1);
  assert.ok(r.notes.includes('Active: Neurocinetics; Burst reduced to 1 in the Active Turn'));
  // Special Dice don't change the Burst value, so they still apply.
  const ft = derive({active: {...side(neuro, hmg, '7:'), ftSize: 2}, reactive: side(profile(), combi, '1:'), rangeCm: 40});
  assert.equal(ft.inputs.burstA, 1);
  assert.equal(ft.inputs.bonusBurstA, 1);
  // Without the skill: the full Burst with its MOD.
  assert.equal(derive({active: side(profile(), hmg, '7:'), reactive: side(profile(), combi, '1:'), rangeCm: 40}).inputs.burstA, 5);
});

test('Neurocinetics (+1B): the extra Burst counts in the Reactive Turn only (Yan Huo)', () => {
  const neuro = profile({skills: [{id: 109, name: 'Neurocinetics', extra: ['+1B']}]});
  const ml = option([{id: 9, name: 'Missile Launcher'}]);
  const args = {active: side(profile(), combi, '1:'), reactive: side(neuro, ml, '9:Hit Mode'), rangeCm: 40};
  const r = derive(args);
  assert.equal(r.inputs.burstB, 2);
  const burst = /** @type {import('../types.js').Section} */ (/** @type {LedgerSide} */ (buildLedger({...args, derived: r}).B).burst);
  assert.ok(burst.lines.some((l) => l.label === 'Neurocinetics' && l.value === 1), JSON.stringify(burst.lines));
  // Active Turn: still B 1.
  const a = derive({active: side(neuro, ml, '9:Hit Mode'), reactive: side(profile(), combi, '1:'), rangeCm: 40});
  assert.equal(a.inputs.burstA, 1);
  // A weapon +1B on a Neurocinetics trooper also counts in ARO.
  const plain = profile({skills: [{id: 109, name: 'Neurocinetics'}]});
  const ml1 = option([{id: 9, name: 'Missile Launcher', extra: ['+1B']}]);
  assert.equal(derive({active: side(profile(), combi, '1:'), reactive: side(plain, ml1, '9:Hit Mode'), rangeCm: 40}).inputs.burstB, 2);
});
