// The share card: what a shared Matchup link unfurls into on Discord and
// WhatsApp (design: canvas Final, "Share card"). The app can't hand the
// numbers to anyone else (the dice run in the browser), so the Share button
// packs what the card shows into the link itself (?card=, base64url JSON);
// the Worker reads it back to write the preview tags and draw the image
// (worker/card.js). The app ignores the param: the first URL sync drops it.
//
// The Worker only displays these strings; every number and label is worked
// out in the app (headline.js), so a link shows what its sender saw.
// Anyone can hand-write a card; it only ever changes a preview.
//
//   {k: 'wpo' | 'win' | 'wound',  the sender's headline choice
//    nf: true,                    not face to face (headline fell back)
//    x: '16-24"',                 range band
//    a / b: {n: '0.81',           headline number
//            l: 'wounds / order', its label
//            u: 'Squalos Mk-II',  unit
//            w: 'HMG',            weapon
//            s: 'Cover, Fireteam 5', the side's situation ('' for none)
//            c: 'squalos-mk-ii-1-1'}}  unit crest slug (src/army/crests.js) or ''

export const CARD_PARAM = 'card';
const KINDS = ['wpo', 'win', 'wound'];
const MAX_TEXT = 60;
const SLUG = /^[a-z0-9-]{1,80}$/;

const toB64url = (bytes) => btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const fromB64url = (s) => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0));

export function encodeCard(card) {
  return toB64url(new TextEncoder().encode(JSON.stringify(card)));
}

// Hand-written links get the same treatment as real ones: anything missing,
// too long or the wrong type is dropped, never trusted.
const text = (v) => (typeof v === 'string' ? v.slice(0, MAX_TEXT) : '');
const slug = (v) => (typeof v === 'string' && SLUG.test(v) ? v : '');

function side(x) {
  if (!x || typeof x !== 'object') return null;
  const out = {n: text(x.n), l: text(x.l), u: text(x.u), w: text(x.w), s: text(x.s), c: slug(x.c)};
  return out.n && out.u ? out : null;
}

// The card in a link's ?card= value, or null.
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
export const detailLine = (x, sep = ' · ') => [x.w, x.s].filter(Boolean).join(sep);

// "0.81 vs 0.46 wounds / order", or each label after its number when the
// sides' labels differ (one side dodging: "65% wins face to face vs 20% dodges").
export function numbersLine({a, b}) {
  return a.l === b.l ? `${a.n} vs ${b.n} ${a.l}` : `${a.n} ${a.l} vs ${b.n} ${b.l}`;
}

// Under the two numbers on the image: the range, and why the headline is not
// the one the player chose.
export const footerLine = (card) => [card.x, card.nf && 'Not face to face'].filter(Boolean).join(' · ');

// The preview's words (canvas ShareText, T1): names in the title, the numbers
// first in the description, then range and both sides' weapons and situations.
export const previewTitle = (card) => `${card.a.u} vs ${card.b.u}`;
export const previewDescription = (card) =>
  [numbersLine(card), footerLine(card), `${detailLine(card.a, ', ')} vs ${detailLine(card.b, ', ')}`].filter(Boolean).join(' · ');

// The line the Share button sends with the link (WhatsApp shows it above the
// preview): "Squalos Mk-II HMG vs Zhanshi Missile L.: 0.81 vs 0.46 wounds / order".
export const shareText = (card) => `${card.a.u} ${card.a.w} vs ${card.b.u} ${card.b.w}: ${numbersLine(card)}`;
