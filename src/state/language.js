// The app's language: the one picked in Settings, else the first of the
// browser's languages the app has, else English. It decides which names
// file the army data and the search index load (src/army/localize.js),
// and the app's copy (src/i18n).
import {useAppState} from './store.js';

// A new language is listed here and in scripts/fetch-army.mjs (LANGUAGES),
// src/data/army.js (NAMES), src/ui/picker/useTrooperSearch.js (INDEXES) and
// src/i18n/index.js (LOADERS, its copy): dynamic imports need their file
// names written out.
/** @type {Record<string, string>} */
export const LANGUAGES = {en: 'English', es: 'Español'};
export const AUTO = 'auto';

/**
 * @param {string | null | undefined} choice
 * @param {readonly string[]} [browserLanguages]
 */
export function resolveLanguage(choice, browserLanguages = []) {
  // `in` on a null choice is false, like a missing key.
  if (/** @type {string} */ (choice) in LANGUAGES) return /** @type {string} */ (choice);
  for (const tag of browserLanguages) {
    const base = String(tag ?? '').toLowerCase().split('-')[0];
    if (base in LANGUAGES) return base;
  }
  return 'en';
}

export const browserLanguages = () =>
  (typeof navigator === 'undefined' ? [] : navigator.languages ?? [navigator.language]);

// What Settings shows: 'auto' unless a language was picked.
/** @param {import('../types.js').Prefs | null | undefined} prefs */
export const languageChoice = (prefs) => (/** @type {string} */ (prefs?.language) in LANGUAGES ? /** @type {string} */ (/** @type {import('../types.js').Prefs} */ (prefs).language) : AUTO);

export const useLanguage = () => useAppState((s) => resolveLanguage(s.prefs.language, browserLanguages()));
