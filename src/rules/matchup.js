// Matchup -> calculator params: applies the N5 rules to two resolved troopers
// (rules/trooper.js resolveSelection) and returns the engine input with the
// notes and warnings to show next to it.
import {EQUIP, SKILL} from '../army/ids.js';
import {hasEquip, hasSkill} from '../army/traits.js';
import {causesWounds, hasContinuousDamage, isNonLethal, isTemplate} from '../army/weapons.js';
import {
  LIMITS, albedoMod, attackBonuses, attackStat, benefitsFromCover, clamp, dodgeSuccessValue, fireteamBonuses,
  hasNanoscreen, ignoresCoverOnSaves, keepsAroBurst, mimetismMod,
} from './modifiers.js';
import {rangeModFor} from './ranges.js';
import {
  calcAmmo, hasImmunity, hasNoEffect, immunityAgainst, immunityFor, immunityNote, shockApplies, vulnerabilityTo,
} from './saves.js';
import {isSpecOps} from './trooper.js';

// Skills, equipment and Immunities the rules below take into account, for the
// matchup summary (matchup/labels.js).
export const MODELED_SKILLS = [SKILL.MIMETISM, SKILL.NO_COVER, SKILL.TOTAL_REACTION, SKILL.NEUROCINETICS, SKILL.VULNERABILITY];
export const MODELED_EQUIP = [EQUIP.NANOSCREEN, EQUIP.MSV1, EQUIP.MSV2, EQUIP.MSV3, EQUIP.X_VISOR, EQUIP.ALBEDO];
export const MODELED_IMMUNITIES = ['AP', 'ARM', 'BTS', 'Critical', 'Enhanced', 'Shock'];

// Traits that matter to the roll but aren't modelled yet: a warning.
const IGNORED = [
  ['skill', SKILL.LIMITED_COVER, 'Limited Cover'],
  ['skill', SKILL.SAPPER, 'Sapper'],
  ['skill', SKILL.SURPRISE_ATTACK, 'Surprise Attack'],
  ['skill', SKILL.MARKSMANSHIP, 'Marksmanship'],
  ['skill', SKILL.SIXTH_SENSE, 'Sixth Sense'],
];

// Names of traits on this side that the converter does not model yet.
function unsupportedTraits(side) {
  if (!side?.traits) return [];
  const found = IGNORED
    .filter(([kind, id]) => (kind === 'skill' ? hasSkill(side.traits, id) : hasEquip(side.traits, id)))
    .map(([, , name]) => name);
  if (fireteamBonuses(side.ftSize).sixthSense) found.push('Sixth Sense');
  return found;
}

function approximationWarnings(label, side, target) {
  const warnings = [];
  const row = side?.weapon?.row;
  if (row && hasNoEffect(target?.traits, row)) {
    warnings.push(`${label}: ${row.name} has no effect on a target with Immunity (${immunityAgainst(target.traits, row)}); not rolled`);
  } else if (row && isNonLethal(row)) {
    warnings.push(`${label}: ${row.name} is non-lethal; results shown as wounds`);
  }
  for (const name of side?.unsupportedUpgradeWeapons ?? []) {
    warnings.push(`${label}: ${name} (upgrade) not supported by the calculator`);
  }
  return warnings;
}

function attackInputs(x, y, rangeCm, side, errors, notes) {
  const label = side === 'A' ? 'Active' : 'Reactive';
  const {row, mods} = x.weapon;
  let rangeMod = rangeModFor(row, rangeCm, x.traits);
  // Out of range: the attack still happens but always fails. A success value
  // of 0 misses on every roll, with no crit.
  const outOfRange = rangeMod === null;
  if (outOfRange) rangeMod = 0;
  const mim = y ? mimetismMod(y.traits, x.traits) : 0;
  const albedo = y ? albedoMod(y.traits, x.traits) : 0;
  const cover = benefitsFromCover(y) || hasNanoscreen(y) ? -3 : 0;
  const bonus = attackBonuses(x);
  const sv = outOfRange
    ? 0
    : clamp(LIMITS.successValue, attackStat(x.profile, row) + rangeMod + mim + albedo + cover + mods.sv + bonus.bs);

  const noEffect = hasNoEffect(y?.traits, row);
  let burst = (row.burst ?? 1) + bonus.burst;
  if (side === 'B' && !keepsAroBurst(x)) burst = 1;
  if (noEffect) burst = 0;
  const immunity = immunityAgainst(y?.traits, row);
  const out = {
    [`successValue${side}`]: sv,
    [`burst${side}`]: clamp(LIMITS.burst, burst),
    [`bonusBurst${side}`]: noEffect ? 0 : clamp(LIMITS.bonusBurst, bonus.sd),
    [`damage${side}`]: clamp(LIMITS.damage, mods.ps ?? row.dmg),
    [`ammo${side}`]: calcAmmo(row, y?.traits),
    [`cont${side}`]: !immunity && hasContinuousDamage(row, mods),
    [`shock${side}`]: shockApplies(row, y),
  };
  if (out[`shock${side}`]) notes.push(`${label}: Shock against VITA 1; a failed save is Dead, counted as one extra wound`);
  // State-only weapons get a warning instead (no effect), or play as always (Stunned).
  const note = immunity && causesWounds(row) && immunityNote(immunity, row, mods);
  if (note) notes.push(`${label}: ${note}`);
  const vulnerable = vulnerabilityTo(y?.traits, row);
  const lost = vulnerable && immunityFor(y.traits, row);
  if (lost) notes.push(`${label}: target has Vulnerability (${vulnerable}); Immunity (${lost}) does not apply`);
  return out;
}

