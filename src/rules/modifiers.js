// MODs and bonuses to the roll: cover, Nanoscreen, Mimetism, Albedo, Fireteams,
// BS Attack, ARO burst and Dodge.
import {LIMITS} from '../engine/params.js';
import {EQUIP, SKILL} from '../army/ids.js';
import {equipExtra, hasEquip, hasSkill, skillExtra, skillExtras} from '../army/traits.js';
import {attackAttribute, isImpactTemplate, isTemplate, parseWeaponMods} from '../army/weapons.js';

// A Success Value below 1 is an automatic failure (no roll can pass or crit):
// it is clamped to 0, which the engine treats exactly that way. The same
// value stands for an attack out of range.
export {LIMITS};
export const clamp = ([min, max], n) => Math.min(max, Math.max(min, n));

// "The sum total of the Modifiers applied to a Roll can never exceed +12 or
// -12." Attribute changes (Fireteam +1 BS, Dodge (PH=14)) are not MODs.
export const MOD_CAP = [-12, 12];
export const capMods = (sum) => clamp(MOD_CAP, sum);

// Direct and Impact (Blast mode) templates ignore cover's +3 to the Saving
// Roll. The -3 BS MOD still applies to the attack roll.
export const ignoresCoverOnSaves = (row) => isTemplate(row) || isImpactTemplate(row);

// Units with the No Cover skill (TAGs, bikes, Redeye...) get nothing from cover.
export const benefitsFromCover = (side) => Boolean(side?.inCover) && !hasSkill(side?.traits, SKILL.NO_COVER);

// Nanoscreen (wiki): -3 BS MOD on BS Attack Rolls against the user and +3 to
// the user's Saving Rolls against BS Attacks, templates included. Treated as
// the same MOD as cover, so the two do not stack.
export const hasNanoscreen = (side) => hasEquip(side?.traits, EQUIP.NANOSCREEN);

// The BS MOD a target's cover or Nanoscreen imposes on this attacker (they
// don't stack):
// - Limited Cover: the trooper keeps cover's +3 to its saves, not the -3 BS.
// - No Cover: neither (benefitsFromCover). Nanoscreen still works.
// - Marksmanship (attacker): ignores the -3 from cover and from Nanoscreen,
//   not the target's +3 to its saves.
export function coverBsMod(target, attackerTraits) {
  if (hasSkill(attackerTraits, SKILL.MARKSMANSHIP)) return 0;
  const cover = benefitsFromCover(target) && !hasSkill(target?.traits, SKILL.LIMITED_COVER);
  return cover || hasNanoscreen(target) ? -3 : 0;
}

const hasMsv = (traits) => hasEquip(traits, EQUIP.MSV1) || hasEquip(traits, EQUIP.MSV2) || hasEquip(traits, EQUIP.MSV3);

// Albedo (wiki): an enemy with a Multispectral Visor or Marksmanship who
// declares a BS Attack requiring LoF against the bearer applies the bracketed
// MOD (-3 / -6). Not applied to CC. Other attackers are unaffected.
export function albedoMod(targetTraits, attackerTraits) {
  if (!hasEquip(targetTraits, EQUIP.ALBEDO)) return 0;
  if (!hasMsv(attackerTraits) && !hasSkill(attackerTraits, SKILL.MARKSMANSHIP)) return 0;
  const mod = Number(equipExtra(targetTraits, EQUIP.ALBEDO));
  return Number.isFinite(mod) && mod < 0 ? mod : -3;
}

// Mimetism (-3) / (-6) against the attacker's Multispectral Visor:
// MSV1 cancels 3 of it (-3 -> 0, -6 -> -3); MSV2 and MSV3 cancel it all.
export function mimetismMod(targetTraits, attackerTraits) {
  const extra = skillExtra(targetTraits, SKILL.MIMETISM);
  if (!hasSkill(targetTraits, SKILL.MIMETISM)) return 0;
  const mod = Number(extra);
  const value = Number.isFinite(mod) && mod < 0 ? mod : -3;
  if (hasEquip(attackerTraits, EQUIP.MSV2) || hasEquip(attackerTraits, EQUIP.MSV3)) return 0;
  if (hasEquip(attackerTraits, EQUIP.MSV1)) return Math.min(0, value + 3);
  return value;
}

// Fireteam bonuses by member count (N5, cumulative, assuming all members are
// the same Unit): 2 = BS Attack +1 SD, 3 = +3 Discover and +1 Dodge MOD,
// 4 = +1 BS, 5 = Sixth Sense. 0 means not in a Fireteam.
export const FIRETEAM_MIN = 2;
export const FIRETEAM_MAX = 5;
export function fireteamBonuses(size = 0) {
  return {
    sd: size >= 2 ? 1 : 0,
    dodge: size >= 3 ? 1 : 0,
    bs: size >= 4 ? 1 : 0,
    sixthSense: size >= 5,
  };
}

