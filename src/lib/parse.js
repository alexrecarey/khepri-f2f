// Outside data (a share link, localStorage, a hand-written ?card=) crosses
// into the app through a valibot schema that is both the parser and the
// type (docs/plans/ui-pass.md, step 10). The policy lives here: never throw;
// a bad field falls back to its default and the rest is kept (`v.fallback`
// per field, `parseOr` at the top). The schemas live next to the data they
// describe (engine/params.js, state/schema.js, share/card.js).
import * as v from 'valibot';

/**
 * The value `schema` reads from `value`, or `fallback` when it can't be read.
 * @template {v.GenericSchema} S
 * @template F
 * @param {S} schema
 * @param {unknown} value
 * @param {F} fallback
 * @returns {v.InferOutput<S> | F}
 */
export function parseOr(schema, value, fallback) {
  const result = v.safeParse(schema, value);
  return result.success ? result.output : fallback;
}

/**
 * An integer of at least `min`.
 * @param {number} min
 */
export const intFrom = (min) => v.pipe(v.number(), v.integer(), v.minValue(min));

/**
 * An integer within [min, max] (engine/params.js LIMITS).
 * @param {readonly [number, number]} limits
 */
export const intIn = ([min, max]) => v.pipe(intFrom(min), v.maxValue(max));

/**
 * A string of at most `max` characters.
 * @param {number} max
 */
export const textUpTo = (max) => v.pipe(v.string(), v.maxLength(max));

// A URL param as a number: anything Number() reads ('', ' 3', '1e1',
// 'Infinity' included), not NaN.
export const numberFromUrl = v.pipe(v.string(), v.transform(Number), v.number());

/**
 * An array of what `item` reads; items it can't read are dropped, never the
 * list (one broken saved roll must not lose the others).
 * @template {v.GenericSchema} S
 * @param {S} item
 */
export const arrayOf = (item) => v.pipe(
  v.array(v.unknown()),
  v.transform((xs) => xs.flatMap((x) => {
    const r = v.safeParse(item, x);
    return r.success ? [r.output] : [];
  })),
);
