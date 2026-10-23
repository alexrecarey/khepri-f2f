// n held within [min, max]. Written once: the engine params, the rules and
// the classic screen all clamp to the same LIMITS (engine/params.js).
/**
 * @param {readonly [number, number]} limits
 * @param {number} n
 */
export const clamp = ([min, max], n) => Math.min(max, Math.max(min, n));
