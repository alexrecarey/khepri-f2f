// The roll itself: range bands, templates, the Dodge and No ARO, bursts in ARO,
// a split range, loadout extras, stats and their limits, Team-Ops. Each rule
// with a file of its own sits next to this one (immunity, cover, bsAttack...);
// the fixtures are testFixtures.mjs and testMatchups.mjs.
// Run with: yarn test:js
import test from 'node:test';
import assert from 'node:assert/strict';
import {applyStatOverrides} from '../army/loadouts.js';
import {statOverrides} from '../army/normalize.js';
import {effectiveTraits} from '../army/traits.js';
import {bsWeapons} from '../army/weapons.js';
import {buildLedger} from './ledger.js';
import {derive, deriveInputs, option, profile} from './testFixtures.mjs';
import {army} from '../army/testArmy.mjs';
import {tEn} from '../i18n/index.js';
import {attackStat} from './modifiers.js';
import {rangeModFor} from './ranges.js';
import {pseudoWeapons, resolveSelection} from './trooper.js';
import {W, side, combi, pick, DIRECT_TEMPLATE_NOTE, label, byIsc, minus3, flamer, duel, at, shooter, dodger} from './testMatchups.mjs';

/** @typedef {import('../types.js').WeaponRow} WeaponRow */
/** @typedef {import('../types.js').WeaponEntry} WeaponEntry */
/** @typedef {import('../types.js').OptionRow} OptionRow */
/** @typedef {import('../types.js').Traits} Traits */
/** @typedef {import('../types.js').Trooper} Trooper */
/** @typedef {import('../types.js').LedgerSide} LedgerSide */

test('rangeModFor uses the shared distance band', () => {
  assert.equal(rangeModFor(W[1][0], 40), 3);
  assert.equal(rangeModFor(W[1][0], 60), -3);
  assert.equal(rangeModFor(W[6][0], 120), null);
  assert.equal(rangeModFor(W[3][0], 120), 0);
});

test('X Visor softens negative range MODs', () => {
  const xVisor = /** @type {Traits} */ ({equip: [{id: 117, name: 'X Visor'}]});
  const plasma = army.weapons[111].find((r) => r.mode === 'Hit Mode');
  assert.deepEqual([40, 80, 100, 120].map((cm) => rangeModFor(plasma, cm)), [3, -3, -6, null]);
  assert.deepEqual([40, 80, 100, 120].map((cm) => rangeModFor(plasma, cm, xVisor)), [3, 0, -3, null]);
  const hatamoto = byIsc('Hatamoto Imperial Guard');
  const active = resolveSelection(army, {unitId: hatamoto.id, factionId: 1102, optionId: 1, weaponKey: '111:Hit Mode'});
  const reactive = side(profile({arm: 3}), combi, '1:');
  assert.equal(derive({active, reactive, rangeCm: 80}).inputs.successValueA, 13);
});

test('combi vs combi at 8-16", reactive in cover', () => {
  const r = derive({active: side(profile({bs: 13}), combi, '1:'), reactive: side(profile(), combi, '1:', true), rangeCm: 40});
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
  assert.equal(r.inputs.templateA, false);
  assert.equal(r.inputs.templateB, false);
  assert.equal(r.inputs.fixedFaceToFace, false);
});

test('template weapon against a Dodge: the template and its continuous damage, the Dodge rolled', () => {
  const flamer = option([{id: 3, name: 'Heavy Flamethrower'}]);
  const target = profile({ph: 13, skills: [{id: 40, name: 'Dodge', extra: ['+3']}]});
  const r = derive({active: side(profile(), flamer, '3:'), reactive: side(target, combi, 'dodge'), rangeCm: 20});
  assert.equal(r.inputs.templateA, true);
  assert.equal(r.inputs.templateB, false);
  assert.equal(r.inputs.burstA, 1);
  assert.equal(r.inputs.contA, true);
  assert.equal(r.inputs.ammoB, 'DODGE');
  assert.equal(r.inputs.burstB, 1);
  assert.equal(r.inputs.successValueB, 16);
  assert.deepEqual(r.notes, [DIRECT_TEMPLATE_NOTE]);
});

