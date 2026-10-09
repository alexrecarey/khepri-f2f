#!/usr/bin/env node
// Prints the largest fireteam each unit can join (src/army/fireteams.js), from
// the raw Army downloads that fetch-army keeps.
//
//   node scripts/fireteam-report.mjs [cacheDir]     (default .cache/army)
import {readFile, readdir} from 'node:fs/promises';
import path from 'node:path';
import {fireteamLimits} from '../src/army/fireteams.js';

const dir = process.argv[2] ?? '.cache/army';
const files = (await readdir(dir)).filter((f) => /^units_en_\d+\.json$/.test(f));
const armies = await Promise.all(files.map(async (f) => JSON.parse(await readFile(path.join(dir, f), 'utf8'))));

const names = {};
for (const army of armies) for (const u of army.units ?? []) names[u.slug] ??= u.isc.trim();

const limits = fireteamLimits(armies.map((a) => a.fireteamChart));
const lines = [];
for (const [slug, {all, fto}] of Object.entries(limits)) {
  const name = names[slug];
  if (!name) continue; // charts also list Team-Ops placeholders and units missing from the download
  if (all) lines.push([name, all]);
  if (fto > all) lines.push([`${name} FTO`, fto]);
  if (!all && !fto) lines.push([name, 'no']);
}
lines.sort((a, b) => a[0].localeCompare(b[0]));
for (const [name, size] of lines) console.log(`${name} (${size})`);
const count = (s) => lines.filter(([, x]) => x === s).length;
console.error(`\n${lines.length} profiles: ${count(5)} × 5, ${count(4)} × 4, ${count(3)} × 3, ${count(2)} × 2, ${count('no')} no`);
