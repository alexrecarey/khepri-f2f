// Forward Observer (army/forwardObserver.js): the skill as a BS Attack on WIP
// whose hit is Targeted, with no Saving Roll.
// Run with: yarn test:js
import test from 'node:test';
import assert from 'node:assert/strict';
import {trooperForwardObserver} from '../army/forwardObserver.js';
import {effectiveTraits} from '../army/traits.js';
import {noSavingRoll, stateCaused} from '../army/weapons.js';
import {calculate} from '../engine/calculate.js';
import {fullParams} from '../engine/params.js';
import {render} from '../i18n/message.js';
import {tEn} from '../i18n/index.js';
import {defaultWeapon} from './defaultWeapon.js';
import {fireteamHelps, targetedHelps} from './modifiers.js';
import {winState} from './smoke.js';
import {derive, option, profile} from './testFixtures.mjs';
import {W, combi, immune, label, mimetic, minus3, side} from './testMatchups.mjs';
import {trooperWeapons} from './trooper.js';
import {woundStates} from './woundStates.js';

/** @typedef {import('../types.js').LedgerSide} LedgerSide */

const FO = {id: 59, name: 'Forward Observer'};
/**
 * A WIP 13 Forward Observer with a Combi Rifle, on its skill.
 * @param {Partial<import('../types.js').ProfileRow>} [over]
 * @param {string[]} [extra] the skill's bracketed values
 */
const observer = (over = {}, extra) => side(profile({wip: 13, ...over, skills: [{...FO, ...(extra && {extra})}, ...(over.skills ?? [])]}), combi, 'fo');
/** @param {Partial<import('../types.js').ProfileRow>} [over] */
const rifle = (over = {}) => side(profile(over), combi, '1:');
/**
 * @param {import('../types.js').Trooper} a
 * @param {import('../types.js').Trooper} b
 * @param {number} [rangeCm]
 */
const at = (a, b, rangeCm = 40) => derive({active: a, reactive: b, rangeCm});

test('the skill is a weapon choice: B2, no PS, Targeted; its bracketed MODs are the weapon\'s', () => {
  const traits = effectiveTraits(profile({skills: [FO]}), combi);
  const [fo, ...rest] = trooperForwardObserver(traits);
  assert.deepEqual(rest, []);
  assert.deepEqual([fo.key, fo.kind, label(fo)], ['fo', 'bs', 'Forward Observer · B2 · Targeted']);
  assert.deepEqual([noSavingRoll(fo.row), stateCaused(fo.row)], [true, 'Targeted']);
  // After the loadout's weapons in the list.
  assert.deepEqual(trooperWeapons(combi, W, traits).map((w) => w.key), ['1:', 'fo']);
  assert.deepEqual(trooperForwardObserver(effectiveTraits(profile(), combi)), [], 'no skill, no choice');
  const sd = trooperForwardObserver(effectiveTraits(profile({skills: [{...FO, extra: ['+1SD']}]}), combi))[0];
  assert.equal(label(sd), 'Forward Observer · B2+1SD · Targeted');
  // The army's own name, the English kept for the rules.
  const es = trooperForwardObserver({skills: [{id: 59, name: 'Observador de Artillería'}], equip: []})[0];
  assert.deepEqual([es.name, es.row.en], ['Observador de Artillería', 'Forward Observer']);
});

test('a BS Attack on WIP: Range MODs, the target\'s MODs, B2 in the Active Turn, no Saving Roll', () => {
  const r = at(observer(), rifle());
  assert.equal(r.ok, true);
  const p = r.inputs;
  assert.deepEqual([p.successValueA, p.burstA, p.bonusBurstA, p.ammoA, p.damageA, p.templateA, p.unopposed], [13, 2, 0, 'STATE', 0, false, false]);
  const l = /** @type {LedgerSide} */ (r.ledger.A);
  assert.equal(l.dice, 'B2 SV13');
  assert.equal(l.save, undefined, 'no Saving Roll to explain');
  assert.equal(/** @type {import('../types.js').Section} */ (l.ammo).total, 'Targeted');
  assert.deepEqual(r.notes, ['Active: Forward Observer; a hit leaves the target Targeted, with no Saving Roll']);
  assert.deepEqual(r.warnings, [], 'no Non-lethal warning: the results say Targeted');
  // 0 to 24", -3 to 48", -6 to 96", then out of range.
  assert.deepEqual([60, 61, 120, 121, 240].map((cm) => at(observer(), rifle(), cm).inputs.successValueA), [13, 10, 10, 7, 7]);
  // Mimetism (-3) and cover (-3): it has a target, unlike Smoke.
  assert.equal(at(observer(), side(mimetic(-3), combi, '1:', true)).inputs.successValueA, 7);
  // The skill's +1SD.
  assert.equal(at(observer({}, ['+1SD']), rifle()).inputs.bonusBurstA, 1);
});

