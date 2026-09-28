// Run with: yarn test:units   (node --test, no extra dependencies)
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {
  bsWeapons,
  defaultWeapon,
  deriveInputs,
  effectiveTraits,
  isBsAttackWeapon,
  loadoutLabels,
  matchupTraits,
  pseudoWeapons,
  rangeModFor,
  resolveSelection,
  searchKey,
  applyStatOverrides,
  attackStat,
} from './profileToInputs.js';

const RIFLE_RANGES = [{to: 40, mod: 3}, {to: 80, mod: -3}, {to: 120, mod: -6}];
const W = {
  1: [{name: 'Combi Rifle', mode: null, ammo: 'N', burst: 3, dmg: 7, saving: 'ARM', saves: '1', props: ['Suppressive Fire'], ranges: RIFLE_RANGES}],
  2: [
    {name: 'MULTI Rifle', mode: 'AP Mode', ammo: 'AP', burst: 3, dmg: 7, saving: 'ARM/2', saves: '1', props: [], ranges: RIFLE_RANGES},
    {name: 'MULTI Rifle', mode: 'Shock Mode', ammo: 'Shock', burst: 3, dmg: 7, saving: 'ARM', saves: '1', props: [], ranges: RIFLE_RANGES},
  ],
  3: [{name: 'Heavy Flamethrower', mode: null, ammo: 'Fire', burst: 1, dmg: 6, saving: 'ARM', saves: '1', props: ['Direct Template (Large Teardrop)', 'Continous Damage'], ranges: null}],
  4: [{name: 'Viral Combi Rifle', mode: null, ammo: 'N', burst: 3, dmg: 7, saving: 'BTS', saves: '1', props: ['Bioweapon (DA+SHOCK)', 'Suppressive Fire'], ranges: RIFLE_RANGES}],
  5: [{name: 'Plasma Carbine', mode: 'Hit Mode', ammo: 'N', burst: 2, dmg: 6, saving: 'ARM and BTS', saves: '1 and 1', props: [], ranges: RIFLE_RANGES}],
  6: [{name: 'Heavy Pistol', mode: null, ammo: 'Shock', burst: 2, dmg: 6, saving: 'ARM', saves: '1', props: [], ranges: [{to: 20, mod: 3}, {to: 40, mod: 0}, {to: 60, mod: -6}]}],
  7: [{name: 'Heavy Machine Gun', mode: null, ammo: 'N', burst: 4, dmg: 5, saving: 'ARM', saves: '1', props: [], ranges: [{to: 20, mod: -3}, {to: 40, mod: 0}, {to: 80, mod: 3}, {to: 120, mod: -3}]}],
  8: [{name: 'CC Weapon', mode: null, ammo: 'N', burst: null, dmg: 7, saving: 'ARM', saves: '1', props: ['CC'], ranges: null}],
  9: [{name: 'Missile Launcher', mode: 'Hit Mode', ammo: 'Exp', burst: 1, dmg: 6, saving: 'ARM', saves: '3', props: [], ranges: RIFLE_RANGES}],
  10: [{name: 'T2 Rifle', mode: null, ammo: 'T2', burst: 3, dmg: 6, saving: 'ARM', saves: '1', props: [], ranges: RIFLE_RANGES}],
  11: [
    {name: 'Plasma Carbine', mode: 'Hit Mode', ammo: 'N', burst: 2, dmg: 6, saving: 'ARM and BTS', saves: '1 and 1', props: [], ranges: RIFLE_RANGES},
    {name: 'Plasma Carbine', mode: 'Blast Mode', ammo: 'N', burst: 2, dmg: 7, saving: 'ARM and BTS', saves: '1 and 1', props: ['Impact Template (Circular)'], ranges: RIFLE_RANGES},
  ],
  12: [{name: 'Panzerfaust', mode: null, ammo: 'AP+Exp', burst: 1, dmg: 6, saving: 'ARM/2', saves: '3', props: ['Anti-materiel', 'Disposable (2)'], ranges: RIFLE_RANGES}],
  13: [{name: 'K1 Combi Rifle', mode: null, ammo: 'N', burst: 3, dmg: 7, saving: 'ARM=0', saves: '1', props: ['Anti-materiel', 'Suppressive Fire'], ranges: RIFLE_RANGES}],
  14: [{name: 'Vulkan Shotgun', mode: null, ammo: 'AP', burst: 2, dmg: 6, saving: 'ARM/2', saves: '1', props: ['Continous Damage'], ranges: RIFLE_RANGES}],
  15: [{name: 'Breaker Rifle', mode: null, ammo: 'AP', burst: 3, dmg: 7, saving: 'BTS/2', saves: '1', props: ['Suppressive Fire'], ranges: RIFLE_RANGES}],
  16: [{name: 'E/Mitter', mode: null, ammo: 'E/M', burst: 2, dmg: 7, saving: 'BTS/2', saves: '2', props: ['Non-lethal', '[**]'], ranges: RIFLE_RANGES}],
  17: [{name: 'Flash Pulse', mode: null, ammo: 'Stun', burst: 1, dmg: 7, saving: 'BTS', saves: '1', props: ['BS Weapon (WIP)', 'State: Stunned', 'Non-lethal'], ranges: RIFLE_RANGES}],
  19: [{name: 'Light Rocket Launcher', mode: 'Blast Mode', ammo: 'N', burst: 2, dmg: 6, saving: 'ARM', saves: '1', props: ['Continous Damage', 'Impact Template (Circular)'], ranges: RIFLE_RANGES}],
  18: [{name: 'Sepsitor', mode: null, ammo: null, burst: 1, dmg: 4, saving: 'BTS', saves: '1', props: ['Intuitive Attack', 'Disposable (2)', 'State: Sepsitorized', 'Direct Template (Large Teardrop)', '[*]'], ranges: null}],
};

const profile = (over = {}) => ({id: 1, name: 'P', bs: 12, ph: 12, arm: 2, bts: 3, w: 1, skills: [], equip: [], ...over});
const option = (weapons, over = {}) => ({id: 1, name: 'O', points: 10, swc: '0', weapons, skills: [], equip: [], ...over});
const side = (p, o, weaponKey, inCover = false) => {
  const traits = effectiveTraits(p, o);
  const weapon = bsWeapons(o, W).find((w) => w.key === weaponKey) ?? pseudoWeapons(p, traits).find((w) => w.key === weaponKey) ?? null;
  return {profile: p, option: o, traits, weapon, inCover};
};
const combi = option([{id: 1, name: 'Combi Rifle'}, {id: 8, name: 'CC Weapon'}]);