test('Direct Template note: said whatever the other side does (Alex, 2026-10-23)', () => {
  const flamer = side(profile(), option([{id: 3, name: 'Heavy Flamethrower'}]), '3:');
  // Against a Dodge, and against No ARO: the template is still its own roll.
  assert.deepEqual(derive({active: flamer, reactive: side(profile(), combi, 'dodge'), rangeCm: 20}).notes, [DIRECT_TEMPLATE_NOTE]);
  assert.deepEqual(derive({active: flamer, reactive: side(profile(), combi, 'none'), rangeCm: 20}).notes, [DIRECT_TEMPLATE_NOTE]);
  // A template Smoke blocks rolls nothing, so there is nothing to say about it.
  const smoked = derive({active: flamer, reactive: side(profile(), combi, 'dodge'), rangeCm: 20, zones: {smoke: true}});
  assert.equal(smoked.inputs.burstA, 0);
  assert.ok(!smoked.notes.includes(DIRECT_TEMPLATE_NOTE), smoked.notes.join(' | '));
});

test('template weapon against a shot back: two unopposed rolls, the shot a Normal Roll', () => {
  const flamer = option([{id: 3, name: 'Heavy Flamethrower'}]);
  const r = derive({active: side(profile(), flamer, '3:'), reactive: side(profile(), combi, '1:'), rangeCm: 20});
  assert.equal(r.ok, true);
  assert.equal(r.inputs.templateA, true);
  assert.equal(r.inputs.templateB, false);
  assert.equal(r.inputs.ammoB, 'N');
  assert.equal(r.inputs.successValueB, 15);   // 12 + 3 range, no MODs from the template user
  assert.equal(r.inputs.burstB, 1);
  assert.equal(r.inputs.armB, 2);             // no cover: the template ignores it anyway
  assert.deepEqual(r.notes, ['Direct Template: no Face to Face Roll; each attack is rolled on its own']);
  // And the other way round: an ARO template against an active shot.
  const aro = derive({active: side(profile(), combi, '1:'), reactive: side(profile(), flamer, '3:', true), rangeCm: 20});
  assert.equal(aro.ok, true);
  assert.equal(aro.inputs.templateA, false);
  assert.equal(aro.inputs.templateB, true);
  assert.equal(aro.inputs.successValueA, 12);  // 12 + 3 range - 3 cover, a Normal Roll
  assert.equal(aro.inputs.burstB, 1);
  assert.equal(aro.inputs.contB, true);
  assert.equal(aro.inputs.ammoB, 'N');
});

test('active Dodge: PH roll, no damage, reactive still shoots', () => {
  const dodger = profile({ph: 13, skills: [{id: 40, name: 'Dodge', extra: ['+3']}]});
  const r = derive({active: side(dodger, combi, 'dodge'), reactive: side(profile(), combi, '1:', true), rangeCm: 40});
  assert.equal(r.ok, true, r.errors.join('; '));
  assert.equal(r.inputs.ammoA, 'DODGE');
  assert.equal(r.inputs.burstA, 1);
  assert.equal(r.inputs.successValueA, 16);
  assert.equal(r.inputs.templateA, false);
  assert.equal(r.inputs.successValueB, 15);   // 12 + 3 range, dodger not in cover
  assert.equal(r.inputs.burstB, 1);
  assert.equal(r.inputs.armA, 2);
  assert.deepEqual(pseudoWeapons(effectiveTraits(dodger, combi), 'A').map((w) => w.key), ['dodge', 'reset']);
  assert.deepEqual(pseudoWeapons(effectiveTraits(dodger, combi), 'B').map((w) => w.key), ['dodge', 'reset', 'none']);
  // Dodging an ARO template: the template's hits are the reactive side's.
  const vsTemplate = derive({active: side(dodger, combi, 'dodge'), reactive: side(profile(), option([{id: 3, name: 'Heavy Flamethrower'}]), '3:'), rangeCm: 20});
  assert.equal(vsTemplate.ok, true);
  assert.equal(vsTemplate.inputs.templateB, true);
  assert.equal(vsTemplate.inputs.ammoA, 'DODGE');
  assert.equal(vsTemplate.inputs.successValueA, 16);
});

