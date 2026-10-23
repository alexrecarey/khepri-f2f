// Hacking Programs (Alex, 2026-10-22). Run with: yarn test:js
import test from 'node:test';
import assert from 'node:assert/strict';
import {canTarget, hasZeroPain, trooperPrograms, unreadHackingExtras} from '../army/hacking.js';
import {EQUIP, SKILL} from '../army/ids.js';
import {normalizeWeaponRow} from '../army/normalize.js';
import {effectiveTraits} from '../army/traits.js';
import {stateCaused} from '../army/weapons.js';
import {buildLedger} from './ledger.js';
import {deriveInputs} from './matchup.js';
import {rangeModFor} from './ranges.js';
import {readFileSync} from 'node:fs';
import {fireteamHelps} from './modifiers.js';
import {pseudoWeapons, resolveSelection, trooperWeapons} from './trooper.js';
import {hasNoEffect} from './saves.js';
import {woundStates} from './woundStates.js';

const W = Object.fromEntries(Object.entries({
  1: [{name: 'Combi Rifle', mode: null, ammo: 'N', burst: 3, dmg: 7, saving: 'ARM', saves: '1', props: [],
    ranges: [{to: 40, mod: 3}, {to: 80, mod: -3}, {to: 120, mod: -6}]}],
}).map(([id, rows]) => [id, rows.map(normalizeWeaponRow)]));

const HD = {id: EQUIP.HACKING_DEVICE, name: 'Hacking Device'};
const KHD = {id: EQUIP.KILLER_HACKING_DEVICE, name: 'Killer Hacking Device'};
const HACKER = {id: SKILL.HACKER, name: 'Hacker'};
const profile = (over = {}) => ({id: 1, name: 'P', type: 'LI', bs: 12, ph: 12, wip: 13, arm: 1, bts: 3, w: 1, skills: [], equip: [], ...over});
const option = (over = {}) => ({id: 1, name: 'O', points: 10, swc: '0', weapons: [{id: 1, name: 'Combi Rifle'}], skills: [], equip: [], ...over});
const hacker = (device = HD, over = {}) => profile({skills: [HACKER], equip: [device], ...over});

function side(p, key, extra = {}) {
  const o = option();
  const traits = effectiveTraits(p, o);
  const weapon = trooperWeapons(o, W, traits).find((w) => w.key === key)
    ?? trooperPrograms(traits).find((w) => w.key === key)
    ?? pseudoWeapons(traits).find((w) => w.key === key) ?? null;
  return {profile: p, option: o, traits, weapon, inCover: false, ftSize: 1, ...extra};
}

// What a section's live lines (not struck, a number) add up to.
const addUp = (lines) => lines.filter((x) => !x.struck && typeof x.value === 'number').reduce((n, x) => n + x.value, 0);

// deriveInputs, with "How the dice were built" checked against every number.
function derive(args) {
  const r = deriveInputs(args);
  if (!r.ok) return r;
  const ledger = buildLedger({...args, derived: r});
  for (const s of ['A', 'B']) {
    const l = ledger[s];
    if (!l || l.kind === 'none') continue;
    const o = s === 'A' ? 'B' : 'A';
    const expect = {sv: r.inputs[`successValue${s}`], burst: r.inputs[`burst${s}`], sd: r.inputs[`bonusBurst${s}`] ?? 0,
      save: r.inputs[`damage${s}`] + r.inputs[`arm${o}`]};
    for (const [k, total] of Object.entries(expect)) {
      const sec = l[k];
      if (!sec) continue;
      const where = `ledger ${s} ${k}: ${JSON.stringify(sec.lines)}`;
      assert.equal(sec.total, total, where);
      // Out of range is a '—' line with Success Value 0, not a sum.
      if (!sec.lines.some((x) => x.value === '—')) assert.equal(addUp(sec.lines), total, where);
    }
  }
  return {...r, ledger};
}

test('devices: a Hacking Device runs Carbonite, Spotlight, Total Control, Oblivion; a Killer one Trinity', () => {
  const keys = (p) => trooperPrograms(effectiveTraits(p, option())).map((w) => w.key);
  assert.deepEqual(keys(hacker()), ['hack:carbonite', 'hack:oblivion', 'hack:spotlight', 'hack:totalControl']);
  assert.deepEqual(keys(hacker(KHD)), ['hack:trinity']);
  assert.deepEqual(keys(profile()), []);
  // Extra programs: an UPGRADE on the device or programs listed on the Hacker skill.
  assert.deepEqual(keys(hacker({...KHD, extra: ['UPGRADES: Carbonite, Firewall (-3)']})), ['hack:carbonite', 'hack:trinity']);
  assert.deepEqual(keys(profile({skills: [{...HACKER, extra: ['Carbonite', 'Spotlight']}]})), ['hack:carbonite', 'hack:spotlight']);
});