test('bsWeapons expands modes and drops CC weapons', () => {
  const o = option([{id: 2, name: 'MULTI Rifle'}, {id: 3, name: 'Heavy Flamethrower'}, {id: 8, name: 'CC Weapon'}]);
  const keys = bsWeapons(o, W).map((w) => w.key);
  assert.deepEqual(keys, ['2:AP Mode', '2:Shock Mode', '3:']);
  assert.equal(isBsAttackWeapon(W[8][0]), false);
});

const pick = (weapons, role) => defaultWeapon(bsWeapons(option(weapons), W), role)?.key ?? null;

test('defaultWeapon (active) takes the highest burst, loadout +B included', () => {
  assert.equal(pick([{id: 6, name: 'Heavy Pistol'}, {id: 1, name: 'Combi Rifle'}, {id: 7, name: 'HMG'}], 'active'), '7:');
  assert.equal(pick([{id: 1, name: 'Combi Rifle'}, {id: 6, name: 'Heavy Pistol', extra: ['+2B']}], 'active'), '6:');
});

test('defaultWeapon (active) breaks burst ties by Blast Mode, then ammo', () => {
  assert.equal(pick([{id: 11, name: 'Plasma Carbine'}], 'active'), '11:Blast Mode');
  assert.equal(pick([{id: 1, name: 'Combi Rifle'}, {id: 2, name: 'MULTI Rifle'}], 'active'), '2:Shock Mode');
  assert.equal(pick([{id: 2, name: 'MULTI Rifle'}, {id: 4, name: 'Viral Combi Rifle'}], 'active'), '4:');
});

test('defaultWeapon (reactive) prefers +1 SD, then Blast Mode, then ammo', () => {
  assert.equal(pick([{id: 11, name: 'Plasma Carbine'}, {id: 1, name: 'Combi Rifle', extra: ['+1SD']}], 'reactive'), '1:');
  assert.equal(pick([{id: 12, name: 'Panzerfaust'}, {id: 19, name: 'Light Rocket Launcher'}], 'reactive'), '19:Blast Mode');
  assert.equal(pick([{id: 7, name: 'HMG'}, {id: 6, name: 'Heavy Pistol'}], 'reactive'), '6:');
});

test('defaultWeapon ammo precedence is PLASMA > EXP > DA > Shock > N', () => {
  const order = [{id: 1, name: 'Combi Rifle'}, {id: 6, name: 'Heavy Pistol'}, {id: 4, name: 'Viral Combi Rifle'},
    {id: 9, name: 'Missile Launcher'}, {id: 5, name: 'Plasma Carbine'}];
  const picks = [];
  for (let n = order.length; n > 0; n -= 1) picks.push(pick(order.slice(0, n), 'reactive'));
  assert.deepEqual(picks, ['5:Hit Mode', '9:Hit Mode', '4:', '6:', '1:']);
});

test('defaultWeapon ranks other ammo with N and keeps menu order on ties', () => {
  assert.equal(pick([{id: 15, name: 'Breaker Rifle'}, {id: 1, name: 'Combi Rifle'}], 'reactive'), '15:');
  assert.equal(pick([{id: 1, name: 'Combi Rifle'}, {id: 10, name: 'T2 Rifle'}], 'active'), '1:');
  assert.equal(defaultWeapon([], 'active'), null);
});

test('rangeModFor uses the shared distance band', () => {
  assert.equal(rangeModFor(W[1][0], 40), 3);
  assert.equal(rangeModFor(W[1][0], 60), -3);
  assert.equal(rangeModFor(W[6][0], 120), null);
  assert.equal(rangeModFor(W[3][0], 120), 0);
});

test('X Visor softens negative range MODs', () => {
  const xVisor = {equip: [{id: 117, name: 'X Visor'}]};
  const plasma = army.weapons[111].find((r) => r.mode === 'Hit Mode');
  assert.deepEqual([40, 80, 100, 120].map((cm) => rangeModFor(plasma, cm)), [3, -3, -6, null]);
  assert.deepEqual([40, 80, 100, 120].map((cm) => rangeModFor(plasma, cm, xVisor)), [3, 0, -3, null]);
  const hatamoto = byIsc('Hatamoto Imperial Guard');
  const active = resolveSelection(army, {unitId: hatamoto.id, factionId: 1102, optionId: 1, weaponKey: '111:Hit Mode'});
  const reactive = side(profile({arm: 3}), combi, '1:');
  assert.equal(deriveInputs({active, reactive, rangeCm: 80}).inputs.successValueA, 13);
});

test('combi vs combi at 8-16", reactive in cover', () => {
  const r = deriveInputs({active: side(profile({bs: 13}), combi, '1:'), reactive: side(profile(), combi, '1:', true), rangeCm: 40});
  assert.equal(r.ok, true);
  assert.equal(r.inputs.successValueA, 13);   // 13 + 3 range - 3 cover
  assert.equal(r.inputs.burstA, 3);
  assert.equal(r.inputs.damageA, 7);
  assert.equal(r.inputs.ammoA, 'N');
  assert.equal(r.inputs.armB, 5);             // 2 + 3 cover
  assert.equal(r.inputs.btsB, 6);
  assert.equal(r.inputs.successValueB, 15);   // 12 + 3 range, attacker not in cover
  assert.equal(r.inputs.burstB, 1);           // ARO burst
  assert.equal(r.inputs.armA, 2);
  assert.equal(r.inputs.dtwVsDodge, false);
  assert.equal(r.inputs.fixedFaceToFace, false);
});

test('mimetism and MSV', () => {
  const mim3 = profile({skills: [{id: 28, name: 'Mimetism', extra: ['-3']}]});
  const mim6 = profile({skills: [{id: 28, name: 'Mimetism', extra: ['-6']}]});
  const msv1 = profile({equip: [{id: 114, name: 'Multispectral Visor L1'}]});
  const msv2 = profile({equip: [{id: 115, name: 'Multispectral Visor L2'}]});
  const sv = (a, b) => deriveInputs({active: side(a, combi, '1:'), reactive: side(b, combi, '1:'), rangeCm: 40}).inputs.successValueA;
  assert.equal(sv(profile(), mim3), 12);
  assert.equal(sv(profile(), mim6), 9);
  assert.equal(sv(msv1, mim3), 15);
  assert.equal(sv(msv1, mim6), 9);
  assert.equal(sv(msv2, mim6), 15);
});

