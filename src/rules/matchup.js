// Matchup -> calculator params: applies the N5 rules to two resolved troopers
// (rules/trooper.js resolveSelection) and returns the engine input with the
// notes and warnings to show next to it.
import {SKILL} from '../army/ids.js';
import {hasEquip, hasSkill} from '../army/traits.js';
import {causesWounds, hasContinuousDamage, isNonLethal, isTemplate, weaponPS} from '../army/weapons.js';
import {
  COVER_SAVE_MOD, LIMITS, albedoMod, attackBonuses, attackStat, benefitsFromCover, capMods, clamp, coverBsMod, dodgeExtras,
  dodgeSuccessValue, fireteamBonuses, hasNanoscreen, ignoresCoverOnSaves, keepsAroBurst, mimetismMod, opposingMods,
} from './modifiers.js';
import {rangeModFor} from './ranges.js';
import {
  calcAmmo, hasImmunity, hasNoEffect, immunityAgainst, immunityFor, immunityNote, saveHalving, shockApplies, vulnerabilityTo,
} from './saves.js';
import {isSpecOps} from './trooper.js';

// The Immunities the rules here read, and Immunities to States the calculator
// doesn't model (E/M's IMM-B and Isolated, Possession): recognized, and
// correctly change nothing here, since a hit is scored the same and only the
// State afterwards differs (Warhorse's immunity to Isolated is the same case).
// scripts/army-validate.mjs fails on any other Immunity in the army data.
export const MODELED_IMMUNITIES = ['AP', 'ARM', 'BTS', 'Continuous Damage', 'Critical', 'Enhanced', 'Shock'];
export const STATE_IMMUNITIES = ['IMM-B', 'Isolated', 'POS'];

// Traits that matter to the roll but aren't modelled yet: a warning.
const IGNORED = [];

// Names of traits on this side that the converter does not model yet.
function unsupportedTraits(side) {
  if (!side?.traits) return [];
  const found = IGNORED
    .filter(([kind, id]) => (kind === 'skill' ? hasSkill(side.traits, id) : hasEquip(side.traits, id)))
    .map(([, , name]) => name);
  return found;
}

function approximationWarnings(label, side, target) {
  const warnings = [];
  const row = side?.weapon?.row;
  if (row && hasNoEffect(target?.traits, row)) {
    warnings.push(`${label}: ${row.name} has no effect on a target with Immunity (${immunityAgainst(target.traits, row)}); its hits cause no damage`);
  } else if (row && isNonLethal(row)) {
    warnings.push(`${label}: ${row.name} is non-lethal; results shown as wounds`);
  }
  for (const name of side?.unsupportedUpgradeWeapons ?? []) {
    warnings.push(`${label}: ${name} (upgrade) not supported by the calculator`);
  }
  return warnings;
}

const signed = (n) => `${n > 0 ? '+' : ''}${n}`;

// The MODs x puts on y's Face to Face Roll (modifiers.js opposingMods), with
// a note for each one y ignores.
function opposingMod(x, y, xActive, yLabel, notes) {
  let total = 0;
  for (const m of opposingMods(x, y, xActive)) {
    if (m.ignoredBy) notes.push(`${yLabel}: ${m.ignoredBy}; the opponent's ${m.label} has no effect`);
    else total += m.value;
  }
  return total;
}

