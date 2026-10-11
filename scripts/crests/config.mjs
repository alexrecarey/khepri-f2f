// Where the unit crests live, shared by the sync script and the Worker
// config (wrangler.jsonc binds the same bucket as CRESTS).
export const CREST_BUCKET = 'khepri-crests';
// Same name when CB updates a crest, so browsers recheck after a week.
export const CREST_CACHE_CONTROL = 'public, max-age=604800, stale-while-revalidate=86400';
// wrangler isn't a dependency (its runtime is ~100 MB in the zero-install
// cache); scripts and CI run this pinned version through npx.
export const WRANGLER = 'wrangler@4.149.0';
