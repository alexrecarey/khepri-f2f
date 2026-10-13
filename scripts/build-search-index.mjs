// army.json -> src/search/index.json, the small file the picker searches.
// Run after fetch-army: yarn build-search-index
import {readFileSync, writeFileSync} from 'node:fs';
import {buildIndex} from '../src/search/buildIndex.js';

const army = JSON.parse(readFileSync(new URL('../src/army/army.json', import.meta.url), 'utf8'));
const index = buildIndex(army);
const out = new URL('../src/search/index.json', import.meta.url);
writeFileSync(out, JSON.stringify(index));
console.log(`${index.rows.length} rows, ${index.units.length} units -> ${(JSON.stringify(index).length / 1024).toFixed(0)} KB`);
