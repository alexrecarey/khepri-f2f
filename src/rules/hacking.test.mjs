// Hacking Programs (Alex, 2026-10-22). Run with: yarn test:js
import test from 'node:test';
import assert from 'node:assert/strict';
import {canTarget, hasZeroPain, trooperPrograms, unreadHackingExtras} from '../army/hacking.js';
import {EQUIP, SKILL} from '../army/ids.js';
import {effectiveTraits} from '../army/traits.js';
import {stateCaused} from '../army/weapons.js';
import {deriveInputs as deriveRaw} from './matchup.js';
import {derive as checked, deriveInputs, option as loadout, profile as baseProfile, weaponTable} from './testFixtures.mjs';
import {army} from '../army/testArmy.mjs';

/** @typedef {import('../types.js').WeaponRow} WeaponRow */
/** @typedef {import('../types.js').WeaponEntry} WeaponEntry */
/** @typedef {import('../types.js').ProfileRow} ProfileRow */
/** @typedef {import('../types.js').OptionRow} OptionRow */
/** @typedef {import('../types.js').TraitRef} TraitRef */
/** @typedef {import('../types.js').Trooper} Trooper */
/** @typedef {import('../types.js').Side} Side */
/** @typedef {import('../types.js').Line} Line */
/** @typedef {import('../types.js').Ledger} Ledger */
/** @typedef {import('../types.js').LedgerSide} LedgerSide */
/** @typedef {import('../types.js').RenderedDerived} RenderedDerived */
/** @typedef {import('../types.js').ResolvedSide} ResolvedSide */

import {rangeModFor} from './ranges.js';
import {fireteamHelps} from './modifiers.js';
import {pseudoWeapons, resolveSelection, trooperWeapons} from './trooper.js';
import {hasNoEffect} from './saves.js';
import {woundStates} from './woundStates.js';

// One rifle, in army.json form: the columns the rules read.
const W = weaponTable({
  1: [{name: 'Combi Rifle', mode: null, ammo: 'N', burst: 3, dmg: 7, saving: 'ARM', saves: '1', props: [],
    ranges: [{to: 40, mod: 3}, {to: 80, mod: -3}, {to: 120, mod: -6}]}],
});

/** @type {TraitRef} */
const HD = {id: EQUIP.HACKING_DEVICE, name: 'Hacking Device'};
/** @type {TraitRef} */
const KHD = {id: EQUIP.KILLER_HACKING_DEVICE, name: 'Killer Hacking Device'};
/** @type {TraitRef} */
const HACKER = {id: SKILL.HACKER, name: 'Hacker'};
// A hacker's profile: WIP for the programs, ARM 1 so a hit shows.
/**
 * @param {Partial<ProfileRow>} [over]
 * @returns {ProfileRow}
 */
const profile = (over = {}) => baseProfile({type: 'LI', wip: 13, arm: 1, ...over});
/**
 * @param {Partial<OptionRow>} [over]
 * @returns {OptionRow}
 */
const option = (over = {}) => loadout([{id: 1, name: 'Combi Rifle'}], over);
/**
 * @param {TraitRef} [device]
 * @param {Partial<ProfileRow>} [over]
 */
const hacker = (device = HD, over = {}) => profile({skills: [HACKER], equip: [device], ...over});

/**
 * @param {ProfileRow} p
 * @param {string} key
 * @param {Partial<ResolvedSide>} [extra]
 * @returns {Trooper}
 */
function side(p, key, extra = {}) {
  const o = option();
  const traits = effectiveTraits(p, o);
  const weapon = trooperWeapons(o, W, traits).find((w) => w.key === key)
    ?? trooperPrograms(traits).find((w) => w.key === key)
    ?? pseudoWeapons(traits).find((w) => w.key === key) ?? null;
  return /** @type {Trooper} */ ({profile: p, option: o, traits, weapon, inCover: false, ftSize: 1, ...extra});
}

