// Calculator params (src/engine/params.js) -> dice engine (src/engine/wasm/, its calculate)
// -> result rows for the display.
//
// The engine only rolls dice. The rules that turn a weapon and a target into
// dice live here: what each ammunition does, PS + ARM (or BTS) as the save
// value, Plasma's second Saving Roll, Immunity (Critical), Shock, and a Direct
// Template against an attack being two separate rolls.
import {other} from '../lib/side.js';

// What a hit with each ammunition does (calculator ammo, params.js AMMO_KEYS).
//   saves             Saving Rolls per hit
//   woundsPerFailure  wounds per failed Saving Roll
//   secondary         every Saving Roll also needs a BTS one (Plasma)
/** @typedef {import('../types.js').Params} Params */
/** @typedef {import('../types.js').Player} Player */
/** @typedef {import('../types.js').EngineInput} EngineInput */

/** @type {Record<import('../types.js').Ammo, {saves: number, woundsPerFailure?: number, secondary?: boolean}>} */
export const AMMO = {
  N: {saves: 1},
  DA: {saves: 2},
  EXP: {saves: 3},
  T2: {saves: 1, woundsPerFailure: 2},
  PLASMA: {saves: 1, secondary: true},
  // A Dodge wins the Face to Face Roll but causes no Saving Rolls.
  DODGE: {saves: 0},
  // An attack whose hits do nothing to the target (e.g. E/M against Immunity
  // (BTS)): still rolled and opposed, but causes no Saving Rolls.
  NONE: {saves: 0},
};

// Keys of one side's engine input; the engine reads these with an A or B suffix.
/** @type {(keyof import('../types.js').EngineSide)[]} */
export const ENGINE_SIDE_KEYS = [
  'successValue', 'burst', 'bonusBurst', 'template',
  'saveValue', 'saves', 'critSave', 'woundsPerFailure', 'cont', 'secondarySave',
];
export const ENGINE_KEYS = [
  ...['A', 'B'].flatMap((s) => ENGINE_SIDE_KEYS.map((k) => k + s)),
  'fixedFaceToFace',
];

// Most wounds shown; more are counted as this many.
export const MAX_WOUNDS = 25;

// Side s's attack against the other side, as the engine reads it.
/**
 * @param {Params} p
 * @param {import('../types.js').Side} s
 * @returns {Partial<EngineInput>}
 */
function sideInput(p, s) {
  const t = other(s);
  const ammo = AMMO[p[`ammo${s}`]];
  // Computed keys: tsc sees an index signature, so the shape is stated.
  return /** @type {Partial<EngineInput>} */ ({
    [`successValue${s}`]: p[`successValue${s}`],
    [`burst${s}`]: p[`burst${s}`],
    [`bonusBurst${s}`]: p[`bonusBurst${s}`],
    [`template${s}`]: p[`template${s}`],
    // A Saving Roll passes on d20 <= PS + ARM (or BTS), MODs already in ARM.
    [`saveValue${s}`]: p[`damage${s}`] + p[`arm${t}`],
    [`saves${s}`]: ammo.saves,
    // A Critical adds a Saving Roll, unless the target has Immunity (Critical)
    // or the hit causes no Saving Rolls at all.
    [`critSave${s}`]: ammo.saves > 0 && !p[`critImmune${t}`],
    [`woundsPerFailure${s}`]: ammo.woundsPerFailure ?? 1,
    [`cont${s}`]: p[`cont${s}`],
    [`secondarySave${s}`]: ammo.secondary ? p[`damage${s}`] + p[`bts${t}`] : null,
  });
}

// Engine input for the whole roll.
/**
 * @param {Params} p
 * @returns {EngineInput}
 */
export const engineInput = (p) => /** @type {EngineInput} */ ({...sideInput(p, 'A'), ...sideInput(p, 'B'), fixedFaceToFace: p.fixedFaceToFace});

// Does side s attack? A Direct Template always does; a roll does unless it is
// a Dodge or not made.
/**
 * @param {Params} p
 * @param {import('../types.js').Side} s
 */
const attacks = (p, s) => p[`template${s}`] || (p[`burst${s}`] > 0 && p[`ammo${s}`] !== 'DODGE');

// A Direct Template against an attack: nothing is opposed, each side's attack
// is its own roll (a Normal Roll, or the template's automatic hits).
/** @param {Params} p */
export const isUnopposed = (p) => (p.templateA || p.templateB) && attacks(p, 'A') && attacks(p, 'B');

