// MODs and bonuses to the roll: cover, Nanoscreen, Mimetism, Albedo, Fireteams,
// BS Attack, ARO burst and Dodge.
import {LIMITS} from '../engine/params.js';
import {EQUIP, SKILL} from '../army/ids.js';
import {equipExtra, hasEquip, hasSkill, skillExtra, skillExtras} from '../army/traits.js';
import {ZERO_PAIN, canTarget, isHackingProgram} from '../army/hacking.js';
import {attackAttribute, isCommsAttack, isImpactTemplate, isTemplate, parseWeaponMods} from '../army/weapons.js';
import {ccOpposingMods, isCcAttack, naturalBornWarrior} from './closeCombat.js';
import {tEn} from '../i18n/index.js';

// A Success Value below 1 is an automatic failure (no roll can pass or crit):
// it is clamped to 0, which the engine treats exactly that way. The same
// value stands for an attack out of range.
export {LIMITS};
export const clamp = ([min, max], n) => Math.min(max, Math.max(min, n));

// "The sum total of the Modifiers applied to a Roll can never exceed +12 or
// -12." Fireteam +1 BS is a MOD and counts; Dodge (PH=14) replaces the
// Attribute and doesn't.
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
// - A Comms Attack (`row`): neither cover nor Nanoscreen does anything
//   (Firewall is its cover).
export const COVER_BS_MOD = -3;
// Cover's (or Nanoscreen's) MOD to the target's Saving Rolls.
export const COVER_SAVE_MOD = 3;
export function coverBsMod(target, attackerTraits, row = null) {
  if (hasSkill(attackerTraits, SKILL.MARKSMANSHIP) || isCommsAttack(row)) return 0;
  const cover = benefitsFromCover(target) && !hasSkill(target?.traits, SKILL.LIMITED_COVER);
  return cover || hasNanoscreen(target) ? COVER_BS_MOD : 0;
}

// Firewall (wiki): a Comms Attack against the trooper takes the bracketed
// MOD (-3 / -6), and the trooper gets +3 to its Saving Rolls against it, like
// cover against a BS Attack. It comes from a Hacking Device's upgrade
// ("UPGRADE: Firewall (-3)", "Firewall -6") or a TinBot: Firewall (-3). Only
// one applies: the player takes the best. 0 without one.
export const FIREWALL_SAVE_MOD = 3;
const FIREWALL_EXTRA = /\bFirewall \(?(-\d+)\)?/;
export function firewallMod(traits) {
  const mods = [...(traits?.skills ?? []), ...(traits?.equip ?? [])].flatMap((t) => {
    if (t.id === EQUIP.TINBOT_FIREWALL) return (t.extra ?? []).map(Number).filter((n) => n < 0);
    return (t.extra ?? []).map((e) => FIREWALL_EXTRA.exec(e)).filter(Boolean).map((m) => Number(m[1]));
  });
  return mods.length > 0 ? Math.min(...mods) : 0;
}

// The Firewall a side benefits from: the Firewall chip (rules/trooper.js,
// which starts on its own), else its own (firewallMod).
export const firewallOf = (side) => side?.firewall ?? firewallMod(side?.traits);

// ECM: Hacker (-X): an enemy Hacking Program against the trooper takes -X.
export function ecmHackerMod(traits) {
  const mod = Number(equipExtra(traits, EQUIP.ECM_HACKER));
  return Number.isFinite(mod) && mod < 0 ? mod : 0;
}

// The MODs on x's Hacking Program roll that no other attack has, one line
// each ({value, label, target}): the program's Attack MOD (Trinity +3) and
// the target's ECM: Hacker (`target`: the target's). Firewall is every Comms
// Attack's (firewallOf).
export function programSvMods(x, y, t = tEn) {
  const row = x?.weapon?.row;
  if (!isHackingProgram(row)) return [];
  const out = [];
  if (row.hack.attack) out.push({value: row.hack.attack, label: row.name, target: false});
  const ecm = y ? ecmHackerMod(y.traits) : 0;
  if (ecm) out.push({value: ecm, label: t('equip.ecmHacker', {mod: ecm}), target: true});
  return out;
}

// Does x's attack reach y? A Hacking Program only hits its Target types
// (army/hacking.js canTarget); anything else does.
export const reaches = (x, y) => !isHackingProgram(x?.weapon?.row) || canTarget(x.weapon.row, y);