// Every case is also a ledger case (testFixtures.mjs derive).
const derive = checked;

test('devices: a Hacking Device runs Carbonite, Spotlight, Total Control, Oblivion; a Killer one Trinity', () => {
  /** @param {ProfileRow} p */
  const keys = (p) => trooperPrograms(effectiveTraits(p, option())).map((w) => w.key);
  assert.deepEqual(keys(hacker()), ['hack:carbonite', 'hack:oblivion', 'hack:spotlight', 'hack:totalControl']);
  assert.deepEqual(keys(hacker(KHD)), ['hack:trinity']);
  assert.deepEqual(keys(profile()), []);
  // Extra programs: an UPGRADE on the device or programs listed on the Hacker skill.
  assert.deepEqual(keys(hacker({...KHD, extra: ['UPGRADES: Carbonite, Firewall (-3)']})), ['hack:carbonite', 'hack:trinity']);
  assert.deepEqual(keys(profile({skills: [{...HACKER, extra: ['Carbonite', 'Spotlight']}]})), ['hack:carbonite', 'hack:spotlight']);
});

test('program upgrades: +1B, +1SD, PS=X, SR-X, AP, an opponent MOD; device MODs on every program', () => {
  /** @param {TraitRef} device */
  const programs = (device) => Object.fromEntries(trooperPrograms(effectiveTraits(hacker(device), option())).map((w) => [w.key, w]));
  const k = programs({...KHD, extra: ['UPGRADE: Trinity (AP)', 'UPGRADE: Trinity (-3)', '+1B']});
  assert.equal(k['hack:trinity'].mods.forceAP, true);
  assert.equal(k['hack:trinity'].mods.opponent, -3);
  assert.equal(k['hack:trinity'].mods.burst, 1);
  const h = programs({...HD, extra: ['UPGRADE: Carbonite (+1 B)', 'UPGRADE: Trinity (SR-2)', 'UPGRADE: Total Control (PS=3)']});
  assert.equal(h['hack:carbonite'].mods.burst, 1);
  assert.equal(h['hack:oblivion'].mods.burst, 0);
  assert.equal(h['hack:trinity'].mods.psMod, -2);
  assert.equal(h['hack:totalControl'].mods.ps, 3);
  assert.equal(programs({...HD, extra: ['UPGRADE: SR-1']})['hack:spotlight'].mods.psMod, -1);
  assert.equal(programs({...HD, extra: ['UPGRADE: Carbonite (+1SD)']})['hack:carbonite'].mods.sd, 1);
  assert.deepEqual(unreadHackingExtras(['UPGRADE: White Noise', 'Firewall -6', 'UPGRADE: Trinity (PS=5)', 'UPGRADE: Mystery']), ['UPGRADE: Mystery']);
});

test('Zero Pain: from the Hacker skill or an UPGRADE, a Reset with two dice and -3 to the Comms Attack', () => {
  assert.equal(hasZeroPain(effectiveTraits(profile({skills: [{...HACKER, extra: ['Zero Pain']}]}), option())), true);
  assert.equal(hasZeroPain(effectiveTraits(hacker({...HD, extra: ['UPGRADE: Zero Pain']}), option())), true);
  assert.equal(hasZeroPain(effectiveTraits(hacker(), option())), false);
  const zp = profile({type: 'HI', skills: [{...HACKER, extra: ['Zero Pain']}], equip: [HD]});
  const r = derive({active: side(hacker(), 'hack:carbonite'), reactive: side(zp, 'zeroPain'), rangeCm: 40});
  assert.equal(r.inputs.burstB, 2);           // two WIP rolls, in ARO too
  assert.equal(r.inputs.ammoB, 'DODGE');      // it evades, it causes no saves
  assert.equal(r.inputs.successValueA, 10);   // WIP 13 - 3
  assert.equal(r.inputs.successValueB, 13);
  assert.match(/** @type {LedgerSide} */ (r.ledger.B).dice, /^Zero Pain B2 SV13/);
});

