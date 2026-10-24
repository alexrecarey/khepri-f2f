// Unit by id without scanning all ~740 units: a Map built once per army
// object (the loaded data, or the raw JSON in tests) and kept while it lives.
/** @type {WeakMap<object, Map<number, import('../types.js').UnitRow>>} */
const byId = new WeakMap();

/**
 * @param {import('../types.js').Army | null | undefined} army
 * @param {number | null | undefined} id
 * @returns {import('../types.js').UnitRow | null}
 */
export function unitById(army, id) {
  if (!army?.units) return null;
  let map = byId.get(army);
  if (!map) byId.set(army, map = new Map(army.units.map((u) => [u.id, u])));
  // A null id misses like any other unknown id.
  return map.get(/** @type {number} */ (id)) ?? null;
}
