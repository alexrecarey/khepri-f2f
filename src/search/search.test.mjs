// Run with: yarn test:js
// Trooper search: the index builder, the matcher's tiers, what search() and
// browse() return, and the scoreboard floors (see scripts/search-eval.mjs).
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {buildIndex} from './buildIndex.js';
import {createSearch, TIER} from './search.js';
import {prefixDistance, soundKey, words, indexWords} from './text.js';
import {buildCorpus} from './eval/corpus.js';
import {score} from './eval/score.js';

const army = JSON.parse(readFileSync(new URL('../army/army.json', import.meta.url), 'utf8'));
const hard = JSON.parse(readFileSync(new URL('./eval/hard-cases.json', import.meta.url), 'utf8'));
const index = buildIndex(army);
const searcher = createSearch(index);
const PANO = 101;
const YUJING = 201;
const firstUnit = (query, factionId = null) => searcher.search({query, factionId}).units[0]?.short;

test('words: accents, hyphens, apostrophes and CamelCase', () => {
  assert.deepEqual(words('Índigo Spec-Ops'), ['indigo', 'spec', 'ops']);
  assert.deepEqual(words('RacerBots'), ['racer', 'bots']);
  assert.deepEqual(words("'Iguana' Squadron"), ['iguana', 'squadron']);
  assert.deepEqual(words('Nøkken'), ['nokken']);
  assert.ok(indexWords('Hac Tao Special Unit').includes('hactao'));
  assert.ok(indexWords('PSI-Cops').includes('psicops'));
});

test('prefixDistance counts typos against the start of a word', () => {
  assert.equal(prefixDistance('zhnashi', 'zhanshi', 1), 1); // neighbour swap is one typo
  assert.equal(prefixDistance('fusil', 'fusiliers', 1), 0); // still typing
  assert.equal(prefixDistance('fusilers', 'fusiliers', 1), 1);
  assert.equal(prefixDistance('hexas', 'hassassin', 1), 2); // gives up: budget + 1
});

test('soundKey merges transliteration spellings', () => {
  assert.equal(soundKey('gulam'), soundKey('ghulam'));
  assert.equal(soundKey('asawirah'), soundKey('asawira'));
});

test('index: one row per loadout, sectorials folded into their vanilla', () => {
  assert.ok(index.rows.length > 2500 && index.rows.length < 4500, `${index.rows.length} rows`);
  // The ten vanilla armies plus Non-Aligned Armies (the mercenary companies).
  assert.equal(index.factions.length, 11);
  assert.ok(index.rows.every((r) => Object.keys(r.factions).every((f) => index.factions.some((v) => v.id === Number(f)))));
  // 'Iguana' Squadron exists only in sectorials (403 and 502), so it is listed
  // under their vanillas and loaded from the sectorial that has it.
  const iguana = index.units.find((u) => u.short === "'Iguana' Squadron");
  assert.deepEqual(iguana.factions.sort(), [401, 501]);
  const row = index.rows.find((r) => r.unitId === iguana.id);
  assert.equal(row.factions[401], 403);
});

test('the committed index.json is up to date with army.json', () => {
  const committed = readFileSync(new URL('./index.json', import.meta.url), 'utf8');
  assert.equal(committed, JSON.stringify(index), 'run: yarn build-search-index');
});

test('unit and weapon together: "fus ml"', () => {
  const res = searcher.search({query: 'fus ml'});
  assert.deepEqual(res.units.map((u) => u.short).sort(), ['Fennec Fusiliers', 'Fusiliers']);
  assert.ok(res.profiles.every((p) => p.weapon === 'Missile Launcher'));
  assert.ok(res.profiles.every((p) => p.weaponId != null)); // the weapon to preselect
});

