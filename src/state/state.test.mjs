// Run with: yarn test:js
import test from 'node:test';
import assert from 'node:assert/strict';
import {createStore} from '@tanstack/store';
import {DEFAULT_PARAMS} from '../engine/params.js';
import {reduce, uiDepth} from './reduce.js';
import {EMPTY_SIDE, MAX_RECENTS, initialState} from './schema.js';
import {STORAGE_KEY, loadPersisted, savePersisted} from './storage.js';
import {bootState} from './store.js';
import {startSync} from './sync.js';
import {stateFromUrl, urlFromState} from './url.js';

const run = (state, ...actions) => actions.reduce(reduce, state);
const memStorage = (init = {}) => {
  const m = new Map(Object.entries(init));
  return {getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), map: m};
};
const fennec = {...EMPTY_SIDE, unitId: 10, factionId: 101, groupId: 1, optionId: 2, weaponKey: 'w1'};
const zhanshi = {...EMPTY_SIDE, unitId: 20, factionId: 201, groupId: 1, optionId: 1, weaponKey: 'none', inCover: true};

test('reduce is pure: the old state is never changed', () => {
  const s0 = initialState();
  const frozen = JSON.stringify(s0);
  run(s0, {type: 'setSide', side: 'A', sel: fennec}, {type: 'setRange', rangeCm: 80, open: true}, {type: 'swapSides'});
  assert.equal(JSON.stringify(s0), frozen);
});

test('unknown actions return the same object', () => {
  const s0 = initialState();
  assert.equal(reduce(s0, {type: 'nope'}), s0);
});

test('swapSides drops No ARO and Surprise Attack, carries fireteam and cover', () => {
  const s = run(initialState(),
    {type: 'setSide', side: 'A', sel: {...fennec, surpriseAttack: true, ftSize: 3}},
    {type: 'setSide', side: 'B', sel: zhanshi},
    {type: 'swapSides'});
  assert.equal(s.matchup.A.unitId, 20);
  assert.equal(s.matchup.A.weaponKey, null);       // No ARO -> default weapon
  assert.equal(s.matchup.A.inCover, true);
  assert.equal(s.matchup.B.unitId, 10);
  assert.equal(s.matchup.B.surpriseAttack, false);
  assert.equal(s.matchup.B.ftSize, 3);
});

test('setRange can open the selector in the same step', () => {
  const s = run(initialState(), {type: 'setRange', rangeCm: 100, open: true});
  assert.equal(s.matchup.rangeCm, 100);
  assert.equal(s.ui.rangeOpen, true);
  assert.equal(run(s, {type: 'setRange', rangeCm: 60}).ui.rangeOpen, true);   // open left alone
});

test('picker: open, drill in, back one screen at a time', () => {
  let s = run(initialState(), {type: 'openPicker', side: 'B', scope: 101});
  assert.equal(uiDepth(s.ui), 1);
  s = run(s, {type: 'pickerQuery', query: 'fus'}, {type: 'pickerPush', view: {view: 'factions'}});
  assert.equal(uiDepth(s.ui), 2);
  // Choosing a faction leaves the faction list and remembers the faction.
  s = run(s, {type: 'pickerScope', scope: 201});
  assert.deepEqual(s.ui.picker.stack, []);
  assert.equal(s.ui.picker.scope, 201);
  assert.equal(s.ui.picker.query, 'fus');
  assert.deepEqual(s.lists.recentFactions, [201]);
  s = run(s, {type: 'pickerPush', view: {view: 'type', type: 'LI'}}, {type: 'pickerPush', view: {view: 'unit', unitId: 10}});
  assert.equal(uiDepth(s.ui), 3);
  s = run(s, {type: 'back'});
  assert.equal(s.ui.picker.stack.at(-1).view, 'type');
  s = run(s, {type: 'backTo', depth: 0});
  assert.equal(s.ui.overlay, null);
  assert.equal(s.ui.picker, null);
});

test('pickTrooper fills the side, keeps its cover, records a recent and closes', () => {
  let s = run(initialState(), {type: 'patchSide', side: 'B', patch: {inCover: true}}, {type: 'openPicker', side: 'B'});
  const recent = {unitId: 10, groupId: 1, optionId: 2, armyFactionId: 101};
  s = run(s, {type: 'pickTrooper', side: 'B', sel: fennec, recent});
  assert.equal(s.matchup.B.unitId, 10);
  assert.equal(s.matchup.B.inCover, true);
  assert.equal(s.ui.overlay, null);
  assert.deepEqual(s.lists.recents, [recent]);
  // Same trooper again moves to the front instead of duplicating.
  s = run(s, {type: 'pickTrooper', side: 'A', sel: zhanshi, recent: {...recent, unitId: 20}},
    {type: 'pickTrooper', side: 'A', sel: fennec, recent});
  assert.deepEqual(s.lists.recents.map((r) => r.unitId), [10, 20]);
});