// Side s's attack on its own: the other side doesn't roll (a fixed roll
// included, it only means anything against the active side's roll).
/**
 * @param {Params} p
 * @param {import('../types.js').Side} s
 * @returns {Params}
 */
const alone = (p, s) => /** @type {Params} */ ({
  ...p, [`burst${other(s)}`]: 0, [`bonusBurst${other(s)}`]: 0, [`template${other(s)}`]: false, fixedFaceToFace: false,
});

// Shock: a failed Saving Roll against VITA 1 is Dead, one extra wound, once.
/**
 * @param {Params} p
 * @param {import('../types.js').EngineOutput['outcomes']} outcomes
 */
function applyShock(p, outcomes) {
  /** @type {Partial<Record<Player, boolean>>} */
  const shock = {active: p.shockA, reactive: p.shockB};
  return outcomes.map((o) => (shock[o.player] && o.wounds > 0 ? {...o, wounds: o.wounds + 1} : o));
}

/**
 * Engine output -> the result rows: who wins the Face to Face Roll, then the
 * wounds, active then fail then reactive. rawChance is the chance counted in
 * rolls (chance * totalRolls).
 * @param {Params} p
 * @param {import('../types.js').EngineOutput} output
 * @returns {import('../types.js').EngineResult}
 */
export function formatResult(p, {rolls: count, outcomes}) {
  // The engine's roll count is a BigInt past 2**53 (wasm/khepri_engine.js;
  // B6+3 EXP continuous on both sides gets there), and a BigInt in a
  // product with a Number throws. The count is only shown and scaled by.
  const rolls = Number(count);
  /** @type {Record<Player, Map<number, number>>} */
  const chances = {active: new Map(), fail: new Map(), reactive: new Map()};
  for (const o of applyShock(p, outcomes)) {
    const w = Math.min(o.wounds, MAX_WOUNDS);
    chances[o.player].set(w, (chances[o.player].get(w) ?? 0) + o.chance);
  }
  /** @param {Map<number, number>} m */
  const total = (m) => [...m.values()].reduce((x, y) => x + y, 0);
  const faceToFace = /** @type {Player[]} */ (['active', 'reactive', 'fail']).map((player, id) => {
    const chance = total(chances[player]);
    return {id, player, rawChance: chance * rolls, chance};
  });
  /** @type {import('../types.js').WoundRow[]} */
  const expectedWounds = [];
  for (const player of /** @type {Player[]} */ (['active', 'fail', 'reactive'])) {
    const rows = [...chances[player]].sort(([x], [y]) => x - y);
    rows.forEach(([wounds, chance], i) => expectedWounds.push({
      id: expectedWounds.length,
      player,
      wounds,
      rawChance: chance * rolls,
      chance,
      cumulativeChance: rows.slice(i).reduce((sum, [, c]) => sum + c, 0),
    }));
  }
  return {faceToFace, expectedWounds, totalRolls: rolls};
}

/**
 * Runs the calculator params through `runEngine` (engine input -> engine
 * output: the engine's calculate, see worker.js) and returns the result the display reads.
 *
 * A Direct Template against an attack (isUnopposed) is two engine runs, one
 * per side. The result then holds 'unopposed': {active, reactive}, one result
 * per side, each without the other's rows; its top-level 'faceToFace' and
 * 'expectedWounds' keep only each side's own rows (no 'fail').
 * @param {Params} p
 * @param {import('../types.js').RunEngine} runEngine
 * @returns {import('../types.js').EngineResult}
 */
export function calculate(p, runEngine) {
  /** @param {Params} q */
  const run = (q) => formatResult(q, runEngine(engineInput(q)));
  if (!isUnopposed(p)) return run(p);
  const active = run(alone(p, 'A'));
  const reactive = run(alone(p, 'B'));
  /**
   * @template {{player: Player}} R
   * @param {R[]} r
   * @param {Player} player
   */
  const own = (r, player) => r.filter((x) => x.player === player);
  const rows = [...own(active.expectedWounds, 'active'), ...own(reactive.expectedWounds, 'reactive')];
  return {
    unopposed: {active, reactive},
    faceToFace: [...own(active.faceToFace, 'active'), ...own(reactive.faceToFace, 'reactive')],
    expectedWounds: rows.map((r, id) => ({...r, id})),
    totalRolls: active.totalRolls + reactive.totalRolls,
  };
}