test('faction scope, and matches elsewhere when the scope has none', () => {
  const pano = searcher.search({query: 'fusiliers', factionId: PANO});
  assert.ok(pano.units.length > 0);
  const yj = searcher.search({query: 'fusiliers', factionId: YUJING});
  assert.equal(yj.units.length, 0);
  assert.ok(yj.elsewhere.some((e) => e.factionId === PANO && e.count > 0));
  assert.ok(searcher.search({query: 'hmg', factionId: YUJING}).profiles
    .every((p) => p.factionId === YUJING && p.armyFactionId != null));
});

test('exact and prefix matches outrank typo matches', () => {
  assert.equal(firstUnit('hexas'), 'Hexas');
  assert.equal(firstUnit('mine'), 'Minescorp Jackals'); // unit name before the Mines weapon
  const res = searcher.search({query: 'fusilers'});
  assert.ok(res.profiles[0].tier === TIER.TYPO1 && res.profiles[0].loose);
});

test('short words never match through typos', () => {
  // "ml" must not drag in "mal...", "mel..." names.
  assert.ok(searcher.search({query: 'ml'}).profiles.every((p) => p.weapon === 'Missile Launcher'));
});

test('recent picks that match come first and are not repeated', () => {
  const pick = searcher.search({query: 'fus ml'}).profiles[1];
  const res = searcher.search({query: 'fus', recentIds: [pick.rowId]});
  assert.equal(res.recent[0].rowId, pick.rowId);
  assert.ok(!res.profiles.some((p) => p.rowId === pick.rowId));
});

test('browse: type tiles and units A-Z for a faction', () => {
  const b = searcher.browse({factionId: PANO});
  assert.ok(b.types.some((t) => t.type === 'HI' && t.count > 0));
  assert.ok(b.types.every((t) => t.count > 0));
  const names = b.units.map((u) => u.short);
  assert.deepEqual(names, [...names].sort((a, c) => a.localeCompare(c)));
});

// The scoreboard floors. Raise them when the matcher improves; a drop means a
// change made search worse for some names.
test('scoreboard: generated typos and hard cases', () => {
  const typo = score(searcher, buildCorpus(index.units));
  assert.equal(typo.all.found, typo.all.n, 'every generated query finds its unit');
  assert.ok(typo.all.top5 / typo.all.n >= 0.99, `top5 ${typo.all.top5}/${typo.all.n}`);
  assert.ok(typo.all.top1 / typo.all.n >= 0.95, `top1 ${typo.all.top1}/${typo.all.n}`);
  const h = score(searcher, hard.map((c) => ({...c, kind: 'hard'})));
  assert.deepEqual(h.misses, [], 'hand-written hard cases all in the top 5');
});

test('speed: typing stays well under a frame', () => {
  for (const q of ['a', 'fus', 'hmg']) searcher.search({query: q}); // warm up
  const times = [];
  for (const q of ['f', 'fu', 'fus', 'fus m', 'fus ml', 'zhan', 'zhnashi', 'gulam', 'hmg', 'shasvast', 'knights of']) {
    const t = performance.now();
    searcher.search({query: q});
    times.push(performance.now() - t);
  }
  times.sort((a, b) => a - b);
  // Generous for slow CI machines; on a laptop these run in ~0.5 ms.
  assert.ok(times.at(-2) < 8, `slowest queries: ${times.slice(-3).map((t) => t.toFixed(1))} ms`);
});

test('unit drill-in, units of a type, and finding a saved pick again', () => {
  const fus = index.units.find((u) => u.short === 'Fusiliers');
  const rowsP = searcher.unitRows(fus.id, PANO);
  assert.ok(rowsP.length > 3);
  assert.ok(rowsP.every((r, i) => i === 0 || rowsP[i - 1].points <= r.points));
  assert.ok(rowsP.every((r) => r.weapons.length > 0));
  const li = searcher.unitsOfType('LI', PANO);
  assert.ok(li.some((u) => u.short === 'Fusiliers'));
  assert.ok(li.every((u) => u.type === 'LI'));
  const hit = rowsP[2];
  assert.equal(searcher.findRow(hit), hit.rowId);
});
