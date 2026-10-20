import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {splitNames, withNames} from './localize.js';

const army = JSON.parse(readFileSync(new URL('./army.json', import.meta.url), 'utf8'));

test('the English names put back on the core give army.json again', () => {
  const {core, names} = splitNames(army);
  const {lang, terms, ...back} = withNames(core, names);
  assert.deepEqual(back, army);
  assert.equal(lang, 'en');
  assert.equal(terms, null);
});

test('a names file with display maps carries them as the army\'s terms', () => {
  const {core, names} = splitNames(army);
  const es = {...names, extras: {'+1B': '+1R'}, modes: {}, types: {LI: 'IL'}, stats: {bs: 'CD'}};
  const out = withNames(core, es, 'es');
  assert.equal(out.lang, 'es');
  assert.deepEqual(out.terms, {extras: {'+1B': '+1R'}, modes: {}, types: {LI: 'IL'}, stats: {bs: 'CD'}});
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
