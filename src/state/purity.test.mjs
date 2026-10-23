// Run with: yarn test:js
// The state document and the army data are never written to: every reducer
// action, the army-reading action creators and the matchup derivation run on
// deep-frozen inputs, where a write throws.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {deepFreeze} from '../lib/deepFreeze.js';
import {openPicker, pickTrooper, pickerSide, setUpgrade} from './actions.js';
import {matchupView} from './matchupView.js';
import {reduce} from './reduce.js';
import {EMPTY_SIDE, initialState} from './schema.js';
import {MODES} from './modes.js';
import {DEFAULT_PARAMS} from '../engine/params.js';

const army = deepFreeze(JSON.parse(readFileSync(new URL('../army/army.json', import.meta.url), 'utf8')));
const fennec = {...EMPTY_SIDE, unitId: 10, factionId: 101, groupId: 1, optionId: 2, weaponKey: 'w1', ftSize: 3};
const zhanshi = {...EMPTY_SIDE, unitId: 20, factionId: 201, groupId: 1, optionId: 1, weaponKey: 'none', inCover: true};
const roll = {id: 'r1', mode: MODES.matchup, savedAt: 1, setup: {A: fennec, B: zhanshi, rangeCm: 40}, summary: {a: 'A', r: 'B'}};

// A state with every slice filled: picker open two screens deep, a split
// range, saved rolls, recents and scopes.
const busy = () => deepFreeze({
  ...initialState(),
  matchup: {...initialState().matchup, A: fennec, B: zhanshi, rangeCmB: 80},
  ui: {...initialState().ui, overlay: 'picker', picker: {side: 'A', query: 'fus', scope: 101, stack: [{view: 'factions'}, {view: 'unit'}]}},
  scopes: {A: 101},
  prefs: {headline: 'win'},
  lists: {recents: [{unitId: 10, groupId: 1, optionId: 2, armyFactionId: 101, side: 'A'}], recentFactions: [101], saved: [roll]},
});

// One action of every type reduce() knows.
const ACTIONS = [
  {type: 'replace', state: {mode: MODES.basic}},
  {type: 'setMode', mode: MODES.basic},
  {type: 'setSide', side: 'B', sel: fennec},
  {type: 'patchSide', side: 'A', patch: {targeted: true}},
  {type: 'setCover', side: 'A', on: true},
  {type: 'setSapper', side: 'B', on: true},
  {type: 'pickWeapon', side: 'A', key: 'cc1', kind: 'cc'},
  {type: 'setRange', side: 'B', rangeCm: 100, open: true},
  {type: 'setRangeSplit', on: false},
  {type: 'setZone', zone: 'smoke', on: true},
  {type: 'setRangeOpen', open: true},
  {type: 'swapSides'},
  {type: 'clearSides'},
  {type: 'setEdit', edit: {side: 'A', chip: 'ftSize'}},
  {type: 'setClassic', key: 'burstA', value: 4},
  {type: 'openInClassic', params: DEFAULT_PARAMS},
  {type: 'setClassicSave', side: 'A', which: 'arm', total: 3},
  {type: 'openOverlay', overlay: 'menu'},
  {type: 'back'},
  {type: 'backTo', depth: 0},
  {type: 'saveRoll', roll: {...roll, id: 'r2'}},
  {type: 'deleteRoll', id: 'r1'},
  {type: 'loadRoll', id: 'r1'},
  {type: 'setSavedTab', tab: 'classic'},
  {type: 'setSwiped', id: 'r1'},
  {type: 'clearRecents'},
  {type: 'clearSaved'},
  {type: 'setPref', key: 'headline', value: 'wpo'},
  {type: 'toast', text: 'Saved'},
  {type: 'openPicker', side: 'B', scope: null},
  {type: 'pickerQuery', query: 'zh'},
  {type: 'pickerCursor', cursor: {cursor: 2}},
  {type: 'pickerSide', side: 'B', scope: 201},
  {type: 'pickerScope', scope: 201},
  {type: 'pickerPush', view: {view: 'factions'}},
  {type: 'pickTrooper', side: 'A', sel: zhanshi, ftMax: 5, scope: 201, next: true,
    recent: {unitId: 20, groupId: 1, optionId: 1, armyFactionId: 201}},
];

test('every reducer action leaves a frozen state alone', () => {
  for (const action of ACTIONS) {
    assert.doesNotThrow(() => reduce(busy(), action), action.type);
    assert.doesNotThrow(() => reduce(deepFreeze(initialState()), action), action.type);
  }
});

test('the list above covers every action reduce() handles', () => {
  const source = readFileSync(new URL('./reduce.js', import.meta.url), 'utf8');
  const handled = [...source.matchAll(/^\s*case '(\w+)':/gm)].map((m) => m[1]);
  assert.deepEqual(handled.filter((type) => !ACTIONS.some((a) => a.type === type)), []);
});

// The first option of every 15th unit, in the first faction it is in.
const sample = army.units.filter((_, i) => i % 15 === 0).map((u) => {
  const [factionId, {groups}] = Object.entries(u.byFaction)[0];
  const g = groups[0];
  return {...EMPTY_SIDE, unitId: u.id, factionId: Number(factionId), groupId: g.id, profileId: g.profiles[0].id, optionId: g.options[0].id};
});

test('matchupView and the action creators never write to the army or the matchup', () => {
  const state = deepFreeze({...initialState(), matchup: {...initialState().matchup, A: sample[0], B: sample[1]}});
  for (const [i, a] of sample.entries()) {
    const b = sample[(i + 7) % sample.length];
    const base = deepFreeze({A: {...a, inCover: true, ftSize: 3}, B: {...b, sapper: true}, rangeCm: 40, rangeCmB: 80, smoke: i % 2 === 0, whiteNoise: false});
    // Each of A's weapons, so every kind of roll (shot, CC, Dodge, Reset, program) is derived.
    const view = matchupView(army, base);
    for (const g of view.A.groups) {
      for (const w of g.modes ?? [g.w]) matchupView(army, deepFreeze({...base, A: {...base.A, weaponKey: w.key}}));
    }
    const hit = {unitId: a.unitId, armyFactionId: a.factionId, factionId: a.factionId, groupId: a.groupId, profileId: a.profileId, optionId: a.optionId};
    pickTrooper(army, 'A', hit, {next: true, state});
    setUpgrade(army, state, 'A', {upgrade: 0});
  }
  openPicker(army, state, 'B');
  pickerSide(army, state, 'A');
  assert.ok(sample.length > 40);
});