test('reactive burst: total reaction keeps weapon burst, "none" is unopposed', () => {
  const hmg = option([{id: 7, name: 'Heavy Machine Gun'}]);
  const rem = profile({skills: [{id: 61, name: 'Total Reaction'}]});
  assert.equal(derive({active: side(profile(), combi, '1:'), reactive: side(rem, hmg, '7:'), rangeCm: 40}).inputs.burstB, 4);
  assert.equal(derive({active: side(profile(), combi, '1:'), reactive: side(profile(), hmg, '7:'), rangeCm: 40}).inputs.burstB, 1);
  const neuro = profile({skills: [{id: 109, name: 'Neurocinetics'}]});
  assert.equal(derive({active: side(profile(), combi, '1:'), reactive: side(neuro, hmg, '7:'), rangeCm: 40}).inputs.burstB, 4);
  const none = derive({active: side(profile(), combi, '1:'), reactive: side(profile(), hmg, 'none'), rangeCm: 40});
  assert.equal(none.inputs.burstB, 0);
  assert.equal(none.ok, true);
});

// The asymmetries between the two sides of deriveInputs (one block serves both).
test('No ARO: the reactive rolls nothing; on the active side it leaves the setup incomplete', () => {
  const hmg = option([{id: 7, name: 'Heavy Machine Gun'}]);
  const none = derive({active: side(profile(), combi, '1:'), reactive: side(profile(), hmg, 'none'), rangeCm: 40});
  assert.deepEqual([none.inputs.burstB, none.inputs.bonusBurstB, none.inputs.shockB, none.inputs.templateB], [0, 0, false, false]);
  assert.equal(none.inputs.successValueB, undefined);
  // The reactive still saves against the attack.
  assert.equal(none.inputs.armB, 2);
  const carried = deriveInputs({active: side(profile(), hmg, 'none'), reactive: side(profile(), combi, '1:'), rangeCm: 40});
  assert.equal(carried.ok, false);
  assert.deepEqual(carried.errors, []);
});

test('an Attribute of 0 is an error naming the roll: Attack on the active side, ARO on the reactive', () => {
  const noCc = profile({cc: 0});
  const noBs = profile({bs: 0});
  /**
   * @param {import('../types.js').ResolvedSide | null} active
   * @param {import('../types.js').ResolvedSide | null} reactive
   */
  const errors = (active, reactive) => deriveInputs({active, reactive, rangeCm: 40}).errors;
  assert.deepEqual(errors(side(noCc, combi, '8:'), side(profile(), combi, '1:')), ['Active: this profile cannot make CC attacks; pick Dodge']);
  assert.deepEqual(errors(side(profile(), combi, '1:'), side(noCc, combi, '8:')), ['Reactive: this profile cannot make CC attacks; pick Dodge or No ARO']);
  assert.deepEqual(errors(side(noBs, combi, '1:'), side(profile(), combi, '1:')), ['Active: this profile cannot make BS attacks; pick Dodge']);
  assert.deepEqual(errors(side(profile(), combi, '1:'), side(noBs, combi, '1:')), ['Reactive: this profile cannot make BS attacks; pick Dodge or No ARO']);
});

test('split range: the reactive shoots at rangeCmB, the active at rangeCm', () => {
  const hmg = option([{id: 7, name: 'Heavy Machine Gun'}]);
  /**
   * @param {number} rangeCm
   * @param {number | null} [rangeCmB]
   */
  const at = (rangeCm, rangeCmB) => derive({active: side(profile(), combi, '1:'), reactive: side(profile(), hmg, '7:'), rangeCm, rangeCmB}).inputs;
  // Combi +3 at 40; HMG 0 at 40, +3 at 60.
  assert.deepEqual([at(40).successValueA, at(40).successValueB], [15, 12]);
  assert.deepEqual([at(40, 60).successValueA, at(40, 60).successValueB], [15, 15]);
  assert.equal(at(40, 60).successValueB, at(60).successValueB);
  // A null rangeCmB is no split.
  assert.deepEqual(at(40, null), at(40));
});