test('Carbonite: WIP, B2 (B1 in ARO), PS 7 DA on BTS, Immobilized-B; no range, Fireteam or cover', () => {
  const tag = profile({type: 'TAG', bts: 6, w: 3, str: true});
  const r = derive({active: side(hacker(), 'hack:carbonite', {ftSize: 4}), reactive: side(tag, '1:', {inCover: true}), rangeCm: 240});
  assert.equal(r.inputs.successValueA, 13);   // WIP, no Range MOD at 96", no Fireteam +1
  assert.equal(r.inputs.burstA, 2);
  assert.equal(r.inputs.bonusBurstA, 0);      // no Fireteam +1 SD
  assert.equal(r.inputs.ammoA, 'DA');
  assert.equal(/** @type {number} */ (r.inputs.damageA) + /** @type {number} */ (r.inputs.armB), 7 + 6);  // cover's +3 does nothing
  assert.equal(rangeModFor(trooperPrograms(effectiveTraits(hacker(), option()))[0].row, 240), 0);
  const aro = derive({active: side(tag, '1:'), reactive: side(hacker(), 'hack:carbonite'), rangeCm: 40});
  assert.equal(aro.inputs.burstB, 1);
  const states = woundStates(tag, effectiveTraits(tag, option()), {state: stateCaused(/** @type {WeaponEntry} */ (side(hacker(), 'hack:carbonite').weapon).row)});
  assert.deepEqual(states.map((s) => s.key), ['immobilized-b']);
});

test('Oblivion and Spotlight: AP halves BTS; Trinity: +3 WIP, wounds, B3', () => {
  const hi = profile({type: 'HI', bts: 6});
  const ob = derive({active: side(hacker(), 'hack:oblivion'), reactive: side(hi, '1:'), rangeCm: 40});
  assert.equal(/** @type {number} */ (ob.inputs.damageA) + /** @type {number} */ (ob.inputs.armB), 4 + 3);
  const tr = derive({active: side(hacker(KHD), 'hack:trinity'), reactive: side(hacker(HD, {bts: 3}), 'hack:carbonite'), rangeCm: 40});
  assert.equal(tr.inputs.successValueA, 16);
  assert.equal(tr.inputs.burstA, 3);
  assert.equal(/** @type {number} */ (tr.inputs.damageA) + /** @type {number} */ (tr.inputs.armB), 6 + 3);
  assert.equal(stateCaused(/** @type {WeaponEntry} */ (side(hacker(KHD), 'hack:trinity').weapon).row), null);
  // Hacker against hacker: both programs are rolled, Face to Face.
  assert.equal(tr.inputs.burstB, 1);
  assert.equal(tr.inputs.successValueB, 13);
});