const hasMsv = (traits) => hasEquip(traits, EQUIP.MSV1) || hasEquip(traits, EQUIP.MSV2) || hasEquip(traits, EQUIP.MSV3);
// The attacker's Multispectral Visor as players write it, or null.
const msvLevel = (traits) => (hasEquip(traits, EQUIP.MSV3) ? 3 : hasEquip(traits, EQUIP.MSV2) ? 2 : hasEquip(traits, EQUIP.MSV1) ? 1 : null);
export const msvName = (traits, t = tEn) => (msvLevel(traits) ? t('equip.msv', {level: msvLevel(traits)}) : null);

// A bracketed negative MOD (Mimetism (-6), Albedo (-3)); -3 when the data
// gives none.
const bracketMod = (extra) => {
  const mod = Number(extra);
  return Number.isFinite(mod) && mod < 0 ? mod : -3;
};
// The printed MOD of a target's Mimetism / Albedo, 0 without it.
export const mimetismValue = (traits) => (hasSkill(traits, SKILL.MIMETISM) ? bracketMod(skillExtra(traits, SKILL.MIMETISM)) : 0);
export const albedoValue = (traits) => (hasEquip(traits, EQUIP.ALBEDO) ? bracketMod(equipExtra(traits, EQUIP.ALBEDO)) : 0);

// Albedo (wiki): an enemy with a Multispectral Visor or Marksmanship who
// declares a BS Attack requiring LoF against the bearer applies the bracketed
// MOD (-3 / -6). Not applied to CC. Other attackers are unaffected.
export function albedoMod(targetTraits, attackerTraits) {
  if (!hasMsv(attackerTraits) && !hasSkill(attackerTraits, SKILL.MARKSMANSHIP)) return 0;
  return albedoValue(targetTraits);
}

// Mimetism (-3) / (-6) against the attacker's Multispectral Visor:
// MSV1 cancels 3 of it (-3 -> 0, -6 -> -3); MSV2 and MSV3 cancel it all.
export function mimetismMod(targetTraits, attackerTraits) {
  const value = mimetismValue(targetTraits);
  if (!value) return 0;
  if (hasEquip(attackerTraits, EQUIP.MSV2) || hasEquip(attackerTraits, EQUIP.MSV3)) return 0;
  if (hasEquip(attackerTraits, EQUIP.MSV1)) return Math.min(0, value + 3);
  return value;
}

// Fireteam bonuses by member count (N5, cumulative, assuming all members are
// the same Unit): 2 = BS Attack +1 SD, 3 = +3 Discover and +1 Dodge MOD,
// 4 = +1 BS, 5 = Sixth Sense. 0 means not in a Fireteam.
export const FIRETEAM_MIN = 2;
export const FIRETEAM_MAX = 5;
// The largest fireteam a trooper can be in: army.json's unit.fireteam, the
// most generous team it reaches in any army's chart (src/army/fireteams.js).
// FTO loadouts may go further than the unit's other loadouts. 1 = none.
export function fireteamMax(unit, option) {
  const ft = unit?.fireteam;
  if (!ft) return 1;
  const n = option?.fto ? ft.fto : ft.all;
  return n >= FIRETEAM_MIN ? n : 1;
}

// A size the trooper can actually have: above its max it drops to the max.
export const fireteamSize = (size, max) => (max >= FIRETEAM_MIN ? Math.min(size ?? 1, max) : 1);

// Sixth Sense, from the skill or a Fireteam of 5. In N5 it doesn't touch
// Surprise Attack (that moved to Combat Instinct); what matters here is that a
// trooper with it who Dodges takes no negative MODs (wiki, Sixth Sense; the
// Immobilized / Isolated exceptions are States the calculator doesn't model).
export const hasSixthSense = (side) => hasSkill(side?.traits, SKILL.SIXTH_SENSE) || fireteamBonuses(side?.ftSize).sixthSense;

// Does the side's pick get anything from its Fireteam? Its bonuses are for a
// BS Attack that is rolled (+1 SD, +1 BS; Sixth Sense against Poor
// Visibility) and a Dodge (+1, Sixth Sense). Not a Hacking Program or Reset
// (WIP rolls, Alex 2026-10-22), a CC Attack, a Direct Template or No ARO.
export function fireteamHelps(x) {
  const w = x?.weapon;
  if (!w) return false;
  if (w.pseudo) return w.pseudo === 'dodge';
  return !w.cc && !isTemplate(w.row) && !isHackingProgram(w.row);
}

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