test('recents are capped', () => {
  let s = initialState();
  for (let i = 0; i < MAX_RECENTS + 3; i++) s = run(s, {type: 'pickTrooper', side: 'A', sel: fennec, recent: {unitId: i, groupId: 1, optionId: 1}});
  assert.equal(s.lists.recents.length, MAX_RECENTS);
  assert.equal(s.lists.recents[0].unitId, MAX_RECENTS + 2);
});

test('setMode closes every overlay and ignores unknown modes', () => {
  const s = run(initialState(), {type: 'openOverlay', overlay: 'menu'}, {type: 'setMode', mode: 'basic'});
  assert.equal(s.mode, 'basic');
  assert.equal(s.ui.overlay, null);
  assert.equal(run(s, {type: 'setMode', mode: 'other'}).mode, 'basic');
});

test('matchup state round-trips through the URL', () => {
  const s = run(initialState(),
    {type: 'setSide', side: 'A', sel: {...fennec, ftSize: 3, surpriseAttack: true}},
    {type: 'setSide', side: 'B', sel: zhanshi},
    {type: 'setRange', rangeCm: 80});
  const back = stateFromUrl(urlFromState(s));
  assert.equal(back.mode, 'matchup');
  assert.deepEqual(back.matchup, s.matchup);
});

test('classic state round-trips through the URL, defaults left out', () => {
  const s = run(initialState(), {type: 'setMode', mode: 'basic'},
    {type: 'setClassic', key: 'burstA', value: 5}, {type: 'setClassic', key: 'ammoB', value: 'EXP'});
  const url = urlFromState(s);
  assert.equal(url, '?mode=basic&burstA=5&ammoB=EXP');
  assert.deepEqual(stateFromUrl(url).classic, s.classic);
});

test('an old classic link without a mode opens the classic calculator', () => {
  const out = stateFromUrl('?burstA=4&successValueA=15');
  assert.equal(out.mode, 'basic');
  assert.equal(out.classic.burstA, 4);
  assert.equal(stateFromUrl('?mode=matchup&unitA=10').mode, 'matchup');
  assert.deepEqual(stateFromUrl(''), {});
});

test('storage: saves the persisted slices and reads them back', () => {
  const storage = memStorage();
  const s = run(initialState(), {type: 'setMode', mode: 'basic'},
    {type: 'pickTrooper', side: 'A', sel: fennec, recent: {unitId: 10, groupId: 1, optionId: 2}});
  savePersisted(storage, s);
  const saved = JSON.parse(storage.map.get(STORAGE_KEY));
  assert.equal(saved.ui, undefined);                // ephemeral, never stored
  assert.equal(saved.matchup, undefined);           // lives in the URL
  const back = loadPersisted(storage);
  assert.equal(back.mode, 'basic');
  assert.equal(back.lists.recents[0].unitId, 10);
});

test('storage: reads the keys older builds wrote, survives junk', () => {
  const legacy = memStorage({calculatorMode: '"basic"', recentTroopers: JSON.stringify([{unitId: 5}])});
  const out = loadPersisted(legacy);
  assert.equal(out.mode, 'basic');
  assert.deepEqual(out.lists.recents, [{unitId: 5}]);
  const junk = memStorage({[STORAGE_KEY]: '{not json', calculatorMode: 'nope'});
  assert.deepEqual(loadPersisted(junk), {prefs: {}, lists: {recents: [], recentFactions: [], saved: []}});
  assert.deepEqual(loadPersisted(null).lists.recents, []);
});

test('boot: the URL beats the remembered mode', () => {
  const storage = memStorage({[STORAGE_KEY]: JSON.stringify({v: 1, mode: 'basic', lists: {recents: [{unitId: 3}]}})});
  const s = bootState({search: '?mode=matchup&unitA=10&rangeA=1', storage});
  assert.equal(s.mode, 'matchup');
  assert.equal(s.matchup.A.unitId, 10);
  assert.equal(s.lists.recents[0].unitId, 3);
  assert.deepEqual(s.classic, DEFAULT_PARAMS);
  assert.equal(bootState({storage}).mode, 'basic');
});

