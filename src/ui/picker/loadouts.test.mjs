// Run with: yarn test:js
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {groupLoadouts, loadoutTag, reachGroup, statLine} from './loadouts.js';

const army = JSON.parse(readFileSync(new URL('../../army/army.json', import.meta.url), 'utf8'));
const idOf = (name) => Number(Object.keys(army.weapons).find((id) => army.weapons[id][0].name === name));

test('loadouts group by how far their best weapon reaches', () => {
  assert.equal(reachGroup(army, [idOf('Heavy Machine Gun')]), 'long');
  assert.equal(reachGroup(army, [idOf('Missile Launcher'), idOf('Pistol')]), 'long');
  assert.equal(reachGroup(army, [idOf('Combi Rifle'), idOf('Pistol')]), 'mid');
  assert.equal(reachGroup(army, [idOf('Boarding Shotgun')]), 'close');
  // Support weapons don't count: still a Combi Rifle loadout.
  assert.equal(reachGroup(army, [idOf('Combi Rifle'), idOf('Flash Pulse'), idOf('Disco Baller')]), 'mid');
  assert.equal(reachGroup(army, [idOf('Submachine Gun'), idOf('E/Mitter')]), 'close');
  assert.equal(reachGroup(army, []), 'other');
  assert.equal(reachGroup(null, [1]), 'other');
});

test('groups keep their order and drop empty ones', () => {
  const hits = [{weaponIds: [idOf('Combi Rifle')]}, {weaponIds: [idOf('Heavy Machine Gun')]}];
  assert.deepEqual(groupLoadouts(army, hits).map((g) => g.key), ['long', 'mid']);
});

test('stat line of a unit', () => {
  assert.deepEqual(statLine(army, 1803, 101).slice(0, 3), [['CC', 13], ['BS', 12], ['PH', 10]]);
  assert.equal(statLine(army, -1, 101), null);
});

test('a loadout is tagged with the skills it adds', () => {
  const hit = (optionId) => ({unitId: 1803, armyFactionId: 101, groupId: 1, optionId});
  assert.equal(loadoutTag(army, hit(11)), 'Lieutenant');
  assert.equal(loadoutTag(army, hit(9)), 'Forward Observer, Sensor');
  assert.equal(loadoutTag(army, hit(1)), null);
});
