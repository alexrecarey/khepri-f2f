// The app's Cloudflare Worker. Static files (the Vite build in dist/) are
// served by Workers static assets before this code runs, with index.html
// for any other path (single-page app). This only handles what the assets
// can't: the unit crests, which live in R2 (scripts/crests/sync.mjs) under
// Corvus Belli's file names and are served at /crests/<slug>.svg.

const SLUG = /^\/crests\/([a-z0-9-]+)\.svg$/;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const m = SLUG.exec(url.pathname);
    if (!m || (request.method !== 'GET' && request.method !== 'HEAD')) return env.ASSETS.fetch(request);
    const object = await env.CRESTS.get(`${m[1]}.svg`, {onlyIf: request.headers});
    if (!object) return new Response('Not found', {status: 404});
    const headers = new Headers();
    object.writeHttpMetadata(headers);   // content-type, cache-control from the upload
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
