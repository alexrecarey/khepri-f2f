// Run with: yarn test:js
// The engine itself is tested in test_f2f.py; here a stub stands in for it.
import test from 'node:test';
import assert from 'node:assert/strict';
import {MAX_WOUNDS, calculate, engineInput, formatResult} from './calculate.js';
import {fullParams} from './params.js';

const P = fullParams({
  successValueA: 14, burstA: 3, bonusBurstA: 1, damageA: 13, armA: 4, btsA: 6, ammoA: 'N',
  successValueB: 12, burstB: 1, damageB: 14, armB: 2, btsB: 3, ammoB: 'N',
});

test('engine input: final success value, bursts, save value = PS + target ARM', () => {
  const e = engineInput(P);
  assert.deepEqual(
    [e.successValueA, e.burstA, e.bonusBurstA, e.saveValueA, e.successValueB, e.burstB, e.saveValueB],
    [14, 3, 1, 13 + 2, 12, 1, 14 + 4],
  );
  assert.deepEqual([e.savesA, e.critSaveA, e.woundsPerFailureA, e.contA, e.secondarySaveA], [1, true, 1, false, null]);
  assert.equal(e.fixedFaceToFace, false);
});

test('engine input: ammunition', () => {
  const side = (ammoA, extra = {}) => {
    const e = engineInput({...P, ammoA, ...extra});
    return [e.savesA, e.critSaveA, e.woundsPerFailureA, e.secondarySaveA];
  };
  assert.deepEqual(side('DA'), [2, true, 1, null]);
  assert.deepEqual(side('EXP'), [3, true, 1, null]);
  assert.deepEqual(side('T2'), [1, true, 2, null]);
  // Plasma: a second Saving Roll at PS + the target's BTS.
  assert.deepEqual(side('PLASMA'), [1, true, 1, 13 + 3]);
  // No Saving Rolls, so no Critical one either.
  assert.deepEqual(side('DODGE'), [0, false, 1, null]);
  assert.deepEqual(side('NONE'), [0, false, 1, null]);
  assert.equal(engineInput({...P, contA: true}).contA, true);
});

test('engine input: Immunity (Critical) belongs to the target', () => {
  const e = engineInput({...P, critImmuneB: true});
  assert.equal(e.critSaveA, false);
  assert.equal(e.critSaveB, true);
});

/**
 * @param {import('../types.js').EngineOutput['outcomes']} outcomes
 * @param {number | bigint} [rolls]
 * @returns {import('../types.js').RunEngine}
 */
const stub = (outcomes, rolls = 8000) => () => ({rolls, outcomes});

test('result rows: active, fail, reactive by wounds, with cumulative chances', () => {
  const r = calculate(P, stub([
    {player: 'reactive', wounds: 1, chance: 0.1},
    {player: 'active', wounds: 2, chance: 0.2},
    {player: 'fail', wounds: 0, chance: 0.3},
    {player: 'active', wounds: 0, chance: 0.25},
    {player: 'active', wounds: 1, chance: 0.15},
  ]));
  assert.deepEqual(r.expectedWounds.map((x) => [x.id, x.player, x.wounds]),
    [[0, 'active', 0], [1, 'active', 1], [2, 'active', 2], [3, 'fail', 0], [4, 'reactive', 1]]);
  assert.deepEqual(r.expectedWounds.map((x) => +x.cumulativeChance.toFixed(10)), [0.6, 0.35, 0.2, 0.3, 0.1]);
  assert.equal(r.expectedWounds[2].rawChance, 0.2 * 8000);
  assert.deepEqual(r.faceToFace.map((x) => [x.player, +x.chance.toFixed(10)]),
    [['active', 0.6], ['reactive', 0.1], ['fail', 0.3]]);
  assert.equal(r.totalRolls, 8000);
});

