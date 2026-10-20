// The app's copy in each language. English (./en.js) is the source and is
// bundled; other languages load when chosen. Nothing here imports React or
// the state, so the rules can word their notes and ledger lines with it too.
//
// A message is a string with {name} placeholders. A message that depends on
// a count has one key per plural form, `key_one` / `key_other` (as
// Intl.PluralRules names them), and is asked for as `key` with {count}.
// docs/i18n.md has the workflow; src/i18n/glossary.md the game terms.
//
// Rules decide on the English tokens of the army data (weapon names,
// properties, extras); only what they show goes through t().
//
// A translator also carries the army's own display terms for its language
// (names.<lang>.json: stats, extras, weapon modes, unit types; see
// src/army/localize.js), which Corvus Belli translates itself:
// t.term('stats', 'bs') -> 'CD'.
import en from './en.js';
import {lazyOnce} from '../lib/lazyOnce.js';

export const SOURCE_LANGUAGE = 'en';

// A new language is listed here and in src/state/language.js (LANGUAGES).
const LOADERS = {es: lazyOnce(() => import('./es.js').then((m) => m.default))};

const fill = (text, params) => (params
  ? text.replace(/\{(\w+)\}/g, (all, name) => (params[name] === undefined ? all : String(params[name])))
  : text);

export function translator(messages = en, lang = SOURCE_LANGUAGE, terms = null) {
  const plurals = new Intl.PluralRules(lang);
  const pick = (key) => messages[key] ?? en[key];
  const t = (key, params) => {
    let text;
    if (params && typeof params.count === 'number') {
      text = pick(`${key}_${plurals.select(params.count)}`) ?? pick(`${key}_other`);
    }
    text ??= pick(key);
    return text === undefined ? key : fill(text, params);
  };
  t.lang = lang;
  t.has = (key) => pick(key) !== undefined;
  // A display term from the army data, or the English token itself. `scope`
  // narrows a table by a key first (modes are per weapon id).
  t.term = (table, token, scope) => {
    const map = scope === undefined ? terms?.[table] : terms?.[table]?.[scope];
    return map?.[token] ?? token;
  };
  t.withTerms = (next) => translator(messages, lang, next);
  return t;
}

// English, with no army terms: the default wherever no language is passed
// (the rules' tests, the Worker's link previews).
export const tEn = translator();

export async function loadTranslator(lang) {
  const load = LOADERS[lang];
  return load ? translator(await load(), lang) : tEn;
}

// The messages of a language, for the locale tests.
export const loadMessages = (lang) => (lang === SOURCE_LANGUAGE ? Promise.resolve(en) : LOADERS[lang]());
