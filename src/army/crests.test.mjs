// Run with: yarn test:js
import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync, readFileSync} from 'node:fs';
import {crestOf, crestSlugs} from './crests.js';

const army = JSON.parse(readFileSync(new URL('./army.json', import.meta.url), 'utf8'));

test('every crest army.json names is self-hosted (yarn fetch-army runs fetch-crests)', () => {
  const missing = [...crestSlugs(army)].filter((slug) => !existsSync(new URL(`../../public/crests/${slug}.webp`, import.meta.url)));
  assert.deepEqual(missing, []);
});

test('a profile with its own crest wins over its unit\'s', () => {
  assert.equal(crestOf({crest: 'unit-1-1'}, {crest: 'unit-2-1'}), 'unit-2-1');
  assert.equal(crestOf({crest: 'unit-1-1'}, {}), 'unit-1-1');
  assert.equal(crestOf(null, null), null);
});