// A fake window: history entries with {state, url}, popstate on go().
function fakeWindow(url = '/?x=1') {
  const listeners = [];
  const win = {
    entries: [{state: null, url}], index: 0,
    get location() {
      const u = new URL(win.entries[win.index].url, 'https://x.test');
      return {pathname: u.pathname, search: u.search, hash: u.hash};
    },
    history: {
      pushState: (state, _, u) => { win.entries.splice(win.index + 1, Infinity, {state, url: u}); win.index++; },
      replaceState: (state, _, u) => { win.entries[win.index] = {state, url: u}; },
      go: (n) => { win.index += n; listeners.forEach((f) => f({state: win.entries[win.index].state})); },
    },
    addEventListener: (_, f) => listeners.push(f),
    removeEventListener: () => {},
  };
  return win;
}

test('sync: the URL follows the state, each overlay layer is a history entry', () => {
  const store = createStore(initialState());
  const dispatch = (a) => store.setState((s) => reduce(s, a));
  const win = fakeWindow('/old-route');
  const stop = startSync(store, dispatch, {win});
  assert.equal(win.entries[0].url, '/?mode=matchup');
  dispatch({type: 'setSide', side: 'A', sel: fennec});
  assert.match(win.entries[win.index].url, /unitA=10/);
  dispatch({type: 'openPicker', side: 'B'});
  dispatch({type: 'pickerPush', view: {view: 'factions'}});
  assert.equal(win.index, 2);
  // Browser Back closes one layer.
  win.history.go(-1);
  assert.equal(store.get().ui.overlay, 'picker');
  assert.deepEqual(store.get().ui.picker.stack, []);
  // Closing inside the app steps history back too.
  dispatch({type: 'back'});
  assert.equal(win.index, 0);
  assert.equal(store.get().ui.overlay, null);
  assert.match(win.entries[0].url, /unitA=10/);
  stop();
});

test('replace fills missing slices and keeps this device\'s lists', () => {
  const s0 = run(initialState(), {type: 'pickTrooper', side: 'A', sel: fennec, recent: {unitId: 10, groupId: 1, optionId: 2}});
  const s = reduce(s0, {type: 'replace', state: {mode: 'basic', classic: {burstA: 5}, ui: {overlay: 'results'}}});
  assert.equal(s.classic.burstA, 5);
  assert.equal(s.classic.burstB, DEFAULT_PARAMS.burstB);
  assert.equal(s.ui.overlay, 'results');
  assert.equal(s.ui.rangeOpen, false);
  assert.equal(s.lists.recents.length, 1);
  assert.equal(s.matchup.rangeCm, 40);
});

test('every fixture is a valid partial state', async () => {
  const {readdirSync, readFileSync: read} = await import('node:fs');
  const dir = new URL('../ui/fixtures/', import.meta.url);
  for (const f of readdirSync(dir).filter((n) => n.endsWith('.json'))) {
    const s = reduce(initialState(), {type: 'replace', state: JSON.parse(read(new URL(f, dir), 'utf8'))});
    assert.ok(['matchup', 'basic'].includes(s.mode), f);
    assert.equal(stateFromUrl(urlFromState(s)).mode, s.mode, f);
  }
});

test('saved rolls: save once per setup, load the whole setup, delete', async () => {
  const {makeRoll} = await import('./rolls.js');
  let s = run(initialState(), {type: 'setSide', side: 'A', sel: fennec}, {type: 'setRange', rangeCm: 80});
  const roll = makeRoll({mode: 'matchup', setup: s.matchup, summary: {a: 'x'}, now: 1});
  s = run(s, {type: 'saveRoll', roll}, {type: 'saveRoll', roll: {...roll, id: 'again'}});
  assert.equal(s.lists.saved.length, 1);
  assert.equal(s.lists.saved[0].id, 'again');
  s = run(s, {type: 'clearSides'}, {type: 'setMode', mode: 'basic'}, {type: 'openOverlay', overlay: 'saved'},
    {type: 'loadRoll', id: 'again'});
  assert.equal(s.mode, 'matchup');
  assert.equal(s.matchup.A.unitId, 10);
  assert.equal(s.matchup.rangeCm, 80);
  assert.equal(s.ui.overlay, null);
  s = run(s, {type: 'deleteRoll', id: 'again'});
  assert.deepEqual(s.lists.saved, []);
});

test('settings: start faction pref, clearing data', () => {
  let s = run(initialState(), {type: 'setPref', key: 'startFaction', value: {A: 101, B: null}});
  assert.equal(s.prefs.startFaction.A, 101);
  s = run(s, {type: 'pickTrooper', side: 'A', sel: fennec, recent: {unitId: 1}}, {type: 'clearRecents'});
  assert.deepEqual(s.lists.recents, []);
  assert.equal(uiDepth(run(s, {type: 'openOverlay', overlay: 'settings'}).ui), 1);
});
