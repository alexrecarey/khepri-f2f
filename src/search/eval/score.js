// Runs a list of {query, expect} through search() and scores it: is the
// expected unit the first unit listed (top 1), or among the first five
// (top 5), or listed at all (found)? A short prefix like "shas" lists all
// fifteen Shasvastii units, so missing the top 5 there is not a failure.
// Shared by scripts/search-eval.mjs (the report) and the tests (the floor the
// scores must not drop below).
import {words} from '../text.js';

/** One kind's tally.
 * @typedef {{n: number, top1: number, top5: number, found: number, results: number}} Tally */

/**
 * @param {import('../../types.js').Searcher} searcher
 * @param {import('./corpus.js').SearchCase[]} cases
 */
export function score(searcher, cases) {
  /** @type {Map<string, Tally>} */
  const byKind = new Map();
  /** @type {(import('./corpus.js').SearchCase & {got: string[]})[]} */
  const misses = [];
  /** @type {number[]} */
  const times = [];
  for (const c of cases) {
    const t0 = performance.now();
    const res = searcher.search({query: c.query, factionId: c.factionId ?? null});
    times.push(performance.now() - t0);
    const shorts = res.units.map((u) => words(u.short).join(' '));
    const rank = shorts.indexOf(c.expect);
    // set() then get(): the tally is there.
    const k = /** @type {Tally} */ (byKind.get(c.kind) ?? byKind.set(c.kind, {n: 0, top1: 0, top5: 0, found: 0, results: 0}).get(c.kind));
    k.n++;
    k.results += res.units.length;
    if (rank >= 0) k.found++;
    if (rank === 0) k.top1++;
    if (rank >= 0 && rank < 5) k.top5++;
    else misses.push({...c, got: shorts.slice(0, 3)});
  }
  const all = [...byKind.values()].reduce((a, k) => ({
    n: a.n + k.n, top1: a.top1 + k.top1, top5: a.top5 + k.top5, found: a.found + k.found, results: a.results + k.results,
  }), {n: 0, top1: 0, top5: 0, found: 0, results: 0});
  times.sort((a, b) => a - b);
  return {
    byKind: Object.fromEntries(byKind),
    all,
    misses,
    ms: {p50: times[Math.floor(times.length / 2)], p95: times[Math.floor(times.length * 0.95)], max: times.at(-1)},
  };
}
