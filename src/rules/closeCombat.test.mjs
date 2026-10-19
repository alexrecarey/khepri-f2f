// Close combat: CC weapons, Martial Arts, Natural Born Warrior, and what
// shooting MODs don't do to a CC Attack. Every case also checks that "How the
// dice were built" adds up to the same numbers.
import test from 'node:test';
import assert from 'node:assert/strict';
import {SKILL} from '../army/ids.js';
import {effectiveTraits} from '../army/traits.js';
import {bsWeapons, ccWeapons} from '../army/weapons.js';
import {buildLedger} from './ledger.js';
import {deriveInputs} from './matchup.js';
import {pseudoWeapons, trooperCcWeapons, trooperWeapons} from './trooper.js';

// Rows in army.json form.
const RIFLE = [{to: 40, mod: 3}, {to: 80, mod: -3}, {to: 120, mod: -6}];
const W = {
  1: [{name: 'Combi Rifle', mode: null, burst: 3, dmg: 7, ranges: RIFLE, ammo: ['N'], save: {attr: 'ARM'}, saveRolls: 1, props: []}],
  5: [{name: 'CC Weapon', mode: null, burst: 1, dmg: 8, ranges: null, ammo: ['N'], save: {attr: 'ARM'}, saveRolls: 1, props: ['CC']}],
  11: [{name: 'DA CC Weapon', mode: null, burst: 1, dmg: 8, ranges: null, ammo: ['DA'], save: {attr: 'ARM'}, saveRolls: 2, props: ['Anti-materiel', 'CC']}],
  17: [{name: 'D-Charges', mode: 'CC Mode', burst: 1, dmg: 6, ranges: null, ammo: ['AP', 'Exp'], save: {attr: 'ARM', halved: true}, saveRolls: 3, props: ['Anti-materiel', 'CC', 'Disposable (3)', 'Improvised', '[*]']}],
  71: [{name: 'PARA CC Weapon', mode: null, burst: 1, dmg: null, ranges: null, ammo: ['PARA'], save: {attr: 'PH', mod: -6}, saveRolls: 1, props: ['CC', 'Non-lethal', 'State: IMM-A']}],
  149: [
    {name: 'Vorpal CC Weapon', mode: 'BS Mode', burst: 1, dmg: 8, ranges: [{to: 20, mod: 3}], ammo: ['N'], save: {attr: 'ARM', armZero: true}, saveRolls: 1, props: ['BS Weapon (PH)', 'State: Dead', '[*]']},
    {name: 'Vorpal CC Weapon', mode: 'CC Mode', burst: 1, dmg: 8, ranges: null, ammo: ['N'], save: {attr: 'ARM', armZero: true}, saveRolls: 1, props: ['CC', 'State: Dead', '[*]']},
  ],
};

const skill = (id, ...extra) => ({id, name: String(id), ...(extra.length ? {extra} : {})});
const MA = [null, SKILL.MARTIAL_ARTS_L1, SKILL.MARTIAL_ARTS_L2, SKILL.MARTIAL_ARTS_L3, SKILL.MARTIAL_ARTS_L4, SKILL.MARTIAL_ARTS_L5];
const profile = (over = {}) => ({id: 1, name: 'P', cc: 15, bs: 12, ph: 12, arm: 2, bts: 3, w: 1, skills: [], equip: [], ...over});
const LOADOUT = [{id: 1, name: 'Combi Rifle'}, {id: 11, name: 'DA CC Weapon', extra: ['PS=6']}];
// A trooper using `key`: a weapon key, 'cc' for its first CC weapon, 'dodge'.
function trooper(key, {skills = [], weapons = LOADOUT, ...rest} = {}, over = {}) {
  const p = profile({skills, ...rest});
  const o = {id: 1, name: 'O', weapons, skills: [], equip: []};
  const traits = effectiveTraits(p, o);
  const all = [...trooperWeapons(o, W, traits), ...trooperCcWeapons(o, W, traits), ...pseudoWeapons(traits)];
  const weapon = key === 'cc' ? trooperCcWeapons(o, W, traits)[0] : all.find((w) => w.key === key);
  return {profile: p, option: o, traits, weapon, inCover: false, ftSize: 1, ...over};
}

