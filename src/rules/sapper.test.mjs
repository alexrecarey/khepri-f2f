// Run with: yarn test:js
// Sapper: the trooper may sit in a Foxhole (Partial Cover + Mimetism (-3));
// a picked trooper starts in cover, or in its Foxhole when it has Sapper.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {SKILL} from '../army/ids.js';
import {hasSkill} from '../army/traits.js';
import {pickTrooper} from '../state/actions.js';
import {matchupCore} from '../state/matchupView.js';
import {buildLedger, renderDerived} from './ledger.js';
import {deriveInputs as deriveRaw} from './matchup.js';

// The rules word their notes and lines as message descriptors; these tests
// read them in English (ledger.js renders them).
const deriveInputs = (o) => renderDerived(deriveRaw(o));
import {resolveSelection} from './trooper.js';

/** @typedef {import('../types.js').Selection} Selection */

/** @type {import('../types.js').Army} */
const army = JSON.parse(readFileSync(new URL('../army/army.json', import.meta.url), 'utf8'));
/** @param {string} isc a unit in the data */
const unit = (isc) => /** @type {import('../types.js').UnitRow} */ (army.units.find((u) => u.isc.startsWith(isc)));
/**
 * @param {string} isc
 * @param {number} optionId
 * @param {Partial<Selection>} [extra]
 * @returns {Selection}
 */
const sel = (isc, optionId, extra = {}) => {
  const u = unit(isc);
  const [factionId, {groups}] = Object.entries(u.byFaction)[0];
  return /** @type {Selection} */ ({unitId: u.id, factionId: Number(factionId), groupId: groups[0].id, profileId: groups[0].profiles[0].id, optionId, ...extra});
};
/** @param {Selection} s */
const hit = (s) => /** @type {import('../types.js').ProfileHit} */ ({unitId: s.unitId, groupId: s.groupId, optionId: s.optionId, factionId: s.factionId, armyFactionId: s.factionId});

const sapper = sel('Zouaves', 10, {weaponKey: '180:'}); // Minelayer/Sapper, T2 Marksman Rifle
const fusilier = sel('Fusiliers', 1, {weaponKey: '33:'}); // Combi Rifle

test('a Foxhole gives cover and Mimetism (-3); without Sapper the switch does nothing', () => {
  const plain = resolveSelection(army, sapper);
  assert.ok(plain);
  assert.ok(plain.canSapper);
  assert.equal(plain.inCover, false);
  assert.ok(!hasSkill(plain.traits, SKILL.MIMETISM));
  const dug = resolveSelection(army, {...sapper, sapper: true});
  assert.ok(dug);
  assert.equal(dug.sapper, true);
  assert.equal(dug.inCover, true);
  assert.ok(hasSkill(dug.traits, SKILL.MIMETISM));
  assert.equal(resolveSelection(army, {...fusilier, sapper: true})?.sapper, false);
});

test('shooting a trooper in a Foxhole: -3 cover and -3 Mimetism, both in the ledger', () => {
  const active = /** @type {import('../types.js').ResolvedSide} */ (resolveSelection(army, fusilier));
  /** @param {import('../types.js').ResolvedSide} target */
  const sv = (target) => /** @type {number} */ (deriveInputs({active, reactive: target, rangeCm: 40}).inputs.successValueA);
  const open = /** @type {import('../types.js').ResolvedSide} */ (resolveSelection(army, sapper));
  const dug = /** @type {import('../types.js').ResolvedSide} */ (resolveSelection(army, {...sapper, sapper: true}));
  assert.equal(sv(dug), sv(open) - 6);
  const derived = deriveInputs({active, reactive: dug, rangeCm: 40});
  const labels = /** @type {import('../types.js').Section} */ (/** @type {import('../types.js').LedgerSide} */ (buildLedger({active, reactive: dug, derived}).A).sv).lines.map((l) => l.label);
  assert.ok(labels.includes('Mimetism (-3), Foxhole'), labels.join(' | '));
  assert.ok(labels.includes('Foxhole cover'), labels.join(' | '));
});

test('a picked trooper starts in cover, or in its Foxhole with Sapper', () => {
  const f = pickTrooper(army, 'A', hit(fusilier));
  assert.equal(f.sel.inCover, true);
  assert.equal(f.sel.sapper, false);
  const z = pickTrooper(army, 'B', hit(sapper));
  assert.equal(z.sel.sapper, true);
  assert.equal(z.sel.inCover, false);
  // No Cover: cover can't help, so it starts off.
  const noCover = army.units.flatMap((u) => Object.entries(u.byFaction).slice(0, 1).flatMap(([fid, {groups}]) =>
    groups[0].options.map((o) => ({unitId: u.id, factionId: Number(fid), groupId: groups[0].id, optionId: o.id}))))
    .find((s) => hasSkill(resolveSelection(army, s)?.traits, SKILL.NO_COVER));
  assert.ok(noCover);
  assert.equal(pickTrooper(army, 'A', hit(/** @type {Selection} */ (noCover))).sel.inCover, false);
});

test('the side view: the Cover chip is off while the side sits in its Foxhole', () => {
  /** @param {Selection} A */
  const v = (A) => matchupCore(army, {A, B: fusilier, rangeCm: 40}).A;
  assert.equal(v({...sapper, inCover: true}).coverOn, true);
  assert.equal(v({...sapper, inCover: true, sapper: true}).coverOn, false);
  // Without Sapper the switch does nothing, so a stray flag leaves Cover on.
  assert.equal(matchupCore(army, {A: {...fusilier, inCover: true, sapper: true}, B: sapper, rangeCm: 40}).A.coverOn, true);
});
