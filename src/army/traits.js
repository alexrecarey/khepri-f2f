import {SKILL} from './ids.js';
import {tEn} from '../i18n/index.js';

// Skills and equipment of a trooper: the profile's plus the loadout's.
// A trait is {id, name, extra?: [...]}, as in the Army data.

export function effectiveTraits(profile, option) {
  return {
    skills: [...(profile?.skills ?? []), ...(option?.skills ?? [])],
    equip: [...(profile?.equip ?? []), ...(option?.equip ?? [])],
  };
}

export const hasSkill = (traits, id, extra) =>
  (traits?.skills ?? []).some((s) => s.id === id && (extra === undefined || (s.extra ?? []).includes(extra)));
export const hasEquip = (traits, id) => (traits?.equip ?? []).some((e) => e.id === id);
export const skillExtra = (traits, id) => (traits?.skills ?? []).find((s) => s.id === id)?.extra?.[0] ?? null;
export const equipExtra = (traits, id) => (traits?.equip ?? []).find((e) => e.id === id)?.extra?.[0] ?? null;
// Every bracketed value of a skill, over all its copies (e.g. Immunity (ARM), Immunity (Shock)).
export const skillExtras = (traits, id) =>
  (traits?.skills ?? []).filter((s) => s.id === id).flatMap((s) => s.extra ?? []);

// "Name (extra, extra)" as the Army list shows it; the extras in t's
// language (the army's own translation: "+1B" -> "+1R").
export const traitLabel = (trait, t = tEn) =>
  (trait.extra?.length ? `${trait.name} (${trait.extra.map((e) => t.term('extras', e)).join(', ')})` : trait.name);

// Lieutenant (any level): changes nothing on the table, so the picker and the
// index leave it out when telling loadouts apart.
export const isLieutenant = (skill) => skill?.id === SKILL.LIEUTENANT;
