// The app's Cloudflare Worker. Static files (the Vite build in dist/) are
// served by Workers static assets before this code runs, with index.html
// for any other path (single-page app). This only handles what the assets
// can't: link previews for shared matchups (preview.js: the share page /s
// and the card images under /og/), and the unit
// crests, which live in R2 (scripts/crests/sync.mjs) under Corvus Belli's
// file names and are served at /crests/<slug>. R2 holds each one as
// <slug>.svg or, for the few heavy ones, <slug>.webp (never both); the
// content type tells the browser which it got, so the app doesn't care.

import {CREST_CACHE_CONTROL} from '../scripts/crests/config.mjs';
import {CREST_SLUG} from '../src/army/crests.js';
import {SHARE_PATH} from '../src/share/card.js';
import {previewImage, sharePage} from './preview.js';

// /crests/<slug> (src/army/crests.js CREST_SLUG).
const CREST_PATH = '/crests/';

export default {
  /**
   * @param {Request} request
   * @param {Env} env
   * @param {ExecutionContext} ctx
   */
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (request.method === 'GET' || request.method === 'HEAD') {
      if (url.pathname === SHARE_PATH || url.pathname === `${SHARE_PATH}/`) return sharePage(request, env, url);
      if (url.pathname.startsWith('/og/')) return previewImage(request, env, ctx, url);
    }
    const slug = url.pathname.startsWith(CREST_PATH) ? url.pathname.slice(CREST_PATH.length) : null;
    if (slug === null || !CREST_SLUG.test(slug) || (request.method !== 'GET' && request.method !== 'HEAD')) return env.ASSETS.fetch(request);
    // SVG first: nearly every crest is one, so most requests are one lookup.
    const object = await env.CRESTS.get(`${slug}.svg`, {onlyIf: request.headers})
      ?? await env.CRESTS.get(`${slug}.webp`, {onlyIf: request.headers});
    if (!object) return new Response('Not found', {status: 404});
    const headers = new Headers();
    object.writeHttpMetadata(headers);   // content-type from the upload
    // The policy lives in config.mjs, not in each object's upload metadata,
    // so crests uploaded under an older policy follow the current one.
    headers.set('cache-control', CREST_CACHE_CONTROL);
    headers.set('etag', object.httpEtag);
    // Third-party SVGs on our origin: never let one run script, even if a
    // future CB update (or an opened-in-a-tab crest) carries some.
    headers.set('content-security-policy', "default-src 'none'; img-src data:; style-src 'unsafe-inline'; sandbox");
    headers.set('x-content-type-options', 'nosniff');
    // onlyIf matched If-None-Match: the browser's copy is current.
    if (!('body' in object)) return new Response(null, {status: 304, headers});
    return new Response(request.method === 'HEAD' ? null : object.body, {headers});
  },
};
