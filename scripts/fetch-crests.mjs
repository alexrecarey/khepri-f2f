#!/usr/bin/env node
// Self-hosts every unit crest army.json names (unit.crest, profile.crest) as
// public/crests/<slug>.webp, so they work offline and don't depend on Corvus
// Belli's asset server at run time. Run after fetch-army (yarn fetch-army
// does both).
//
//   1. download  the SVG from assets.corvusbelli.net into .cache/crests
//                (not committed)
//   2. convert   to a 128 px WebP with ImageMagick (`magick` on the PATH).
//                The SVGs are 21 MB together (a few are over 1 MB); the WebPs
//                about 5 MB, and the app never shows a crest above 64 px.
//
// Crests already converted are kept unless --refresh is passed.

import {execFile} from 'node:child_process';
import {access, mkdir, readFile, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {promisify} from 'node:util';
import {fileURLToPath} from 'node:url';
import {crestSlugs} from '../src/army/crests.js';

const BASE = 'https://assets.corvusbelli.net/army/img/logo/units';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CACHE = path.join(ROOT, '.cache', 'crests');
const OUT = path.join(ROOT, 'public', 'crests');
const SIZE = 128;
const refresh = process.argv.includes('--refresh');

const run = promisify(execFile);
const exists = (f) => access(f).then(() => true, () => false);

async function svgFor(slug) {
  const file = path.join(CACHE, `${slug}.svg`);
  if (!refresh && await exists(file)) return file;
  const res = await fetch(`${BASE}/${slug}.svg`);
  const body = res.ok ? await res.text() : '';
  if (!res.ok || !body.includes('<svg')) throw new Error(`HTTP ${res.status}`);
  await writeFile(file, body);
  return file;
}

async function crest(slug) {
  const svg = await svgFor(slug);
  await run('magick', ['-background', 'none', '-density', '300', svg,
    '-resize', `${SIZE}x${SIZE}`, '-quality', '82', path.join(OUT, `${slug}.webp`)]);
}

async function main() {
  await run('magick', ['-version']).catch(() => {
    throw new Error('fetch-crests needs ImageMagick (`magick`) on the PATH, e.g. brew install imagemagick');
  });
  const army = JSON.parse(await readFile(path.join(ROOT, 'src', 'army', 'army.json'), 'utf8'));
  const slugs = [...crestSlugs(army)].sort();
  await mkdir(CACHE, {recursive: true});
  await mkdir(OUT, {recursive: true});
  const todo = [];
  for (const slug of slugs) if (refresh || !(await exists(path.join(OUT, `${slug}.webp`)))) todo.push(slug);
  const failed = [];
  // A few at a time: polite to the server, still quick for ~900 files.
  for (let i = 0; i < todo.length; i += 8) {
    await Promise.all(todo.slice(i, i + 8).map((slug) => crest(slug).catch((e) => failed.push(`${slug} (${e.message})`))));
  }
  console.log(`Crests: ${slugs.length} named, ${todo.length - failed.length} converted`);
  // The app shows the faction crest instead, so a missing one isn't fatal.
  if (failed.length > 0) console.warn(`Not converted: ${failed.join(', ')}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
