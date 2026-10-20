// army.json -> the small files the picker searches: src/search/index.json in
// English, index.<lang>.json for each names file (src/army/names.<lang>.json).
// Run after fetch-army: yarn build-search-index
import {readFileSync, readdirSync, writeFileSync} from 'node:fs';
import {buildIndex} from '../src/search/buildIndex.js';
import {splitNames, withNames} from '../src/army/localize.js';

const army = JSON.parse(readFileSync(new URL('../src/army/army.json', import.meta.url), 'utf8'));
const {core} = splitNames(army);
const armyDir = new URL('../src/army/', import.meta.url);
const languages = readdirSync(armyDir).map((f) => /^names\.([a-z]+)\.json$/.exec(f)?.[1]).filter(Boolean);
const builds = [['index.json', army],
  ...languages.map((lang) => [`index.${lang}.json`, withNames(core, JSON.parse(readFileSync(new URL(`names.${lang}.json`, armyDir), 'utf8')))])];
for (const [file, data] of builds) {
  const index = buildIndex(data);
  writeFileSync(new URL(`../src/search/${file}`, import.meta.url), JSON.stringify(index));
  console.log(`${file}: ${index.rows.length} rows, ${index.units.length} units -> ${(JSON.stringify(index).length / 1024).toFixed(0)} KB`);
}
