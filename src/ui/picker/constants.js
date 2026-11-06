// A unit type's name: src/i18n's typeName.<type>.
/**
 * @param {import('../../types.js').Translator} t
 * @param {string | null | undefined} type
 */
export const typeName = (t, type) => (type && t.has(`typeName.${type}`) ? t(`typeName.${type}`) : type ?? '');

// The search box's placeholder teaches the shorthand: one hint per opening,
// picked at random, from what players look for on that side (burst for the
// active trooper, ARO picks for the reactive one). [query, what it stands
// for]; with no second part the query speaks for itself ("Try jsa hmg").
// Kept to about 20 characters so the hint fits a phone's box. The shorthand
// is the index's (aliases.js), the same in every language.
/** @type {Record<string, Record<import('../../types.js').Side, [string, string | null][]>>} */
const HINTS = {
  en: {
    A: [['sf', 'Spitfire'], ['msr', 'MULTI Sniper'], ['jsa hmg', null], ['fus ml', null], ['tanuki hmg', null]],
    B: [['ml', 'missiles'], ['hrl', 'heavy rockets'], ['+sd', 'Special Dice'], ['tr', 'Total Reaction'], ['sniper', null]],
  },
  es: {
    A: [['sf', 'Spitfire'], ['msr', 'MULTI Franco'], ['jsa hmg', null], ['fus ml', null], ['tanuki hmg', null]],
    B: [['ml', 'lanzamisiles'], ['hrl', 'lanzacohetes'], ['+sd', 'Dado Especial'], ['tr', 'Reacción Total'], ['francotirador', null]],
  },
};
/**
 * @param {string} lang
 * @param {import('../../types.js').Side} side
 */
export const searchHints = (lang, side) => (HINTS[lang] ?? HINTS.en)[side];
