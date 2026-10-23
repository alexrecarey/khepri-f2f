import {clamp} from '../lib/clamp.js';

// The calculator's input (types.js Params): one flat object of calculator
// params, the same in Basic mode, Matchup mode, share links, saved results
// and the CSV export. Keys end in A (active) or B (reactive), plus a flag for
// a fixed-value roll. src/engine/calculate.js turns them into the dice
// engine's own, smaller input.

// Ammunition the calculator knows: the keys of AMMO in calculate.js. DODGE
// stands for a Dodge, which wins the Face to Face Roll but causes no Saving
// Rolls; NONE for an attack the target is immune to, rolled and opposed but
// harmless.
/** @typedef {import('../types.js').Params} Params */
/** @typedef {import('../types.js').Ammo} Ammo */

/** @type {Ammo[]} */
export const AMMO_KEYS = ['N', 'DA', 'EXP', 'T2', 'PLASMA', 'DODGE', 'NONE'];

/** [min, max] of each numeric param, per side.
 * @type {Record<'burst' | 'bonusBurst' | 'successValue' | 'damage' | 'arm' | 'bts', readonly [number, number]>} */
export const LIMITS = {
  // 0 = not rolled: the other side makes a Normal Roll (unopposed).
  burst: [0, 6],
  bonusBurst: [0, 3],
  // 0 = always fails, no crit (e.g. a weapon out of range in Matchup mode).
  successValue: [0, 30],
  damage: [0, 30],
  arm: [0, 13],
  bts: [0, 12],
};

/** How a param is read and what it starts at.
 * @typedef {{type: 'int', limit: readonly [number, number], default: number} | {type: 'bool', default: boolean} | {type: 'ammo', default: Ammo}} ParamSpec */

/**
 * @param {keyof typeof LIMITS} limit
 * @param {number} value
 * @returns {ParamSpec}
 */
const int = (limit, value) => ({type: 'int', limit: LIMITS[limit], default: value});
/** @returns {ParamSpec} */
const bool = () => ({type: 'bool', default: false});
/** @returns {ParamSpec} */
const ammo = () => ({type: 'ammo', default: 'N'});

/**
 * @param {import('../types.js').Side} s
 * @param {number} burst
 */
const side = (s, burst) => ({
  [`burst${s}`]: int('burst', burst),
  [`bonusBurst${s}`]: int('bonusBurst', 0),
  [`successValue${s}`]: int('successValue', 13),
  [`damage${s}`]: int('damage', 7),        // weapon PS
  [`arm${s}`]: int('arm', 0),              // ARM (or BTS for BTS weapons) as a target, MODs included
  [`bts${s}`]: int('bts', 0),              // BTS as a target of Plasma
  [`ammo${s}`]: ammo(),
  [`cont${s}`]: bool(),                    // Continuous Damage
  // Shock takes effect: target has VITA 1 and no immunity. Matchup mode only
  // (App.jsx turns it off in Basic mode).
  [`shock${s}`]: bool(),
  [`critImmune${s}`]: bool(),              // Immunity (Critical) as a target
  // Direct Template: burst hits land automatically, no roll. Against a Dodge
  // (or No ARO) only the Dodge is rolled; against an attack, each side's attack
  // is its own unopposed roll (calculate.js calculate).
  [`template${s}`]: bool(),
});

// Computed keys: tsc sees an index signature, so the shape is stated.
/** @type {Record<keyof Params, ParamSpec>} */
export const PARAMS = /** @type {Record<keyof Params, ParamSpec>} */ ({
  ...side('A', 3),
  ...side('B', 1),
  fixedFaceToFace: bool(),   // Reactive rolls a fixed value (e.g. AC2)
});

/** @type {(keyof Params)[]} */
export const PARAM_KEYS = /** @type {(keyof Params)[]} */ (Object.keys(PARAMS));

/** @type {Params} */
export const DEFAULT_PARAMS = /** @type {Params} */ (Object.fromEntries(PARAM_KEYS.map((k) => [k, PARAMS[k].default])));

// One raw string (URL param) -> value, or undefined when it can't be read.
/**
 * @param {ParamSpec} spec
 * @param {string} raw
 */
function parseValue(spec, raw) {
  if (spec.type === 'int') return isNaN(Number(raw)) ? undefined : clamp(spec.limit, Number(raw));
  if (spec.type === 'bool') return raw.toLowerCase() === 'true';
  const upper = raw.toUpperCase();
  return AMMO_KEYS.includes(/** @type {Ammo} */ (upper)) ? /** @type {Ammo} */ (upper) : undefined;
}

/**
 * Calculator params from URL search params; anything missing or unreadable
 * gets its default.
 * @param {URLSearchParams} searchParams
 * @returns {Params}
 */
export function parseParams(searchParams) {
  const out = {...DEFAULT_PARAMS};
  for (const k of PARAM_KEYS) {
    const raw = searchParams.get(k);
    if (raw === null) continue;
    const v = parseValue(PARAMS[k], raw);
    // parseValue reads k's spec, so v is k's type.
    if (v !== undefined) /** @type {Record<string, unknown>} */ (out)[k] = v;
  }
  // Links from before templateA / templateB: dtwVsDodge was an active template
  // against a reactive Dodge, whatever ammoB said.
  if (searchParams.get('dtwVsDodge')?.toLowerCase() === 'true') Object.assign(out, {templateA: true, ammoB: 'DODGE'});
  return out;
}

/**
 * Full calculator input, defaults filled in for anything not given.
 * @param {Partial<Params>} partial
 * @returns {Params}
 */
export function fullParams(partial) {
  /** @type {Record<string, unknown>} */
  const params = {};
  for (const k of PARAM_KEYS) params[k] = partial[k] !== undefined ? partial[k] : DEFAULT_PARAMS[k];
  // Every key was set from the same key of a Params.
  return /** @type {Params} */ (params);
}

/**
 * Cache key independent of object key order.
 * @param {Params} params
 */
export const paramsKey = (params) => JSON.stringify(PARAM_KEYS.map((k) => params[k]));