// Situation chips on a side (Alex, 2026-10-22):
// - Targeted: the side is in Targeted State (Spotlight, a Forward Observer...).
//   A BS Attack or Comms Attack against it gets +3 (not a CC Attack, nor a
//   Direct Template: no roll), and its own Reset -3 (wiki, Targeted State).
// - Hacked: -3 to -12 to the side's Reset, from the States earlier programs
//   left it in (Isolated -9, Immobilized-B -3: -12 both): one chip, not one
//   per State. Targeted's -3 is the Targeted chip.
// - IMM-A: Immobilized-A, -6 to the side's Dodge.
export const TARGETED_MOD = 3;
export const TARGETED_RESET_MOD = -3;
export const HACKED_RESET_MODS = [-3, -6, -9, -12];
export const IMM_A_DODGE_MOD = -6;
// Does x's pick gain from its target being Targeted? A rolled BS Attack or
// Comms Attack (a Hacking Program, the Jammer).
export const targetedHelps = (x) => Boolean(x?.weapon?.row) && !x.weapon.cc && !isTemplate(x.weapon.row);
// x attacking y: +3 when y is Targeted.
export const targetedMod = (x, y) => (y?.targeted && targetedHelps(x) ? TARGETED_MOD : 0);
// x's own Reset while Targeted (Zero Pain is a program, not a Reset roll).
export const targetedResetMod = (x) => (x?.targeted && x.weapon?.pseudo === 'reset' && !x.weapon.zeroPain ? TARGETED_RESET_MOD : 0);
export const hackedResetMod = (x) => (x?.weapon?.pseudo === 'reset' && HACKED_RESET_MODS.includes(x.hackedReset) ? x.hackedReset : 0);
export const immADodgeMod = (x) => (x?.weapon?.pseudo === 'dodge' && x.immA ? IMM_A_DODGE_MOD : 0);

// Reset Success Value: WIP plus `mod` (the opponent's BS Attack (-X),
// Surprise Attack), capped at +/-12. No Fireteam bonus: that is Dodge's.
export function resetSuccessValue(profile, mod = 0) {
  return clamp(LIMITS.successValue, (profile?.wip ?? 0) + capMods(mod));
}

// Bangbomb (+X): the X, 0 without the equipment.
export function bangbombValue(traits) {
  const m = /^\+(\d+)$/.exec(equipExtra(traits, EQUIP.BANGBOMB) ?? '');
  return m ? Number(m[1]) : 0;
}

// Bangbomb (+X) on x's Dodge against `incoming` (the attacker's weapon;
// nothing when it isn't attacking). Only when the player picked the Bangbomb
// Dodge: it needs the attacker in the user's LoF or ZoC, which the calculator
// can't tell (a shot in the back), so the player chooses. Never against
// Template Weapons, Direct or Impact.
export const cancelsBangbomb = (row) => isTemplate(row) || isImpactTemplate(row);

