// Run with: yarn test:js
import test from 'node:test';
import assert from 'node:assert/strict';
import {SKILL} from '../army/ids.js';
import {woundStates} from './woundStates.js';

const skills = (...ids) => ({skills: ids.map((id) => ({id})), equip: []});
const labels = (w, traits = skills(), opts) => woundStates({w}, traits, opts).map((s) => s.label);

test('VITA / STR n: wounds, then Unconscious, then Dead', () => {
  assert.deepEqual(labels(1), ['Unconscious', 'Dead']);
  assert.deepEqual(labels(2), ['1 wound', 'Unconscious', 'Dead']);
  assert.deepEqual(labels(3), ['1 wound', '2 wounds', 'Unconscious', 'Dead']);
  assert.deepEqual(labels(4), ['1 wound', '2 wounds', '3 wounds', 'Unconscious', 'Dead']);
  assert.deepEqual(woundStates({w: 3}).map((s) => s.wounds), [1, 2, 3, 4]);
});

test('Remote Presence adds a second Unconscious', () => {
  const rp = skills(SKILL.REMOTE_PRESENCE);
  assert.deepEqual(labels(1, rp), ['Unconscious', 'Unconscious ×2', 'Dead']);
  assert.deepEqual(labels(3, rp), ['1 wound', '2 wounds', 'Unconscious', 'Unconscious ×2', 'Dead']);
  assert.deepEqual(woundStates({w: 3, str: true}, rp).map((s) => s.wounds), [1, 2, 3, 4, 5]);
});

test('NWI and Dogged rename Unconscious and keep fighting', () => {
  assert.deepEqual(labels(2, skills(SKILL.NWI)), ['1 wound', 'NWI', 'Dead']);
  assert.deepEqual(labels(1, skills(SKILL.DOGGED)), ['Dogged', 'Dead']);
  const out = (traits) => woundStates({w: 2}, traits).filter((s) => s.outOfFight).map((s) => s.key);
  assert.deepEqual(out(skills()), ['unc', 'dead']);
  assert.deepEqual(out(skills(SKILL.NWI)), ['dead']);
  assert.deepEqual(out(skills(SKILL.DOGGED)), ['dead']);
});

test('Shock against VITA 1: straight to Dead', () => {
  assert.deepEqual(labels(1, skills(SKILL.DOGGED), {shock: true}), ['Dead']);
  assert.equal(woundStates({w: 1}, skills(), {shock: true})[0].shock, true);
});
