#!/usr/bin/env node
// Keeps the R2 bucket of unit crests in step with army.json. Each crest is
// Corvus Belli's SVG, made smaller where CB's file is wasteful (optimize.mjs)
// and checked to look the same (verify.mjs), stored under CB's own file name:
// <slug>.svg. The app's Worker serves them at /crests/<slug>.svg.
//
//   yarn crests                    upload crests army.json names that R2
//                                  doesn't have yet (usually: nothing)
//   yarn crests --check-changes    also ask CB (headers only) whether any
//                                  crest changed since it was uploaded, and
//                                  redo those (the weekly crests workflow)
//   yarn crests --force            redo every crest
//   yarn crests --force a-1-1 b-2-1   redo just these
//   --dry-run                      say what would be done, change nothing
//
// What R2 holds is recorded in manifest.json in the same bucket: per slug,
// CB's ETag and Last-Modified when it was fetched, the sizes, how it was
// optimized and how different it looked (0 = identical). A run reads that one
// file, so a run with nothing to do makes one request.
//
// Auth: wrangler's (`wrangler login` locally; CLOUDFLARE_API_TOKEN and
// CLOUDFLARE_ACCOUNT_ID in CI, a token with R2 edit).

import {execFile} from 'node:child_process';
import {mkdir, readFile, writeFile} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {promisify} from 'node:util';
import {fileURLToPath} from 'node:url';
import {crestSlugs} from '../../src/army/crests.js';
import {CREST_BUCKET, CREST_CACHE_CONTROL, WRANGLER} from './config.mjs';
import {crestCandidates} from './optimize.mjs';
import {MAX_DIFF, crestDiff} from './verify.mjs';

const SOURCE = 'https://assets.corvusbelli.net/army/img/logo/units';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const CACHE = path.join(ROOT, '.cache', 'crests');
const MANIFEST = 'manifest.json';

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const checkChanges = args.includes('--check-changes');
const force = args.includes('--force');
const named = args.filter((a) => !a.startsWith('--'));

const run = promisify(execFile);
const wrangler = (...a) => run('npx', ['--yes', WRANGLER, ...a], {cwd: ROOT, maxBuffer: 64 * 1024 * 1024});

// n at a time.
async function pool(items, n, fn) {
  const queue = [...items];
  await Promise.all(Array.from({length: n}, async () => {
    while (queue.length) await fn(queue.shift());
  }));
}

async function readManifest() {
  try {
    const {stdout} = await wrangler('r2', 'object', 'get', `${CREST_BUCKET}/${MANIFEST}`, '--remote', '--pipe');
    return JSON.parse(stdout);
  } catch (e) {
    if (/does not exist|NoSuchKey|10007/.test(String(e.stderr ?? e.message))) return {version: 1, crests: {}};
    throw e;
  }
}

async function put(key, file, contentType) {
  await wrangler('r2', 'object', 'put', `${CREST_BUCKET}/${key}`, '--file', file, '--remote',
    '--content-type', contentType, '--cache-control', CREST_CACHE_CONTROL);
}

// CB's validators for a crest, from a HEAD request.
async function sourceHead(slug) {
  const res = await fetch(`${SOURCE}/${slug}.svg`, {method: 'HEAD'});
  if (!res.ok) throw new Error(`HEAD ${res.status}`);
  return {etag: res.headers.get('etag'), lastModified: res.headers.get('last-modified')};
}

