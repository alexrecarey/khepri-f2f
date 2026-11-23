// Run with: yarn test:js
import test from 'node:test';
import assert from 'node:assert/strict';
import {MAX_LIST_UNITS, listItems, matchedCount, paneTarget} from './deskList.js';

/** @typedef {import('../../types.js').SearchResult} SearchResult */
/** @typedef {import('../../types.js').Searcher} Searcher */

/**
 * @param {number} unitId
 * @param {number[]} factionIds
 */
const unit = (unitId, factionIds) => /** @type {import('../../types.js').UnitHit} */ ({key: `${unitId}`, unitId, factionIds});
// A result is only read for its units here; a searcher is only checked for.
/** @param {import('../../types.js').UnitHit[]} units */
const result = (units) => /** @type {SearchResult} */ ({units});
const searcher = /** @type {Searcher} */ ({});
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
  const all = result([unit(1, [7]), unit(2, [8]), unit(3, [7, 8])]);
  const scoped = result([unit(1, [7]), unit(3, [7, 8])]);
  assert.equal(matchedCount({typing: true, scope: 7, all, scoped}), 3);
  assert.equal(matchedCount({typing: true, scope: null, all, scoped: all}), 3);
  assert.equal(matchedCount({typing: false, scope: null, all, scoped: all}), 0);

  const items = listItems({searcher, typing: true, scope: 7, top: null, all, scoped, browse: null, factionName});
  assert.deepEqual(items.map((x) => (x.kind === 'head' ? x.text : x.kind === 'unit' ? x.u.unitId : x.hit)), ['F7', 1, 3, 'In other factions', 2]);
  const last = items.at(-1);
  assert.ok(last && last.kind === 'unit');
  assert.equal(last.away, true);
});

test('desk list caps the units it shows while typing', () => {
  const many = result(Array.from({length: MAX_LIST_UNITS + 10}, (_, i) => unit(i, [1])));
  const items = listItems({searcher, typing: true, scope: null, top: null, all: many, scoped: many, browse: null, factionName});
  assert.equal(items.length, MAX_LIST_UNITS);
  assert.equal(matchedCount({typing: true, scope: null, all: many, scoped: many}), MAX_LIST_UNITS + 10);
});

// The right pane's unit: a Team-Ops trooper's own key and group, named with its
// unit; a recent's own group, so its profile heads the pane.
test('pane target: a unit row or a recent, read off the hit', () => {
  const u = /** @type {import('../../types.js').UnitHit} */ ({key: '417:2', unitId: 417, groupId: 2, parent: 'JSA Team-Ops',
    short: 'Kaizoku Heavy Spec-Ops', factionIds: [1101]});
  assert.deepEqual(paneTarget({kind: 'unit', u, factionId: 1101}),
    {key: '417:2', unitId: 417, factionId: 1101, groupId: 2, name: 'Kaizoku Heavy Spec-Ops', parent: 'JSA Team-Ops'});
  const hit = /** @type {import('../../types.js').ProfileHit} */ ({key: '12', unitId: 12, factionId: 101, groupId: 3, unit: 'Cutters', parent: null});
  assert.deepEqual(paneTarget({kind: 'recent', hit}), {key: '12', unitId: 12, factionId: 101, groupId: 3, name: 'Cutters', parent: null});
  assert.equal(paneTarget({kind: 'head', text: 'x'}), null);
  assert.equal(paneTarget(null), null);
});