function attackInputs(x, y, rangeCm, side, errors, notes, opposing = 0) {
  const label = side === 'A' ? 'Active' : 'Reactive';
  const {row, mods} = x.weapon;
  let rangeMod = rangeModFor(row, rangeCm, x.traits);
  // Out of range: the attack still happens but always fails. A success value
  // of 0 misses on every roll, with no crit.
  const outOfRange = rangeMod === null;
  if (outOfRange) rangeMod = 0;
  const mim = y ? mimetismMod(y.traits, x.traits) : 0;
  const albedo = y ? albedoMod(y.traits, x.traits) : 0;
  const cover = y ? coverBsMod(y, x.traits) : 0;
  const bonus = attackBonuses(x);
  // Every MOD counts toward the cap, Fireteam +1 BS included (Alex, 2026-10-10).
  const modSum = bonus.bs + rangeMod + mim + albedo + cover + mods.sv + opposing;
  const modTotal = capMods(modSum);
  if (!outOfRange && modTotal !== modSum) notes.push(`${label}: MODs add up to ${signed(modSum)}, capped at ${signed(modTotal)}`);
  const sv = outOfRange
    ? 0
    : clamp(LIMITS.successValue, attackStat(x.profile, row) + modTotal);

  const noEffect = hasNoEffect(y?.traits, row);
  let burst = (row.burst ?? 1) + bonus.burst;
  if (side === 'B' && !keepsAroBurst(x)) burst = 1;
  // Neurocinetics: B 1 in the Active Turn, Burst MODs included (wiki).
  if (side === 'A' && hasSkill(x.traits, SKILL.NEUROCINETICS)) {
    burst = 1;
    notes.push(`${label}: Neurocinetics; Burst reduced to 1 in the Active Turn`);
  }
  const immunity = immunityAgainst(y?.traits, row);
  // Immunity (Continuous Damage): the Trait is ignored, the hit is not.
  const contImmune = hasImmunity(y?.traits, 'Continuous Damage', row);
  const out = {
    [`successValue${side}`]: sv,
    [`burst${side}`]: clamp(LIMITS.burst, burst),
    [`bonusBurst${side}`]: clamp(LIMITS.bonusBurst, bonus.sd),
    [`damage${side}`]: clamp(LIMITS.damage, weaponPS(row, mods)),
    [`ammo${side}`]: noEffect ? 'NONE' : calcAmmo(row, y?.traits),
    [`cont${side}`]: !immunity && !contImmune && hasContinuousDamage(row, mods),
    [`shock${side}`]: shockApplies(row, y),
  };
  if (out[`shock${side}`]) notes.push(`${label}: Shock against VITA 1; a failed save is Dead (no Unconscious, NWI or Dogged)`);
  // State-only weapons get a warning instead (no effect), or play as always (Stunned).
  if (!immunity && contImmune && hasContinuousDamage(row, mods)) {
    notes.push(`${label}: target has Immunity (Continuous Damage); Continuous Damage ignored`);
  }
  const note = immunity && causesWounds(row) && immunityNote(immunity, row, mods);
  if (note) notes.push(`${label}: ${note}`);
  const vulnerable = vulnerabilityTo(y?.traits, row);
  const lost = vulnerable && immunityFor(y.traits, row);
  if (lost) notes.push(`${label}: target has Vulnerability (${vulnerable}); Immunity (${lost}) does not apply`);
  return out;
}

// A Dodge: one PH roll (Dodge MODs and the Fireteam's +1 included, Dodge
// (+1SD) as Special Dice) that causes no Saving Rolls.
function dodgeInputs(x, side, opposing = 0) {
  return {
    [`ammo${side}`]: 'DODGE',
    [`burst${side}`]: 1,
    [`bonusBurst${side}`]: clamp(LIMITS.bonusBurst, dodgeExtras(x.traits).sd),
    [`successValue${side}`]: dodgeSuccessValue(x.profile, x.traits, fireteamBonuses(x.ftSize).dodge + opposing),
    [`cont${side}`]: false,
    [`shock${side}`]: false,
  };
}

// `dodging`: y Dodges this attack, so Dodge (ARM +3) adds to its ARM.
function defenseInputs(y, incoming, side, dodging = false) {
  const p = y.profile;
  const save = incoming?.row?.save ?? {attr: 'ARM'};
  // Immune: the Attribute is rolled as printed, no ARM=0 and no AP halving.
  const immune = Boolean(immunityAgainst(y.traits, incoming?.row));
  const arm = (p.arm ?? 0) + (dodging ? dodgeExtras(y.traits).arm : 0);
  let base = save.attr === 'BTS' ? p.bts : save.armZero && !immune ? 0 : arm;
  base = Math.max(0, base ?? 0);
  // AP or printed halving (saves.js saveHalving).
  if (saveHalving(incoming?.row, incoming?.mods, y.traits).halves) base = Math.ceil(base / 2);
  // Cover's +3 is a Saving Roll MOD, not ARM: add it after AP halving. The
  // calculator saves on d20 <= PS + ARM, so this input is where the MOD goes.
  const templateIncoming = ignoresCoverOnSaves(incoming?.row);
  const coverSave = benefitsFromCover(y) && !templateIncoming ? COVER_SAVE_MOD : 0;
  const nanoSave = hasNanoscreen(y) ? COVER_SAVE_MOD : 0;
  const cover = Math.max(coverSave, nanoSave);
  return {
    [`arm${side}`]: clamp(LIMITS.arm, base + cover),
    [`bts${side}`]: clamp(LIMITS.bts, Math.max(0, p.bts ?? 0) + cover),
    [`critImmune${side}`]: hasImmunity(y.traits, 'Critical', incoming?.row),
  };
}