// Fetch, optimize, check, upload one crest; returns its manifest entry.
async function processCrest(slug, tmp) {
  const res = await fetch(`${SOURCE}/${slug}.svg`);
  const source = res.ok ? await res.text() : '';
  if (!res.ok || !source.includes('<svg')) throw new Error(`GET ${res.status}`);
  await writeFile(path.join(CACHE, `${slug}.svg`), source);
  // The first candidate that still looks like the source (the last one is
  // the source itself, so there always is one).
  let pick = null;
  for (const c of await crestCandidates(source)) {
    const diff = c.how === 'original' ? 0 : crestDiff(source, c.svg);
    if (diff <= MAX_DIFF) { pick = {...c, diff}; break; }
  }
  const file = path.join(tmp, `${slug}.svg`);
  await writeFile(file, pick.svg);
  if (!dryRun) await put(`${slug}.svg`, file, 'image/svg+xml');
  return {
    etag: res.headers.get('etag'),
    lastModified: res.headers.get('last-modified'),
    sourceBytes: Buffer.byteLength(source),
    bytes: Buffer.byteLength(pick.svg),
    how: pick.how,
    diff: Math.round(pick.diff * 10000) / 10000,
    ...(pick.notes.length ? {notes: pick.notes} : {}),
  };
}

async function main() {
  const army = JSON.parse(await readFile(path.join(ROOT, 'src', 'army', 'army.json'), 'utf8'));
  const wanted = [...crestSlugs(army)].sort();
  const manifest = await readManifest();
  const have = manifest.crests;

  const todo = new Map();   // slug -> why
  const unknown = named.filter((s) => !wanted.includes(s));
  if (unknown.length) throw new Error(`not crests army.json names: ${unknown.join(', ')}`);
  if (named.length && !force) throw new Error('slugs only mean something with --force (yarn crests --force a-1-1 b-2-1)');
  if (force) for (const s of named.length ? named : wanted) todo.set(s, 'forced');
  for (const s of wanted) if (!have[s] && !todo.has(s)) todo.set(s, 'missing');
  if (checkChanges) {
    await pool(wanted.filter((s) => have[s] && !todo.has(s)), 16, async (s) => {
      const head = await sourceHead(s).catch(() => null);
      if (head && (head.etag !== have[s].etag)) todo.set(s, `changed (${have[s].etag} -> ${head.etag})`);
    });
  }
  const stale = Object.keys(have).filter((s) => !wanted.includes(s));
  console.log(`Crests: ${wanted.length} named, ${Object.keys(have).length} in R2, ${todo.size} to do` +
    (stale.length ? `, ${stale.length} in R2 no longer named (kept)` : ''));
  if (todo.size === 0) return;

  await mkdir(CACHE, {recursive: true});
  const tmp = path.join(os.tmpdir(), `crests-${process.pid}`);
  await mkdir(tmp, {recursive: true});
  const failed = [];
  let done = 0;
  await pool([...todo.keys()], 6, async (slug) => {
    try {
      have[slug] = await processCrest(slug, tmp);
      const e = have[slug];
      if (e.how !== 'svgo 2 decimals' || e.sourceBytes > 100_000 || todo.get(slug) !== 'missing') {
        console.log(`  ${slug}: ${todo.get(slug)}; ${Math.round(e.sourceBytes / 1000)} -> ${Math.round(e.bytes / 1000)} KB, ${e.how}, diff ${e.diff}`);
      }
    } catch (e) {
      failed.push(`${slug} (${e.message})`);
    }
    if (++done % 100 === 0) console.log(`  ${done}/${todo.size}`);
  });
  if (!dryRun) {
    const file = path.join(tmp, MANIFEST);
    await writeFile(file, JSON.stringify({version: 1, updatedAt: new Date().toISOString(), crests: have}, null, 1));
    await put(MANIFEST, file, 'application/json');
  }
  const total = (k) => Object.values(have).reduce((n, e) => n + (e[k] ?? 0), 0);
  console.log(`${dryRun ? 'Would upload' : 'Uploaded'} ${todo.size - failed.length}; all crests ${Math.round(total('sourceBytes') / 1e5) / 10} MB from CB -> ${Math.round(total('bytes') / 1e5) / 10} MB in R2`);
  if (failed.length) {
    // The app shows the faction crest for a missing one, so this isn't fatal
    // for the app; it is for the run, so CI notices.
    console.error(`Failed: ${failed.join(', ')}`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err.stderr ? String(err.stderr) : err);
  process.exit(1);
});