test('loadout BS MOD extras: "+3" and "+3 BS" add to the attack roll', () => {
  /** @param {string[]} extra */
  const sv = (extra) => derive({active: side(profile(), option([{id: 1, name: 'x', extra}]), '1:'), reactive: null, rangeCm: 40}).inputs.successValueA;
  assert.equal(sv([]), 15);
  assert.equal(sv(['+3']), 18);
  assert.equal(sv(['+3 BS']), 18);
  assert.equal(sv(['-3 BS']), 12);
});

test('loadout extras and crit immunity', () => {
  const o = option([{id: 1, name: 'Combi Rifle', extra: ['+1B', 'PS=9']}]);
  const target = profile({skills: [{id: 162, name: 'Immunity', extra: ['Critical']}]});
  const r = derive({active: side(profile(), o, '1:'), reactive: side(target, combi, '1:'), rangeCm: 40});
  assert.equal(r.inputs.burstA, 4);
  assert.equal(r.inputs.damageA, 9);
  assert.equal(r.inputs.critImmuneB, true);
});

test('out of range weapon always fails: success value 0, no error', () => {
  const pistol = option([{id: 6, name: 'Heavy Pistol'}]);
  const r = derive({active: side(profile(), pistol, '6:'), reactive: side(profile(), combi, '1:'), rangeCm: 120});
  assert.equal(r.ok, true);
  assert.deepEqual(r.errors, []);
  assert.equal(r.inputs.successValueA, 0);
});

test('Sixth Sense and Sapper are modelled, not reported as unsupported', () => {
  const p = profile({skills: [{id: 67, name: 'Sixth Sense'}, {id: 89, name: 'Sapper'}]});
  const r = derive({active: side(p, combi, '1:'), reactive: side(profile(), combi, '1:'), rangeCm: 40});
  assert.ok(!r.warnings.some((n) => n.includes('not implemented')), r.warnings.join(' | '));
});

test('loadout stat overrides (BS=11, BTS=3) replace the profile stat', () => {
  const p = profile({bs: 5, bts: 0});
  const skills = [{id: 279, name: 'BS=11'}, {id: 280, name: 'BTS=3'}];
  const o = option([], {skills, statOverrides: /** @type {OptionRow['statOverrides']} */ (statOverrides(skills))});
  const q = applyStatOverrides(p, o);
  assert.equal(q.bs, 11);
  assert.equal(q.bts, 3);
  assert.equal(p.bs, 5);                        // original untouched

  const polaris = byIsc('Polaris Team');
  const f = polaris.inFactions[0];
  const group = /** @type {import('../types.js').GroupRow} */ (polaris.byFaction[f].groups.find((g) => g.options.some((x) => x.skills.some((sk) => sk.name === 'BS=11'))));
  const beta = /** @type {OptionRow} */ (group.options.find((x) => x.skills.some((sk) => sk.name === 'BS=11')));
  const r = /** @type {Trooper} */ (resolveSelection(army, {unitId: polaris.id, factionId: f, groupId: group.id, optionId: beta.id}));
  assert.equal(r.profile.bs, 11);
});

test('BS Weapon (PH) / (WIP) roll against PH / WIP', () => {
  const p = profile({bs: 5, ph: 16, wip: 12});
  // Rows with only their properties: all attackAttribute reads.
  assert.equal(attackStat(p, /** @type {WeaponRow} */ ({props: ['BS Weapon (PH)']})), 16);
  assert.equal(attackStat(p, /** @type {WeaponRow} */ ({props: ['BS Weapon (WIP)']})), 12);
  assert.equal(attackStat(p, /** @type {WeaponRow} */ ({props: /** @type {string[]} */ ([])})), 5);

  const polaris = byIsc('Polaris Team');
  const f = polaris.inFactions[0];
  const group = /** @type {import('../types.js').GroupRow} */ (polaris.byFaction[f].groups.find((g) => g.profiles[0].ph === 16));
  const o = group.options[0];
  const grenades = /** @type {WeaponEntry} */ (bsWeapons(o, army.weapons).find((w) => w.name === 'Grenades'));
  const x = /** @type {Trooper} */ (resolveSelection(army, {unitId: polaris.id, factionId: f, groupId: group.id, optionId: o.id, weaponKey: grenades.key}));
  const r = derive({active: x, reactive: null, rangeCm: 20}).inputs;
  assert.equal(r.successValueA, 16 + /** @type {number} */ (rangeModFor(grenades.row, 20)));
});

