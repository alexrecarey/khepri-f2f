// Run with: yarn test:js
import test from 'node:test';
import assert from 'node:assert/strict';
import {latestOnly} from './latestOnly.js';

test('jobs sent while one runs: only the newest runs next', async () => {
  const ran = [];
  let release;
  const gate = new Promise((r) => { release = r; });
  const push = latestOnly(async (job) => { ran.push(job); if (job === 1) await gate; });
  const first = push(1);
  await new Promise((r) => setImmediate(r));   // job 1 is running
  assert.deepEqual(ran, [1]);
  push(2); push(3); push(4); push(5);
  release();
  await first;
  assert.deepEqual(ran, [1, 5]);
});

test('waits for `before` (engine loading), then runs only the newest', async () => {
  const ran = [];
  let loaded;
  const loading = new Promise((r) => { loaded = r; });
  const push = latestOnly((job) => { ran.push(job); }, {before: () => loading});
  const done = push('a');
  push('b'); push('c');
  assert.deepEqual(ran, []);
  loaded();
  await done;
  assert.deepEqual(ran, ['c']);
});