// A Dodge: one PH roll (Dodge MODs and the Fireteam's +1 included) that
// causes no Saving Rolls.
function dodgeInputs(x, side) {
  return {
    [`ammo${side}`]: 'DODGE',
    [`burst${side}`]: 1,
    [`bonusBurst${side}`]: 0,
    [`successValue${side}`]: dodgeSuccessValue(x.profile, x.traits, fireteamBonuses(x.ftSize).dodge),
    [`cont${side}`]: false,
    [`shock${side}`]: false,
  };
}

function defenseInputs(y, incoming, side) {
  const p = y.profile;
  const save = incoming?.row?.save ?? {attr: 'ARM'};
  // Immune: the Attribute is rolled as printed, no ARM=0 and no AP halving.
  const immune = Boolean(immunityAgainst(y.traits, incoming?.row));
  let base = save.attr === 'BTS' ? p.bts : save.armZero && !immune ? 0 : p.arm;
  base = Math.max(0, base ?? 0);
  const halve = Boolean(save.halved) || Boolean(incoming?.mods?.forceAP);
  const apImmune = immune || hasImmunity(y.traits, 'AP', incoming?.row);
  if (halve && !apImmune) base = Math.ceil(base / 2);
  // Cover's +3 is a Saving Roll MOD, not ARM: add it after AP halving. The
  // calculator saves on d20 <= PS + ARM, so this input is where the MOD goes.
  const templateIncoming = ignoresCoverOnSaves(incoming?.row);
  const coverSave = benefitsFromCover(y) && !templateIncoming ? 3 : 0;
  const nanoSave = hasNanoscreen(y) ? 3 : 0;
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
  // A template with no effect on its target forces no Dodge.
  const usesTemplate = (x, y) => Boolean(x?.weapon?.row && isTemplate(x.weapon.row) && !hasNoEffect(y?.traits, x.weapon.row));
  const aTemplate = usesTemplate(a, b);
  const bTemplate = usesTemplate(b, a);

  if (a) {
    if (!a.weapon) {
      incomplete = true;
    } else if (a.weapon.pseudo === 'dodge') {
      // The calculator only models templates against a dodging *reactive* trooper.
      if (bTemplate) errors.push('Active Dodge against a reactive template weapon is not supported');
      Object.assign(inputs, dodgeInputs(a, 'A'));
      inputs.dtwVsDodge = false;
    } else if (a.weapon.pseudo) {
      incomplete = true; // e.g. "No ARO" carried over; the active side needs a real choice
    } else if (attackStat(a.profile, a.weapon.row) <= 0) {
      errors.push('Active: this profile cannot make BS attacks; pick Dodge');
    } else {
      Object.assign(inputs, attackInputs(a, b, rangeCm, 'A', errors, notes));
      inputs.dtwVsDodge = aTemplate;
    }
    if (b?.weapon?.row) Object.assign(inputs, defenseInputs(a, b.weapon, 'A'));
    else if (b) Object.assign(inputs, defenseInputs(a, null, 'A'));
  }

  if (b) {
    if (!b.weapon) {
      incomplete = true;
    } else if (aTemplate || b.weapon.pseudo === 'dodge') {
      if (aTemplate && !b.weapon.pseudo) notes.push('Reactive: template weapon forces a Dodge');
      Object.assign(inputs, dodgeInputs(b, 'B'));
    } else if (b.weapon.pseudo === 'none') {
      inputs.burstB = 0;
      inputs.bonusBurstB = 0;
      inputs.shockB = false;
    } else if (attackStat(b.profile, b.weapon.row) <= 0) {
      errors.push('Reactive: this profile cannot make BS attacks; pick Dodge or No ARO');
    } else {
      Object.assign(inputs, attackInputs(b, a, rangeCm, 'B', errors, notes));
    }
    if (a?.weapon?.row) Object.assign(inputs, defenseInputs(b, a.weapon, 'B'));
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