test('in ARO it is one die, Face to Face against the shot', () => {
  const r = at(rifle(), observer());
  assert.deepEqual([r.inputs.successValueB, r.inputs.burstB, r.inputs.ammoB, r.inputs.unopposed], [13, 1, 'STATE', false]);
  assert.equal(/** @type {LedgerSide} */ (r.ledger.B).dice, 'B1 SV13');
});

test('a Dodge evades it, Face to Face; a Reset doesn\'t', () => {
  const dodge = at(observer(), side(profile(), combi, 'dodge'));
  assert.deepEqual([dodge.inputs.burstA, dodge.inputs.burstB, dodge.inputs.ammoB, dodge.inputs.unopposed], [2, 1, 'DODGE', false]);
  const reset = at(observer(), side(profile({wip: 13}), combi, 'reset'));
  assert.deepEqual([reset.inputs.burstA, reset.inputs.burstB], [2, 0]);
});

test('a hit is Targeted: each win counts as one, shown as that State', () => {
  const a = observer();
  const p = fullParams(at(a, rifle()).inputs);
  const result = calculate(p, () => ({rolls: 400, outcomes: [
    {player: 'active', wounds: 0, chance: 0.5}, {player: 'reactive', wounds: 1, chance: 0.3}, {player: 'fail', wounds: 0, chance: 0.2},
  ]}));
  assert.deepEqual(result.expectedWounds.filter((x) => x.player === 'active').map((x) => [x.wounds, x.chance]), [[1, 0.5]]);
  // The rifle's wounds are its own.
  assert.deepEqual(result.expectedWounds.filter((x) => x.player === 'reactive').map((x) => x.wounds), [1]);
  assert.equal(winState(a, false), 'Targeted');
  const [step, ...rest] = woundStates(profile(), null, {state: winState(a, false)});
  assert.deepEqual(rest, []);
  assert.deepEqual([step.key, render(tEn, step.label)], ['targeted', 'Targeted']);
});

test('it is a BS Attack: Fireteam, BS Attack (-X) and Targeted count; no Immunity stops it', () => {
  const team = {...observer(), ftSize: 4};
  const r = at(team, rifle()).inputs;
  assert.deepEqual([r.successValueA, r.bonusBurstA], [14, 1]);
  assert.equal(fireteamHelps(team), true);
  // BS Attack (-3) goes on the opponent's roll, as with any BS Attack: BS 12, +3 range, -3.
  assert.equal(at(observer({skills: [minus3]}), rifle()).inputs.successValueB, 12);
  // Wiki, Targeted State: +3 to any BS Attack against the trooper.
  assert.equal(targetedHelps(observer()), true);
  assert.equal(at(observer(), {...rifle(), targeted: true}).inputs.successValueA, 16);
  // No Saving Roll: Immunity (ARM) / (BTS) have nothing to treat as Normal.
  for (const kind of ['ARM', 'BTS', 'Enhanced']) {
    const i = at(observer(), side(immune(kind), combi, '1:'));
    assert.equal(i.inputs.ammoA, 'STATE', kind);
    assert.deepEqual(i.warnings, [], kind);
  }
});

test('never the default weapon while there is another', () => {
  const traits = effectiveTraits(profile({skills: [FO]}), combi);
  for (const role of /** @type {const} */ (['active', 'reactive'])) {
    assert.equal(defaultWeapon(trooperWeapons(combi, W, traits), role)?.key, '1:', role);
    assert.equal(defaultWeapon(trooperWeapons(option([]), W, traits), role)?.key, 'fo', role);
  }
});