function derive(args) {
  const r = deriveInputs({rangeCm: 40, ...args});
  assert.ok(r.ok, JSON.stringify(r.errors));
  const ledger = buildLedger({rangeCm: 40, ...args, inputs: r.inputs});
  for (const s of ['A', 'B']) {
    const l = ledger[s];
    const t = s === 'A' ? 'B' : 'A';
    const expect = {sv: r.inputs[`successValue${s}`], burst: r.inputs[`burst${s}`], sd: r.inputs[`bonusBurst${s}`] ?? 0,
      save: r.inputs[`damage${s}`] + r.inputs[`arm${t}`]};
    for (const [k, total] of Object.entries(expect)) {
      if (!l[k]) continue;
      const where = `ledger ${s} ${k}: ${JSON.stringify(l[k].lines)}`;
      assert.equal(l[k].total, total, where);
      assert.deepEqual(l[k].lines.filter((x) => x.label === 'other rules'), [], where);
    }
  }
  return {...r, ledger};
}

test('CC weapons are listed apart from BS weapons, a CC Mode included', () => {
  const o = {weapons: [{id: 1}, {id: 5}, {id: 149}, {id: 71, extra: ['-6']}]};
  assert.deepEqual(bsWeapons(o, W).map((w) => w.key), ['1:', '149:BS Mode']);
  const cc = ccWeapons(o, W);
  assert.deepEqual(cc.map((w) => w.key), ['5:', '149:CC Mode', '71:']);
  assert.ok(cc.every((w) => w.cc));
  // PARA CC Weapon (-6): the opponent's MOD, not the user's.
  assert.equal(cc[2].mods.opponent, -6);
  assert.equal(cc[2].mods.sv, 0);
});

test('a CC Attack rolls CC with the loadout PS; Martial Arts L2 gives +3 and -3 to the opponent', () => {
  const {inputs} = derive({active: trooper('cc', {cc: 20, skills: [skill(MA[2])]}), reactive: trooper('cc', {cc: 14})});
  assert.equal(inputs.successValueA, 23);
  assert.equal(inputs.successValueB, 11);
  assert.equal(inputs.damageA, 6);
  assert.equal(inputs.ammoA, 'DA');
  assert.equal(inputs.burstA, 1);
  assert.equal(inputs.bonusBurstA, 0);
});

test('Martial Arts L3 / L4 / L5 dice, in both turns', () => {
  const ma = (lvl, side) => {
    const x = trooper('cc', {skills: [skill(MA[lvl])]});
    const y = trooper('cc');
    return side === 'A' ? derive({active: x, reactive: y}).inputs : derive({active: y, reactive: x}).inputs;
  };
  assert.deepEqual([ma(3, 'A').burstA, ma(3, 'A').bonusBurstA], [1, 1]);
  assert.deepEqual([ma(4, 'A').burstA, ma(4, 'A').bonusBurstA], [2, 0]);
  assert.deepEqual([ma(5, 'B').burstB, ma(5, 'B').bonusBurstB], [2, 1]);
  assert.equal(ma(1, 'A').successValueA, 15);
  assert.equal(ma(1, 'A').successValueB, 12);
});

test('in ARO a CC Attack is one die: loadout and CC Attack +B count only in the Active Turn', () => {
  const weapons = [{id: 11, name: 'DA CC Weapon', extra: ['+1B']}];
  const x = () => trooper('cc', {weapons, skills: [skill(SKILL.CC_ATTACK, '+1B')]});
  assert.equal(derive({active: x(), reactive: trooper('cc')}).inputs.burstA, 3);
  assert.equal(derive({active: trooper('cc'), reactive: x()}).inputs.burstB, 1);
});

test('range, cover and Mimetism do not touch a CC Attack; the shooter keeps its range and the target its Mimetism', () => {
  const ninja = trooper('cc', {cc: 20, skills: [skill(SKILL.MIMETISM, '-6')]}, {inCover: true});
  const shooter = trooper('1:', {}, {inCover: true});
  const {inputs} = derive({active: ninja, reactive: shooter, rangeCm: 120});
  // Ninja: CC 20, nothing from range, cover or the shooter.
  assert.equal(inputs.successValueA, 20);
  // Shooter: BS 12, -6 at 80-120, -6 Mimetism, -3 cover (it's a BS Attack).
  assert.equal(inputs.successValueB, 0);
  const near = derive({active: ninja, reactive: shooter, rangeCm: 40}).inputs;
  assert.equal(near.successValueB, 12 + 3 - 6 - 3);
  // The shooter in cover gets no +3 to its save against the CC Attack;
  // the Ninja in cover keeps it against the shot.
  assert.equal(near.armB, 2);
  assert.equal(near.armA, 2 + 3);
});

