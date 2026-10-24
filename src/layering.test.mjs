// The layering rule from AGENTS.md, checked: dependencies point one way,
// `ui -> state -> rules -> army`. Reads every module under src/ and worker/,
// takes its import specifiers and fails on an import that points up a layer.
// A layer is a top-level directory under src/ (ui, state, rules, army, ...).
// Tests, the WASM glue and the app's entry files (src/App.jsx, main.jsx) are
// not checked; the entry files wire everything together by design.
import assert from 'node:assert/strict';
import {readdirSync, readFileSync, statSync} from 'node:fs';
import {dirname, join, relative, resolve, sep} from 'node:path';
import {test} from 'node:test';
import {fileURLToPath} from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

// What each layer may not import. Anything not listed (worker/, src root)
// may import what it needs, except ui/: only ui/ and the entry files draw.
const BOTTOM = ['rules', 'army', 'search', 'engine', 'results', 'lib', 'i18n'];
/** @type {Record<string, string[]>} */
const FORBIDDEN = {
  worker: ['ui'],
  // state/ reads the army through army/, never the search index's builder.
  state: ['ui', 'search'],
  ...Object.fromEntries(BOTTOM.map((layer) => [layer, ['ui', 'state']])),
  share: ['ui'],
  matchup: ['ui'],
  data: ['ui'],
};
FORBIDDEN.engine = [...FORBIDDEN.engine, 'rules'];

const SKIP_DIRS = new Set([join('src', 'engine', 'wasm'), 'node_modules']);
const isModule = (f) => /\.(js|jsx|mjs)$/.test(f) && !/\.test\.mjs$/.test(f);

function* modules(dir) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (SKIP_DIRS.has(relative(ROOT, path))) continue;
    if (statSync(path).isDirectory()) yield* modules(path);
    else if (isModule(name)) yield path;
  }
}

// Static `import x from '…'` / `export … from '…'` and dynamic `import('…')`
// specifiers. Lines that are comments are skipped, so prose about imports
// does not count.
const STATIC = /^\s*(?:import|export)\b[^'"]*?\bfrom\s*['"]([^'"]+)['"]/;
const SIDE_EFFECT = /^\s*import\s*['"]([^'"]+)['"]/;
const DYNAMIC = /\bimport\(\s*['"]([^'"]+)['"]\s*\)/g;
export function specifiers(source) {
  const out = [];
  for (const line of source.split('\n')) {
    if (/^\s*(\/\/|\*|\/\*)/.test(line)) continue;
    const m = STATIC.exec(line) ?? SIDE_EFFECT.exec(line);
    if (m) out.push(m[1]);
    for (const d of line.matchAll(DYNAMIC)) out.push(d[1]);
  }
  return out;
}

// 'src/ui/x.js' -> 'ui'; 'worker/x.js' -> 'worker'; 'src/App.jsx' -> 'app'.
function layerOf(path) {
  const parts = relative(ROOT, path).split(sep);
  if (parts[0] === 'worker') return 'worker';
  if (parts[0] === 'src') return parts.length > 2 ? parts[1] : 'app';
  return null;
}

test('layering: dependencies point one way (ui -> state -> rules -> army)', () => {
  const violations = [];
  for (const dir of ['src', 'worker']) {
    for (const file of modules(join(ROOT, dir))) {
      // Every module under src/ and worker/ is in a layer.
      const from = /** @type {string} */ (layerOf(file));
      const forbidden = FORBIDDEN[from] ?? (from === 'app' ? [] : ['ui']);
      for (const spec of specifiers(readFileSync(file, 'utf8'))) {
        if (!spec.startsWith('.')) continue;
        const to = layerOf(resolve(dirname(file), spec));
        if (to && to !== from && forbidden.includes(to)) {
          violations.push(`${relative(ROOT, file)} imports '${spec}' (${from} -> ${to})`);
        }
      }
    }
  }
  assert.deepEqual(violations, [], `imports that point up a layer:\n  ${violations.join('\n  ')}`);
});

// The rules word what they say as message descriptors (i18n/message.js) and
// never translate: only ledger.js, the renderer, reads the translator, so a
// language change re-renders without re-deriving (state/useMatchupView.js).
test('layering: rules/ (but the ledger) never import the translator', () => {
  const offenders = [];
  for (const file of modules(join(ROOT, 'src', 'rules'))) {
    if (relative(ROOT, file) === join('src', 'rules', 'ledger.js')) continue;
    for (const spec of specifiers(readFileSync(file, 'utf8'))) {
      if (/\/i18n\/(index|en|es)\.js$/.test(spec)) offenders.push(`${relative(ROOT, file)} imports '${spec}'`);
    }
  }
  assert.deepEqual(offenders, []);
});

// The army data's helpers word what they say the same way (weaponLabel,
// ammoMsg): army/ reaches i18n/ only for the descriptors, never the
// translator.
test('layering: army/ imports only i18n/message.js from i18n/', () => {
  const offenders = [];
  for (const file of modules(join(ROOT, 'src', 'army'))) {
    for (const spec of specifiers(readFileSync(file, 'utf8'))) {
      if (/\/i18n\//.test(spec) && !/\/i18n\/message\.js$/.test(spec)) offenders.push(`${relative(ROOT, file)} imports '${spec}'`);
    }
  }
  assert.deepEqual(offenders, []);
});

test('layering: specifiers() reads static, re-export and dynamic imports, not comments', () => {
  const src = [
    "import a from './a.js';",
    "import {b, c as d} from '../b/c.js';",
    "export {e} from './e.js';",
    "import './side.css';",
    "// import x from './comment.js';",
    " * import y from './doc.js';",
    "const f = () => import('./f.js');",
  ].join('\n');
  assert.deepEqual(specifiers(src), ['./a.js', '../b/c.js', './e.js', './side.css', './f.js']);
});