test('a roll count past 2**53 (a BigInt from the WASM glue) still formats', () => {
  // B6+3 EXP continuous on both sides at high PS gets there in Classic mode.
  const big = 262144000000000000000000n;
  const r = calculate(P, stub([{player: 'active', wounds: 1, chance: 0.5}, {player: 'fail', wounds: 0, chance: 0.5}], big));
  assert.equal(r.totalRolls, Number(big));
  assert.equal(r.expectedWounds[0].rawChance, 0.5 * Number(big));
  // A Direct Template against an attack adds the two counts.
  const r2 = calculate({...P, templateA: true}, stub([{player: 'active', wounds: 1, chance: 1}], big));
  assert.equal(r2.totalRolls, 2 * Number(big));
});

test('result rows: wounds over the maximum count as the maximum', () => {
  const r = formatResult(P, {rolls: 1, outcomes: [
    {player: 'active', wounds: MAX_WOUNDS, chance: 0.5},
    {player: 'active', wounds: MAX_WOUNDS + 3, chance: 0.5},
  ]});
  assert.deepEqual(r.expectedWounds.map((x) => [x.wounds, x.chance]), [[MAX_WOUNDS, 1]]);
});

test('Shock: one extra wound once a Saving Roll fails, on the side that has it', () => {
  /** @type {import('../types.js').EngineOutput['outcomes']} */
  const outcomes = [
    {player: 'active', wounds: 0, chance: 0.2},
    {player: 'active', wounds: 1, chance: 0.3},
    {player: 'active', wounds: 2, chance: 0.1},
    {player: 'reactive', wounds: 1, chance: 0.4},
  ];
  const rows = (p) => calculate(p, stub(outcomes)).expectedWounds.map((x) => [x.player, x.wounds]);
  assert.deepEqual(rows({...P, shockA: true}), [['active', 0], ['active', 2], ['active', 3], ['reactive', 1]]);
  assert.deepEqual(rows({...P, shockB: true}), [['active', 0], ['active', 1], ['active', 2], ['reactive', 2]]);
});

test('a Direct Template against an attack: one engine run per side, each alone', () => {
  /** @type {import('../types.js').EngineInput[]} */
  const runs = [];
  /** @type {import('../types.js').RunEngine} */
  const engine = (e) => {
    runs.push(e);
    const player = e.burstA > 0 || e.templateA ? 'active' : 'reactive';
    return {rolls: e.templateA || e.templateB ? 1 : 20, outcomes: [
      {player, wounds: 1, chance: 0.6}, {player: e.templateA || e.templateB ? player : 'fail', wounds: 0, chance: 0.4},
    ]};
  };
  const r = calculate({...P, templateA: true, burstA: 2, bonusBurstB: 1, fixedFaceToFace: true}, engine);
  assert.equal(runs.length, 2);
  // The template alone: the reactive side doesn't roll at all.
  assert.deepEqual([runs[0].templateA, runs[0].burstB, runs[0].bonusBurstB, runs[0].fixedFaceToFace], [true, 0, 0, false]);
  // The shot alone: no template, no fixed roll.
  assert.deepEqual([runs[1].templateA, runs[1].burstA, runs[1].burstB, runs[1].bonusBurstB], [false, 0, 1, 1]);
  assert.equal(r.totalRolls, 21);
  assert.deepEqual(Object.keys(/** @type {NonNullable<typeof r.unopposed>} */ (r.unopposed)), ['active', 'reactive']);
  assert.deepEqual(r.faceToFace.map((x) => x.player), ['active', 'reactive']);
  assert.deepEqual(r.expectedWounds.map((x) => [x.id, x.player]),
    [[0, 'active'], [1, 'active'], [2, 'reactive']]);
});

test('a Direct Template against a Dodge or No ARO is one run', () => {
  for (const p of /** @type {Partial<import('../types.js').Params>[]} */ ([{ammoB: 'DODGE'}, {burstB: 0}])) {
    let n = 0;
    const r = calculate({...P, templateA: true, ...p}, () => (n++, {rolls: 1, outcomes: []}));
    assert.equal(n, 1);
    assert.equal(r.unopposed, undefined);
  }
});