test('program upgrades: +1B, +1SD, PS=X, SR-X, AP, an opponent MOD; device MODs on every program', () => {
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
  assert.match(r.ledger.B.dice, /^Zero Pain B2 SV13/);
});

test('Carbonite: WIP, B2 (B1 in ARO), PS 7 DA on BTS, Immobilized-B; no range, Fireteam or cover', () => {
  const tag = profile({type: 'TAG', bts: 6, w: 3, str: true});
  const r = derive({active: side(hacker(), 'hack:carbonite', {ftSize: 4}), reactive: side(tag, '1:', {inCover: true}), rangeCm: 240});
  assert.equal(r.inputs.successValueA, 13);   // WIP, no Range MOD at 96", no Fireteam +1
  assert.equal(r.inputs.burstA, 2);
  assert.equal(r.inputs.bonusBurstA, 0);      // no Fireteam +1 SD
  assert.equal(r.inputs.ammoA, 'DA');
  assert.equal(r.inputs.damageA + r.inputs.armB, 7 + 6);  // cover's +3 does nothing
  assert.equal(rangeModFor(trooperPrograms(effectiveTraits(hacker(), option()))[0].row, 240), 0);
  const aro = derive({active: side(tag, '1:'), reactive: side(hacker(), 'hack:carbonite'), rangeCm: 40});
  assert.equal(aro.inputs.burstB, 1);
  const states = woundStates(tag, effectiveTraits(tag, option()), {state: stateCaused(side(hacker(), 'hack:carbonite').weapon.row)});
  assert.deepEqual(states.map((s) => s.key), ['immobilized-b']);
});

test('Oblivion and Spotlight: AP halves BTS; Trinity: +3 WIP, wounds, B3', () => {
  const hi = profile({type: 'HI', bts: 6});
  const ob = derive({active: side(hacker(), 'hack:oblivion'), reactive: side(hi, '1:'), rangeCm: 40});
  assert.equal(ob.inputs.damageA + ob.inputs.armB, 4 + 3);
  const tr = derive({active: side(hacker(KHD), 'hack:trinity'), reactive: side(hacker(HD, {bts: 3}), 'hack:carbonite'), rangeCm: 40});
  assert.equal(tr.inputs.successValueA, 16);
  assert.equal(tr.inputs.burstA, 3);
  assert.equal(tr.inputs.damageA + tr.inputs.armB, 6 + 3);
  assert.equal(stateCaused(side(hacker(KHD), 'hack:trinity').weapon.row), null);
  // Hacker against hacker: both programs are rolled, Face to Face.
  assert.equal(tr.inputs.burstB, 1);
  assert.equal(tr.inputs.successValueB, 13);
});

test('targets: Carbonite needs a Hackable trooper or a Hacker, Total Control a TAG, Trinity a Hacker; Spotlight anyone', () => {
  const row = (key, p = hacker(KHD, {skills: [{...HACKER, extra: ['Carbonite', 'Spotlight']}]})) => side(p, key).weapon.row;
  const li = side(profile(), '1:');
  assert.equal(canTarget(row('hack:carbonite'), li), false);
  assert.equal(canTarget(row('hack:carbonite'), side(profile({type: 'REM'}), '1:')), true);
  assert.equal(canTarget(row('hack:carbonite'), side(hacker(), '1:')), true);
  assert.equal(canTarget(row('hack:spotlight'), li), true);
  assert.equal(canTarget(row('hack:trinity'), li), false);
  assert.equal(canTarget(side(hacker(), 'hack:totalControl').weapon.row, side(profile({type: 'HI'}), '1:')), false);
  // Not a valid target: the program isn't rolled, the other side's shot is a Normal Roll.
  const r = derive({active: side(hacker(KHD), 'hack:trinity'), reactive: side(profile(), '1:'), rangeCm: 40});
  assert.equal(r.inputs.burstA, 0);
  assert.equal(r.inputs.burstB, 1);
  assert.equal(r.ledger.A.kind, 'none');
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
  const immune = (what) => effectiveTraits(profile({type: 'TAG', skills: [{id: SKILL.IMMUNITY, name: 'Immunity', extra: [what]}]}), option());
  const row = (key) => side(hacker(), key).weapon.row;
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
  assert.equal(r.inputs.damageA + r.inputs.armB, 6 - 1 + 3);
  assert.equal(r.inputs.successValueB, 11);
});