test('targets: Carbonite needs a Hackable trooper or a Hacker, Total Control a TAG, Trinity a Hacker; Spotlight anyone', () => {
  /**
   * @param {string} key a program the hacker has
   * @param {ProfileRow} [p]
   */
  const row = (key, p = hacker(KHD, {skills: [{...HACKER, extra: ['Carbonite', 'Spotlight']}]})) => /** @type {WeaponEntry} */ (side(p, key).weapon).row;
  const li = side(profile(), '1:');
  assert.equal(canTarget(row('hack:carbonite'), li), false);
  assert.equal(canTarget(row('hack:carbonite'), side(profile({type: 'REM'}), '1:')), true);
  assert.equal(canTarget(row('hack:carbonite'), side(hacker(), '1:')), true);
  assert.equal(canTarget(row('hack:spotlight'), li), true);
  assert.equal(canTarget(row('hack:trinity'), li), false);
  assert.equal(canTarget(/** @type {WeaponEntry} */ (side(hacker(), 'hack:totalControl').weapon).row, side(profile({type: 'HI'}), '1:')), false);
  // Not a valid target: the program isn't rolled, the other side's shot is a Normal Roll.
  const r = derive({active: side(hacker(KHD), 'hack:trinity'), reactive: side(profile(), '1:'), rangeCm: 40});
  assert.equal(r.inputs.burstA, 0);
  assert.equal(r.inputs.burstB, 1);
  assert.equal(/** @type {LedgerSide} */ (r.ledger.A).kind, 'none');
  // The reason is a descriptor naming the program; the ledger words it.
  const raw = deriveRaw({active: side(hacker(KHD), 'hack:trinity'), reactive: side(profile(), '1:'), rangeCm: 40});
  assert.deepEqual(raw.lines.A, {kind: 'none', reason: {key: 'ledger.cantTarget', params: {program: 'Trinity'}}});
  assert.deepEqual(raw.notes, [{key: 'note.side', params: {side: {key: 'side.active'}, text: {key: 'note.cantTarget', params: {program: 'Trinity'}}}}]);
  assert.ok(r.notes.some((n) => n.includes('can\'t target')), r.notes.join(' | '));
});

test('Face to Face: Dodge can\'t evade a program (Normal Roll); Reset is opposed; Reset against a shot isn\'t rolled', () => {
  const hi = profile({type: 'HI', wip: 12});
  const dodge = derive({active: side(hacker(), 'hack:carbonite'), reactive: side(hi, 'dodge'), rangeCm: 40});
  assert.equal(dodge.inputs.burstB, 0);
  const reset = derive({active: side(hacker(), 'hack:carbonite'), reactive: side(hi, 'reset'), rangeCm: 40});
  assert.equal(reset.inputs.burstB, 1);
  assert.equal(reset.inputs.successValueB, 12);
  const shot = derive({active: side(profile(), '1:'), reactive: side(hi, 'reset'), rangeCm: 40});
  assert.equal(shot.inputs.burstB, 0);
});

test('Firewall: the chip, which starts on the trooper\'s own; +3 to the save; ECM: Hacker on programs only', () => {
  const tag = profile({type: 'TAG', bts: 6});
  /** @param {Trooper} target */
  const at = (target) => derive({active: side(hacker(), 'hack:carbonite'), reactive: target, rangeCm: 40}).inputs;
  assert.equal(at(side(tag, '1:', {firewall: -3})).successValueA, 10);
  assert.equal(at(side(tag, '1:', {firewall: -3})).armB, 6 + 3);
  const own = profile({type: 'TAG', bts: 6, equip: [{id: EQUIP.TINBOT_FIREWALL, name: 'TinBot: Firewall', extra: ['-3']}]});
  assert.equal(at(side(own, '1:', {firewall: -6})).successValueA, 7);   // the player's pick
  assert.equal(at(side(tag, '1:')).successValueA, 13);                   // no Firewall of its own: off
  const ecm = profile({type: 'TAG', bts: 6, equip: [{id: EQUIP.ECM_HACKER, name: 'ECM: Hacker', extra: ['-3']}]});
  assert.equal(at(side(ecm, '1:', {firewall: -3})).successValueA, 7);   // ECM and Firewall add up
});

