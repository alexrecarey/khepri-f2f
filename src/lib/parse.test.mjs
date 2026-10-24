// Run with: yarn test:js
import test from 'node:test';
import assert from 'node:assert/strict';
import * as v from 'valibot';
import {arrayOf, intFrom, intIn, numberFromUrl, parseOr, textUpTo} from './parse.js';

test('parseOr: the parsed value, or the fallback; never throws', () => {
  assert.equal(parseOr(v.number(), 3, 0), 3);
  assert.equal(parseOr(v.number(), 'x', 0), 0);
  assert.equal(parseOr(v.object({a: v.number()}), null, null), null);
  // A field with its own fallback keeps the rest of the object.
  assert.deepEqual(parseOr(v.object({a: v.fallback(v.number(), 1), b: v.number()}), {a: 'no', b: 2}, null), {a: 1, b: 2});
});

test('intFrom / intIn: integers only, within the limits (no clamping)', () => {
  assert.equal(parseOr(intFrom(1), 1, null), 1);
  assert.equal(parseOr(intFrom(1), 0, null), null);
  assert.equal(parseOr(intFrom(1), 1.5, null), null);
  assert.equal(parseOr(intIn([0, 6]), 6, null), 6);
  assert.equal(parseOr(intIn([0, 6]), 7, null), null);
  assert.equal(parseOr(intIn([0, 6]), -1, null), null);
  assert.equal(parseOr(intIn([0, 6]), '3', null), null);
});

test('textUpTo: a string no longer than the cap', () => {
  assert.equal(parseOr(textUpTo(3), 'abc', null), 'abc');
  assert.equal(parseOr(textUpTo(3), 'abcd', null), null);
  assert.equal(parseOr(textUpTo(3), 3, null), null);
});

test('numberFromUrl: what Number() reads, NaN refused', () => {
  assert.equal(parseOr(numberFromUrl, '12', null), 12);
  assert.equal(parseOr(numberFromUrl, '', null), 0);
  assert.equal(parseOr(numberFromUrl, 'Infinity', null), Infinity);
  assert.equal(parseOr(numberFromUrl, 'abc', null), null);
  assert.equal(parseOr(numberFromUrl, 12, null), null);
});

test('arrayOf: unreadable items are dropped, the list is kept', () => {
  assert.deepEqual(parseOr(arrayOf(v.number()), [1, 'x', 2, null], []), [1, 2]);
  assert.deepEqual(parseOr(arrayOf(v.number()), 'not a list', []), []);
});
