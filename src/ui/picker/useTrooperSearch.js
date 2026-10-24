// Loads the search index (src/search/index.json, built from army.json) the
// first time it is needed: the Matchup screen asks for it on mount, so it is
// ready by the time the picker opens. Recent picks are in the state document
// (lists.recents).
import {lazyOnce} from '../../lib/lazyOnce.js';
import {createSearch} from '../../search/search.js';
import {useLazy} from '../../data/useLazy.js';

// One index per language: unit, weapon and skill names are searched in the
// app's language (src/state/language.js).
// tsc reads the JSON files' own shape (plain arrays where the index holds
// [word, field] pairs), which overlaps the typedef in neither direction, so
// the import goes through unknown: the typedef says what they hold.
/** @type {Record<string, () => Promise<{default: import('../../types.js').SearchIndex}>>} */
const INDEXES = {
  en: () => /** @type {Promise<{default: import('../../types.js').SearchIndex}>} */ (/** @type {Promise<unknown>} */ (import('../../search/index.json'))),
  es: () => /** @type {Promise<{default: import('../../types.js').SearchIndex}>} */ (/** @type {Promise<unknown>} */ (import('../../search/index.es.json'))),
};
const searchers = Object.fromEntries(Object.entries(INDEXES).map(([lang, load]) =>
  [lang, lazyOnce(() => load().then((m) => createSearch(m.default)))]));
/** @param {string} lang */
const loadSearcher = (lang) => (searchers[lang] ?? searchers.en)();

// {searcher, error, retry}: searcher is null until loaded; after a failure,
// error is set and retry() loads it again.
/**
 * @param {boolean} enabled
 * @param {string} lang
 */
export function useSearcher(enabled, lang) {
  const {value: searcher, error, retry} = useLazy(loadSearcher, lang, enabled);
  return {searcher, error, retry};
}
