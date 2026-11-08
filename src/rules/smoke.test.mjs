// Smoke and Eclipse Ammunition (rules/smoke.js): a rolled BS Attack that hits
// nobody, Face to Face against the attacks that need LoF through it.
// Run with: yarn test:js
import test from 'node:test';
import assert from 'node:assert/strict';
import {effectiveTraits} from '../army/traits.js';
import {bsWeapons, isBsAttackWeapon} from '../army/weapons.js';
import {calculate, isUnopposed} from '../engine/calculate.js';
import {fullParams} from '../engine/params.js';
import {render} from '../i18n/message.js';
import {tEn} from '../i18n/index.js';
import {defaultWeapon} from './defaultWeapon.js';
import {fireteamHelps, targetedHelps} from './modifiers.js';
import {derive, option, profile, weaponTable} from './testFixtures.mjs';
import {W, combi, immune, jammer, mimetic, msv, flamer, hacker, minus3} from './testMatchups.mjs';
import {pseudoWeapons, trooperCcWeapons, trooperWeapons} from './trooper.js';
import {woundStates} from './woundStates.js';

/** @typedef {import('../types.js').Trooper} Trooper */
/** @typedef {import('../types.js').LedgerSide} LedgerSide */

const SMOKE_RANGES = [{to: 20, mod: 0}, {to: 40, mod: -3}];
// The chart's rows as the Army lists them (army.json 45, 46, 195, 208).
const SW = {...W, ...weaponTable({
  45: [{name: 'Smoke Grenades', mode: null, ammo: 'Smoke', burst: 1, dmg: null, ranges: SMOKE_RANGES,
    props: ['Speculative Attack', 'BS Weapon (PH)', 'Impact Template (Circular)', 'Non-lethal', 'Targetless', '[**]']}],
  46: [{name: 'Eclipse Grenades', mode: null, ammo: 'Eclipse', burst: 1, dmg: null, ranges: SMOKE_RANGES,
    props: ['Speculative Attack', 'BS Weapon (PH)', 'Impact Template (Circular)', 'Non-lethal', 'Reflective', 'Targetless', '[**]']}],
  195: [{name: 'Smoke Grenade Launcher', mode: null, ammo: 'Smoke', burst: 1, dmg: null, ranges: [{to: 60, mod: 0}, {to: 80, mod: -3}, {to: 120, mod: -6}],
    props: ['Speculative Attack', 'Non-lethal', 'Impact Template (Circular)', 'Targetless', '[**]']}],
  208: [{name: 'Disco Baller', mode: null, ammo: null, burst: 1, dmg: null, ranges: SMOKE_RANGES,
    props: ['Speculative Attack', 'Disposable (2)', 'Double Shot', 'Targetless', '[*]']}],
})};

/**
 * testMatchups.js side(), over the table with the smoke rows.
 * @param {import('../types.js').ProfileRow} p
 * @param {import('../types.js').OptionRow} o
 * @param {string} weaponKey
 * @param {boolean} [inCover]
 * @returns {Trooper}
 */
const side = (p, o, weaponKey, inCover = false) => {
  const traits = effectiveTraits(p, o);
  const weapon = [...trooperWeapons(o, SW, traits), ...trooperCcWeapons(o, SW, traits), ...pseudoWeapons(traits)].find((w) => w.key === weaponKey) ?? null;
  return /** @type {Trooper} */ ({profile: p, option: o, traits, weapon, inCover});
};
const grenades = option([{id: 1, name: 'Combi Rifle'}, {id: 45, name: 'Smoke Grenades'}, {id: 46, name: 'Eclipse Grenades'}, {id: 8, name: 'CC Weapon'}]);
// A Yojimbo-like PH 14 trooper throwing its Smoke Grenades.
/**
 * @param {Partial<import('../types.js').ProfileRow>} [over]
 * @param {string} [key]
 */
const thrower = (over = {}, key = '45:') => side(profile({ph: 14, ...over}), grenades, key);
/** @param {Partial<import('../types.js').ProfileRow>} [over] */
const rifle = (over = {}) => side(profile(over), combi, '1:');
/**
 * @param {Trooper} a
 * @param {Trooper} b
 */