export function bangbombMod(x, incoming) {
  if (!x?.weapon?.bangbomb || !incoming?.row || cancelsBangbomb(incoming.row)) return 0;
  return bangbombValue(x.traits);
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

// Does this side roll? A Dodge, a CC Attack, or a BS Attack that isn't a Direct Template
// (even one its target is immune to: the rolls are still opposed).
export function rollsDice(x) {
  const w = x?.weapon;
  if (!w) return false;
  if (w.pseudo) return w.pseudo === 'dodge' || w.pseudo === 'reset';
  return !isTemplate(w.row) && attackStat(x.profile, w.row) > 0;
}

// Does x's Dodge or Reset evade the attack `incoming` (the other side's
// weapon)? Dodge evades anything but a Comms Attack; Reset only Comms Attacks
// (wiki, Reset). Against no attack either one just rolls. An attack evades
// nothing: it is opposed when both attack.
export function evades(x, incoming) {
  const p = x?.weapon?.pseudo;
  if (p !== 'dodge' && p !== 'reset') return false;
  if (!incoming?.row || incoming.pseudo) return true;
  return (p === 'reset') === isCommsAttack(incoming.row);
}

// The MODs x's skills put on y's Face to Face Roll, one entry each:
// {value, label, ignoredBy} (ignoredBy: what of y's cancels it, else null).
// Negative MODs from x's skills apply to the opponent, and only in opposed
// rolls: both roll against each other (a Direct Template hits automatically,
// so nothing is opposed).
// - x Dodges with Dodge (-X) and y attacks: y takes -X (wiki, Dodge).
// - x makes a BS Attack with BS Attack (-X): y takes -X attacking or Dodging,
//   unless y has Warhorse (bsAttackMod).
// - x makes a CC Attack: Martial Arts, CC Attack (-X) and the weapon's (-X)
//   go on y's roll, whatever y does (closeCombat.js ccOpposingMods).
// - x is the active trooper, attacks (BS or CC), and uses Surprise Attack
//   (-X) (a player toggle): y takes -X attacking or Dodging, unless y has
//   Combat Instinct, or a Multispectral Visor L3 against a CC Attack. Against
//   a BS Attack or a Hacking Program MSV3 only ignores it on table conditions
//   the calculator can't see, so the player decides by leaving the chip on.
// - y Dodges with Sixth Sense (the skill or a Fireteam of 5): none of these
//   negative MODs apply to its Dodge.
// - y answers x's CC Attack with its own and has Natural Born Warrior: none
//   of x's negative MODs apply either.
export function opposingMods(x, y, xActive, t = tEn) {
  if (!rollsDice(x) || !rollsDice(y)) return [];
  // A program that can't target the other trooper isn't rolled.
  if (!reaches(x, y) || !reaches(y, x)) return [];
  // A Dodge or Reset that can't evade this attack isn't rolled against it.
  if (x.weapon.pseudo && !evades(x, y.weapon)) return [];
  if (y.weapon.pseudo && !evades(y, x.weapon)) return [];
  // Zero Pain: -3 to the Comms Attack it evades.
  if (x.weapon.pseudo === 'reset') {
    return x.weapon.zeroPain ? [{value: ZERO_PAIN.opponent, label: t('pseudo.zeroPainMod', {mod: ZERO_PAIN.opponent}), ignoredBy: null}] : [];
  }
  if (x.weapon.pseudo === 'dodge') {
    const mod = y.weapon.pseudo ? 0 : dodgeExtras(x.traits).opponentMod;
    return mod ? [{value: mod, label: t('skill.dodgeMod', {mod}), ignoredBy: null}] : [];
  }
  const sixth = y.weapon.pseudo === 'dodge' && hasSixthSense(y) ? t('skill.sixthSenseDodge') : null;
  const nbw = naturalBornWarrior(x, y) ? t('skill.naturalBornWarrior') : null;
  const out = [];
  if (isCcAttack(x)) {
    for (const m of ccOpposingMods(x, t)) out.push({...m, ignoredBy: nbw ?? sixth});
  } else if (isHackingProgram(x.weapon.row)) {
    // A program's (or its upgrade's) Opp. MOD, Trinity (-3). BS Attack (-X) is for shots.
    const opp = x.weapon.mods.opponent ?? 0;
    if (opp) out.push({value: opp, label: t('ledger.programMod', {program: x.weapon.row.name, mod: opp}), ignoredBy: sixth});
  } else {
    const bs = bsAttackMod(x.traits);
    if (bs) out.push({value: bs, label: t('skill.bsAttackMod', {mod: bs}), ignoredBy: hasSkill(y.traits, SKILL.WARHORSE) ? t('skill.warhorse') : sixth});
  }
  const surprise = xActive && x.surpriseAttack ? surpriseAttackMod(x.traits) : 0;
  if (surprise) {
    const ignoredBy = nbw ?? (hasSkill(y.traits, SKILL.COMBAT_INSTINCT) ? t('skill.combatInstinct')
      : isCcAttack(x) && hasEquip(y.traits, EQUIP.MSV3) ? t('equip.msv', {level: 3}) : sixth);
    out.push({value: surprise, label: t('skill.surpriseAttackMod', {mod: surprise}), ignoredBy});
  }
  return out;
}

// Only Total Reaction / Neurocinetics keep their full burst in ARO, and only
// for a BS Attack: a Hacking Program is B 1 in ARO.
export const keepsAroBurst = (x) => !isHackingProgram(x.weapon?.row)
  && (hasSkill(x.traits, SKILL.TOTAL_REACTION) || hasSkill(x.traits, SKILL.NEUROCINETICS));

// Neurocinetics (+1B): the extra Burst counts in the Reactive Turn only (the
// Active Turn is B 1 regardless). Yan Huo, Sunduqbut.
export const neurocineticsAroBurst = (traits) =>
  skillExtras(traits, SKILL.NEUROCINETICS)
    .map((e) => /^\+(\d+)B$/.exec(e))
    .filter(Boolean)
    .reduce((n, m) => n + Number(m[1]), 0);

// Burst, SD and BS bonuses on a BS Attack, summed over the weapon's loadout
// extras, the profile's BS Attack (+1SD / +1B) skill and the Fireteam.
// Templates keep their burst bonuses but don't roll, so get no SD or BS.
// A Hacking Program is no BS Attack: only its own upgrades (+1B, +1SD), no
// BS Attack skill or Fireteam bonus (Alex, 2026-10-22).
export function attackBonuses(x) {
  const row = x.weapon?.row;
  if (!row) return {burst: 0, sd: 0, bs: 0, skillBurst: 0};
  if (isHackingProgram(row)) return {burst: x.weapon.mods.burst, sd: x.weapon.mods.sd, bs: 0, skillBurst: 0};
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
