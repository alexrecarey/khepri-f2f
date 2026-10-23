// x and everything reachable from it, frozen in place (and returned). For
// tests: a module that writes to its input then throws (ES modules are
// strict), so "never mutates its input" is checked, not just intended.
export function deepFreeze(x) {
  if (x === null || typeof x !== 'object' || Object.isFrozen(x)) return x;
  Object.freeze(x);
  for (const v of x instanceof Map ? x.values() : Object.values(x)) deepFreeze(v);
  return x;
}
