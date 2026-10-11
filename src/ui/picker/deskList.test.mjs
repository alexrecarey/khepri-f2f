// Run with: yarn test:js
import test from 'node:test';
import assert from 'node:assert/strict';
import {MAX_LIST_UNITS, listItems, matchedCount} from './deskList.js';

const unit = (unitId, factionIds) => ({unitId, factionIds});
const factionName = (id) => `F${id}`;

// ?fixture=FinalPicker opens the desk picker with a query typed before the
// searcher has loaded: all/scoped are still null and the page went blank.
test('desk list is empty while the searcher loads, query typed or not', () => {
  for (const scope of [null, 7]) {
    for (const typing of [true, false]) {
      const base = {typing, scope, top: null, all: null, scoped: null, browse: null, factionName};
      assert.deepEqual(listItems({...base, searcher: null}), []);
      assert.equal(matchedCount(base), 0);
    }
  }
});

test('desk list counts matches in the faction and in others once each', () => {
  const searcher = {};
  const all = {units: [unit(1, [7]), unit(2, [8]), unit(3, [7, 8])]};
  const scoped = {units: [unit(1, [7]), unit(3, [7, 8])]};
  assert.equal(matchedCount({typing: true, scope: 7, all, scoped}), 3);
  assert.equal(matchedCount({typing: true, scope: null, all, scoped: all}), 3);
  assert.equal(matchedCount({typing: false, scope: null, all, scoped: all}), 0);

  const items = listItems({searcher, typing: true, scope: 7, top: null, all, scoped, browse: null, factionName});
  assert.deepEqual(items.map((x) => (x.kind === 'head' ? x.text : x.u.unitId)), ['F7', 1, 3, 'In other factions', 2]);
  assert.equal(items.at(-1).away, true);
});

test('desk list caps the units it shows while typing', () => {
  const many = {units: Array.from({length: MAX_LIST_UNITS + 10}, (_, i) => unit(i, [1]))};
  const items = listItems({searcher: {}, typing: true, scope: null, top: null, all: many, scoped: many, browse: null, factionName});
  assert.equal(items.length, MAX_LIST_UNITS);
  assert.equal(matchedCount({typing: true, scope: null, all: many, scoped: many}), MAX_LIST_UNITS + 10);
});
