// Text handling shared by the index builder and the matcher. Both sides of a
// comparison go through the same functions, so "Índigo" in the data and
// "indigo" typed on a phone end up as the same word.
import {searchKey} from '../lib/searchKey.js';

// Raw text -> folded words. Splits on anything that isn't a letter or digit
// (spaces, hyphens, apostrophes, commas, dots) and on CamelCase humps, so
// "RacerBots" gives racer + bots and "PSI-Cops" gives psi + cops.
export function words(text) {
  if (!text) return [];
  const spaced = text
    .replace(/(\p{Ll})(\p{Lu})/gu, '$1 $2')
    .replace(/(\p{Lu})(\p{Lu}\p{Ll})/gu, '$1 $2');
  return searchKey(spaced).split(/[^\p{L}\p{N}]+/u).filter(Boolean);
}

// Every word plus the joined forms people type when they drop a space or a
// hyphen: each name chunk glued together ("PSI-Cops" -> psicops,
// "RacerBots" -> racerbots) and each pair of neighbours ("Hac Tao" -> hactao).
export function indexWords(text) {
  const parts = words(text);
  const out = new Set(parts);
  for (let i = 0; i + 1 < parts.length; i++) out.add(parts[i] + parts[i + 1]);
  for (const chunk of (text || '').split(/[\s,]+/)) {
    const glued = words(chunk).join('');
    if (glued) out.add(glued);
  }
  return [...out];
}

// Initials of a multi-word name, so "hmg" finds Heavy Machine Gun and "msr"
// finds MULTI Sniper Rifle without each one needing an alias.
export function initials(text) {
  const parts = words(text);
  return parts.length > 1 ? parts.map((w) => w[0]).join('') : null;
}

// A loose "sounds like" key for transliterated names, where players spell what
// they heard: Ghulam / Gulam, Asawira / Asawirah, Kum / Khum. Not English
// phonetics: these are a few spelling equivalences that cover Arabic, Chinese,
// Japanese and Slavic transliterations without merging unrelated names.
export function soundKey(word) {
  return word
    .replace(/ph/g, 'f')
    .replace(/(?<=[bcdfgjklmnpqrstvwxz])h/g, '') // kh->k, gh->g, zh->z, sh->s, th->t
    .replace(/q|c(?=[aou])|ck/g, 'k')
    .replace(/y/g, 'i')
    .replace(/w/g, 'v')
    .replace(/h$/, '')
    .replace(/(.)\1+/g, '$1');
}

// Typo distance between what was typed and the START of a word: the fewest
// single-letter insertions, deletions, substitutions or neighbour swaps that
// turn `q` into some prefix of `w`. Prefix, because the user is usually still
// typing ("zhnash" should already find Zhanshi). Gives up above `max`.
export function prefixDistance(q, w, max) {
  const m = q.length;
  const n = Math.min(w.length, m + max);
  // Rows of the optimal-string-alignment table, q down, w across.
  let prev2 = null;
  let prev = new Array(n + 1);
  for (let j = 0; j <= n; j++) prev[j] = j;
  for (let i = 1; i <= m; i++) {
    const cur = new Array(n + 1);
    cur[0] = i;
    let rowMin = cur[0];
    for (let j = 1; j <= n; j++) {
      const cost = q[i - 1] === w[j - 1] ? 0 : 1;
      let v = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost);
      if (i > 1 && j > 1 && q[i - 1] === w[j - 2] && q[i - 2] === w[j - 1]) v = Math.min(v, prev2[j - 2] + 1);
      cur[j] = v;
      if (v < rowMin) rowMin = v;
    }
    if (rowMin > max) return max + 1;
    prev2 = prev;
    prev = cur;
  }
  // Best over every prefix length of w: the last row's minimum.
  let best = max + 1;
  for (let j = 0; j <= n; j++) if (prev[j] < best) best = prev[j];
  return best;
}

// How many typos a typed word of this length may carry. Short words get none:
// with two or three letters, one typo matches half the vocabulary.
export function typoBudget(length) {
  if (length < 4) return 0;
  return length < 8 ? 1 : 2;
}