test('Immunity to the State stops the program: (IMM-B) Carbonite, (Isolated) or Warhorse Oblivion, (POS) Total Control', () => {
  /** @param {string} what */
  const immune = (what) => effectiveTraits(profile({type: 'TAG', skills: [{id: SKILL.IMMUNITY, name: 'Immunity', extra: [what]}]}), option());
  /** @param {string} key a program the hacker has */
  const row = (key) => /** @type {WeaponEntry} */ (side(hacker(), key).weapon).row;
  assert.equal(hasNoEffect(immune('IMM-B'), row('hack:carbonite')), true);
  assert.equal(hasNoEffect(immune('IMM-B'), row('hack:oblivion')), false);
  assert.equal(hasNoEffect(immune('Isolated'), row('hack:oblivion')), true);
  assert.equal(hasNoEffect(effectiveTraits(profile({skills: [{id: SKILL.WARHORSE, name: 'Warhorse'}]}), option()), row('hack:oblivion')), true);
  assert.equal(hasNoEffect(immune('POS'), row('hack:totalControl')), true);
  assert.equal(hasNoEffect(immune('BTS'), row('hack:carbonite')), false);
  const r = derive({active: side(hacker(), 'hack:carbonite'), reactive: side(profile({type: 'TAG', skills: [{id: SKILL.IMMUNITY, name: 'Immunity', extra: ['IMM-B']}]}), '1:'), rangeCm: 40});
  assert.equal(r.inputs.ammoA, 'NONE');
});

test('upgrades reach the dice: Trinity (AP) halves BTS, (SR-1) lowers PS, (-3) goes on the opponent', () => {
  const khd = hacker({...KHD, extra: ['UPGRADE: Trinity (AP)', 'UPGRADE: Trinity (SR-1)', 'UPGRADE: Trinity (-3)']});
  const target = hacker(HD, {wip: 14, bts: 6});
  const r = derive({active: side(khd, 'hack:trinity'), reactive: side(target, 'reset'), rangeCm: 40});
  assert.equal(/** @type {number} */ (r.inputs.damageA) + /** @type {number} */ (r.inputs.armB), 6 - 1 + 3);
  assert.equal(r.inputs.successValueB, 11);
});

test('the Firewall chip starts on the trooper\'s own Firewall, which can\'t be switched off; off without one', () => {
  /** @type {import('../types.js').Army} */
  /**
   * The first loadout the predicate picks, as a selection (the data has one).
   * @param {(p: ProfileRow, o: OptionRow) => boolean} pred
   * @returns {Partial<import('../types.js').Selection>}
   */
  const sel = (pred) => {
    for (const u of army.units) for (const [fid, {groups}] of Object.entries(u.byFaction)) for (const g of groups) for (const o of g.options) {
      if (pred(g.profiles[0], o)) return {unitId: u.id, factionId: Number(fid), groupId: g.id, profileId: g.profiles[0].id, optionId: o.id};
    }
    return /** @type {never} */ (null);
  };
  const own = sel((p, o) => o.equip.some((e) => (e.extra ?? []).includes('UPGRADE: Firewall (-3)')));
  assert.equal(/** @type {Trooper} */ (resolveSelection(army, own)).firewall, -3);
  assert.equal(/** @type {Trooper} */ (resolveSelection(army, {...own, firewall: -6})).firewall, -6);
  assert.equal(/** @type {Trooper} */ (resolveSelection(army, {...own, firewall: 0})).firewall, -3);
  assert.equal(/** @type {Trooper} */ (resolveSelection(army, {...own, firewall: null})).firewall, -3);
  const none = sel((p, o) => p.type === 'LI' && o.equip.length === 0 && !(p.equip ?? []).length);
  assert.equal(/** @type {Trooper} */ (resolveSelection(army, none)).firewall, 0);
  assert.equal(/** @type {Trooper} */ (resolveSelection(army, {...none, firewall: -6})).firewall, -6);
  assert.equal(/** @type {Trooper} */ (resolveSelection(army, {...none, firewall: 0})).firewall, 0);
});

