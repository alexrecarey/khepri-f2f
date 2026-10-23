// What a hit does to its target: Ammunition, Immunity, Vulnerability, Shock.
import {SKILL} from '../army/ids.js';
import {hasSkill} from '../army/traits.js';
import {list, msg, term} from '../i18n/message.js';
import {
  ammoMsg, ammoTypes, bioweaponAmmo, bioweaponProp, causesStunned, causesWounds, hasAmmo, hasContinuousDamage, hasShockAmmo,
  isCommsAttack, isPlasma, saveAttribute, stateCaused,
} from '../army/weapons.js';

/** @typedef {import('../types.js').Traits | null | undefined} MaybeTraits */
/** @typedef {import('../types.js').WeaponRow} WeaponRow */
/** @typedef {WeaponRow | null | undefined} MaybeRow */

// Vulnerability (wiki): no Immunity against the bracketed weapon, e.g. any
// weapon with "Viral" in its name. Returns the bracketed name, or null.
// Matched on the English name (`en` when the names are in another language).
/**
 * @param {MaybeTraits} targetTraits
 * @param {MaybeRow} row
 * @returns {string | null}
 */
export function vulnerabilityTo(targetTraits, row) {
  const name = (row?.en ?? row?.name ?? '').toLowerCase();
  return (targetTraits?.skills ?? [])
    .filter((s) => s.id === SKILL.VULNERABILITY)
    .flatMap((s) => s.extra ?? [])
    .find((e) => name.includes(e.toLowerCase())) ?? null;
}

// Against a Comms Attack only an Immunity to a State works: Immunity
// (Isolated), Immunity (IMM-B), Immunity (POS). ARM, BTS, Enhanced, Critical,
// AP and the rest do nothing (Alex, 2026-10-20).
const COMMS_IMMUNITIES = ['Isolated', 'IMM-B', 'POS'];
// The Immunity that stops each State a Comms Attack causes, as the Army
// writes it.
/** @type {Record<string, string>} */
const STATE_IMMUNITY = {'Isolated': 'Isolated', 'Immobilized-B': 'IMM-B', 'Possessed': 'POS'};

/**
 * @param {MaybeTraits} targetTraits
 * @param {string} kind the Immunity's bracketed value
 * @param {MaybeRow} row
 */
export const hasImmunity = (targetTraits, kind, row) =>
  hasSkill(targetTraits, SKILL.IMMUNITY, kind) && !vulnerabilityTo(targetTraits, row)
  && (!isCommsAttack(row) || COMMS_IMMUNITIES.includes(kind));

// The Immunity that covers this weapon's Saving Roll, ignoring Vulnerability.
// None against a Comms Attack.
/**
 * @param {MaybeTraits} targetTraits
 * @param {MaybeRow} row
 * @returns {string | null}
 */
export function immunityFor(targetTraits, row) {
  if (!row || isCommsAttack(row)) return null;
  if (hasSkill(targetTraits, SKILL.IMMUNITY, 'Enhanced')) return 'Enhanced';
  const attr = saveAttribute(row);
  return hasSkill(targetTraits, SKILL.IMMUNITY, attr) ? attr : null;
}

// Immunity (ARM) / (BTS) (wiki): when the Saving Roll uses that Attribute, the
// Ammunition is treated as Normal: one Saving Roll per hit, one Wound per
// failure, Attribute not halved. Weapon Traits that cause States, reduce the
// Attribute or refer to Wounds (ARM=0, Continuous Damage) are ignored too. A
// Critical still adds its Saving Roll, and a combined ARM+BTS save (Plasma)
// still rolls both. Immunity (Enhanced) is Immunity (ARM) plus Immunity (BTS).
// Returns the bracketed name of the Immunity that applies, or null.
/**
 * @param {MaybeTraits} targetTraits
 * @param {MaybeRow} row
 * @returns {string | null}
 */
export function immunityAgainst(targetTraits, row) {
  return vulnerabilityTo(targetTraits, row) ? null : immunityFor(targetTraits, row);
}

// Against an Immunity those States are ignored too, so nothing is left of the
// attack. The exception is State: Stunned, which always applies (wiki example
// 4, Flash Pulse).
// Such an attack is still a BS Attack against the target: rolled, opposed (a
// success still cancels the target's Dodge or shot), its hits just cause no
// Saving Rolls (ammo NONE).
// Immunity (Isolated) leaves nothing of a weapon whose only effect is Isolated
// (Jammer, Oblivion) either, and nor does Warhorse, which makes its user immune
// to Isolated (Alex, 2026-10-20). Likewise Immunity (IMM-B) against Carbonite
// and Immunity (POS) against Total Control.
/**
 * @param {MaybeTraits} targetTraits
 * @param {MaybeRow} row
 */
export const hasNoEffect = (targetTraits, row) => Boolean(noEffectBy(targetTraits, row));

