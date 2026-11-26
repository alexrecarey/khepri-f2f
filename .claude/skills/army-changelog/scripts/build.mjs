// @ts-check
// node build.mjs <changelog.json> <army.json (new)> <out dir> [crest cache dir]
// Builds the publishable changelog page from changelog.mjs output:
//   <out>/index.html       the page, with the data embedded
//   <out>/crests/*.svg     one crest per unit entry (from the crest cache, else CB)
//   <out>/logos/*.svg      faction and army logos (from CB)
//   <out>/files.json       the `files` list for the Artifact publish (root = <out>)
// The artifact frame blocks images from other hosts, so every image is
// published beside the page. CB's SVGs are downloaded, so each is checked for
// scripts, event handlers and foreignObject before it is kept.
import {copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

/** @typedef {import('../../../../src/types.js').Army} Army */
/** @typedef {{units: {crest: string | null, factions: number[]}[]}} ChangelogData the part of changelog.mjs's output read here */

const [dataPath, armyPath, out, cacheArg] = process.argv.slice(2);
if (!dataPath || !armyPath || !out) {
  console.error('usage: node build.mjs <changelog.json> <army.json> <out dir> [crest cache]');
  process.exit(2);
}
const HERE = path.dirname(fileURLToPath(import.meta.url));
const TEMPLATE = path.join(HERE, '..', 'assets', 'template.html');
const UNITS = 'https://assets.corvusbelli.net/army/img/logo/units';
const cache = cacheArg ?? '.cache/crests';
const UNSAFE = /<script|foreignObject|\son[a-z]+\s*=|javascript:/i;

/** @type {ChangelogData} */
const data = JSON.parse(readFileSync(dataPath, 'utf8'));
/** @type {Army} */
const army = JSON.parse(readFileSync(armyPath, 'utf8'));
for (const dir of ['crests', 'logos']) mkdirSync(path.join(out, dir), {recursive: true});

/** @type {{path: string}[]} */
const files = [];
/** @type {string[]} */
const problems = [];

/**
 * Puts one SVG in the output (from the cache when it has it, else from url)
 * and lists it for the publish, unless it isn't a plain SVG.
 * @param {string} rel its path under <out>
 * @param {string | null} cached
 * @param {string} url
 */
async function keep(rel, cached, url) {
  const dest = path.join(out, rel);
  if (!existsSync(dest)) {
    if (cached && existsSync(cached)) {
      copyFileSync(cached, dest);
    } else {
      const res = await fetch(url);
      if (!res.ok) {
        problems.push(`${res.status} ${url}`);
        return;
      }
      writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
    }
  }
  const text = readFileSync(dest, 'utf8');
  if (!text.includes('<svg') || UNSAFE.test(text)) {
    problems.push(`not a plain SVG, left out: ${rel}`);
    return;
  }
  files.push({path: rel});
}

const crests = [...new Set(data.units.map((entry) => entry.crest).filter((crest) => crest !== null))];
for (const crest of crests) await keep(`crests/${crest}.svg`, path.join(cache, `${crest}.svg`), `${UNITS}/${crest}.svg`);

// Logos: every top-level faction (the facets) and every army on a card. A
// top-level faction is its own parent; CB files Non-Aligned Armies under 900,
// which is no army, so an army whose parent isn't listed counts as one too
// (the page's factionOf).
const topLevel = Object.values(army.factions).filter((faction) => faction.parent === faction.id || !army.factions[faction.parent]);
const armyIds = new Set([...data.units.flatMap((entry) => entry.factions), ...topLevel.map((faction) => faction.id)]);
const logos = new Set();
for (const id of armyIds) {
  const url = army.factions[id]?.logo;
  if (!url) {
    problems.push(`no logo for army ${id}`);
    continue;
  }
  const slug = /** @type {string} */ (url.split('/').pop()).replace(/\.svg$/, '');
  if (logos.has(slug)) continue;
  logos.add(slug);
  await keep(`logos/${slug}.svg`, null, url);
}

// `<` escaped so the data can't close its <script> tag.
const json = JSON.stringify(data).replace(/</g, '\\u003c');
const html = readFileSync(TEMPLATE, 'utf8').replace('__DATA__', () => json);
new Function(html.split('<script>')[1].split('</script>')[0]); // throws on a syntax error
writeFileSync(path.join(out, 'index.html'), html);
writeFileSync(path.join(out, 'files.json'), JSON.stringify(files));
console.log(`index.html, ${crests.length} crests, ${logos.size} logos, ${files.length} files`);
if (problems.length) console.log('problems:\n  ' + problems.join('\n  '));
