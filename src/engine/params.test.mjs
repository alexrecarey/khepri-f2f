// Run with: yarn test:js
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {AMMO, DEFAULT_PARAMS, PARAM_KEYS, fullParams, paramsKey, parseParams} from './params.js';

const f2f = readFileSync(new URL('./f2f.py', import.meta.url), 'utf8');

test('f2f.py reads exactly the calculator params', () => {
  const calculate = f2f.slice(f2f.indexOf('def calculate('));
  const read = new Set([...calculate.matchAll(/p\['(\w+)'\]/g)].map((m) => m[1]));
  assert.deepEqual([...read].sort(), [...PARAM_KEYS].sort());
});

test('f2f.py knows exactly the calculator ammo', () => {
  const table = /^AMMO = \{([\s\S]*?)^\}/m.exec(f2f)[1];
  const keys = [...table.matchAll(/^\s+'(\w+)':/gm)].map((m) => m[1]);
  assert.deepEqual(keys.sort(), [...AMMO].sort());
});

test('parseParams: defaults, clamping, case and junk', () => {
  assert.deepEqual(parseParams(new URLSearchParams()), DEFAULT_PARAMS);
  const p = parseParams(new URLSearchParams({
    burstA: '9', armB: '-1', successValueA: 'abc', ammoA: 'plasma', ammoB: 'nope', contA: 'TRUE', shockB: 'yes',
  }));
  assert.equal(p.burstA, 6);
  assert.equal(p.armB, 0);
  assert.equal(p.successValueA, 13);
  assert.equal(p.ammoA, 'PLASMA');
  assert.equal(p.ammoB, 'N');
  assert.equal(p.contA, true);
  assert.equal(p.shockB, false);
});

test('burst 0 (not rolled) survives a share link on either side', () => {
  const p = parseParams(new URLSearchParams({burstA: '0', burstB: '0'}));
  assert.equal(p.burstA, 0);
  assert.equal(p.burstB, 0);
  assert.equal(parseParams(new URLSearchParams()).burstA, 3);
});

test('bonusBurstB is read on its own, not only when burstB is set', () => {
  assert.equal(parseParams(new URLSearchParams({bonusBurstB: '2'})).bonusBurstB, 2);
  assert.equal(parseParams(new URLSearchParams({burstB: '2', bonusBurstB: 'x'})).bonusBurstB, 0);
});

test('paramsKey ignores key order; fullParams fills defaults', () => {
  const a = fullParams({burstA: 4, ammoA: 'DA'});
  const b = {...a};
  delete b.burstA;
  b.burstA = 4;
  assert.equal(paramsKey(a), paramsKey(b));
  assert.equal(a.burstB, 1);
  assert.equal(a.fixedFaceToFace, false);
});