test('AP halves ARM (rounding up) unless immune; cover added after', () => {
  const multi = option([{id: 2, name: 'MULTI Rifle'}]);
  const arm = (target, inCover = false) =>
    deriveInputs({active: side(profile(), multi, '2:AP Mode'), reactive: side(target, combi, '1:', inCover), rangeCm: 40}).inputs.armB;
  assert.equal(arm(profile({arm: 5})), 3);
  assert.equal(arm(profile({arm: 5}), true), 6);
  assert.equal(arm(profile({arm: 5, skills: [{id: 162, name: 'Immunity', extra: ['AP']}]})), 5);
});

test('ammo mapping from saves / saving', () => {
  const ammo = (id, key) => deriveInputs({active: side(profile(), option([{id, name: 'x'}]), key), reactive: null, rangeCm: 40}).inputs.ammoA;
  assert.equal(ammo(4, '4:'), 'DA');
  assert.equal(ammo(9, '9:Hit Mode'), 'EXP');
  assert.equal(ammo(5, '5:Hit Mode'), 'PLASMA');
  assert.equal(ammo(10, '10:'), 'T2');
  assert.equal(ammo(6, '6:'), 'N');
});

test('BTS weapons put the target BTS into the ARM input', () => {
  const viral = option([{id: 4, name: 'Viral Combi Rifle'}]);
  const r = deriveInputs({active: side(profile(), viral, '4:'), reactive: side(profile({arm: 5, bts: 9}), combi, '1:'), rangeCm: 40});
  assert.equal(r.inputs.armB, 9);
});

test('template weapon forces dodge, sets DTW and continuous damage', () => {
  const flamer = option([{id: 3, name: 'Heavy Flamethrower'}]);
  const target = profile({ph: 13, skills: [{id: 40, name: 'Dodge', extra: ['+3']}]});
  const r = deriveInputs({active: side(profile(), flamer, '3:'), reactive: side(target, combi, '1:'), rangeCm: 20});
  assert.equal(r.inputs.dtwVsDodge, true);
  assert.equal(r.inputs.burstA, 1);
  assert.equal(r.inputs.contA, true);
  assert.equal(r.inputs.ammoB, 'DODGE');
  assert.equal(r.inputs.burstB, 1);
  assert.equal(r.inputs.successValueB, 16);
  assert.ok(r.notes.some((n) => n.includes('Dodge')));
});

test('active Dodge: PH roll, no damage, reactive still shoots', () => {
  const dodger = profile({ph: 13, skills: [{id: 40, name: 'Dodge', extra: ['+3']}]});
  const r = deriveInputs({active: side(dodger, combi, 'dodge'), reactive: side(profile(), combi, '1:', true), rangeCm: 40});
  assert.equal(r.ok, true, r.errors.join('; '));
  assert.equal(r.inputs.ammoA, 'DODGE');
  assert.equal(r.inputs.burstA, 1);
  assert.equal(r.inputs.successValueA, 16);
  assert.equal(r.inputs.dtwVsDodge, false);
  assert.equal(r.inputs.successValueB, 15);   // 12 + 3 range, dodger not in cover
  assert.equal(r.inputs.burstB, 1);
  assert.equal(r.inputs.armA, 2);
  assert.deepEqual(pseudoWeapons(dodger, effectiveTraits(dodger, combi), 'A').map((w) => w.key), ['dodge']);
  assert.deepEqual(pseudoWeapons(dodger, effectiveTraits(dodger, combi), 'B').map((w) => w.key), ['dodge', 'none']);
  const vsTemplate = deriveInputs({active: side(dodger, combi, 'dodge'), reactive: side(profile(), option([{id: 3, name: 'Heavy Flamethrower'}]), '3:'), rangeCm: 20});
  assert.equal(vsTemplate.ok, false);
});

test('reactive burst: total reaction keeps weapon burst, "none" is unopposed', () => {
  const hmg = option([{id: 7, name: 'Heavy Machine Gun'}]);
  const rem = profile({skills: [{id: 61, name: 'Total Reaction'}]});
  assert.equal(deriveInputs({active: side(profile(), combi, '1:'), reactive: side(rem, hmg, '7:'), rangeCm: 40}).inputs.burstB, 4);
  assert.equal(deriveInputs({active: side(profile(), combi, '1:'), reactive: side(profile(), hmg, '7:'), rangeCm: 40}).inputs.burstB, 1);
  const none = deriveInputs({active: side(profile(), combi, '1:'), reactive: side(profile(), hmg, 'none'), rangeCm: 40});
  assert.equal(none.inputs.burstB, 0);
  assert.equal(none.ok, true);
});

test('loadout extras and crit immunity', () => {
  const o = option([{id: 1, name: 'Combi Rifle', extra: ['+1B', 'PS=9']}]);
  const target = profile({skills: [{id: 162, name: 'Immunity', extra: ['Critical']}]});
  const r = deriveInputs({active: side(profile(), o, '1:'), reactive: side(target, combi, '1:'), rangeCm: 40});
  assert.equal(r.inputs.burstA, 4);
  assert.equal(r.inputs.damageA, 9);
  assert.equal(r.inputs.critImmuneB, true);
});

// --- Immunity (ARM) / (BTS) ------------------------------------------------
const immune = (extra, over = {}) => profile({arm: 5, bts: 3, skills: [{id: 162, name: 'Immunity', extra: [extra]}], ...over});
const shotAt = (target, id, key, {extra, inCover = false} = {}) =>
  deriveInputs({
    active: side(profile({wip: 13}), option([{id, name: 'x', ...(extra ? {extra} : {})}]), key),
    reactive: side(target, combi, '1:', inCover),
    rangeCm: 40,
  });

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
  assert.equal(shotAt(dog, 7, '7:', {extra: ['Continous Damage']}).inputs.contA, false);
  assert.equal(shotAt(profile(), 7, '7:', {extra: ['Continous Damage']}).inputs.contA, true);
  // Templates still force the Dodge.
  const flamer = deriveInputs({active: side(profile(), option([{id: 3, name: 'Heavy Flamethrower'}]), '3:'), reactive: side(dog, combi, '1:'), rangeCm: 20}).inputs;
  assert.equal(flamer.contA, false);
  assert.equal(flamer.dtwVsDodge, true);
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
  assert.deepEqual(viral.notes, ['Active: Shock against VITA 1; a failed save is Dead, counted as one extra wound']);
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
  const r = deriveInputs({active: side(dog, combi, '1:'), reactive: side(rem, option([{id: 14, name: 'Vulkan Shotgun'}]), '14:'), rangeCm: 40});
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
  assert.deepEqual(r.notes, ['Active: target has Immunity (ARM); AP+Exp treated as N']);
  assert.deepEqual(r.warnings, []);
  assert.deepEqual(shotAt(dog, 13, '13:').notes, ['Active: target has Immunity (ARM); ARM=0 ignored']);
  assert.deepEqual(shotAt(dog, 1, '1:', {extra: ['AP', 'Continous Damage']}).notes,
    ['Active: target has Immunity (ARM); AP treated as N; Continuous Damage ignored']);
  assert.deepEqual(shotAt(dog, 1, '1:').notes, []);   // plain N: nothing to ignore
  assert.deepEqual(matchupTraits(side(dog, combi, '1:')), ['Immunity (ARM)']);
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
  assert.deepEqual(matchupTraits(side(jinwei, combi, '1:')), ['Immunity (BTS)']);
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

