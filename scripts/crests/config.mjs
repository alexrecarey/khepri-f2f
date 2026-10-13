// Where the unit crests live, shared by the sync script and the Worker
// config (wrangler.jsonc binds the same bucket as CRESTS).
export const CREST_BUCKET = 'khepri-crests';
// Crests almost never change, and when CB updates one it keeps its name: a
// month fresh, then up to another month served from cache while the browser
// rechecks in the background (a 304 via the ETag unless it really changed).
// The Worker sends this on every crest, so changing it here needs no re-upload.
export const CREST_CACHE_CONTROL = 'public, max-age=2592000, stale-while-revalidate=2592000';
// A crest whose optimized SVG is still bigger than this is served as a WebP
// instead (raster.mjs): the few CB crests that carry big embedded images or
// very long paths. R2 holds one file per crest, <slug>.svg or <slug>.webp,
// and the Worker serves whichever exists at /crests/<slug>.
export const WEBP_OVER_BYTES = 60_000;
// wrangler isn't a dependency (its runtime is ~100 MB in the zero-install
// cache); scripts and CI run this pinned version through npx.
export const WRANGLER = 'wrangler@4.149.0';
