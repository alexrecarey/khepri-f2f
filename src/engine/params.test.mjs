// Run with: yarn test:js
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {AMMO_KEYS, DEFAULT_PARAMS, PARAM_KEYS, ParamsSchema, fullParams, paramsKey, parseParams} from './params.js';
import {parseOr} from '../lib/parse.js';
import {AMMO as AMMO_RULES, ENGINE_KEYS} from './calculate.js';

const engine = readFileSync(new URL('../../engine-rs/src/engine.rs', import.meta.url), 'utf8');

test('the engine reads exactly the engine input', () => {
  // Side::from_json reads key("x") for each side; Input::from_json the shared keys by name.
  const read = new Set([...engine.matchAll(/\bkey\("(\w+)"\)/g)].flatMap((m) => ['A', 'B'].map((s) => m[1] + s)));
  for (const m of engine.matchAll(/_field\(p, "(\w+)"\)/g)) read.add(m[1]);
  assert.deepEqual([...read].sort(), [...ENGINE_KEYS].sort());
});

test('calculate.js knows exactly the calculator ammo', () => {
  assert.deepEqual(Object.keys(AMMO_RULES).sort(), [...AMMO_KEYS].sort());
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
  const b = /** @type {Partial<import('../types.js').Params>} */ ({...a});
  delete b.burstA;
  b.burstA = 4;
  assert.equal(paramsKey(a), paramsKey(/** @type {import('../types.js').Params} */ (b)));
  assert.equal(a.burstB, 1);
  assert.equal(a.fixedFaceToFace, false);
});

test('old share links: dtwVsDodge is an active template against a reactive Dodge', () => {
  const p = parseParams(new URLSearchParams({dtwVsDodge: 'true', ammoB: 'N'}));
  assert.equal(p.templateA, true);
  assert.equal(p.ammoB, 'DODGE');
  assert.equal(parseParams(new URLSearchParams({dtwVsDodge: 'false'})).templateA, false);
  assert.equal('dtwVsDodge' in p, false);
});

test('ParamsSchema (a saved setup): ints within their limits, else the default; nothing is clamped', () => {
  const read = (/** @type {unknown} */ setup) => parseOr(ParamsSchema, setup, null);
  assert.deepEqual(read({}), DEFAULT_PARAMS);
  assert.deepEqual(read({burstA: 4, ammoB: 'DA', contA: true, junk: 1}), {...DEFAULT_PARAMS, burstA: 4, ammoB: 'DA', contA: true});
  const p = read({burstA: 1.5, armB: 14, successValueA: '13', ammoA: 'plasma', contA: 'true', shockB: 1});
  assert.ok(p);
  assert.equal(p.burstA, DEFAULT_PARAMS.burstA);
  assert.equal(p.armB, DEFAULT_PARAMS.armB);
  assert.equal(p.successValueA, DEFAULT_PARAMS.successValueA);
  assert.equal(p.ammoA, 'N');               // a value, unlike a URL param, is not read in any case
  assert.equal(p.contA, false);
  assert.equal(p.shockB, false);
  assert.equal(read(null), null);
});

test('parseParams: a URL number is what Number() reads, clamped; an empty value is 0', () => {
  const p = parseParams(new URLSearchParams({burstA: 'Infinity', damageA: '', armA: ' 5 ', btsB: '1e1'}));
  assert.deepEqual([p.burstA, p.damageA, p.armA, p.btsB], [6, 0, 5, 10]);
});