test('Immunity (BTS): E/M has no effect, so it is not rolled and the ARO is a Normal Roll', () => {
  const jinwei = immune('BTS', {bts: 6});
  // E/M is treated as N, and Non-Lethal means no Wounds either.
  const em = shotAt(jinwei, 16, '16:', {extra: ['+1SD']});
  assert.equal(em.ok, true);
  assert.equal(em.inputs.burstA, 0);
  assert.equal(em.inputs.bonusBurstA, 0);
  assert.equal(em.inputs.burstB, 1);               // the ARO, unopposed
  assert.equal(em.inputs.ammoB, 'N');
  assert.deepEqual(em.warnings, ['Active: E/Mitter has no effect on a target with Immunity (BTS); not rolled']);
  assert.deepEqual(em.notes, []);
  const plain = shotAt(profile({bts: 6}), 16, '16:', {extra: ['+1SD']});
  assert.equal(plain.inputs.burstA, 2);
  assert.equal(plain.inputs.bonusBurstA, 1);
  assert.equal(plain.inputs.ammoA, 'DA');
  assert.equal(plain.inputs.armB, 3);
  assert.deepEqual(plain.warnings, ['Active: E/Mitter is non-lethal; results shown as wounds']);
  // In ARO too: the active shot becomes the Normal Roll.
  const emitter = side(profile(), option([{id: 16, name: 'E/Mitter'}]), '16:');
  const aro = deriveInputs({active: side(jinwei, combi, '1:'), reactive: emitter, rangeCm: 40});
  assert.equal(aro.inputs.burstB, 0);
  assert.equal(aro.inputs.bonusBurstB, 0);
  assert.equal(aro.inputs.burstA, 3);
  assert.deepEqual(aro.warnings, ['Reactive: E/Mitter has no effect on a target with Immunity (BTS); not rolled']);
  // Nothing rolled at all when neither attack can do anything.
  const both = deriveInputs({active: side(jinwei, option([{id: 16, name: 'E/Mitter'}]), '16:'), reactive: side(jinwei, option([{id: 16, name: 'E/Mitter'}]), '16:'), rangeCm: 40});
  assert.equal(both.ok, true);
  assert.equal(both.inputs.burstA, 0);
  assert.equal(both.inputs.burstB, 0);
  // Immunity (ARM) is no help, Immunity (Enhanced) is.
  assert.equal(shotAt(immune('ARM'), 16, '16:').inputs.burstA, 2);
  assert.deepEqual(shotAt(immune('Enhanced'), 16, '16:').warnings,
    ['Active: E/Mitter has no effect on a target with Immunity (Enhanced); not rolled']);
});

test('Immunity (BTS): a Sepsitor has no effect and forces no Dodge', () => {
  const jinwei = immune('BTS', {bts: 6});
  const sepsitor = (p) => side(p, option([{id: 18, name: 'Sepsitor'}]), '18:');
  // State: Sepsitorized is ignored, so the target may shoot back instead.
  const r = deriveInputs({active: sepsitor(profile()), reactive: side(jinwei, combi, '1:'), rangeCm: 20});
  assert.equal(r.ok, true);
  assert.equal(r.inputs.burstA, 0);
  assert.equal(r.inputs.dtwVsDodge, false);
  assert.equal(r.inputs.ammoB, 'N');
  assert.equal(r.inputs.burstB, 1);
  assert.deepEqual(r.notes, []);
  assert.deepEqual(r.warnings, ['Active: Sepsitor has no effect on a target with Immunity (BTS); not rolled']);
  const plain = deriveInputs({active: sepsitor(profile()), reactive: side(profile(), combi, '1:'), rangeCm: 20});
  assert.equal(plain.inputs.burstA, 1);
  assert.equal(plain.inputs.dtwVsDodge, true);
  assert.equal(plain.inputs.ammoB, 'DODGE');
  // An active Dodge is fine against a reactive template that can do nothing.
  const dodge = deriveInputs({active: side(jinwei, combi, 'dodge'), reactive: sepsitor(profile()), rangeCm: 20});
  assert.equal(dodge.ok, true, dodge.errors.join('; '));
  assert.equal(dodge.inputs.burstB, 0);
  assert.equal(deriveInputs({active: side(profile(), combi, 'dodge'), reactive: sepsitor(profile()), rangeCm: 20}).ok, false);
});

test('Immunity (BTS): Flash Pulse still stuns, as a Face to Face Roll', () => {
  // Wiki example 4: Non-Lethal and State: Stunned are always applied.
  const flash = shotAt(immune('BTS', {bts: 6}), 17, '17:');
  assert.equal(flash.inputs.burstA, 1);
  assert.equal(flash.inputs.damageA, 7);
  assert.equal(flash.inputs.ammoA, 'N');
  assert.equal(flash.inputs.armB, 6);
  assert.deepEqual(flash.warnings, ['Active: Flash Pulse is non-lethal; results shown as wounds']);
  assert.deepEqual(flash.notes, []);
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
    'Active: Shock against VITA 1; a failed save is Dead, counted as one extra wound',
    'Active: target has Vulnerability (Viral); Immunity (BTS) does not apply',
  ]);
  const breaker = shotAt(chaksa, 15, '15:');
  assert.equal(breaker.inputs.ammoA, 'N');
  assert.equal(breaker.inputs.armB, 5);
  assert.equal(breaker.inputs.critImmuneB, true);
  assert.deepEqual(matchupTraits(side(chaksa, combi, '1:')), ['Immunity (BTS)', 'Immunity (Critical)', 'Vulnerability (Viral)']);
});

