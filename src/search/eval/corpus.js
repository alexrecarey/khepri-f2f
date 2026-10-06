// The search scoreboard's test queries: every unit's short name, mangled the
// ways players mangle names on a phone keyboard. Deterministic (seeded), so a
// change in the score always comes from a change in the matcher.
import {words} from '../text.js';

// Small seeded generator (mulberry32): same corpus on every run.
function rng(seed) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Neighbouring keys on a QWERTY phone keyboard, for fat-finger substitutions.
const NEAR = {
  q: 'wa', w: 'qes', e: 'wrd', r: 'etf', t: 'ryg', y: 'tuh', u: 'yij', i: 'uok', o: 'ipl', p: 'ol',
  a: 'qsz', s: 'awdz', d: 'sefx', f: 'drgc', g: 'fthv', h: 'gyjb', j: 'hukn', k: 'jilm', l: 'kop',
  z: 'asx', x: 'zdc', c: 'xfv', v: 'cgb', b: 'vhn', n: 'bjm', m: 'nk',
};
const VOWELS = 'aeiou';

// Each mutation changes one word (the longest, where typos happen) and returns
// null when it can't apply, so short names only get the cases that fit them.
const MUTATIONS = {
  exact: (w) => w,
  drop: (w, r) => (w.length > 4 ? cut(w, 1 + Math.floor(r() * (w.length - 2)), 1, '') : null),
  swap: (w, r) => {
    if (w.length < 5) return null;
    const i = 1 + Math.floor(r() * (w.length - 3));
    return w[i] === w[i + 1] ? null : w.slice(0, i) + w[i + 1] + w[i] + w.slice(i + 2);
  },
  double: (w, r) => {
    if (w.length < 4) return null;
    const i = 1 + Math.floor(r() * (w.length - 1));
    return w.slice(0, i) + w[i] + w.slice(i);
  },
  fatFinger: (w, r) => {
    if (w.length < 5) return null;
    const i = 1 + Math.floor(r() * (w.length - 2));
    const near = NEAR[w[i]];
    return near ? cut(w, i, 1, near[Math.floor(r() * near.length)]) : null;
  },
  vowel: (w, r) => {
    const spots = [...w].map((c, i) => (i > 0 && VOWELS.includes(c) ? i : -1)).filter((i) => i > 0);
    if (w.length < 5 || !spots.length) return null;
    const i = spots[Math.floor(r() * spots.length)];
    const other = VOWELS.replace(w[i], '');
    return cut(w, i, 1, other[Math.floor(r() * other.length)]);
  },
};

const cut = (s, i, n, insert) => s.slice(0, i) + insert + s.slice(i + n);

// Whole-name variants that aren't single-word typos.
const NAME_VARIANTS = {
  // The first few letters of the name, as typed before the list narrows down.
  prefix: (parts) => (parts[0].length > 5 ? parts[0].slice(0, 4) : null),
  // A dropped space between the first two words ("hactao", "bluewolf mongol cavalry").
  noSpace: (parts) => (parts.length > 1 ? [parts[0] + parts[1], ...parts.slice(2)].join(' ') : null),
  firstWord: (parts) => (parts.length > 1 && parts[0].length >= 4 ? parts[0] : null),
};

// units -> [{query, kind, expect}] where `expect` is the folded short name (two
// units can share one, e.g. a character and their squad).
export function buildCorpus(units, seed = 7) {
  const r = rng(seed);
  const out = [];
  for (const unit of units) {
    const parts = words(unit.short);
    if (!parts.length) continue;
    const expect = parts.join(' ');
    let longest = 0;
    parts.forEach((p, i) => { if (p.length > parts[longest].length) longest = i; });
    for (const [kind, fn] of Object.entries(MUTATIONS)) {
      const m = fn(parts[longest], r);
      if (m == null) continue;
      const q = parts.map((p, i) => (i === longest ? m : p)).join(' ');
      out.push({query: q, kind, expect});
    }
    for (const [kind, fn] of Object.entries(NAME_VARIANTS)) {
      const q = fn(parts);
      if (q) out.push({query: q, kind, expect});
    }
  }
  return out;
}
