// Run with: yarn test:js
// Sapper: the trooper may sit in a Foxhole (Partial Cover + Mimetism (-3));
// a picked trooper starts in cover, or in its Foxhole when it has Sapper.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {SKILL} from '../army/ids.js';
import {hasSkill} from '../army/traits.js';
import {pickTrooper} from '../state/actions.js';
import {buildLedger} from './ledger.js';
import {deriveInputs} from './matchup.js';
import {resolveSelection} from './trooper.js';

const army = JSON.parse(readFileSync(new URL('../army/army.json', import.meta.url), 'utf8'));
const unit = (isc) => army.units.find((u) => u.isc.startsWith(isc));
const sel = (isc, optionId, extra = {}) => {
  const u = unit(isc);
  const [factionId, {groups}] = Object.entries(u.byFaction)[0];
  return {unitId: u.id, factionId: Number(factionId), groupId: groups[0].id, profileId: groups[0].profiles[0].id, optionId, ...extra};
};
const hit = (s) => ({unitId: s.unitId, groupId: s.groupId, optionId: s.optionId, factionId: s.factionId, armyFactionId: s.factionId});

const sapper = sel('Zouaves', 10, {weaponKey: '180:'}); // Minelayer/Sapper, T2 Marksman Rifle
const fusilier = sel('Fusiliers', 1, {weaponKey: '33:'}); // Combi Rifle

test('a Foxhole gives cover and Mimetism (-3); without Sapper the switch does nothing', () => {
  const plain = resolveSelection(army, sapper);
  assert.ok(plain.canSapper);
  assert.equal(plain.inCover, false);
  assert.ok(!hasSkill(plain.traits, SKILL.MIMETISM));
  const dug = resolveSelection(army, {...sapper, sapper: true});
  assert.equal(dug.sapper, true);
  assert.equal(dug.inCover, true);
  assert.ok(hasSkill(dug.traits, SKILL.MIMETISM));
  assert.equal(resolveSelection(army, {...fusilier, sapper: true}).sapper, false);
});

test('shooting a trooper in a Foxhole: -3 cover and -3 Mimetism, both in the ledger', () => {
  const active = resolveSelection(army, fusilier);
  const sv = (target) => deriveInputs({active, reactive: target, rangeCm: 40}).inputs.successValueA;
  const open = resolveSelection(army, sapper);
  const dug = resolveSelection(army, {...sapper, sapper: true});
  assert.equal(sv(dug), sv(open) - 6);
  const {inputs} = deriveInputs({active, reactive: dug, rangeCm: 40});
  const labels = buildLedger({active, reactive: dug, rangeCm: 40, inputs}).A.sv.lines.map((l) => l.label);
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
  assert.equal(pickTrooper(army, 'A', hit(noCover)).sel.inCover, false);
});
