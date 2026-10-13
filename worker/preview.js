// Link previews (Discord, WhatsApp...). index.html carries the site's own
// tags, so any link unfurls; a link from the Share button carries its share
// card (?card=, src/share/card.js), and for those the page's tags are swapped
// for the card's: its words (canvas ShareText, T1) and its image.
import {CARD_PARAM, decodeCard, previewDescription, previewTitle} from '../src/share/card.js';
import {CARD_H, CARD_W, renderCard, renderDefault} from './card.js';

// Bump when the image changes: the apps cache previews by image URL.
const IMAGE_PATH = '/og/v1/';
// Discord's embed stripe: the side that does better.
const ACTIVE = '#5fc4a0', REACTIVE = '#e59bc0';
// The numbers in an image URL never change, so caches may keep it for good.
const IMMUTABLE = 'public, max-age=31536000, immutable';

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Which side the stripe goes to: the bigger headline number (ties go active).
const leader = (card) => (parseFloat(card.b.n) > parseFloat(card.a.n) ? REACTIVE : ACTIVE);

function cardTags(card, url) {
  const image = `${url.origin}${IMAGE_PATH}card.png?${CARD_PARAM}=${encodeURIComponent(url.searchParams.get(CARD_PARAM))}`;
  const title = previewTitle(card);
  return [
    ['property', 'og:site_name', 'Infinity the Calculator'],
    ['property', 'og:type', 'website'],
    ['property', 'og:url', url.href],
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

// The page with the card's tags in place of the site's, or null when the
// link has no (valid) card and the page goes out as built.
export async function pageWithCard(request, env, url) {
  const card = decodeCard(url.searchParams.get(CARD_PARAM));
  if (!card) return null;
  const page = await env.ASSETS.fetch(request);
  const isSiteTag = (el) => /^(og:|twitter:)/.test(el.getAttribute('property') ?? el.getAttribute('name') ?? '')
    || el.getAttribute('name') === 'theme-color';
  return new HTMLRewriter()
    .on('meta', {element(el) { if (isSiteTag(el)) el.remove(); }})
    .on('title', {element(el) { el.setInnerContent(`${previewTitle(card)} · Infinity the Calculator`); }})
    .on('head', {element(el) { el.append(cardTags(card, url), {html: true}); }})
    .transform(page);
}

// /og/v1/card.png?card=... and /og/v1/default.png, or null for anything else.
export async function previewImage(request, env, ctx, url) {
  if (!url.pathname.startsWith(IMAGE_PATH)) return null;
  const name = url.pathname.slice(IMAGE_PATH.length);
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
