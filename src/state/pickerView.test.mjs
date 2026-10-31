// Run with: yarn test:js
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {groupLoadouts, loadoutCharts, loadoutTag, mainWeapon, orderLoadouts, profileGroups, reachGroup, statLine, unitDetail, weaponChart} from './pickerView.js';
import {createSearch} from '../search/search.js';
import {lieutenantTwins} from '../search/buildIndex.js';
import {SKILL} from '../army/ids.js';
import {army} from '../army/testArmy.mjs';

/** @typedef {import('../types.js').ProfileHit} ProfileHit */
/** @typedef {import('../types.js').OptionRow} OptionRow */

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
  const hits = /** @type {ProfileHit[]} */ ([{weaponIds: [idOf('Combi Rifle')]}, {weaponIds: [idOf('Heavy Machine Gun')]}]);
  assert.deepEqual(groupLoadouts(army, hits).map((g) => g.key), ['long', 'mid']);
});

test('stat line of a unit', () => {
  assert.deepEqual(statLine(army, 1803, 101)?.slice(0, 3), [['CC', 13], ['BS', 12], ['PH', 10]]);
  assert.equal(statLine(army, -1, 101), null);
});

test('a loadout is tagged with the skills it adds', () => {
  const hit = (optionId) => /** @type {ProfileHit} */ ({unitId: 1803, armyFactionId: 101, groupId: 1, optionId});
  assert.equal(loadoutTag(army, hit(11)), null); // Lieutenant only: not a tag
  assert.equal(loadoutTag(army, hit(9)), 'Forward Observer, Sensor');
  assert.equal(loadoutTag(army, hit(1)), null);
});

test('weapon charts: bands per range column, main gun first', () => {
  const ml = weaponChart(army, idOf('Missile Launcher'));
  assert.ok(ml);
  assert.equal(ml.bands.length, 7);
  assert.equal(ml.bands[3], 3);                        // 24-32" is +3
  assert.equal(weaponChart(army, idOf('Chain Rifle'))?.bands.every((b) => b === null), true);
  const charts = loadoutCharts(army, [idOf('Flash Pulse'), idOf('Combi Rifle'), idOf('Pistol')]);
  assert.equal(charts[0].name, 'Combi Rifle');
  const d = unitDetail(army, 1803, 101);
  assert.ok(d);
  assert.equal(d.profiles[0].stats[0][0], 'MOV');
  assert.deepEqual(d.profiles[0].stats[0][1], [10, 10]); // cm; the pane shows 4-4 (inches) or 10-10 (cm)
});

test('loadouts: cheapest first, then least SWC ("+1" before 0, "-" as 0), then Lieutenant last, then army order', () => {
  // Option 8 is the Lieutenant; a fake army is all the order reads of it.
  const lt = /** @type {import('../types.js').Army} */ (/** @type {unknown} */ ({units: [{id: 1, byFaction: {101: {groups: [{id: 1,
    options: [{id: 8, skills: [{id: SKILL.LIEUTENANT, name: 'Lieutenant'}]}]}]}}}]}));
  const hits = /** @type {ProfileHit[]} */ ([
    {optionId: 1, points: 9, swc: '0.5'}, {optionId: 2, points: 41, swc: '1.5'}, {optionId: 3, points: 9, swc: '0'},
    {optionId: 4, points: 38, swc: '+1'}, {optionId: 5, points: 38, swc: '0'}, {optionId: 11, points: 34, swc: '0.5'},
    {optionId: 10, points: 34, swc: '-'}, {optionId: 6, points: 34, swc: '0'},
    {optionId: 8, points: 21, swc: '0'}, {optionId: 7, points: 21, swc: '0'}, {optionId: 9, points: 21, swc: '0'},
  ].map((h) => ({...h, unitId: 1, armyFactionId: 101, groupId: 1})));
  assert.deepEqual(orderLoadouts(lt, hits).map((h) => h.optionId), [3, 1, 7, 9, 8, 10, 6, 11, 4, 5, 2]);
});

