// The search scoreboard: how often typo'd unit names still find the right
// unit. Run after any change to the matcher, aliases or thresholds:
//   yarn search-eval            summary
//   yarn search-eval --misses   plus every query that missed the top 5
import {readFileSync} from 'node:fs';
import {buildIndex} from '../src/search/buildIndex.js';
import {createSearch} from '../src/search/search.js';
import {buildCorpus} from '../src/search/eval/corpus.js';
import {score} from '../src/search/eval/score.js';

const army = JSON.parse(readFileSync(new URL('../src/army/army.json', import.meta.url), 'utf8'));
const hard = JSON.parse(readFileSync(new URL('../src/search/eval/hard-cases.json', import.meta.url), 'utf8'));
const index = buildIndex(army);
const searcher = createSearch(index);

const pct = (a, n) => `${((100 * a) / n).toFixed(1)}%`.padStart(6);
function report(title, result) {
  console.log(`\n${title}`);
  console.log('kind          n   top1    top5   found  avg units');
  for (const [kind, k] of Object.entries(result.byKind)) {
    console.log(`${kind.padEnd(10)} ${String(k.n).padStart(4)} ${pct(k.top1, k.n)} ${pct(k.top5, k.n)} ${pct(k.found, k.n)}   ${(k.results / k.n).toFixed(1)}`);
  }
  const a = result.all;
  console.log(`${'ALL'.padEnd(10)} ${String(a.n).padStart(4)} ${pct(a.top1, a.n)} ${pct(a.top5, a.n)} ${pct(a.found, a.n)}   ${(a.results / a.n).toFixed(1)}`);
  console.log(`time per query: p50 ${result.ms.p50.toFixed(2)} ms, p95 ${result.ms.p95.toFixed(2)} ms, max ${result.ms.max.toFixed(2)} ms`);
}

// Warm up the JIT so the timings measure steady-state typing, not the first call.
for (const q of ['a', 'fus', 'hmg', 'zhanshi']) searcher.search({query: q});

const corpus = buildCorpus(index.units);
const typo = score(searcher, corpus);
report(`Generated typos (${corpus.length} queries over ${index.units.length} units)`, typo);
const hardResult = score(searcher, hard.map((h) => ({...h, kind: 'hard'})));
report('Hand-written hard cases', hardResult);

const showMisses = process.argv.includes('--misses');
const misses = [...hardResult.misses, ...typo.misses];
console.log(`\n${misses.length} misses outside the top 5${showMisses ? ':' : ' (--misses to list)'}`);
if (showMisses) for (const m of misses) console.log(`  [${m.kind}] "${m.query}" -> want "${m.expect}", got ${JSON.stringify(m.got)}`);
