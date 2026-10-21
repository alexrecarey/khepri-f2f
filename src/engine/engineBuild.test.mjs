// Run with: yarn test:js
// The committed WASM (src/engine/wasm/) must be built from the committed Rust (engine-rs/): BUILD.json holds the
// source hash build-engine.sh saw, and editing engine-rs/ without `yarn build:engine` changes it.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {engineSourceHash} from '../../scripts/engine-stamp.mjs';

const stamp = JSON.parse(readFileSync(new URL('./wasm/BUILD.json', import.meta.url), 'utf8'));

test('the WASM was built from engine-rs/ as committed', () => {
  assert.equal(stamp.source, engineSourceHash(), 'engine-rs/ changed: run `yarn build:engine` and commit src/engine/wasm/');
});
