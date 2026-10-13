// Run with: yarn test:js
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {groupLoadouts, loadoutCharts, loadoutTag, mainWeapon, orderLoadouts, reachGroup, statLine, unitDetail, weaponChart} from './loadouts.js';
import {lieutenantTwins} from '../../search/buildIndex.js';

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
  assert.equal(loadoutTag(army, hit(11)), null); // Lieutenant only: not a tag
  assert.equal(loadoutTag(army, hit(9)), 'Forward Observer, Sensor');
  assert.equal(loadoutTag(army, hit(1)), null);
});

test('weapon charts: bands per range column, main gun first', () => {
  const ml = weaponChart(army, idOf('Missile Launcher'));
  assert.equal(ml.bands.length, 7);
  assert.equal(ml.bands[3], 3);                        // 24-32" is +3
  assert.equal(weaponChart(army, idOf('Chain Rifle')).bands.every((b) => b === null), true);
  const charts = loadoutCharts(army, [idOf('Flash Pulse'), idOf('Combi Rifle'), idOf('Pistol')]);
  assert.equal(charts[0].name, 'Combi Rifle');
  const d = unitDetail(army, 1803, 101);
  assert.equal(d.profiles[0].stats[0][0], 'MOV');
  assert.equal(d.profiles[0].stats[0][1], '4-4');
});

test('Swiss Guard: SWC loadouts first (longer reach first), main gun is the farthest-reaching weapon', async () => {
  const {createSearch: createSearcher} = await import('../../search/search.js');
  const index = JSON.parse(readFileSync(new URL('../../search/index.json', import.meta.url), 'utf8'));
  const searcher = createSearcher(index);
  const swiss = army.units.find((u) => u.isc === 'Swiss Guard');
  const hits = orderLoadouts(army, searcher.unitRows(swiss.id, 101));
  const mains = hits.map((h) => army.weapons[mainWeapon(army, h.weaponIds)][0].name);
  assert.deepEqual(mains.slice(0, 3), ['Missile Launcher', 'Heavy Machine Gun', 'MULTI Rifle']);
  assert.equal(loadoutCharts(army, hits[0].weaponIds)[0].name, 'Missile Launcher');
});

test('Lieutenant: twins of a plain loadout are dropped, the skill is never a tag', () => {
  const lt = {id: 2, weapons: [{id: 1}], skills: [{name: 'Lieutenant'}], equip: []};
  const plain = {id: 1, weapons: [{id: 1}], skills: [], equip: []};
  const other = {id: 3, weapons: [{id: 2}], skills: [{name: 'Lieutenant'}, {name: 'Hacker'}], equip: []};
  assert.deepEqual([...lieutenantTwins([plain, lt, other])], [2]);
  const unit = army.units.find((u) => u.byFaction[101]?.groups.some((g) => g.options.some((o) => (o.skills ?? []).some((s) => s.name === 'Lieutenant'))));
  const group = unit.byFaction[101].groups.find((g) => g.options.some((o) => (o.skills ?? []).some((s) => s.name === 'Lieutenant')));
  const option = group.options.find((o) => (o.skills ?? []).some((s) => s.name === 'Lieutenant'));
  assert.ok(!(loadoutTag(army, {unitId: unit.id, armyFactionId: 101, groupId: group.id, optionId: option.id}) ?? '').includes('Lieutenant'));
});