test('a side without a weapon yet: no error shown, but not ready to apply', () => {
  const r = derive({active: side(profile(), combi, null), reactive: side(profile(), combi, '1:'), rangeCm: 40});
  assert.deepEqual(r.errors, []);
  assert.equal(r.ok, false);
});

test('Team-Ops upgrades: stat, equipment, TacBall weapon, unsupported weapon warning', () => {
  const unit = byIsc('Combined Army Team-Ops');
  const f = unit.inFactions[0];
  const group = unit.byFaction[f].groups[0];
  const o = group.options[0];
  /**
   * @param {import('../types.js').UpgradeItem[]} list
   * @param {string} label
   */
  const idx = (list, label) => list.findIndex((i) => i.label === label);
  // A Team-Ops unit has its upgrades; a resolution with a profile and traits.
  const upgrades = /** @type {NonNullable<import('../types.js').UnitRow['upgrades']>} */ (unit.upgrades);
  const base = /** @type {Trooper} */ (resolveSelection(army, {unitId: unit.id, factionId: f, groupId: group.id, optionId: o.id}));
  /**
   * @param {number | null} upgrade
   * @param {number | null} [ball]
   */
  const pick = (upgrade, ball = null) =>
    /** @type {Trooper & {traits: Traits}} */ (resolveSelection(army, {unitId: unit.id, factionId: f, groupId: group.id, optionId: o.id, upgrade, ball}));

  assert.equal(pick(idx(upgrades.chart, 'BS+1')).profile.bs, base.profile.bs + 1);
  assert.ok(pick(idx(upgrades.chart, 'Multispectral Visor L1')).traits.equip.some((e) => e.name === 'Multispectral Visor L1'));

  const tac = pick(null, idx(upgrades.ball, 'Plasma Carbine'));
  assert.ok(bsWeapons(tac.option, army.weapons).some((w) => w.name === 'Plasma Carbine'));

  const mines = pick(idx(upgrades.chart, 'Minelayer, Shock Mine'));
  const w = bsWeapons(mines.option, army.weapons)[0];
  const r = derive({active: {...mines, weapon: w}, reactive: null, rangeCm: 40});
  assert.ok(r.warnings.some((x) => x === 'Active: Shock Mine (upgrade) not supported by the calculator'), r.warnings.join(' | '));
});

test('Spec-Ops charts are not applied (deferred)', () => {
  const unit = byIsc('Nexus-7 Spec-Ops');
  const f = unit.inFactions[0];
  const group = unit.byFaction[f].groups[0];
  const sel = {unitId: unit.id, factionId: f, groupId: group.id, profileId: group.profiles[0].id, optionId: group.options[0].id};
  const base = /** @type {Trooper} */ (resolveSelection(army, sel));
  const up = /** @type {Trooper} */ (resolveSelection(army, {...sel, upgrade: 1, ball: 0}));
  assert.equal(up.profile.bs, base.profile.bs);
  assert.deepEqual(up.upgrades, []);
  for (const p of group.profiles) {
    const x = /** @type {Trooper} */ (resolveSelection(army, {...sel, profileId: p.id}));
    const w = bsWeapons(x.option, army.weapons)[0];
    const r = derive({active: {...x, weapon: w}, reactive: {...x, weapon: w}, rangeCm: 40});
    // Once, even with Spec-Ops on both sides.
    assert.equal(r.warnings.filter((m) => m === 'Spec-Ops upgrades and SpecBall not supported yet').length, 1, `${p.name}: ${r.warnings.join(' | ')}`);
  }
});

