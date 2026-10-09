// Run with: yarn test:js
import test from 'node:test';
import assert from 'node:assert/strict';
import {fireteamLimits} from './fireteams.js';

const entry = (name, slug, max = 1, comment = '') => ({min: 0, max, name, comment, required: false, slug});
const VANILLA = {CORE: 0, HARIS: 1, DUO: 2};
const SECTORIAL = {CORE: 1, HARIS: 1, DUO: 256};

test('each unit gets its most generous team across armies', () => {
  const vanilla = {spec: VANILLA, teams: [{type: ['DUO'], units: [entry('FUSILIER', 'fusiliers', 2)]}]};
  const sectorial = {spec: SECTORIAL, teams: [{type: ['HARIS', 'CORE'], units: [entry('FUSILIER', 'fusiliers', 5)]}]};
  assert.equal(fireteamLimits([vanilla, sectorial]).fusiliers.all, 5);
});

test('Core only counts where the army fields it, and respects its cap', () => {
  const vanilla = {spec: VANILLA, teams: [{type: ['HARIS', 'CORE'], units: [entry('BOLT', 'bolts', 3)]}]};
  assert.equal(fireteamLimits([vanilla]).bolts.all, 3);
  const capped = {spec: SECTORIAL, desc: 'In this Sectorial, the Fireteams Core have a maximum of 4 members.',
    teams: [{type: ['CORE'], units: [entry('HOPLITE', 'hoplites', 4)]}]};
  assert.equal(fireteamLimits([capped]).hoplites.all, 4);
});

test('a Duo counts only when it can be pure', () => {
  const chart = {spec: VANILLA, teams: [{type: ['DUO'], units: [
    entry('SQUALO', 'squalos', 2), entry('TIKBALANG', 'tikbalangs', 1),
    entry('PATSY', 'patsy', 1, '(Orc, Helot)'), entry('ORC', 'orcs', 1),
  ]}]};
  const ft = fireteamLimits([chart]);
  assert.equal(ft.squalos.all, 2); // may appear twice
  assert.equal(ft.tikbalangs.all, 0); // once only, counts as nobody: no bonus
  assert.equal(ft.patsy.all, 2); // counts as an Orc, who is in the team
});

test('FTO entries apply to FTO loadouts only', () => {
  const chart = {spec: SECTORIAL, teams: [{type: ['DUO', 'HARIS'], units: [entry('YĀN HUǑ FTO', 'yan-huo', 2)]}]};
  assert.deepEqual(fireteamLimits([chart])['yan-huo'], {all: 0, fto: 3});
});

test('wildcards join the largest team type the army fields', () => {
  const chart = {spec: VANILLA, teams: [{type: [], units: [entry('QUINN', 'quinn')]}]};
  assert.equal(fireteamLimits([chart]).quinn.all, 3);
});
