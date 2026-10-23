import {SKILL} from './ids.js';

// Skills and equipment of a trooper: the profile's plus the loadout's.
// A trait is {id, name, extra?: [...]}, as in the Army data.

/**
 * @param {import('../types.js').ProfileRow | null | undefined} profile
 * @param {import('../types.js').OptionRow | null | undefined} option
 * @returns {import('../types.js').Traits}
 */
export function effectiveTraits(profile, option) {
  return {
    skills: [...(profile?.skills ?? []), ...(option?.skills ?? [])],
    equip: [...(profile?.equip ?? []), ...(option?.equip ?? [])],
  };
}

/** @typedef {import('../types.js').Traits | null | undefined} MaybeTraits */

/**
 * @param {MaybeTraits} traits
 * @param {number} id
 * @param {string} [extra] a bracketed value the skill must carry
 */
export const hasSkill = (traits, id, extra) =>
  (traits?.skills ?? []).some((s) => s.id === id && (extra === undefined || (s.extra ?? []).includes(extra)));
/**
 * @param {MaybeTraits} traits
 * @param {number} id
 */
export const hasEquip = (traits, id) => (traits?.equip ?? []).some((e) => e.id === id);
/**
 * @param {MaybeTraits} traits
 * @param {number} id
 * @returns {string | null}
 */
export const skillExtra = (traits, id) => (traits?.skills ?? []).find((s) => s.id === id)?.extra?.[0] ?? null;
/**
 * @param {MaybeTraits} traits
 * @param {number} id
 * @returns {string | null}
 */
export const equipExtra = (traits, id) => (traits?.equip ?? []).find((e) => e.id === id)?.extra?.[0] ?? null;
// Every bracketed value of a skill, over all its copies (e.g. Immunity (ARM), Immunity (Shock)).
/**
 * @param {MaybeTraits} traits
 * @param {number} id
 * @returns {string[]}
 */
export const skillExtras = (traits, id) =>
  (traits?.skills ?? []).filter((s) => s.id === id).flatMap((s) => s.extra ?? []);

// "Name (extra, extra)" as the Army list shows it; the extras in t's
// language (the army's own translation: "+1B" -> "+1R") and distance unit
// (Dodge (+2") -> Esquivar (+5 cm)). t: the translator (src/i18n).
/**
 * @param {import('../types.js').TraitRef} trait
 * @param {import('../types.js').Translator} t
 */
export const traitLabel = (trait, t) =>
  (trait.extra?.length ? `${trait.name} (${trait.extra.map((e) => t.inchText(t.term('extras', e))).join(', ')})` : trait.name);

// Lieutenant (any level): changes nothing on the table, so the picker and the
// index leave it out when telling loadouts apart.
/** @param {import('../types.js').TraitRef | null | undefined} skill */
export const isLieutenant = (skill) => skill?.id === SKILL.LIEUTENANT;