test('a Success Value below 1 is an automatic failure (0), not a roll on 1', () => {
  // BS 4 at 24-32" (-3), target in cover (-3) and Mimetism (-6): 4 - 12 = -8.
  const shooter = side(profile({bs: 4}), combi, '1:');
  const target = side(profile({skills: [{id: 28, name: 'Mimetism', extra: ['-6']}]}), combi, '1:', true);
  assert.equal(derive({active: shooter, reactive: target, rangeCm: 80}).inputs.successValueA, 0);
  // BS 7 at 8-16" (+3), cover (-3) and Mimetism (-6) is exactly 1: still rolled.
  const one = side(profile({bs: 7}), combi, '1:');
  assert.equal(derive({active: one, reactive: target, rangeCm: 40}).inputs.successValueA, 1);
  // A Dodge too: PH 2 with Immobilized-A (-6) is 0, not -4.
  const dodger = {...side(profile({ph: 2}), combi, 'dodge'), immA: true};
  assert.equal(derive({active: shooter, reactive: dodger, rangeCm: 40}).inputs.successValueB, 0);
});

test('MODs to a roll are capped at +/-12; Fireteam +1 BS is a MOD and counts', () => {
  // HMG at 0-8" (-3), Mimetism (-6), cover (-3), BS Attack (-3) from the target: -15 -> -12.
  const mim6 = profile({skills: [minus3, {id: 28, name: 'Mimetism', extra: ['-6']}]});
  const r = duel(side(profile({bs: 14}), option([{id: 7, name: 'HMG'}]), '7:'), side(mim6, combi, '1:', true), 20);
  assert.equal(r.inputs.successValueA, 2);
  assert.ok(r.notes.includes('Active: MODs add up to -15, capped at -12'), r.notes.join(' | '));
  // Fireteam +1 BS: -14, still capped at -12 (Alex, 2026-10-10).
  const ft4 = {...side(profile({bs: 14}), option([{id: 7, name: 'HMG'}]), '7:'), ftSize: 4};
  assert.equal(duel(ft4, side(mim6, combi, '1:', true), 20).inputs.successValueA, 2);
  // A Dodge's MODs cap at -12 too: PH 13, Immobilized-A (-6), BS Attack (-6)
  // and Surprise Attack (-3) add up to -15, capped at -12: SV 1.
  const ambusher = {...side(profile({bs: 14, skills: [{id: 201, name: 'BS Attack', extra: ['-6']}, {id: 191, name: 'Surprise Attack', extra: ['-3']}]}), combi, '1:'), surpriseAttack: true};
  const dodger = {...side(profile({ph: 13}), combi, 'dodge'), immA: true};
  const capped = duel(ambusher, dodger);
  assert.equal(capped.inputs.successValueB, 1);
  // And says so, like an attack (Alex, 2026-10-23).
  assert.ok(capped.notes.includes('Reactive: MODs add up to -15, capped at -12'), capped.notes.join(' | '));
  // Dodge (+6) is a MOD, PH=14 isn't: 14 + 6 and the Fireteam's +1 is 21.
  const ft = {...side(profile({ph: 13, skills: [{id: 40, name: 'Dodge', extra: ['PH=14', '+6']}]}), combi, 'dodge'), ftSize: 3};
  assert.equal(duel(side(profile({bs: 14}), combi, '1:'), ft).inputs.successValueB, 21);
});

test('a Success Value above 30 is capped at 30, in the inputs and the ledger', () => {
  // BS 29 + 3 (range) = 32.
  const a = side(profile({bs: 29}), combi, '1:');
  const args = {active: a, reactive: side(profile(), combi, '1:'), rangeCm: 20};
  const r = derive(args);
  assert.equal(r.inputs.successValueA, 30);
  const sv = /** @type {import('../types.js').Section} */ (/** @type {LedgerSide} */ (buildLedger({...args, derived: r}).A).sv);
  assert.ok(sv.lines.some((l) => l.label === 'capped at 30' && l.value === -2), JSON.stringify(sv.lines));
});

test('range bands are labelled in the language\'s unit', async () => {
  const {bandLabel} = await import('./ranges.js');
  const {translator, tEn} = await import('../i18n/index.js');
  const {default: es} = await import('../i18n/es.js');
  assert.equal(bandLabel(3, tEn), '24-32"');
  assert.equal(bandLabel(3, translator(es, 'es')), '60-80 cm');
  assert.equal(bandLabel(0, translator(es, 'es')), '0-20 cm');
});
