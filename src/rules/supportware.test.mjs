// Supportware: Assisted Fire (Marksmanship) and Enhanced Reaction (B2 in ARO)
// on a REM of an army with an EVO hacker. Run with: yarn test:js
import test from 'node:test';
import assert from 'node:assert/strict';
import {army} from '../army/testArmy.mjs';
import {option, profile} from './testFixtures.mjs';
import {assistedFireTraits, supportwareChips} from './supportware.js';
import {resolveSelection} from './trooper.js';
import {albedo, byIsc, combi, duel, side} from './testMatchups.mjs';

/** @typedef {import('../types.js').Trooper} Trooper */
/** @typedef {import('../types.js').Section} Section */

const REM = profile({type: 'REM'});
const TOTAL_REACTION = {id: 61, name: 'Total Reaction'};
const missile = option([{id: 9, name: 'Missile Launcher'}]);

/**
 * A side running a Supportware (resolveSelection sets these for a REM of an
 * army with an EVO hacker).
 * @param {Trooper} s
 * @param {'assistedFire' | 'enhancedReaction'} id
 * @returns {Trooper}
 */
const running = (s, id) => ({
  ...s, canSupportware: true, supportware: id,
  ...(id === 'assistedFire' && {traits: assistedFireTraits(/** @type {import('../types.js').Traits} */ (s.traits))}),
});

/** @param {Section | undefined} sec */
const labels = (sec) => (sec?.lines ?? []).map((l) => l.label);

test('Enhanced Reaction: a REM shooting in ARO rolls two dice', () => {
  const shooter = side(profile(), combi, '1:');
  const r = duel(shooter, running(side(REM, combi, '1:'), 'enhancedReaction'));
  assert.equal(r.inputs.burstB, 2);
  assert.ok(labels(r.ledger.B?.burst).includes('Enhanced Reaction: B2 in ARO'));
  // Without it: one die.
  assert.equal(duel(shooter, side(REM, combi, '1:')).inputs.burstB, 1);
});

test('Enhanced Reaction: nothing in the Active Turn, with Total Reaction, a B1 weapon or a Dodge', () => {
  const target = side(profile(), combi, '1:');
  // Active: the full Burst already.
  assert.equal(duel(running(side(REM, combi, '1:'), 'enhancedReaction'), target).inputs.burstA, 3);
  // Total Reaction keeps the full Burst: B3, not B2.
  const tr = profile({type: 'REM', skills: [TOTAL_REACTION]});
  assert.equal(duel(target, running(side(tr, combi, '1:'), 'enhancedReaction')).inputs.burstB, 3);
  // A B1 Missile Launcher stays B1: never above the weapon's Burst.
  assert.equal(duel(target, running(side(REM, missile, '9:Hit Mode'), 'enhancedReaction')).inputs.burstB, 1);
  // A Dodge rolls one die whatever.
  assert.equal(duel(target, running(side(REM, combi, 'dodge'), 'enhancedReaction')).inputs.burstB, 1);
});

test('Assisted Fire: Marksmanship ignores the cover MOD, not the +3 save, and Albedo now applies', () => {
  const inCover = side(profile(), combi, '1:', true);
  const plain = duel(side(REM, combi, '1:'), inCover);
  const assisted = duel(running(side(REM, combi, '1:'), 'assistedFire'), inCover);
  // BS 12 +3 range, -3 cover off.
  assert.equal(plain.inputs.successValueA, 12);
  assert.equal(assisted.inputs.successValueA, 15);
  assert.equal(assisted.inputs.armB, plain.inputs.armB);
  const struck = (assisted.ledger.A?.sv?.lines ?? []).find((l) => l.label === 'cover');
  assert.equal(struck?.struck, 'Marksmanship, Assisted Fire');
  // Albedo (-3) only works against Marksmanship (or MSV).
  const albedoTarget = side(profile({equip: [albedo('-3')]}), combi, '1:');
  assert.equal(duel(side(REM, combi, '1:'), albedoTarget).inputs.successValueA, 15);
  assert.equal(duel(running(side(REM, combi, '1:'), 'assistedFire'), albedoTarget).inputs.successValueA, 12);
});

test('the chips: Assisted Fire for a BS Attack, Enhanced Reaction for one in ARO that it raises', () => {
  const rem = running(side(REM, combi, '1:'), 'assistedFire');
  assert.deepEqual(supportwareChips(rem, 'A'), ['assistedFire']);
  assert.deepEqual(supportwareChips(rem, 'B'), ['assistedFire', 'enhancedReaction']);
  assert.deepEqual(supportwareChips(running(side(REM, combi, 'dodge'), 'assistedFire'), 'B'), []);
  assert.deepEqual(supportwareChips(running(side(REM, missile, '9:Hit Mode'), 'assistedFire'), 'B'), ['assistedFire']);
  const tr = profile({type: 'REM', skills: [TOTAL_REACTION]});
  assert.deepEqual(supportwareChips(running(side(tr, combi, '1:'), 'assistedFire'), 'B'), ['assistedFire']);
  // Marksmanship of its own: Assisted Fire adds nothing.
  const marksman = profile({type: 'REM', skills: [{id: 156, name: 'Marksmanship'}]});
  assert.deepEqual(supportwareChips(running(side(marksman, combi, '1:'), 'assistedFire'), 'A'), []);
  // Not a target (not a REM, or no EVO hacker in its army): none.
  assert.deepEqual(supportwareChips(side(REM, combi, '1:'), 'B'), []);
});

// Real data: PanOceania fields EVO hackers, Ariadna none.
const pathfinder = byIsc('Pathfinder Dronbot');
const vystrel = byIsc('Vystrel Mobile Artillery Regiment');
/**
 * @param {import('../types.js').UnitRow} unit
 * @param {number} factionId
 * @param {Partial<import('../types.js').Selection>} [over]
 */
const sel = (unit, factionId, over = {}) => {
  const group = unit.byFaction[factionId].groups[0];
  return {unitId: unit.id, factionId, groupId: group.id, profileId: group.profiles[0].id, optionId: group.options[0].id, ...over};
};

test('a REM can take Supportware only when its army list has an EVO hacker', () => {
  const pano = resolveSelection(army, sel(pathfinder, 101, {supportware: 'assistedFire'}));
  assert.equal(pano?.canSupportware, true);
  assert.equal(pano?.supportware, 'assistedFire');
  assert.ok(pano?.traits?.skills.some((s) => s.id === 156 && s.supportware === 'assistedFire'));
  const ariadna = resolveSelection(army, sel(vystrel, 301, {supportware: 'assistedFire'}));
  assert.equal(ariadna?.canSupportware, false);
  assert.equal(ariadna?.supportware, null);
  assert.ok(!ariadna?.traits?.skills.some((s) => s.id === 156));
  // Not a REM: a Fusilier in PanOceania.
  const fusilier = resolveSelection(army, sel(byIsc('Fusiliers'), 101, {supportware: 'enhancedReaction'}));
  assert.equal(fusilier?.canSupportware, false);
  assert.equal(fusilier?.supportware, null);
});