test('out of range weapon always fails: success value 0, no error', () => {
  const pistol = option([{id: 6, name: 'Heavy Pistol'}]);
  const r = deriveInputs({active: side(profile(), pistol, '6:'), reactive: side(profile(), combi, '1:'), rangeCm: 120});
  assert.equal(r.ok, true);
  assert.deepEqual(r.errors, []);
  assert.equal(r.inputs.successValueA, 0);
});

test('templates ignore the +3 ARM/BTS from cover but still eat the -3 BS MOD', () => {
  const plasma = option([{id: 11, name: 'Plasma Carbine'}]);
  const target = profile({arm: 4, bts: 6});
  const hit = deriveInputs({active: side(profile(), plasma, '11:Hit Mode'), reactive: side(target, combi, '1:', true), rangeCm: 40});
  const blast = deriveInputs({active: side(profile(), plasma, '11:Blast Mode'), reactive: side(target, combi, '1:', true), rangeCm: 40});
  assert.equal(hit.inputs.armB, 7);
  assert.equal(hit.inputs.btsB, 9);
  assert.equal(blast.inputs.armB, 4);
  assert.equal(blast.inputs.btsB, 6);
  assert.equal(blast.inputs.successValueA, hit.inputs.successValueA);   // cover -3 still applies
  const flamer = deriveInputs({active: side(profile(), option([{id: 3, name: 'Heavy Flamethrower'}]), '3:'), reactive: side(target, combi, '1:', true), rangeCm: 20});
  assert.equal(flamer.inputs.armB, 4);
});

test('No Cover units get nothing from "in cover"', () => {
  const tag = profile({arm: 8, bts: 6, skills: [{id: 264, name: 'No Cover'}]});
  const r = deriveInputs({active: side(profile(), combi, '1:'), reactive: side(tag, combi, '1:', true), rangeCm: 40});
  assert.equal(r.inputs.successValueA, 15);   // no -3 for cover
  assert.equal(r.inputs.armB, 8);
  assert.equal(r.inputs.btsB, 6);
  const normal = deriveInputs({active: side(profile(), combi, '1:'), reactive: side(profile({arm: 8}), combi, '1:', true), rangeCm: 40});
  assert.equal(normal.inputs.successValueA, 12);
  assert.equal(normal.inputs.armB, 11);
});

test('unsupported traits are reported as warnings', () => {
  const p = profile({skills: [{id: 191, name: 'Surprise Attack', extra: ['-3']}, {id: 156, name: 'Marksmanship'}]});
  const r = deriveInputs({active: side(p, combi, '1:'), reactive: side(profile(), combi, '1:'), rangeCm: 40});
  assert.ok(r.warnings.some((n) => n === 'Support for Surprise Attack, Marksmanship not implemented yet'), r.warnings.join(' | '));
});