test('the Firewall chip starts on the trooper\'s own Firewall, which can\'t be switched off; off without one', () => {
  const army = JSON.parse(readFileSync(new URL('../army/army.json', import.meta.url), 'utf8'));
  const sel = (pred) => {
    for (const u of army.units) for (const [fid, {groups}] of Object.entries(u.byFaction)) for (const g of groups) for (const o of g.options) {
      if (pred(g.profiles[0], o)) return {unitId: u.id, factionId: Number(fid), groupId: g.id, profileId: g.profiles[0].id, optionId: o.id};
    }
    return null;
  };
  const own = sel((p, o) => o.equip.some((e) => (e.extra ?? []).includes('UPGRADE: Firewall (-3)')));
  assert.equal(resolveSelection(army, own).firewall, -3);
  assert.equal(resolveSelection(army, {...own, firewall: -6}).firewall, -6);
  assert.equal(resolveSelection(army, {...own, firewall: 0}).firewall, -3);
  assert.equal(resolveSelection(army, {...own, firewall: null}).firewall, -3);
  const none = sel((p, o) => p.type === 'LI' && o.equip.length === 0 && !(p.equip ?? []).length);
  assert.equal(resolveSelection(army, none).firewall, 0);
  assert.equal(resolveSelection(army, {...none, firewall: -6}).firewall, -6);
  assert.equal(resolveSelection(army, {...none, firewall: 0}).firewall, 0);
});

test('Targeted (the side\'s State): +3 to a shot or program against it, -3 to its Reset; not CC, Dodge or Zero Pain', () => {
  const hi = profile({type: 'HI', wip: 13});
  const shot = derive({active: side(profile(), '1:'), reactive: side(hi, 'dodge', {targeted: true}), rangeCm: 40});
  assert.equal(shot.inputs.successValueA, 12 + 3 + 3);   // BS, Range +3, Targeted
  assert.equal(shot.inputs.successValueB, 12);           // its own Dodge: nothing
  const program = derive({active: side(hacker(), 'hack:carbonite'), reactive: side(hi, 'reset', {targeted: true}), rangeCm: 40});
  assert.equal(program.inputs.successValueA, 13 + 3);
  assert.equal(program.inputs.successValueB, 13 - 3);    // its Reset
  assert.ok(program.ledger.B.sv.lines.some((l) => l.label === 'Targeted' && l.value === -3));
  // The active side Targeted: the reactive's shot back gets +3.
  const back = derive({active: side(profile(), '1:', {targeted: true}), reactive: side(profile(), '1:'), rangeCm: 40});
  assert.equal(back.inputs.successValueB, 12 + 3 + 3);
  const zp = profile({type: 'HI', wip: 13, skills: [{...HACKER, extra: ['Zero Pain']}], equip: [HD]});
  const zeroPain = derive({active: side(hacker(), 'hack:carbonite'), reactive: side(zp, 'zeroPain', {targeted: true}), rangeCm: 40});
  assert.equal(zeroPain.inputs.successValueB, 13);
});

test('Hacked: -3 to -12 on a Reset only, within the MOD cap', () => {
  const hi = hacker(HD, {type: 'HI', wip: 13});
  const reset = (extra, attacker = side(hacker(), 'hack:carbonite')) => derive({active: attacker, reactive: side(hi, 'reset', extra), rangeCm: 40});
  assert.equal(reset({hackedReset: -6}).inputs.successValueB, 7);
  // -12 and Trinity's (-3): MODs never pass -12.
  const khd = hacker({...KHD, extra: ['UPGRADE: Trinity (-3)']});
  const capped = reset({hackedReset: -12}, side(khd, 'hack:trinity'));
  assert.equal(capped.inputs.successValueB, 1);
  assert.ok(capped.ledger.B.sv.lines.some((l) => l.label.includes('MOD')), JSON.stringify(capped.ledger.B.sv.lines));
  // Not a Reset: the chip does nothing.
  const dodging = derive({active: side(profile(), '1:'), reactive: side(hi, 'dodge', {hackedReset: -9}), rangeCm: 40});
  assert.equal(dodging.inputs.successValueB, 12);
});

test('IMM-A: -6 to a Dodge only', () => {
  const r = derive({active: side(profile(), '1:'), reactive: side(profile(), 'dodge', {immA: true}), rangeCm: 40});
  assert.equal(r.inputs.successValueB, 12 - 6);
  assert.ok(r.ledger.B.sv.lines.some((l) => l.label === 'IMM-A' && l.value === -6));
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
