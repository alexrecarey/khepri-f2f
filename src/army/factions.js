// Factions: which vanilla army a sectorial belongs to.

// The vanilla army a faction belongs to: follow `parent` up to a faction that
// is its own parent, or whose parent isn't a faction. The mercenary companies
// (Starco, Ikari...) sit under Non-Aligned Armies, whose own parent (900) is
// not in the data, so NA2 is the eleventh "vanilla".
/**
 * @param {Record<string, import('../types.js').Faction>} factions
 * @param {number | string} id
 */
export function rootFaction(factions, id) {
  let cur = Number(id);
  for (let i = 0; i < 5; i++) {
    const parent = factions[cur]?.parent;
    if (parent == null || parent === cur || !factions[parent]) return cur;
    cur = parent;
  }
  return cur;
}

// The same for a side's faction id, when the army may not be loaded yet.
/**
 * @param {import('../types.js').Army | null | undefined} army
 * @param {number | string | null | undefined} factionId
 * @returns {number | null}
 */
export const vanillaOf = (army, factionId) => (factionId == null || !army ? null : rootFaction(army.factions, factionId));
