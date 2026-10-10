// Unit by id without scanning all ~740 units: a Map built once per army
// object (the loaded data, or the raw JSON in tests) and kept while it lives.
const byId = new WeakMap();

export function unitById(army, id) {
  if (!army?.units) return null;
  let map = byId.get(army);
  if (!map) byId.set(army, map = new Map(army.units.map((u) => [u.id, u])));
  return map.get(id) ?? null;
}
