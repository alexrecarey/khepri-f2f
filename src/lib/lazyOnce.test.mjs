// Run with: yarn test:js
import test from 'node:test';
import assert from 'node:assert/strict';
import {lazyOnce} from './lazyOnce.js';

test('loads once and shares the result', async () => {
  let calls = 0;
  const get = lazyOnce(async () => ++calls);
  assert.equal(await get(), 1);
  assert.equal(await get(), 1);
  assert.equal(calls, 1);
});

test('a failed load is retried on the next call', async () => {
  let calls = 0;
  const get = lazyOnce(async () => {
    calls++;
    if (calls === 1) throw new Error('offline');
    return 'army';
  });
  await assert.rejects(get(), /offline/);
  assert.equal(await get(), 'army');
});
