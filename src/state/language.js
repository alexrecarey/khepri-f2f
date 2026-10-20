// The app's language: the one picked in Settings, else the first of the
// browser's languages the app has, else English. It decides which names
// file the army data and the search index load (src/army/localize.js).
import {useAppState} from './store.js';

export const LANGUAGES = {en: 'English', es: 'Español'};
export const AUTO = 'auto';

export function resolveLanguage(choice, browserLanguages = []) {
  if (choice in LANGUAGES) return choice;
  for (const tag of browserLanguages) {
    const base = String(tag ?? '').toLowerCase().split('-')[0];
    if (base in LANGUAGES) return base;
  }
  return 'en';
}

export const browserLanguages = () =>
  (typeof navigator === 'undefined' ? [] : navigator.languages ?? [navigator.language]);

// What Settings shows: 'auto' unless a language was picked.
export const languageChoice = (prefs) => (prefs?.language in LANGUAGES ? prefs.language : AUTO);

export const useLanguage = () => useAppState((s) => resolveLanguage(s.prefs.language, browserLanguages()));