// The bracketed values of a trooper's Dodge skill(s); a trooper can list
// several (Dodge (+3), Dodge (+1")):
//   PH=14    replaces PH for the Dodge Roll
//   +3, +6   a MOD to the user's Dodge Roll
//   -3, -6   a MOD the opponents suffer in Face to Face Rolls while the user
//            Dodges (wiki, Dodge)
//   +1SD     Special Dice on the Dodge Roll
//   ARM +3   +3 ARM while Dodging
//   +1" ...  extra movement: nothing to roll
export function dodgeExtras(traits) {
  const out = {ph: null, mod: 0, opponentMod: 0, sd: 0, arm: 0};
  for (const e of skillExtras(traits, SKILL.DODGE)) {
    let m;
    if ((m = /^PH=(\d+)$/.exec(e))) out.ph = Number(m[1]);
    else if ((m = /^\+(\d+)SD$/.exec(e))) out.sd += Number(m[1]);
    else if ((m = /^ARM \+(\d+)$/.exec(e))) out.arm += Number(m[1]);
    else if ((m = /^\+(\d+)$/.exec(e))) out.mod += Number(m[1]);
    else if ((m = /^-(\d+)$/.exec(e))) out.opponentMod = Math.min(out.opponentMod, -Number(m[1]));
  }
  return out;
}

// Dodge Success Value: PH (or the Dodge (PH=14) replacement) plus the MODs:
// Dodge (+3), and `mod` (Fireteam +1, the opponent's BS Attack (-3)), capped
// at +/-12.
export function dodgeSuccessValue(profile, traits, mod = 0) {
  const dodge = dodgeExtras(traits);
  const sv = dodge.ph ?? profile?.ph ?? 0;
  return clamp(LIMITS.successValue, sv + capMods(dodge.mod + mod));
}

// BS Attack (-X): while the trooper makes a BS Attack that is rolled, the
// opponent takes -X on its Face to Face Roll, whatever it does (shoot or
// Dodge). Nothing when the trooper Dodges, uses a Direct Template (no roll, so
// the opponent's Dodge is a Normal Roll) or can't affect the target (a Normal
// Roll too). Still applies out of range: the attack is declared and fails.
// Warhorse ignores BS Attack (-X), however it is gained.
// Surprise Attack (-X): the -X MOD, 0 without the skill. Whether it is used is
// the player's call (rules/matchup.js opposingMod).
export function surpriseAttackMod(traits) {
  const mods = skillExtras(traits, SKILL.SURPRISE_ATTACK).map((e) => /^-(\d+)$/.exec(e)).filter(Boolean);
  return mods.length > 0 ? Math.min(...mods.map((m) => -Number(m[1]))) : 0;
}

export function bsAttackMod(traits) {
  const mods = skillExtras(traits, SKILL.BS_ATTACK).map((e) => /^-(\d+)$/.exec(e)).filter(Boolean);
  return mods.length > 0 ? Math.min(...mods.map((m) => -Number(m[1]))) : 0;
}


// The Attribute a weapon rolls against: BS, or PH / WIP for BS Weapon (PH) /
// (WIP) (e.g. Grenades, Flash Pulse). BS MODs still apply.
export function attackStat(profile, row) {
  return profile?.[attackAttribute(row)] ?? 0;
}

// Only Total Reaction / Neurocinetics keep their full burst in ARO.
export const keepsAroBurst = (x) => hasSkill(x.traits, SKILL.TOTAL_REACTION) || hasSkill(x.traits, SKILL.NEUROCINETICS);

// Burst, SD and BS bonuses on a BS Attack, summed over the weapon's loadout
// extras, the profile's BS Attack (+1SD / +1B) skill and the Fireteam.
// Templates keep their burst bonuses but don't roll, so get no SD or BS.
export function attackBonuses(x) {
  const row = x.weapon?.row;
  if (!row) return {burst: 0, sd: 0, bs: 0, skillBurst: 0};
  const skillMods = parseWeaponMods(
    skillExtras(x.traits, SKILL.BS_ATTACK).filter((e) => /^\+\d+(B|SD)$/.test(e)),
  );
  const burst = x.weapon.mods.burst + skillMods.burst;
  if (isTemplate(row)) return {burst, sd: 0, bs: 0, skillBurst: skillMods.burst};
  const ft = fireteamBonuses(x.ftSize);
  return {
    burst,
    sd: x.weapon.mods.sd + skillMods.sd + ft.sd,
    bs: ft.bs,
    skillBurst: skillMods.burst,
  };
}
