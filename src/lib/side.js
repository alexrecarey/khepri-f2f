// The two sides of a matchup: A is the active trooper, B the reactive one.
// Here rather than in state/ or rules/ because the engine needs it too.
/** @type {readonly import('../types.js').Side[]} */
export const SIDES = ['A', 'B'];

/**
 * The other side.
 * @param {import('../types.js').Side} side
 * @returns {import('../types.js').Side}
 */
export const other = (side) => (side === 'A' ? 'B' : 'A');