const at8 = (a, b) => derive({active: a, reactive: b, rangeCm: 20});

test('Smoke in ARO against a shot: Face to Face, PH and Range MODs, none of the target\'s MODs', () => {
  // The shooter is Mimetic and in cover: neither touches a throw at a point.
  const r = at8(side(mimetic(-3), combi, '1:', true), thrower());
  assert.equal(r.ok, true);
  const p = r.inputs;
  assert.deepEqual([p.successValueB, p.burstB, p.ammoB, p.damageB, p.templateB, p.unopposed], [14, 1, 'SMOKE', 0, false, false]);
  // The shot at the thrower is a normal one: BS 12 +3.
  assert.equal(p.successValueA, 15);
  const l = /** @type {LedgerSide} */ (r.ledger.B);
  assert.equal(l.dice, 'B1 SV14 Smoke');
  assert.equal(l.save, undefined, 'no Saving Roll to explain');
  const struck = /** @type {import('../types.js').Section} */ (l.sv).lines.filter((x) => x.struck);
  assert.deepEqual(struck.map((x) => [x.label, x.struck]), [['Mimetism (-3)', 'Targetless'], ['cover', 'Targetless']]);
  // Out past the grenade's last band: always fails.
  assert.equal(derive({active: rifle(), reactive: thrower(), rangeCm: 60}).inputs.successValueB, 0);
  assert.equal(derive({active: rifle(), reactive: thrower(), rangeCm: 40}).inputs.successValueB, 11);
  assert.deepEqual(r.warnings, [], 'no Non-lethal warning: the results say Smoke placed');
});

test('a Smoke win places the template: one "wound", shown as Smoke placed, nobody out of the fight', () => {
  const p = fullParams(at8(rifle(), thrower()).inputs);
  const result = calculate(p, () => ({rolls: 400, outcomes: [
    {player: 'active', wounds: 1, chance: 0.3}, {player: 'active', wounds: 0, chance: 0.2},
    {player: 'reactive', wounds: 0, chance: 0.4}, {player: 'fail', wounds: 0, chance: 0.1},
  ]}));
  assert.deepEqual(result.expectedWounds.filter((x) => x.player === 'reactive').map((x) => [x.wounds, x.chance]), [[1, 0.4]]);
  // The shooter's wounds are its own.
  assert.deepEqual(result.expectedWounds.filter((x) => x.player === 'active').map((x) => x.wounds), [0, 1]);
  const [placed, ...rest] = woundStates(profile(), null, {state: 'Smoke'});
  assert.deepEqual(rest, []);
  assert.deepEqual([placed.key, render(tEn, placed.label), placed.outOfFight], ['smoke', 'Smoke placed', false]);
  assert.equal(render(tEn, woundStates(profile(), null, {state: 'Eclipse'})[0].label), 'Eclipse placed');
});

test('a Multispectral Visor sees through Smoke: two Normal Rolls; Eclipse is Reflective, so it is opposed', () => {
  for (const level of [1, 2, 3]) {
    const r = at8(rifle({equip: [msv(level)]}), thrower());
    assert.equal(r.inputs.unopposed, true, `MSV${level}`);
    assert.equal(isUnopposed(fullParams(r.inputs)), true);
    assert.ok(r.notes.includes(`MSV${level} sees through the Smoke: no Face to Face Roll, each side rolls on its own`), r.notes.join(' | '));
  }
  // Not opposed, so the thrower's BS Attack (-3) doesn't reach the shot.
  assert.equal(at8(rifle({equip: [msv(2)]}), thrower({skills: [minus3]})).inputs.successValueA, 15);
  const e = at8(rifle({equip: [msv(2)]}), thrower({}, '46:'));
  assert.equal(e.inputs.unopposed, false);
  assert.equal(e.inputs.ammoB, 'SMOKE');
  assert.equal(/** @type {LedgerSide} */ (e.ledger.B).dice, 'B1 SV14 Eclipse');
  assert.equal(at8(rifle(), thrower()).inputs.unopposed, false, 'no MSV: opposed');
});

