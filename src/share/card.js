// The share card: what a Matchup link unfurls into on Discord and WhatsApp
// (design: canvas Final, "Share card"). The Worker works it out from the
// app's address (state/rolls.js matchupShareCard, via worker/setupCard.js)
// and puts it in the card image's URL (?card=, base64url JSON), so the image
// is drawn from these strings alone. Older Share links went to /s with their
// card too (/s?<setup>&card=..); those still unfurl the same way, and the
// app's first URL sync turns the address into /?<setup> (state/sync.js).
// Anyone can hand-write a card; it only ever changes a preview.
//
//   {k: 'wpo' | 'win' | 'wound',  which headline it shows
//    nf: true,                    not face to face (headline fell back)
//    x: '16-24"',                 range band
//    a / b: {n: '0.81',           headline number
//            l: 'wounds / order', its label
//            u: 'Squalos Mk-II',  unit
//            w: 'HMG',            weapon
//            s: 'Cover, Fireteam 5', the side's situation ('' for none)
//            c: 'squalos-mk-ii-1-1'}}  unit crest slug (src/army/crests.js) or ''

/**
 * One side of the share card: the strings the image is drawn from.
 * @typedef {{n: string, l: string, u: string, w: string, s: string, c: string}} CardSide
 */
/**
 * The share card: the headline kind, whether it fell back (not face to face),
 * the range band and both sides.
 * @typedef {{k: 'wpo' | 'win' | 'wound', nf: boolean, x: string, a: CardSide, b: CardSide}} Card
 */

export const CARD_PARAM = 'card';
// The headline for a link from before the address carried one
// (state/headlines.js HEADLINE_PARAM).
export const LINK_HEADLINE = 'wound';
export const SHARE_PATH = '/s';
/** @type {Card['k'][]} */
const KINDS = ['wpo', 'win', 'wound'];
const MAX_TEXT = 60;
const SLUG = /^[a-z0-9-]{1,80}$/;

/** @param {Uint8Array} bytes */
const toB64url = (bytes) => btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
/** @param {string} s */
const fromB64url = (s) => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0));

/** @param {Card} card */
export function encodeCard(card) {
  return toB64url(new TextEncoder().encode(JSON.stringify(card)));
}

// Hand-written links get the same treatment as real ones: anything missing,
// too long or the wrong type is dropped, never trusted.
/** @param {unknown} v */
const text = (v) => (typeof v === 'string' ? v.slice(0, MAX_TEXT) : '');
/** @param {unknown} v */
const slug = (v) => (typeof v === 'string' && SLUG.test(v) ? v : '');

/**
 * @param {Partial<Record<keyof CardSide, unknown>> | string | number | boolean | null | undefined} x anything a hand-written link may carry
 * @returns {CardSide | null}
 */
function side(x) {
  if (!x || typeof x !== 'object') return null;
  const out = {n: text(x.n), l: text(x.l), u: text(x.u), w: text(x.w), s: text(x.s), c: slug(x.c)};
  return out.n && out.u ? out : null;
}

// The card in a link's ?card= value, or null.
/**
 * @param {string | null | undefined} value
 * @returns {Card | null}
 */
export function decodeCard(value) {
  if (!value || value.length > 2000) return null;
  try {
    const raw = JSON.parse(new TextDecoder().decode(fromB64url(value)));
    const a = side(raw?.a), b = side(raw?.b);
    if (!a || !b || !KINDS.includes(raw.k)) return null;
    return {k: raw.k, nf: raw.nf === true, x: text(raw.x), a, b};
  } catch {
    return null;
  }
}

// One side's second line on the card ("Missile L. · Cover, Fireteam 5"), or
// in the preview's description, ", " between all of it.
/**
 * @param {CardSide} x
 * @param {string} [sep]
 */
export const detailLine = (x, sep = ' · ') => [x.w, x.s].filter(Boolean).join(sep);

// "0.81 vs 0.46 wounds / order", or each label after its number when the
// sides' labels differ (one side dodging: "65% wins face to face vs 20% dodges").
/** @param {{a: Pick<CardSide, 'n' | 'l'>, b: Pick<CardSide, 'n' | 'l'>}} card each side's number and label */
export function numbersLine({a, b}) {
  return a.l === b.l ? `${a.n} vs ${b.n} ${a.l}` : `${a.n} ${a.l} vs ${b.n} ${b.l}`;
}

// Under the two numbers on the image: the range, and why the headline is not
// the one the player chose.
/** @param {Card} card */
export const footerLine = (card) => [card.x, card.nf && 'Not face to face'].filter(Boolean).join(' · ');

// The preview's words (canvas ShareText, T1): names in the title, the numbers
// first in the description, then range and both sides' weapons and situations.
/** @param {Card} card */
export const previewTitle = (card) => `${card.a.u} vs ${card.b.u}`;
/** @param {Card} card */
export const previewDescription = (card) =>
  [numbersLine(card), footerLine(card), `${detailLine(card.a, ', ')} vs ${detailLine(card.b, ', ')}`].filter(Boolean).join(' · ');
