// What a hit does to its target: Ammunition, Immunity, Vulnerability, Shock.
import {SKILL} from '../army/ids.js';
import {hasSkill} from '../army/traits.js';
import {
  ammoTypes, bioweaponAmmo, bioweaponProp, causesStunned, causesWounds, hasAmmo, hasContinuousDamage, hasShockAmmo,
  isPlasma, saveAttribute,
} from '../army/weapons.js';

// Vulnerability (wiki): no Immunity against the bracketed weapon, e.g. any
// weapon with "Viral" in its name. Returns the bracketed name, or null.
export function vulnerabilityTo(targetTraits, row) {
  const name = (row?.name ?? '').toLowerCase();
  return (targetTraits?.skills ?? [])
    .filter((s) => s.id === SKILL.VULNERABILITY)
    .flatMap((s) => s.extra ?? [])
    .find((e) => name.includes(e.toLowerCase())) ?? null;
}

export const hasImmunity = (targetTraits, kind, row) =>
  hasSkill(targetTraits, SKILL.IMMUNITY, kind) && !vulnerabilityTo(targetTraits, row);

// The Immunity that covers this weapon's Saving Roll, ignoring Vulnerability.
export function immunityFor(targetTraits, row) {
  if (!row) return null;
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
export function immunityAgainst(targetTraits, row) {
  return vulnerabilityTo(targetTraits, row) ? null : immunityFor(targetTraits, row);
}

// Against an Immunity those States are ignored too, so nothing is left of the
// attack. The exception is State: Stunned, which always applies (wiki example
// 4, Flash Pulse).
// An attack that cannot affect its target opposes nothing (wiki, Face to Face
// Rolls): it gets burst 0 and the target makes a Normal Roll.
export const hasNoEffect = (targetTraits, row) =>
  Boolean(immunityAgainst(targetTraits, row))
  && !causesWounds(row)
  && !causesStunned(row);

// What the Immunity takes away from this attack, for the matchup note.
export function immunityNote(immunity, row, mods) {
  const parts = [];
  const ammo = ammoTypes(row, mods);
  const bio = bioweaponProp(row);
  if (bio) ammo.push(bio);
  if (ammo.length > 0) parts.push(`${ammo.join('+')} treated as N`);
  const traits = [];
  if (row.save?.armZero) traits.push('ARM=0');
  if (hasContinuousDamage(row, mods)) traits.push('Continuous Damage');
  if (traits.length > 0) parts.push(`${traits.join(', ')} ignored`);
  return parts.length > 0 ? `target has Immunity (${immunity}); ${parts.join('; ')}` : null;
}

// The engine's ammunition for this weapon against this target.
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
export function shockApplies(row, target) {
  if (!hasShockAmmo(row) || !target?.profile) return false;
  if (target.profile.str || target.profile.w !== 1) return false;
  return !immunityAgainst(target.traits, row) && !hasImmunity(target.traits, 'Shock', row);
}
