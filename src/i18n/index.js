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
/** @type {Record<string, () => Promise<Record<string, string>>>} */
const LOADERS = {es: lazyOnce(() => import('./es.js').then((m) => m.default))};

/**
 * @param {string} text
 * @param {Record<string, unknown>} [params]
 */
const fill = (text, params) => (params
  ? text.replace(/\{(\w+)\}/g, (all, name) => (params[name] === undefined ? all : String(params[name])))
  : text);

/**
 * @param {Record<string, string>} [messages] the language's copy (./en.js, ./es.js)
 * @param {string} [lang]
 * @param {import('../types.js').Terms | null} [terms] the army's display terms in that language
 * @returns {import('../types.js').Translator}
 */
export function translator(messages = en, lang = SOURCE_LANGUAGE, terms = null) {
  const plurals = new Intl.PluralRules(lang);
  /** @param {string} key */
  const pick = (key) => messages[key] ?? en[key];
  /**
   * @param {string} key
   * @param {Record<string, unknown>} [params]
   */
  const t = (key, params) => {
    let text;
    if (params && typeof params.count === 'number') {
      text = pick(`${key}_${plurals.select(params.count)}`) ?? pick(`${key}_other`);
    }
    text ??= pick(key);
    return text === undefined ? key : fill(text, params);
  };
  t.lang = lang;
  /** @param {string} key */
  t.has = (key) => pick(key) !== undefined;
  // A display term from the army data, or the English token itself. `scope`
  // narrows a table by a key first (modes are per weapon id).
  /**
   * @param {string} table
   * @param {string} token
   * @param {string | number} [scope]
   */
  t.term = (table, token, scope) => {
    // A scoped table (modes) holds tables; a plain one, text.
    const map = /** @type {Record<string, string> | undefined} */ (scope === undefined ? terms?.[table] : terms?.[table]?.[scope]);
    return map?.[token] ?? token;
  };
  /** @param {import('../types.js').Terms | null} next */
  t.withTerms = (next) => translator(messages, lang, next);
  // Distances. State and URLs hold centimetres; each language shows its own
  // unit (dist.cmPerUnit): English inches, 2.5 cm each as Infinity plays
  // them, Spanish centimetres. t.distance: the number, in that unit.
  const cmPer = Number(pick('dist.cmPerUnit'));
  /** @param {number} cm */
  t.distance = (cm) => Math.round((10 * cm) / cmPer) / 10;
  // Text the Army data writes in inches ('+2"', 'MOV 6-4"'), in t's unit.
  /** @param {string} text */
  t.inchText = (text) => (cmPer === 2.5 ? text : String(text).replace(/(\d+(?:\.\d+)?)(?:-(\d+(?:\.\d+)?))?"/g,
    (all, /** @type {string} */ a, /** @type {string | undefined} */ b) => t('dist.value', {n: [a, b].filter(Boolean).map((x) => t.distance(Number(x) * 2.5)).join('-')})));
  return t;
}

// English, with no army terms: the default wherever no language is passed
// (the rules' tests, the Worker's link previews).
export const tEn = translator();

/** @param {string} lang */
export async function loadTranslator(lang) {
  const load = LOADERS[lang];
  return load ? translator(await load(), lang) : tEn;
}

// The messages of a language, for the locale tests.
/** @param {string} lang */
export const loadMessages = (lang) => (lang === SOURCE_LANGUAGE ? Promise.resolve(en) : LOADERS[lang]());
