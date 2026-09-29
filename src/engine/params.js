// The dice engine's input: one flat object of calculator params, the same in
// Basic mode, Matchup mode, share links, saved results and the CSV export.
// Keys end in A (active) or B (reactive), plus two flags for the kind of roll.
// src/python/f2f.py calculate() reads exactly these keys (checked by params.test.mjs).

// Ammunition the engine knows: the keys of AMMO in f2f.py. DODGE stands for a
// Dodge, which wins the Face to Face Roll but causes no Saving Rolls.
export const AMMO = ['N', 'DA', 'EXP', 'T2', 'PLASMA', 'DODGE'];

// [min, max] of each numeric param, per side.
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

const int = (limit, value) => ({type: 'int', limit: LIMITS[limit], default: value});
const bool = () => ({type: 'bool', default: false});
const ammo = () => ({type: 'ammo', default: 'N'});

const side = (s, burst) => ({
  [`burst${s}`]: int('burst', burst),
  [`bonusBurst${s}`]: int('bonusBurst', 0),
  [`successValue${s}`]: int('successValue', 13),
  [`damage${s}`]: int('damage', 7),        // weapon PS
  [`arm${s}`]: int('arm', 0),              // ARM (or BTS for BTS weapons) as a target, MODs included
  [`bts${s}`]: int('bts', 0),              // BTS as a target of Plasma
  [`ammo${s}`]: ammo(),
  [`cont${s}`]: bool(),                    // Continuous Damage
  [`shock${s}`]: bool(),                   // Shock takes effect: target has VITA 1 and no immunity
  [`critImmune${s}`]: bool(),              // Immunity (Critical) as a target
});

export const PARAMS = {
  ...side('A', 3),
  ...side('B', 1),
  dtwVsDodge: bool(),        // Direct Template Weapon (active) against a Dodge (reactive)
  fixedFaceToFace: bool(),   // Reactive rolls a fixed value (e.g. AC2)
};

export const PARAM_KEYS = Object.keys(PARAMS);

export const DEFAULT_PARAMS = Object.fromEntries(PARAM_KEYS.map((k) => [k, PARAMS[k].default]));

const clamp = ([min, max], n) => Math.min(max, Math.max(min, n));

// One raw string (URL param) -> value, or undefined when it can't be read.
function parseValue(spec, raw) {
  if (spec.type === 'int') return isNaN(Number(raw)) ? undefined : clamp(spec.limit, Number(raw));
  if (spec.type === 'bool') return raw.toLowerCase() === 'true';
  const upper = raw.toUpperCase();
  return AMMO.includes(upper) ? upper : undefined;
}

// Calculator params from URL search params; anything missing or unreadable
// gets its default.
export function parseParams(searchParams) {
  const out = {...DEFAULT_PARAMS};
  for (const k of PARAM_KEYS) {
    const raw = searchParams.get(k);
    if (raw === null) continue;
    const v = parseValue(PARAMS[k], raw);
    if (v !== undefined) out[k] = v;
  }
  return out;
}

// Full calculator input, defaults filled in for anything not given.
export function fullParams(partial) {
  const params = {};
  for (const k of PARAM_KEYS) params[k] = partial[k] !== undefined ? partial[k] : DEFAULT_PARAMS[k];
  return params;
}

// Cache key independent of object key order.
export const paramsKey = (params) => JSON.stringify(PARAM_KEYS.map((k) => params[k]));