test('a Dodge is not opposed to Smoke: it isn\'t rolled, the throw is a Normal Roll', () => {
  const r = at8(thrower(), side(profile(), combi, 'dodge'));
  assert.equal(r.ok, true);
  assert.equal(r.inputs.burstB, 0);
  assert.equal(r.inputs.burstA, 1);
  assert.ok(r.notes.includes('Reactive: a Dodge is not opposed to the Smoke Grenades; it is rolled unopposed'), r.notes.join(' | '));
  assert.equal(/** @type {LedgerSide} */ (r.ledger.B).reason, 'Against Smoke a Dodge is a Normal Roll, not opposed.');
  // No ARO: the same Normal Roll.
  assert.equal(at8(thrower(), side(profile(), combi, 'none')).inputs.burstA, 1);
});

test('a CC Attack or a Comms Attack needs no LoF through the Smoke: each side rolls on its own', () => {
  const cc = at8(side(profile(), combi, '8:'), thrower());
  assert.equal(cc.inputs.unopposed, true);
  assert.ok(cc.notes.includes('A CC Attack needs no LoF through the Smoke: no Face to Face Roll, each side rolls on its own'), cc.notes.join(' | '));
  const jam = at8(side(hacker(), jammer, '21:'), thrower());
  assert.equal(jam.inputs.unopposed, true);
  assert.ok(jam.notes.some((n) => n.startsWith('Jammer needs no LoF')), jam.notes.join(' | '));
});

test('a Direct Template against Smoke: the template hits, the Smoke is a Normal Roll', () => {
  const r = at8(side(profile(), flamer, '3:'), thrower());
  assert.equal(r.inputs.templateA, true);
  assert.equal(r.inputs.unopposed, false);
  assert.equal(isUnopposed(fullParams(r.inputs)), true);
});

test('Smoke is a BS Attack: Fireteam and BS Attack (-X) count; Targeted, Immunity and the target\'s MODs don\'t', () => {
  const team = {...thrower(), ftSize: 4};
  const r = at8(rifle(), team).inputs;
  assert.deepEqual([r.successValueB, r.bonusBurstB], [15, 1]);
  assert.equal(fireteamHelps(team), true);
  assert.equal(targetedHelps(thrower()), false);
  // BS Attack (-3): the opponent's shot takes it, as against any BS Attack.
  assert.equal(at8(rifle(), thrower({skills: [minus3]})).inputs.successValueA, 12);
  // A Targeted shooter gives the throw nothing.
  assert.equal(at8({...rifle(), targeted: true}, thrower()).inputs.successValueB, 14);
  // Immunity has nothing to stop.
  assert.deepEqual(at8(side(immune('ARM'), combi, '1:'), thrower()).warnings, []);
});

test('Smoke is never the default weapon while there is another; Disco Baller stays out', () => {
  const o = (/** @type {number[]} */ ...ids) => option(ids.map((id) => ({id, name: 'x'})));
  // The Launcher's 0 MOD reaches 24", farther than the Heavy Pistol's +3.
  assert.equal(defaultWeapon(bsWeapons(o(195, 45, 6), SW), 'reactive')?.key, '6:');
  assert.equal(defaultWeapon(bsWeapons(o(45, 6), SW), 'active')?.key, '6:');
  assert.equal(defaultWeapon(bsWeapons(o(45), SW), 'reactive')?.key, '45:');
  assert.deepEqual(bsWeapons(o(45, 195, 208), SW).map((w) => [w.key, w.kind]), [['45:', 'smoke'], ['195:', 'smoke']]);
  assert.equal(isBsAttackWeapon(SW[208][0]), false);
});

test('Smoke and Eclipse Grenades are thrown within 8": their pick moves the range; a Launcher\'s doesn\'t', () => {
  const o = option([{id: 45, name: 'x'}, {id: 46, name: 'x'}, {id: 195, name: 'x'}, {id: 1, name: 'x'}]);
  const ws = trooperWeapons(o, SW, effectiveTraits(profile(), o));
  assert.deepEqual(ws.map((w) => [w.key, Boolean(w.throwsClose)]), [['45:', true], ['46:', true], ['195:', false], ['1:', false]]);
});
