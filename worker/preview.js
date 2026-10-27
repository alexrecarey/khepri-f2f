// Link previews (Discord, WhatsApp...). index.html carries the site's own
// tags, so any link unfurls. Two kinds of link get their own card:
//   /?<setup>      the app's address, as copied from the address bar or the
//                  Share button: a rewrite rule on the zone sends only
//                  link-preview bots to /s with the same query
//                  (scripts/cloudflare/), and setupCard.js works the card
//                  out from the setup, so / stays a static file for people.
//   /s?card=..     older Share links, carrying their card (src/share/card.js).
// /s is the app's own page with the site's tags swapped for the card's (its
// words, canvas ShareText T1, and its image), so anyone landing there is in
// the app, which moves its address to /?<setup> itself. Images live under
// /og/, drawn from the card in their URL.
import {CARD_PARAM, decodeCard, encodeCard, previewDescription, previewTitle} from '../src/share/card.js';
import {initSync, calculate as runEngine} from '../src/engine/wasm/khepri_engine.js';
import engineWasm from '../src/engine/wasm/khepri_engine_bg.wasm';
import {CARD_H, CARD_W, renderCard, renderDefault} from './card.js';
import {cardFromSetup} from './setupCard.js';
import {SIDE_COLOR} from '../src/results/ramp.js';

// Bump when the image changes: the apps cache previews by image URL.
const IMAGE_PATH = '/og/v1/';
// Discord's embed stripe: the side that does better.
const {active: ACTIVE, reactive: REACTIVE} = SIDE_COLOR;
// The numbers in an image URL never change, so caches may keep it for good.
const IMMUTABLE = 'public, max-age=31536000, immutable';

/** @typedef {import('../src/share/card.js').Card} Card */

/** @param {unknown} s */
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Which side the stripe goes to: the bigger headline number (ties go active).
/** @param {Card} card */
const leader = (card) => (parseFloat(card.b.n) > parseFloat(card.a.n) ? REACTIVE : ACTIVE);

// link: the address the preview stands for (og:url, where a click goes).
/**
 * @param {Card} card
 * @param {URL} url
 * @param {string} link
 */
function cardTags(card, url, link) {
  // The card's numbers are in the image URL, so it never goes stale: new
  // army data makes a new card, and so a new URL.
  const image = `${url.origin}${IMAGE_PATH}card.png?${CARD_PARAM}=${encodeCard(card)}`;
  const title = previewTitle(card);
  return [
    ['property', 'og:site_name', 'Infinity the Calculator'],
    ['property', 'og:type', 'website'],
    ['property', 'og:url', link],
    ['property', 'og:title', title],
    ['property', 'og:description', previewDescription(card)],
    ['property', 'og:image', image],
    ['property', 'og:image:type', 'image/png'],
    ['property', 'og:image:width', CARD_W],
    ['property', 'og:image:height', CARD_H],
    ['property', 'og:image:alt', `${title}: ${card.a.n} vs ${card.b.n}`],
    // Discord shows the big image only with this.
    ['name', 'twitter:card', 'summary_large_image'],
    ['name', 'theme-color', leader(card)],
  ].map(([attr, key, value]) => `<meta ${attr}="${key}" content="${esc(value)}">`).join('\n');
}

// The army data (a Text module, wrangler.jsonc) is parsed once per isolate,
// on the first preview, not for every crest.
/** @type {import('../src/types.js').Army | null} */
let army = null;
async function armyData() {
  // wrangler.jsonc serves army.json as a Text module: a string, where tsc
  // resolves the JSON file itself, so the import goes through unknown.
  army ??= JSON.parse(/** @type {string} */ (/** @type {unknown} */ ((await import('../src/army/army.json')).default)));
  return /** @type {import('../src/types.js').Army} */ (army);
}

// The card for a /?<setup> address, or null for anything that isn't one;
// the engine refusing a setup included: the site's own preview then.
/**
 * @param {string} search
 * @returns {Promise<Card | null>}
 */
async function setupCard(search) {
  try {
    initSync({module: engineWasm});
    return cardFromSetup(search, await armyData(), runEngine);
  } catch (e) {
    console.error('setup card failed', search, e);
    return null;
  }
}

// /s: the app's page, with the card's tags in place of the site's; as built
// when the link has no card.
/**
 * @param {Request} request
 * @param {Env} env
 * @param {URL} url
 */
export async function sharePage(request, env, url) {
  const page = await env.ASSETS.fetch(new Request(new URL('/', url), request));
  const sent = url.searchParams.get(CARD_PARAM);
  const card = sent ? decodeCard(sent) : await setupCard(url.search);
  if (!card) return page;
  const link = sent ? url.href : `${url.origin}/${url.search}`;
  /** @param {HTMLRewriterElement} el */
  const isSiteTag = (el) => /^(og:|twitter:)/.test(el.getAttribute('property') ?? el.getAttribute('name') ?? '')
    || el.getAttribute('name') === 'theme-color';
  return new HTMLRewriter()
    .on('meta', {element(el) { if (isSiteTag(el)) el.remove(); }})
    .on('title', {element(el) { el.setInnerContent(`${previewTitle(card)} · Infinity the Calculator`); }})
    .on('head', {element(el) { el.append(cardTags(card, url, link), {html: true}); }})
    .transform(page);
}

// /og/v1/card.png?card=... and /og/v1/default.png; anything else under /og/
// is not found (not the app's page, which is what the assets would answer).
/**
 * @param {Request} request
 * @param {Env} env
 * @param {ExecutionContext} ctx
 * @param {URL} url
 */
export async function previewImage(request, env, ctx, url) {
  const name = url.pathname.startsWith(IMAGE_PATH) ? url.pathname.slice(IMAGE_PATH.length) : '';
  const card = name === 'card.png' ? decodeCard(url.searchParams.get(CARD_PARAM)) : null;
  if (name !== 'default.png' && !card) return new Response('Not found', {status: 404});
  // Drawing one takes about a second; Cloudflare's cache keeps each for
  // whoever asks next (no-op on workers.dev previews).
  const cache = caches.default;
  const hit = await cache.match(request);
  if (hit) return hit;
  const png = card ? await renderCard(env, card) : await renderDefault();
  const response = new Response(png, {headers: {'content-type': 'image/png', 'cache-control': IMMUTABLE}});
  ctx.waitUntil(cache.put(request, response.clone()));
  return response;
}