// What leaves this attack without effect, as the warning names it
// ("Immunity (BTS)", "Warhorse"), or null.
/**
 * @param {MaybeTraits} targetTraits
 * @param {MaybeRow} row
 * @returns {import('../types.js').Message | null}
 */
export function noEffectBy(targetTraits, row) {
  /** @param {string} what */
  const immune = (what) => msg('skill.immunity', {what: term('extras', what)});
  const state = isCommsAttack(row) ? stateCaused(row) : null;
  // A null State reads nothing.
  const stopping = STATE_IMMUNITY[/** @type {string} */ (state)];
  if (stopping && hasImmunity(targetTraits, stopping, row)) return immune(stopping);
  if (state === 'Isolated' && hasSkill(targetTraits, SKILL.WARHORSE)) return msg('skill.warhorse');
  const immunity = immunityAgainst(targetTraits, row);
  // An Immunity applies to a weapon: `row` is one.
  return immunity && !causesWounds(/** @type {WeaponRow} */ (row)) && !causesStunned(row) ? immune(immunity) : null;
}

// What the Immunity takes away from this attack, for the matchup note.
/**
 * @param {string} immunity
 * @param {WeaponRow} row
 * @param {import('../types.js').WeaponMods} mods
 * @returns {import('../types.js').Message | null}
 */
export function immunityNote(immunity, row, mods) {
  /** @type {import('../types.js').Message[]} */
  const parts = [];
  /** @type {import('../types.js').Message[]} */
  const ammo = ammoTypes(row, mods).map(ammoMsg);
  const bio = bioweaponProp(row);
  if (bio) ammo.push(term('props', bio));
  if (ammo.length > 0) parts.push(msg('note.treatedAsN', {ammo: list(ammo, '+')}));
  /** @type {import('../types.js').Message[]} */
  const traits = [];
  if (row.save?.armZero) traits.push(msg('save.armZero'));
  if (hasContinuousDamage(row, mods)) traits.push(msg('trait.continuousDamage'));
  if (traits.length > 0) parts.push(msg('note.ignored', {what: list(traits)}));
  return parts.length > 0
    ? msg('note.targetImmunity', {what: term('extras', immunity), effect: list(parts, '; ')}) : null;
}

// The engine's ammunition for this weapon against this target.
/**
 * @param {WeaponRow} row
 * @param {MaybeTraits} targetTraits
 * @returns {import('../types.js').Ammo}
 */
export function calcAmmo(row, targetTraits) {
  if (isPlasma(row)) return 'PLASMA';
  if (immunityAgainst(targetTraits, row)) return 'N';
  if (row.saveRolls === 2) return 'DA';
  if (row.saveRolls === 3) return 'EXP';
  const bio = bioweaponAmmo(row);
  if (bio) return bio;
  if (hasAmmo(row, 'T2')) return 'T2';
  return 'N';
}

// Shock (wiki): a target with VITA 1 that fails a Saving Roll skips
// Unconscious and goes straight to Dead, which the calculator counts as one
// extra wound. Troopers with STR or with 2+ VITA are unaffected. Immunity
// (Shock), and Immunity (ARM) / (BTS) / (Enhanced) on that save, treat the hit
// as Normal Ammunition. Vulnerability cancels any of them.
/**
 * @param {WeaponRow} row
 * @param {Pick<import('../types.js').ResolvedSide, 'profile' | 'traits'> | null | undefined} target
 */
export function shockApplies(row, target) {
  if (!hasShockAmmo(row) || !target?.profile) return false;
  if (target.profile.str || target.profile.w !== 1) return false;
  return !immunityAgainst(target.traits, row) && !hasImmunity(target.traits, 'Shock', row);
}

// How a hit halves the target's ARM / BTS: by AP Ammunition (the weapon's own,
// a loadout "AP", BS Attack (AP)), or printed halved for another reason (E/M:
// BTS/2). Immunity (AP) only ignores the first; any Immunity that turns the
// hit into Normal Ammunition (immunityAgainst) ignores both.
//   {ap, other, apIgnored, halves}
/**
 * @param {MaybeRow} row
 * @param {Pick<import('../types.js').WeaponMods, 'forceAP'> | null | undefined} mods
 * @param {MaybeTraits} targetTraits
 */
export function saveHalving(row, mods, targetTraits) {
  const save = row?.save ?? /** @type {Partial<NonNullable<WeaponRow['save']>>} */ ({});
  const ap = Boolean(mods?.forceAP) || (Boolean(save.halved) && hasAmmo(row, 'AP'));
  const other = Boolean(save.halved) && !hasAmmo(row, 'AP');
  const immune = Boolean(immunityAgainst(targetTraits, row));
  const apIgnored = ap && hasImmunity(targetTraits, 'AP', row);
  return {ap, other, apIgnored, halves: !immune && (other || (ap && !apIgnored))};
}