test('Targeted (the side\'s State): +3 to a shot or program against it, -3 to its Reset; not CC, Dodge or Zero Pain', () => {
  const hi = profile({type: 'HI', wip: 13});
  const shot = derive({active: side(profile(), '1:'), reactive: side(hi, 'dodge', {targeted: true}), rangeCm: 40});
  assert.equal(shot.inputs.successValueA, 12 + 3 + 3);   // BS, Range +3, Targeted
  assert.equal(shot.inputs.successValueB, 12);           // its own Dodge: nothing
  const program = derive({active: side(hacker(), 'hack:carbonite'), reactive: side(hi, 'reset', {targeted: true}), rangeCm: 40});
  assert.equal(program.inputs.successValueA, 13 + 3);
  assert.equal(program.inputs.successValueB, 13 - 3);    // its Reset
  assert.ok(/** @type {import('../types.js').Section} */ (/** @type {LedgerSide} */ (program.ledger.B).sv).lines.some((l) => l.label === 'Targeted' && l.value === -3));
  // The active side Targeted: the reactive's shot back gets +3.
  const back = derive({active: side(profile(), '1:', {targeted: true}), reactive: side(profile(), '1:'), rangeCm: 40});
  assert.equal(back.inputs.successValueB, 12 + 3 + 3);
  const zp = profile({type: 'HI', wip: 13, skills: [{...HACKER, extra: ['Zero Pain']}], equip: [HD]});
  const zeroPain = derive({active: side(hacker(), 'hack:carbonite'), reactive: side(zp, 'zeroPain', {targeted: true}), rangeCm: 40});
  assert.equal(zeroPain.inputs.successValueB, 13);
});

test('Hacked: -3 to -12 on a Reset only, within the MOD cap', () => {
  const hi = hacker(HD, {type: 'HI', wip: 13});
  /**
   * @param {Partial<ResolvedSide>} extra
   * @param {Trooper} [attacker]
   */
  const reset = (extra, attacker = side(hacker(), 'hack:carbonite')) => derive({active: attacker, reactive: side(hi, 'reset', extra), rangeCm: 40});
  assert.equal(reset({hackedReset: -6}).inputs.successValueB, 7);
  // -12 and Trinity's (-3): MODs never pass -12.
  const khd = hacker({...KHD, extra: ['UPGRADE: Trinity (-3)']});
  const capped = reset({hackedReset: -12}, side(khd, 'hack:trinity'));
  assert.equal(capped.inputs.successValueB, 1);
  assert.ok(/** @type {import('../types.js').Section} */ (/** @type {LedgerSide} */ (capped.ledger.B).sv).lines.some((l) => /** @type {string} */ (l.label).includes('MOD')), JSON.stringify(/** @type {import('../types.js').Section} */ (/** @type {LedgerSide} */ (capped.ledger.B).sv).lines));
  // Not a Reset: the chip does nothing.
  const dodging = derive({active: side(profile(), '1:'), reactive: side(hi, 'dodge', {hackedReset: -9}), rangeCm: 40});
  assert.equal(dodging.inputs.successValueB, 12);
});

test('IMM-A: -6 to a Dodge only', () => {
  const r = derive({active: side(profile(), '1:'), reactive: side(profile(), 'dodge', {immA: true}), rangeCm: 40});
  assert.equal(r.inputs.successValueB, 12 - 6);
  assert.ok(/** @type {import('../types.js').Section} */ (/** @type {LedgerSide} */ (r.ledger.B).sv).lines.some((l) => l.label === 'IMM-A' && l.value === -6));
  const shot = derive({active: side(profile(), '1:'), reactive: side(profile(), '1:', {immA: true}), rangeCm: 40});
  assert.equal(shot.inputs.successValueB, 12 + 3);
});

test('the Fireteam only helps a rolled BS Attack or a Dodge, not a program or a Reset', () => {
  assert.equal(fireteamHelps(side(hacker(), '1:')), true);
  assert.equal(fireteamHelps(side(hacker(), 'dodge')), true);
  assert.equal(fireteamHelps(side(hacker(), 'hack:carbonite')), false);
  assert.equal(fireteamHelps(side(hacker(), 'reset')), false);
  assert.equal(fireteamHelps(side(profile({skills: [{...HACKER, extra: ['Zero Pain']}]}), 'zeroPain')), false);
  assert.equal(fireteamHelps(side(hacker(), 'none')), false);
});
