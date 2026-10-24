import * as v from 'valibot';
import {clamp} from '../lib/clamp.js';
import {intIn, numberFromUrl, parseOr} from '../lib/parse.js';

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
/** @typedef {import('../types.js').SideParams} SideParams */
/** @typedef {import('../types.js').Ammo} Ammo */
/** A param's key: a SideParams key with its side, or the fixed-roll flag.
 * @typedef {`${keyof SideParams}A` | `${keyof SideParams}B` | 'fixedFaceToFace'} ParamKey */

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
/** @type {Record<ParamKey, ParamSpec>} */
export const PARAMS = /** @type {Record<ParamKey, ParamSpec>} */ ({
  ...side('A', 3),
  ...side('B', 1),
  fixedFaceToFace: bool(),   // Reactive rolls a fixed value (e.g. AC2)
});

/** @type {ParamKey[]} */
export const PARAM_KEYS = /** @type {ParamKey[]} */ (Object.keys(PARAMS));

/** @type {Params} */
export const DEFAULT_PARAMS = /** @type {Params} */ (Object.fromEntries(PARAM_KEYS.map((k) => [k, PARAMS[k].default])));

// The schemas, built from the table (PARAMS stays the source: the UI reads
// its limits). Each field falls back to its default, so a Params always
// comes out whole. The entries' type is stated the way PARAMS's is: tsc sees
// Object.fromEntries as an index signature.
/** @typedef {{[K in keyof SideParams as `${K}A` | `${K}B`]: v.GenericSchema<unknown, SideParams[K]>} & {fixedFaceToFace: v.GenericSchema<unknown, boolean>}} ParamEntries */
/** @param {(spec: ParamSpec) => v.GenericSchema<unknown, number> | v.GenericSchema<unknown, boolean> | v.GenericSchema<unknown, Ammo>} schemaOf */
const table = (schemaOf) => v.object(/** @type {ParamEntries} */ (Object.fromEntries(PARAM_KEYS.map((k) => [k, schemaOf(PARAMS[k])]))));

// A param as a value (a saved roll's setup): an int within its limits, a
// boolean, an ammo key.
/** @param {ParamSpec} spec */
const valueSchema = (spec) =>
  spec.type === 'int' ? v.fallback(intIn(spec.limit), spec.default)
    : spec.type === 'bool' ? v.fallback(v.boolean(), spec.default)
      : v.fallback(v.picklist(AMMO_KEYS), spec.default);
export const ParamsSchema = table(valueSchema);

// A param as a URL string: a number is clamped into its limits (a link made
// for other limits still loads as near as it can), 'true' in any case is
// true, ammo is read in any case. Anything else is the default.
/** @param {ParamSpec} spec */
const urlSchema = (spec) =>
  spec.type === 'int' ? v.fallback(v.pipe(numberFromUrl, v.transform((n) => clamp(spec.limit, n))), spec.default)
    : spec.type === 'bool' ? v.fallback(v.pipe(v.string(), v.transform((raw) => raw.toLowerCase() === 'true')), spec.default)
      : v.fallback(v.pipe(v.string(), v.toUpperCase(), v.picklist(AMMO_KEYS)), spec.default);
const UrlParamsSchema = table(urlSchema);

/**
 * Calculator params from URL search params; anything missing or unreadable
 * gets its default.
 * @param {URLSearchParams} searchParams
 * @returns {Params}
 */
export function parseParams(searchParams) {
  const out = parseOr(UrlParamsSchema, Object.fromEntries(PARAM_KEYS.flatMap((k) => (searchParams.has(k) ? [[k, searchParams.get(k)]] : []))), DEFAULT_PARAMS);
  // Links from before templateA / templateB: dtwVsDodge was an active template
  // against a reactive Dodge, whatever ammoB said.
  if (searchParams.get('dtwVsDodge')?.toLowerCase() === 'true') return {...out, templateA: true, ammoB: 'DODGE'};
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
