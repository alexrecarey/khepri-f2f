// Run with: yarn test:js
import test from 'node:test';
import assert from 'node:assert/strict';
import {headline, headlineChoice, nextHeadline} from './headline.js';

// The FinalPeek fixture's numbers (Squalos HMG vs Fennec Missile L.).
const s = {
  wpo: {active: 0.81, reactive: 0.46},
  win: {active: 0.568, reactive: 0.356, none: 0.076},
  atLeast: {active: [0.477, 0.24, 0.1], reactive: [0.286, 0.14, 0.03]},
};
const unopposed = {
  unopposed: true, win: {active: 0, reactive: 0, none: 1}, wpo: {active: 0, reactive: 0},
  attacks: {active: {wpo: 1.2, wounded: 0.62}, reactive: {wpo: 0.5, wounded: 0.38}},
};

test('unknown or missing prefs show wounds per order', () => {
  assert.equal(headlineChoice({}), 'wpo');
  assert.equal(headlineChoice({headline: 'nonsense'}), 'wpo');
  assert.equal(headlineChoice({headline: 'win'}), 'win');
});

test('the swipe wraps round both ways', () => {
  assert.equal(nextHeadline('wpo', 1), 'win');
  assert.equal(nextHeadline('win', -1), 'wpo');
  assert.equal(nextHeadline('wound', 1), 'wpo');
  assert.equal(nextHeadline('wpo', -1), 'wound');
});

test('each headline moves wounds per order or 1+ wound to the small line', () => {
  const w = headline(s, 'wpo');
  assert.deepEqual(w.text, {active: '0.81', reactive: '0.46'});
  assert.deepEqual(w.small, ['47.7% at least one wound', '28.6%']);
  const f = headline(s, 'win');
  assert.deepEqual(f.text, {active: '56.8%', reactive: '35.6%'});
  assert.equal(f.label.active, 'wins face to face');
  assert.deepEqual(f.small, ['0.81 wounds / order', '0.46']);
  const one = headline(s, 'wound');
  assert.deepEqual(one.text, {active: '47.7%', reactive: '28.6%'});
  assert.deepEqual(one.small, ['0.81 wounds / order', '0.46']);
});

test('a Dodging side wins by dodging', () => {
  assert.equal(headline(s, 'win', {ammoA: 'N', ammoB: 'DODGE'}).label.reactive, 'dodges');
  assert.equal(headline(s, 'win', {ammoA: 'N', ammoB: 'DODGE'}).label.active, 'wins face to face');
});

test('not face to face: wins face to face falls back to at least one wound', () => {
  const h = headline(unopposed, 'win');
  assert.equal(h.kind, 'wound');
  assert.equal(h.fallback, true);
  assert.deepEqual(h.text, {active: '62.0%', reactive: '38.0%'});
  assert.deepEqual(h.small, ['Not face to face · 1.20 wounds / order', '0.50']);
  assert.deepEqual(headline(unopposed, 'wpo').text, {active: '1.20', reactive: '0.50'});
});
