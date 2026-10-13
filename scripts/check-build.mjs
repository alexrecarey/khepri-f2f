// After `yarn build`: every file the PWA precaches must be under Workbox's
// per-file limit. Workbox only warns and leaves a bigger file out, which
// silently breaks offline use (the army data chunk is the one at risk).
import {readdirSync, statSync} from 'node:fs';
import {PRECACHE_MAX_BYTES} from './precache.mjs';

const dir = new URL('../dist/assets/', import.meta.url);
const mb = (n) => `${(n / 1024 / 1024).toFixed(2)} MB`;
let failed = false;
for (const name of readdirSync(dir)) {
  if (!/\.(js|css)$/.test(name)) continue;
  const size = statSync(new URL(name, dir)).size;
  if (size > PRECACHE_MAX_BYTES) {
    console.error(`${name}: ${mb(size)} is over the ${mb(PRECACHE_MAX_BYTES)} precache limit (vite.config.js)`);
    failed = true;
  } else if (size > PRECACHE_MAX_BYTES * 0.8) {
    console.warn(`${name}: ${mb(size)}, close to the ${mb(PRECACHE_MAX_BYTES)} precache limit`);
  }
}
process.exit(failed ? 1 : 0);