test('Swiss Guard: cheapest first, a points tie goes to less SWC; main gun is the farthest-reaching weapon', async () => {
  const {createSearch: createSearcher} = await import('../search/search.js');
  const index = JSON.parse(readFileSync(new URL('../search/index.json', import.meta.url), 'utf8'));
  const searcher = createSearcher(index);
  const swiss = army.units.find((u) => u.isc === 'Swiss Guard');
  assert.ok(swiss);
  const hits = orderLoadouts(army, searcher.unitRows(swiss.id, 101));
  // Every Swiss Guard loadout has a main weapon.
  const mains = hits.map((h) => army.weapons[/** @type {number} */ (mainWeapon(army, h.weaponIds))][0].name);
  assert.deepEqual(mains.slice(-3), ['MULTI Rifle', 'Heavy Machine Gun', 'Missile Launcher']);
  assert.deepEqual(hits.slice(-3).map((h) => h.points), [56, 56, 60]);
  assert.equal(loadoutCharts(army, hits[hits.length - 1].weaponIds)[0].name, 'Missile Launcher');
});

test('Lieutenant: twins of a plain loadout are dropped, the skill is never a tag', () => {
  // Loadouts as the twins check reads them: weapons, skills, equipment.
  const lt = /** @type {OptionRow} */ ({id: 2, weapons: [{id: 1}], skills: [{id: SKILL.LIEUTENANT, name: 'Lieutenant'}], equip: /** @type {import('../types.js').TraitRef[]} */ ([])});
  const plain = /** @type {OptionRow} */ ({id: 1, weapons: [{id: 1}], skills: /** @type {import('../types.js').TraitRef[]} */ ([]), equip: /** @type {import('../types.js').TraitRef[]} */ ([])});
  const other = /** @type {OptionRow} */ ({id: 3, weapons: [{id: 2}], skills: [{id: SKILL.LIEUTENANT, name: 'Lieutenant'}, {id: 0, name: 'Hacker'}], equip: /** @type {import('../types.js').TraitRef[]} */ ([])});
  assert.deepEqual([...lieutenantTwins([plain, lt, other])], [2]);
  const unit = army.units.find((u) => u.byFaction[101]?.groups.some((g) => g.options.some((o) => (o.skills ?? []).some((s) => s.name === 'Lieutenant'))));
  assert.ok(unit);
  const group = unit.byFaction[101].groups.find((g) => g.options.some((o) => (o.skills ?? []).some((s) => s.name === 'Lieutenant')));
  assert.ok(group);
  const option = group.options.find((o) => (o.skills ?? []).some((s) => s.name === 'Lieutenant'));
  assert.ok(option);
  assert.ok(!(loadoutTag(army, /** @type {ProfileHit} */ ({unitId: unit.id, armyFactionId: 101, groupId: group.id, optionId: option.id})) ?? '').includes('Lieutenant'));
});

test('a unit with several profile groups: one section each, shared kit once, rows keep what differs', () => {
  const searcher = createSearch(JSON.parse(readFileSync(new URL('../search/index.json', import.meta.url), 'utf8')));
  const morat = army.units.find((u) => u.slug === 'morat-team-ops');
  assert.ok(morat);
  const groups = profileGroups(army, searcher.unitRows(morat.id));
  assert.ok(groups);
  assert.deepEqual(groups.map((g) => [g.name, g.type, g.items.length]),
    [['Treitak Spec-Ops', 'MI', 6], ['Treitak Heavy Spec-Ops', 'HI', 4], ['Asklad Creatures', 'LI', 2]]);
  const [treitak, heavy, asklad] = groups;
  assert.deepEqual(treitak.shared, ['Chain-colt', 'D-Charges', 'Heavy Pistol', 'CC Weapon']);
  assert.ok(treitak.items.some(({own}) => own.join() === 'AP Heavy Machine Gun'));
  assert.ok(heavy.items.some(({own}) => own.join() === 'AP Red Fury'));
  // Each group has its own stats: the Heavy's BTS isn't the Treitak-1's.
  assert.notDeepEqual(heavy.stats, treitak.stats);
  assert.deepEqual(asklad.shared, ['Heavy Flamethrower', 'AP CC Weapon']);
  // A TAG and its peripheral: the Crabbot carries no weapon, so its row is its loadout's name.
  const cutters = profileGroups(army, searcher.unitRows(/** @type {import('../types.js').UnitRow} */ (army.units.find((u) => u.slug === 'cutters-varuna-naval-chasseurs')).id));
  assert.ok(cutters);
  assert.deepEqual(cutters.map((g) => g.type), ['TAG', 'REM']);
  assert.deepEqual(cutters[1].items.map(({own}) => own), [['CRABBOT']]);
  // A unit with one profile group keeps today's page.
  const fusiliers = army.units.find((u) => u.slug === 'fusiliers');
  assert.ok(fusiliers);
  assert.equal(profileGroups(army, searcher.unitRows(fusiliers.id)), null);
});
