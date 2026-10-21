// Run with: yarn test:js
// The WASM engine (src/engine/wasm/) must give exactly what f2f.py gives: every input in engine.golden.json
// (written by golden.py from f2f.py, which test_golden.py keeps honest), every outcome, every chance bit for bit.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {initSync, calculate} from './wasm/khepri_engine.js';

initSync({module: readFileSync(new URL('./wasm/khepri_engine_bg.wasm', import.meta.url))});
const golden = JSON.parse(readFileSync(new URL('./engine.golden.json', import.meta.url), 'utf8'));

test('the WASM engine matches f2f.py on every reference input', () => {
  assert.ok(golden.length > 100);
  for (const [i, {input, rolls, outcomes}] of golden.entries()) {
    const got = calculate(input);
    assert.equal(String(got.rolls), rolls, `case ${i}: rolls`);
    assert.deepEqual(got.outcomes, outcomes, `case ${i}: outcomes`);
  }
});

test('the WASM engine rejects two Direct Templates, as f2f.py does', () => {
  const {input} = golden[0];
  assert.throws(() => calculate({...input, templateA: true, templateB: true}));
});
