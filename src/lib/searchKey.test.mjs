// Run with: yarn test:js
import test from 'node:test';
import assert from 'node:assert/strict';
import {searchKey} from './searchKey.js';

test('searchKey folds case and accents', () => {
  assert.equal(searchKey('Nøkken'), 'nokken');
  assert.equal(searchKey('Kōsuke ÉLITE'), 'kosuke elite');
  assert.equal(searchKey('Ǎnzhàn'), 'anzhan');
});
