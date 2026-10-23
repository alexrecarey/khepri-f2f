// Run with: yarn test:js
// The WASM engine (src/engine/wasm/) must give exactly what the Python engine it replaced gave: every input in
// engine.golden.json (written from f2f.py before it was removed; a fixed reference now), every outcome, every
// chance bit for bit.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {initSync, calculate} from './wasm/khepri_engine.js';

initSync({module: readFileSync(new URL('./wasm/khepri_engine_bg.wasm', import.meta.url))});
const golden = JSON.parse(readFileSync(new URL('./engine.golden.json', import.meta.url), 'utf8'));

test('the WASM engine matches the reference results on every input', () => {
  assert.ok(golden.length > 100);
  for (const [i, {input, rolls, outcomes}] of golden.entries()) {
    const got = calculate(input);
    assert.equal(String(got.rolls), rolls, `case ${i}: rolls`);
    assert.deepEqual(got.outcomes, outcomes, `case ${i}: outcomes`);
  }
});

test('the WASM engine rejects two Direct Templates (two separate rolls)', () => {
  const {input} = golden[0];
  assert.throws(() => calculate({...input, templateA: true, templateB: true}));
});