// Builds the partial calculator input object for both sides.
// `active` / `reactive` are results of resolveSelection() (or null).
export function deriveInputs({active, reactive, rangeCm}) {
  const inputs = {};
  const errors = [];
  const notes = [];
  // A side still waiting on its weapon: nothing to report, but not ready to apply.
  let incomplete = false;
  const a = active?.profile ? active : null;
  const b = reactive?.profile ? reactive : null;
  const usesTemplate = (x) => Boolean(x?.weapon?.row && isTemplate(x.weapon.row));
  const aTemplate = usesTemplate(a);
  const bTemplate = usesTemplate(b);
  // BS Attack (-X) MODs on each side's roll.
  const onA = opposingMod(b, a, false, 'Active', notes);
  const onB = opposingMod(a, b, true, 'Reactive', notes);

  if (a) {
    if (!a.weapon) {
      incomplete = true;
    } else if (a.weapon.pseudo === 'dodge') {
      Object.assign(inputs, dodgeInputs(a, 'A', onA));
      inputs.templateA = false;
    } else if (a.weapon.pseudo) {
      incomplete = true; // e.g. "No ARO" carried over; the active side needs a real choice
    } else if (attackStat(a.profile, a.weapon.row) <= 0) {
      errors.push('Active: this profile cannot make BS attacks; pick Dodge');
    } else {
      Object.assign(inputs, attackInputs(a, b, rangeCm, 'A', errors, notes, onA));
      inputs.templateA = aTemplate;
    }
    if (b?.weapon?.row) Object.assign(inputs, defenseInputs(a, b.weapon, 'A', a.weapon?.pseudo === 'dodge'));
    else if (b) Object.assign(inputs, defenseInputs(a, null, 'A'));
  }

  if (b) {
    if (!b.weapon) {
      incomplete = true;
    } else if (b.weapon.pseudo === 'dodge') {
      Object.assign(inputs, dodgeInputs(b, 'B', onB));
      inputs.templateB = false;
    } else if (b.weapon.pseudo === 'none') {
      inputs.burstB = 0;
      inputs.bonusBurstB = 0;
      inputs.shockB = false;
      inputs.templateB = false;
    } else if (attackStat(b.profile, b.weapon.row) <= 0) {
      errors.push('Reactive: this profile cannot make BS attacks; pick Dodge or No ARO');
    } else {
      Object.assign(inputs, attackInputs(b, a, rangeCm, 'B', errors, notes, onB));
      inputs.templateB = bTemplate;
      // A Direct Template on either side: nothing is opposed, each attack is its own roll.
      if (aTemplate || bTemplate) notes.push('Direct Template: no Face to Face Roll; each attack is rolled on its own');
    }
    if (a?.weapon?.row) Object.assign(inputs, defenseInputs(b, a.weapon, 'B', b.weapon?.pseudo === 'dodge'));
    else if (a) Object.assign(inputs, defenseInputs(b, null, 'B'));
  }

  if (a || b) inputs.fixedFaceToFace = false;
  // Things the result may get wrong; shown as alerts but don't block the calculation.
  const warnings = [];
  const unsupported = [...new Set([...unsupportedTraits(a), ...unsupportedTraits(b)])];
  if (unsupported.length > 0) warnings.push(`Support for ${unsupported.join(', ')} not implemented yet`);
  warnings.push(...approximationWarnings('Active', a, b), ...approximationWarnings('Reactive', b, a));
  if (isSpecOps(a) || isSpecOps(b)) warnings.push('Spec-Ops upgrades and SpecBall not supported yet');

  return {inputs, ok: errors.length === 0 && !incomplete && (a !== null || b !== null), errors, warnings, notes};
}
