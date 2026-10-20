import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {splitNames, withNames} from './localize.js';

const army = JSON.parse(readFileSync(new URL('./army.json', import.meta.url), 'utf8'));

test('the English names put back on the core give army.json again', () => {
  const {core, names} = splitNames(army);
  assert.deepEqual(withNames(core, names), army);
});

test('the core carries no names', () => {
  const {core} = splitNames(army);
  const named = [];
  JSON.stringify(core, (key, value) => {
    // Weapon rows keep their English name: the rules read it (Vulnerability).
    if (key === 'weapons' && value && !Array.isArray(value)) return undefined;
    if ((key === 'name' || key === 'isc' || key === 'label') && typeof value === 'string') named.push(value);
    return value;
  });
  assert.deepEqual(named, []);
});
