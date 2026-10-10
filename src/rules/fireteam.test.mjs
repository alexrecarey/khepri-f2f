// Run with: yarn test:js
// Which troopers get a Fireteam option, and how big, from the committed
// army.json (unit.fireteam, built by fetch-army from every army's chart).
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {pickTrooper} from '../state/actions.js';
import {reduce} from '../state/reduce.js';
import {initialState} from '../state/schema.js';
import {fireteamMax} from './modifiers.js';
import {resolveSelection} from './trooper.js';

const army = JSON.parse(readFileSync(new URL('../army/army.json', import.meta.url), 'utf8'));
const unit = (isc) => army.units.find((u) => u.isc.startsWith(isc));
const options = (u) => Object.values(u.byFaction)[0].groups.flatMap((g) => g.options);
const sel = (u, option, extra = {}) => {
  const [factionId, {groups}] = Object.entries(u.byFaction)[0];
  const group = groups.find((g) => g.options.includes(option));
  return {unitId: u.id, factionId: Number(factionId), groupId: group.id, profileId: group.profiles[0].id, optionId: option.id, ...extra};
};

test('a unit gets its most generous fireteam from any army', () => {
  const fennec = unit('Fennec Fusiliers');
  for (const o of options(fennec)) assert.equal(fireteamMax(fennec, o), 5);
  const squalos = unit('Squalos');
  assert.equal(fireteamMax(squalos, options(squalos)[0]), 2);
});

test('only FTO loadouts get an FTO-only fireteam', () => {
  const yanHuo = unit('Yān Huǒ');
  const fto = options(yanHuo).filter((o) => /\bFTO\b/.test(o.name));
  const plain = options(yanHuo).filter((o) => !/\bFTO\b/.test(o.name));
  assert.ok(fto.length && plain.length);
  for (const o of fto) assert.equal(fireteamMax(yanHuo, o), 4);
  for (const o of plain) assert.equal(fireteamMax(yanHuo, o), 1);
});

test('units in no chart, or only in Duos they cannot make pure, get none', () => {
  const dogs = unit('Dog-Warriors');
  assert.equal(fireteamMax(dogs, options(dogs)[0]), 1);
});

test("a size above the trooper's max drops to it", () => {
  const squalos = unit('Squalos');
  const r = resolveSelection(army, sel(squalos, options(squalos)[0], {ftSize: 5}));
  assert.equal(r.ftMax, 2);
  assert.equal(r.ftSize, 2);
});

test('picking a trooper keeps the fireteam size only as far as it can go', () => {
  const fennec = unit('Fennec Fusiliers');
  const squalos = unit('Squalos');
  const dogs = unit('Dog-Warriors');
  const hit = (u) => {
    const s = sel(u, options(u)[0]);
    return {unitId: s.unitId, groupId: s.groupId, optionId: s.optionId, factionId: s.factionId, armyFactionId: s.factionId};
  };
  let s = reduce(initialState(), pickTrooper(army, 'A', hit(fennec)));
  s = reduce(s, {type: 'patchSide', side: 'A', patch: {ftSize: 5}});
  s = reduce(s, pickTrooper(army, 'A', hit(squalos)));
  assert.equal(s.matchup.A.ftSize, 2);
  s = reduce(s, pickTrooper(army, 'A', hit(dogs)));
  assert.equal(s.matchup.A.ftSize, 1);
});