test('both sides in CC: the distance changes nothing', () => {
  const at = (rangeCm) => derive({active: trooper('cc', {skills: [skill(MA[3])]}), reactive: trooper('cc'), rangeCm}).inputs;
  assert.deepEqual(at(20), at(240));
});

test('Natural Born Warrior ignores the attacker negative MODs only when it answers in CC', () => {
  const ninja = () => trooper('cc', {skills: [skill(MA[3]), skill(SKILL.SURPRISE_ATTACK, '-3')]}, {surpriseAttack: true});
  const nbw = (key) => trooper(key, {cc: 16, skills: [skill(SKILL.NATURAL_BORN_WARRIOR)]});
  const r = derive({active: ninja(), reactive: nbw('cc')});
  assert.equal(r.inputs.successValueB, 16);
  assert.deepEqual(r.ledger.B.sv.lines.filter((l) => l.struck).map((l) => l.struck), ['Natural Born Warrior', 'Natural Born Warrior']);
  // Dodging or shooting, NBW does nothing.
  assert.equal(derive({active: ninja(), reactive: nbw('dodge')}).inputs.successValueB, 12 - 6);
  assert.equal(derive({active: ninja(), reactive: nbw('1:')}).inputs.successValueB, 12 + 3 - 6);
  // It only protects the target of a CC Attack: a shot gets no such help.
  const shot = trooper('1:', {skills: [skill(SKILL.SURPRISE_ATTACK, '-3')]}, {surpriseAttack: true});
  assert.equal(derive({active: shot, reactive: nbw('cc')}).inputs.successValueB, 16 - 3);
});

test('Martial Arts -3 applies to a Dodge, unless the dodger has Sixth Sense', () => {
  const ma = trooper('cc', {skills: [skill(MA[2])]});
  assert.equal(derive({active: ma, reactive: trooper('dodge')}).inputs.successValueB, 9);
  assert.equal(derive({active: ma, reactive: trooper('dodge', {skills: [skill(SKILL.SIXTH_SENSE)]})}).inputs.successValueB, 12);
});

test('BS Attack (-X) is for shots: not on the opponent of the trooper CC attacking', () => {
  const x = (key) => trooper(key, {skills: [skill(SKILL.BS_ATTACK, '-3')]});
  assert.equal(derive({active: x('cc'), reactive: trooper('cc')}).inputs.successValueB, 15);
  assert.equal(derive({active: x('1:'), reactive: trooper('cc')}).inputs.successValueB, 12);
});

test('CC Attack skill: +X to itself, -X to the opponent, AP on every CC weapon', () => {
  const x = trooper('cc', {skills: [skill(SKILL.CC_ATTACK, '+3'), skill(SKILL.CC_ATTACK, '-6'), skill(SKILL.CC_ATTACK, 'AP')]});
  const {inputs, ledger} = derive({active: x, reactive: trooper('cc', {arm: 5})});
  assert.equal(inputs.successValueA, 18);
  assert.equal(inputs.successValueB, 9);
  assert.equal(inputs.armB, 3);
  assert.ok(ledger.A.ammo.lines.some((l) => l.label === 'AP' && l.by === 'A'));
});

test('MODs to a CC Attack are capped at -12', () => {
  const x = trooper('cc', {skills: [skill(MA[2]), skill(SKILL.CC_ATTACK, '-6'), skill(SKILL.SURPRISE_ATTACK, '-6')]}, {surpriseAttack: true});
  const weapons = [{id: 17, name: 'D-Charges'}];
  // D-Charges are Improvised: -6, then -3 -6 -6 from the opponent = -21, capped.
  assert.equal(derive({active: x, reactive: trooper('cc', {cc: 20, weapons})}).inputs.successValueB, 8);
});

test('PARA CC Weapon: the target saves on PH-6, and its (-X) goes on the opponent', () => {
  const para = trooper('cc', {weapons: [{id: 71, name: 'PARA CC Weapon', extra: ['-3']}]});
  const {inputs} = derive({active: para, reactive: trooper('cc', {ph: 14})});
  assert.equal(inputs.damageA, 0);
  assert.equal(inputs.armB, 8);
  assert.equal(inputs.successValueB, 12);
});

test('Smoke does not stop a CC Attack', () => {
  const r = derive({active: trooper('cc'), reactive: trooper('cc'), zones: {smoke: true}});
  assert.equal(r.inputs.burstA, 1);
  assert.equal(r.inputs.successValueA, 15);
});