test('Shock takes effect on VITA 1 targets only, unless immune', () => {
  const W2 = {...W, 12: [{name: 'Uragan MRL', mode: 'Hit Mode', ammo: 'AP+Shock', burst: 3, dmg: 6, saving: 'ARM/2', saves: '1', props: [], ranges: RIFLE_RANGES}]};
  const shooter = (id, key) => {
    const o = option([{id, name: 'x'}]);
    return {...side(profile(), o, null), weapon: bsWeapons(o, W2).find((w) => w.key === key)};
  };
  const immunity = (extra) => ({skills: [{id: 162, name: 'Immunity', extra: [extra]}]});
  const vs = (id, key, target) =>
    deriveInputs({active: shooter(id, key), reactive: side(profile({arm: 5, bts: 6, ...target}), combi, '1:'), rangeCm: 40});

  // Shock, AP+Shock, Bioweapon (DA+SHOCK)
  for (const [id, key] of [[6, '6:'], [12, '12:Hit Mode'], [4, '4:']]) {
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
  assert.equal(deriveInputs({active: side(profile(), combi, '1:'), reactive: side(profile(), combi, '1:'), rangeCm: 40}).inputs.shockA, false);
  const pistol = option([{id: 6, name: 'Heavy Pistol'}]);
  const aro = (target) => deriveInputs({active: side(profile(target), combi, '1:'), reactive: side(profile(), pistol, '6:'), rangeCm: 20});
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
  const dodgeA = deriveInputs({active: side(profile(), pistol, 'dodge'), reactive: side(profile(), combi, '1:'), rangeCm: 20});
  assert.equal(dodgeA.inputs.shockA, false);
  for (const key of ['dodge', 'none']) {
    const r = deriveInputs({active: side(profile(), combi, '1:'), reactive: side(profile(), pistol, key), rangeCm: 20});
    assert.equal(r.inputs.shockB, false, key);
  }
  // Forced to Dodge by a template, with a Shock weapon still selected.
  const forced = deriveInputs({active: side(profile(), armed, '3:'), reactive: side(profile(), pistol, '6:'), rangeCm: 20});
  assert.equal(forced.inputs.ammoB, 'DODGE');
  assert.equal(forced.inputs.shockB, false);
});

test('Albedo penalises MSV and Marksmanship attackers only', () => {
  const albedo6 = profile({equip: [{id: 183, name: 'Albedo', extra: ['-6']}]});
  const plain = profile();
  const msv1 = profile({equip: [{id: 114, name: 'Multispectral Visor L1'}]});
  const msv2 = profile({equip: [{id: 115, name: 'Multispectral Visor L2'}]});
  const marksman = profile({skills: [{id: 156, name: 'Marksmanship'}]});
  const sv = (a, b) => deriveInputs({active: side(a, combi, '1:'), reactive: side(b, combi, '1:'), rangeCm: 40});
  assert.equal(sv(plain, albedo6).inputs.successValueA, 15);          // no visor, no effect
  assert.equal(sv(msv1, albedo6).inputs.successValueA, 9);            // 12 + 3 - 6
  assert.equal(sv(marksman, albedo6).inputs.successValueA, 9);
  const mimAlbedo = profile({skills: [{id: 28, name: 'Mimetism', extra: ['-3']}], equip: [{id: 183, name: 'Albedo', extra: ['-3']}]});
  assert.equal(sv(msv2, mimAlbedo).inputs.successValueA, 12);        // mimetism cancelled, albedo -3
  assert.equal(sv(plain, mimAlbedo).inputs.successValueA, 12);       // mimetism -3, no albedo
});

test('Nanoscreen works like cover, also against templates, and does not stack with cover', () => {
  const nano = profile({arm: 4, bts: 6, equip: [{id: 108, name: 'Nanoscreen'}]});
  const open = deriveInputs({active: side(profile(), combi, '1:'), reactive: side(nano, combi, '1:'), rangeCm: 40});
  assert.equal(open.inputs.successValueA, 12);   // 12 + 3 range - 3 nanoscreen
  assert.equal(open.inputs.armB, 7);
  assert.equal(open.inputs.btsB, 9);
  const covered = deriveInputs({active: side(profile(), combi, '1:'), reactive: side(nano, combi, '1:', true), rangeCm: 40});
  assert.equal(covered.inputs.successValueA, 12);
  assert.equal(covered.inputs.armB, 7);
  const plasma = option([{id: 11, name: 'Plasma Carbine'}]);
  const blast = deriveInputs({active: side(profile(), plasma, '11:Blast Mode'), reactive: side(nano, combi, '1:', true), rangeCm: 40});
  assert.equal(blast.inputs.armB, 7);            // cover ignored by the template, nanoscreen still applies
  assert.equal(blast.inputs.btsB, 9);
  const noCoverNano = profile({arm: 2, skills: [{id: 264, name: 'No Cover'}], equip: [{id: 108, name: 'Nanoscreen'}]});
  const r = deriveInputs({active: side(profile(), combi, '1:'), reactive: side(noCoverNano, combi, '1:', true), rangeCm: 40});
  assert.equal(r.inputs.successValueA, 12);
  assert.equal(r.inputs.armB, 5);
});

// --- real data -------------------------------------------------------------
const army = JSON.parse(readFileSync(new URL('../data/army.json', import.meta.url), 'utf8'));
const byIsc = (isc) => army.units.find((u) => u.isc === isc);

test('Hatamoto: six distinguishable loadouts and only BS weapons listed', () => {
  const hatamoto = byIsc('Hatamoto Imperial Guard');
  const group = hatamoto.byFaction['1102'].groups[0];
  const labels = loadoutLabels(group, army.weapons).map((l) => l.label);
  assert.equal(labels.length, 6);
  assert.equal(new Set(labels).size, 6);
  assert.match(labels[0], /Plasma Carbine/);
  assert.match(labels[0], /NCO/);
  assert.doesNotMatch(labels[0], /Heavy Pistol/);
  const names = bsWeapons(group.options[0], army.weapons).map((w) => w.label);
  assert.equal(names.length, 3);
  assert.ok(names.every((n) => /Plasma Carbine|Heavy Pistol/.test(n)));
});

test('matchupTraits lists only the traits the converter uses', () => {
  const hatamoto = byIsc('Hatamoto Imperial Guard');
  const active = resolveSelection(army, {unitId: hatamoto.id, factionId: 1102, optionId: 1, weaponKey: '111:Hit Mode', inCover: true});
  assert.deepEqual(matchupTraits(active), ['Mimetism (-3)', 'No Cover', 'Nanoscreen', 'X Visor']);
  const plain = side(profile({arm: 3}), combi, '1:', true);
  assert.deepEqual(matchupTraits(plain), ['In cover']);
  const dodger = side(profile({skills: [{id: 40, name: 'Dodge', extra: ['+3']}, {id: 162, name: 'Immunity', extra: ['Shock']}]}), combi, 'dodge');
  assert.deepEqual(matchupTraits(dodger), ['Immunity (Shock)', 'Dodge +3']);
  assert.deepEqual(matchupTraits({...dodger, ftSize: 3}), ['Immunity (Shock)', 'Dodge +4']);
});

test('Hatamoto plasma vs Sierra Dronbot HMG at 8-16"', () => {
  const hatamoto = byIsc('Hatamoto Imperial Guard');
  const sierra = byIsc('Sierra Dronbot');
  const active = resolveSelection(army, {unitId: hatamoto.id, factionId: 1102, optionId: 1, weaponKey: '111:Hit Mode'});
  const sierraGroup = sierra.byFaction['107'].groups[0];
  const hmg = bsWeapons(sierraGroup.options[0], army.weapons).find((w) => /Machine Gun/.test(w.name));
  const reactive = resolveSelection(army, {unitId: sierra.id, factionId: 107, optionId: sierraGroup.options[0].id, weaponKey: hmg.key, inCover: true});
  assert.equal(active.factionId, 1102);
  const r = deriveInputs({active, reactive, rangeCm: 40});
  assert.equal(r.ok, true, r.errors.join('; '));
  assert.equal(r.inputs.successValueA, 13);         // BS13 +3 -3 cover
  assert.equal(r.inputs.ammoA, 'PLASMA');
  assert.equal(r.inputs.damageA, 6);
  assert.equal(r.inputs.burstB, hmg.row.burst);     // Total Reaction
  // mimetism -3 and Hatamoto's Nanoscreen -3
  assert.equal(r.inputs.successValueB, sierra.byFaction['107'].groups[0].profiles[0].bs + hmg.row.ranges[1].mod - 6);
  assert.equal(r.inputs.armA, 2 + 3);               // Nanoscreen on saves
  assert.equal(r.inputs.armB, sierraGroup.profiles[0].arm + 3);
});

test('Dog-Warrior shrugs off a Panzerfaust and a K1 (Immunity (ARM))', () => {
  const dog = byIsc('Dog-Warriors');
  const f = dog.inFactions[0];
  const group = dog.byFaction[f].groups[0];
  const form = group.profiles.find((p) => p.name === 'DOG-WARRIOR FORM');
  const o = group.options[0];
  const reactive = resolveSelection(army, {unitId: dog.id, factionId: f, groupId: group.id, profileId: form.id, optionId: o.id, weaponKey: 'dodge'});
  assert.ok(matchupTraits(reactive, 'B').includes('Immunity (ARM)'));
  const find = (name) => Object.entries(army.weapons).find(([, rows]) => rows[0].name === name);
  const shooter = (name) => {
    const [id, rows] = find(name);
    const opt = option([{id: Number(id), name}]);
    const weapon = bsWeapons(opt, army.weapons).find((w) => w.row === rows.find(isBsAttackWeapon));
    return {profile: profile(), option: opt, traits: effectiveTraits(profile(), opt), weapon};
  };
  const pf = deriveInputs({active: shooter('Panzerfaust'), reactive, rangeCm: 40});
  assert.equal(pf.ok, true, pf.errors.join('; '));
  assert.equal(pf.inputs.ammoA, 'N');
  assert.equal(pf.inputs.armB, form.arm);
  assert.ok(!pf.warnings.some((w) => w.includes('Immunity')), pf.warnings.join(' | '));
  const k1 = deriveInputs({active: shooter('K1 Combi Rifle'), reactive, rangeCm: 40});
  assert.equal(k1.inputs.armB, form.arm);
});

test('Chaksa Longarm: Immunity (BTS) against a Breaker, not against Viral', () => {
  const chaksa = byIsc('Chaksa Longarms');
  const f = chaksa.inFactions[0];
  const group = chaksa.byFaction[f].groups[0];
  const reactive = resolveSelection(army, {unitId: chaksa.id, factionId: f, groupId: group.id, optionId: group.options[0].id, weaponKey: 'dodge'});
  const bts = reactive.profile.bts;
  const shooter = (name) => {
    const [id] = Object.entries(army.weapons).find(([, rows]) => rows[0].name === name);
    const opt = option([{id: Number(id), name}]);
    return {profile: profile(), option: opt, traits: effectiveTraits(profile(), opt), weapon: bsWeapons(opt, army.weapons)[0]};
  };
  const breaker = deriveInputs({active: shooter('Breaker Rifle'), reactive, rangeCm: 40});
  assert.equal(breaker.ok, true, breaker.errors.join('; '));
  assert.equal(breaker.inputs.ammoA, 'N');
  assert.equal(breaker.inputs.armB, bts);
  const viral = deriveInputs({active: shooter('VIRAL Sniper Rifle'), reactive, rangeCm: 40});
  assert.equal(viral.inputs.ammoA, 'DA');
  assert.ok(viral.notes.some((n) => n.includes('Vulnerability (Viral)')), viral.notes.join(' | '));
});

test('searchKey folds case and accents', () => {
  assert.equal(searchKey('Nøkken'), 'nokken');
  assert.equal(searchKey('Kōsuke ÉLITE'), 'kosuke elite');
  assert.equal(searchKey('Ǎnzhàn'), 'anzhan');
});

test('fireteam size sets cumulative bonuses', () => {
  const at = (ftSize, weaponKey = '1:') => ({...side(profile({ph: 11}), combi, weaponKey), ftSize});
  const shoot = (n) => deriveInputs({active: at(n), reactive: at(n), rangeCm: 40}).inputs;
  assert.deepEqual([0, 2, 3, 4, 5].map((n) => shoot(n).bonusBurstA), [0, 1, 1, 1, 1]);
  assert.deepEqual([0, 2, 3, 4, 5].map((n) => shoot(n).successValueA), [15, 15, 15, 16, 16]);
  assert.equal(shoot(4).bonusBurstB, 1);
  assert.equal(shoot(4).burstB, 1);

  const dodge = (n) => deriveInputs({active: at(1), reactive: at(n, 'dodge'), rangeCm: 40}).inputs.successValueB;
  assert.deepEqual([0, 2, 3].map(dodge), [11, 11, 12]);

  assert.deepEqual(matchupTraits(at(3)), ['+1SD']);
  assert.deepEqual(matchupTraits(at(4)), ['+1SD', 'BS+1']);
  assert.ok(deriveInputs({active: at(5), reactive: at(1), rangeCm: 40}).warnings.some((n) => n.includes('Sixth Sense')));

  const flamer = option([{id: 3, name: 'Heavy Flamethrower'}]);
  const t = deriveInputs({active: {...side(profile(), flamer, '3:'), ftSize: 4}, reactive: at(1), rangeCm: 20});
  assert.equal(t.inputs.bonusBurstA, 0);
});

test('BS Attack skill SD / B stack with Fireteam and loadout extras', () => {
  const crux = profile({skills: [{id: 201, name: 'BS Attack', extra: ['+1SD']}]});
  const x = {...side(crux, combi, '1:'), ftSize: 2};
  const r = deriveInputs({active: x, reactive: x, rangeCm: 40}).inputs;
  assert.equal(r.bonusBurstA, 2);
  assert.equal(r.bonusBurstB, 2);
  assert.deepEqual(matchupTraits(x), ['+2SD']);

  const gecko = profile({skills: [{id: 201, name: 'BS Attack', extra: ['+1B']}]});
  const g = side(gecko, combi, '1:');
  const rg = deriveInputs({active: g, reactive: g, rangeCm: 40}).inputs;
  assert.equal(rg.burstA, 4);
  assert.equal(rg.burstB, 1);
  assert.deepEqual(matchupTraits(g, 'A'), ['+1B']);
  assert.deepEqual(matchupTraits(g, 'B'), []);
});

test('template burst comes from loadout extras (Dog-Warrior B2 Chain Rifle)', () => {
  const chain = option([{id: 3, name: 'Heavy Flamethrower', extra: ['+1B']}]);
  const x = {...side(profile(), chain, '3:'), ftSize: 4};
  assert.match(bsWeapons(chain, W)[0].label, / · B2 · /);
  const r = deriveInputs({active: x, reactive: side(profile(), combi, '1:'), rangeCm: 20}).inputs;
  assert.equal(r.burstA, 2);
  assert.equal(r.bonusBurstA, 0);
  assert.equal(r.dtwVsDodge, true);
  assert.deepEqual(matchupTraits(x), []);
});

test('loadout labels: same-playing loadouts collapse to the lowest SWC/pts, extras disambiguate', () => {
  const w = [{id: 1, name: 'Combi Rifle'}, {id: 8, name: 'CC Weapon'}];
  const group = {options: [
    option(w, {id: 1, points: 12, swc: '0.5'}),
    option([...w].reverse(), {id: 2, points: 9}),
    option(w, {id: 3, points: 10}),
    option([{id: 1, name: 'Combi Rifle', extra: ['+1B']}, w[1]], {id: 4}),
    option([{id: 1, name: 'Combi Rifle', extra: ['+1B']}, w[1]], {id: 5}),
  ]};
  assert.deepEqual(loadoutLabels(group, W), [
    {id: 1, label: 'Combi Rifle', swc: '0+', points: '9+', detail: 'CC Weapon'},
    {id: 4, label: 'Combi Rifle (+1B)', swc: '0', points: '10', detail: 'CC Weapon'},
  ]);
});

test('loadout labels: name, then abbreviated skills and equipment, then weapons', () => {
  const group = {options: [
    option([{id: 1, name: 'Combi Rifle'}], {id: 1, skills: [{id: 64, name: 'Paramedic'}], equip: [{id: 106, name: 'MediKit'}]}),
    option([{id: 7, name: 'Heavy Machine Gun'}], {
      id: 2,
      name: 'O FTO',
      skills: [{id: 119, name: 'Lieutenant', extra: ['+1 Order']}],
      equip: [{id: 115, name: 'Multispectral Visor L2'}],
    }),
  ]};
  assert.deepEqual(loadoutLabels(group, W).map((l) => l.label), [
    'O · Paramedic, MediKit · Combi Rifle',
    'O FTO · Lt (+1 Order), MSV2 · Heavy Machine Gun',
  ]);
});

test('loadout detail: weapons the label leaves out, alternatives over collapsed loadouts', () => {
  const rifle = {id: 1, name: 'Combi Rifle'};
  const pistol = {id: 6, name: 'Heavy Pistol'};
  const cc = {id: 8, name: 'CC Weapon'};
  const da = {id: 8, name: 'DA CC Weapon'};
  const mines = {id: 99, name: 'Mines'};
  // First row of a group whose other row also has the pistol, so the label drops it.
  const first = (...loadouts) => loadoutLabels({options: [
    ...loadouts.map((weapons, i) => option(weapons, {id: i + 1})),
    option([{id: 7, name: 'Heavy Machine Gun'}, pistol], {id: 9}),
  ]}, W)[0];
  assert.deepEqual(first([rifle, pistol, cc]),
    {id: 1, label: 'Combi Rifle', swc: '0', points: '10', detail: 'Heavy Pistol, CC Weapon'});
  assert.equal(first([rifle, pistol, cc], [rifle, pistol, cc, mines]).detail, 'Heavy Pistol, CC Weapon · optional Mines');
  assert.equal(first([rifle, pistol, cc], [rifle, pistol, da]).detail, 'Heavy Pistol · CC Weapon or DA CC Weapon');
  assert.equal(loadoutLabels({options: [option([rifle])]}, W)[0].detail, '');
});

test('loadout stat overrides (BS=11, BTS=3) replace the profile stat', () => {
  const p = profile({bs: 5, bts: 0});
  const o = option([], {skills: [{id: 279, name: 'BS=11'}, {id: 280, name: 'BTS=3'}]});
  const q = applyStatOverrides(p, o);
  assert.equal(q.bs, 11);
  assert.equal(q.bts, 3);
  assert.equal(p.bs, 5);                        // original untouched

  const polaris = byIsc('Polaris Team');
  const f = polaris.inFactions[0];
  const group = polaris.byFaction[f].groups.find((g) => g.options.some((x) => x.skills.some((sk) => sk.name === 'BS=11')));
  const beta = group.options.find((x) => x.skills.some((sk) => sk.name === 'BS=11'));
  const r = resolveSelection(army, {unitId: polaris.id, factionId: f, groupId: group.id, optionId: beta.id});
  assert.equal(r.profile.bs, 11);
});

test('BS Weapon (PH) / (WIP) roll against PH / WIP', () => {
  const p = profile({bs: 5, ph: 16, wip: 12});
  assert.equal(attackStat(p, {props: ['BS Weapon (PH)']}), 16);
  assert.equal(attackStat(p, {props: ['BS Weapon (WIP)']}), 12);
  assert.equal(attackStat(p, {props: []}), 5);

  const polaris = byIsc('Polaris Team');
  const f = polaris.inFactions[0];
  const group = polaris.byFaction[f].groups.find((g) => g.profiles[0].ph === 16);
  const o = group.options[0];
  const grenades = bsWeapons(o, army.weapons).find((w) => w.name === 'Grenades');
  const x = resolveSelection(army, {unitId: polaris.id, factionId: f, groupId: group.id, optionId: o.id, weaponKey: grenades.key});
  const r = deriveInputs({active: x, reactive: null, rangeCm: 20}).inputs;
  assert.equal(r.successValueA, 16 + rangeModFor(grenades.row, 20));
});

test('a side without a weapon yet: no error shown, but not ready to apply', () => {
  const r = deriveInputs({active: side(profile(), combi, null), reactive: side(profile(), combi, '1:'), rangeCm: 40});
  assert.deepEqual(r.errors, []);
  assert.equal(r.ok, false);
});

test('Team-Ops upgrades: stat, equipment, TacBall weapon, unsupported weapon warning', () => {
  const unit = byIsc('Combined Army Team-Ops');
  const f = unit.inFactions[0];
  const group = unit.byFaction[f].groups[0];
  const o = group.options[0];
  const idx = (list, label) => list.findIndex((i) => i.label === label);
  const base = resolveSelection(army, {unitId: unit.id, factionId: f, groupId: group.id, optionId: o.id});
  const pick = (upgrade, ball = null) =>
    resolveSelection(army, {unitId: unit.id, factionId: f, groupId: group.id, optionId: o.id, upgrade, ball});

  assert.equal(pick(idx(unit.upgrades.chart, 'BS+1')).profile.bs, base.profile.bs + 1);
  assert.ok(pick(idx(unit.upgrades.chart, 'Multispectral Visor L1')).traits.equip.some((e) => e.name === 'Multispectral Visor L1'));

  const tac = pick(null, idx(unit.upgrades.ball, 'Plasma Carbine'));
  assert.ok(bsWeapons(tac.option, army.weapons).some((w) => w.name === 'Plasma Carbine'));
  assert.deepEqual(matchupTraits(tac).includes('Plasma Carbine'), true);

  const mines = pick(idx(unit.upgrades.chart, 'Minelayer, Shock Mine'));
  const w = bsWeapons(mines.option, army.weapons)[0];
  const r = deriveInputs({active: {...mines, weapon: w}, reactive: null, rangeCm: 40});
  assert.ok(r.warnings.some((x) => x === 'Active: Shock Mine (upgrade) not supported by the calculator'), r.warnings.join(' | '));
});

test('Spec-Ops charts are not applied (deferred)', () => {
  const unit = byIsc('Nexus-7 Spec-Ops');
  const f = unit.inFactions[0];
  const group = unit.byFaction[f].groups[0];
  const sel = {unitId: unit.id, factionId: f, groupId: group.id, profileId: group.profiles[0].id, optionId: group.options[0].id};
  const base = resolveSelection(army, sel);
  const up = resolveSelection(army, {...sel, upgrade: 1, ball: 0});
  assert.equal(up.profile.bs, base.profile.bs);
  assert.deepEqual(up.upgrades, []);
  for (const p of group.profiles) {
    const x = resolveSelection(army, {...sel, profileId: p.id});
    const w = bsWeapons(x.option, army.weapons)[0];
    const r = deriveInputs({active: {...x, weapon: w}, reactive: {...x, weapon: w}, rangeCm: 40});
    // Once, even with Spec-Ops on both sides.
    assert.equal(r.warnings.filter((m) => m === 'Spec-Ops upgrades and SpecBall not supported yet').length, 1, `${p.name}: ${r.warnings.join(' | ')}`);
  }
});
