// The other side of a matchup: A is the active trooper, B the reactive one.
// Here rather than in state/ or rules/ because the engine needs it too.
/**
 * @param {import('../types.js').Side} side
 * @returns {import('../types.js').Side}
 */
export const other = (side) => (side === 'A' ? 'B' : 'A');
