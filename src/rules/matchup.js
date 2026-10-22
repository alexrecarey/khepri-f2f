// Matchup -> calculator params: applies the N5 rules to two resolved troopers
// (rules/trooper.js resolveSelection) and returns the engine input with the
// notes and warnings to show next to it.
import {ZERO_PAIN, isHackingProgram} from '../army/hacking.js';
import {SKILL} from '../army/ids.js';
import {hasEquip, hasSkill} from '../army/traits.js';
import {causesWounds, hasContinuousDamage, isCommsAttack, isNonLethal, isTemplate, needsLof, stateCaused, weaponPS} from '../army/weapons.js';
import {
  COVER_SAVE_MOD, FIREWALL_SAVE_MOD, LIMITS, albedoMod, attackBonuses, attackStat, benefitsFromCover, capMods, clamp, coverBsMod, dodgeExtras,
  bangbombMod, dodgeSuccessValue, evades, fireteamBonuses, firewallOf, hasNanoscreen, ignoresCoverOnSaves, keepsAroBurst, mimetismMod,
  hackedResetMod, immADodgeMod, neurocineticsAroBurst, opposingMods, programSvMods, reaches, resetSuccessValue, targetedMod, targetedResetMod,
} from './modifiers.js';
import {rangeModFor} from './ranges.js';
import {visibility, zoneName} from './visibility.js';
import {
  calcAmmo, hasImmunity, hasNoEffect, immunityAgainst, immunityFor, immunityNote, noEffectBy, saveHalving, shockApplies, vulnerabilityTo,
} from './saves.js';
import {isSpecOps} from './trooper.js';
import {ccAttackMods, ccBurst, ccSd, isCcAttack} from './closeCombat.js';
import {tEn} from '../i18n/index.js';

// The Immunities the rules here read, and Immunities to States the calculator
// doesn't model (E/M's IMM-B and Isolated, Possession): recognized, and
// correctly change nothing here, since a hit is scored the same and only the
// State afterwards differs. A weapon that only Isolates (Jammer) is the
// exception: Immunity (Isolated) or Warhorse leaves it without effect
// (saves.js noEffectBy).
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

function approximationWarnings(s, side, target, say) {
  const row = side?.weapon?.row;
  if (row && hasNoEffect(target?.traits, row)) {
    say(s, 'warning.noEffect', {weapon: row.name, by: noEffectBy(target.traits, row, say.t)});
  } else if (row && stateCaused(row)) {
    // Not a warning: the results say Isolated / Stunned (rules/woundStates.js).
  } else if (row && isNonLethal(row)) {
    say(s, 'warning.nonLethal', {weapon: row.name});
  }
  for (const name of side?.unsupportedUpgradeWeapons ?? []) say(s, 'warning.upgradeWeapon', {weapon: name});
}

const signed = (n) => `${n > 0 ? '+' : ''}${n}`;

// The MODs x puts on y's Face to Face Roll (modifiers.js opposingMods), with
// a note for each one y ignores.
function opposingMod(x, y, xActive, ySide, say) {
  let total = 0;
  for (const m of opposingMods(x, y, xActive, say.t)) {
    if (m.ignoredBy) say(ySide, 'note.ignoresMod', {by: m.ignoredBy, mod: m.label});
    else total += m.value;
  }
  return total;
}

const total = (lines) => lines.reduce((t, l) => t + l.value, 0);

function attackInputs(x, y, rangeCm, side, say, opposing = 0, visMod = 0) {
  const {row, mods} = x.weapon;
  let rangeMod = rangeModFor(row, rangeCm, x.traits);
  // Out of range: the attack still happens but always fails. A success value
  // of 0 misses on every roll, with no crit.
  const outOfRange = rangeMod === null;
  if (outOfRange) rangeMod = 0;
  // Mimetism and Albedo need LoF (a Jammer or a program has none); a Comms
  // Attack takes the target's Firewall in place of cover.
  const lof = needsLof(row);
  const mim = y && lof ? mimetismMod(y.traits, x.traits) : 0;
  const albedo = y && lof ? albedoMod(y.traits, x.traits) : 0;
  const cover = y ? coverBsMod(y, x.traits, row) : 0;
  const firewall = y && isCommsAttack(row) ? firewallOf(y) : 0;
  const program = total(programSvMods(x, y, say.t));
  const bonus = attackBonuses(x);
  // Every MOD counts toward the cap, Fireteam +1 BS included (Alex, 2026-10-10).
  const modSum = bonus.bs + rangeMod + mim + albedo + cover + firewall + program + targetedMod(x, y) + mods.sv + opposing + visMod;
  const modTotal = capMods(modSum);
  if (!outOfRange && modTotal !== modSum) say(side, 'note.modCap', {sum: signed(modSum), cap: signed(modTotal)});
  const sv = outOfRange
    ? 0
    : clamp(LIMITS.successValue, attackStat(x.profile, row) + modTotal);

  // Neurocinetics is for BS Attacks: a program keeps its Burst.
  const neuro = !isHackingProgram(row);
  let burst = (row.burst ?? 1) + bonus.burst;
  if (side === 'B' && !keepsAroBurst(x)) burst = 1;
  if (side === 'B' && neuro) burst += neurocineticsAroBurst(x.traits);
  // Neurocinetics: B 1 in the Active Turn, Burst MODs included (wiki).
  if (side === 'A' && neuro && hasSkill(x.traits, SKILL.NEUROCINETICS)) {
    burst = 1;
    say(side, 'note.neurocinetics');
  }
  return {
    [`successValue${side}`]: sv,
    [`burst${side}`]: clamp(LIMITS.burst, burst),
    [`bonusBurst${side}`]: clamp(LIMITS.bonusBurst, bonus.sd),
    ...hitInputs(x, y, side, say),
  };
}

// A CC Attack (closeCombat.js): CC plus its own MODs and the opponent's,
// capped; no range, cover, Mimetism or Smoke. Burst and Special Dice from
// the weapon and Martial Arts.
function ccAttackInputs(x, y, side, say, opposing = 0) {
  const modSum = total(ccAttackMods(x, side === 'A')) + opposing;
  const modTotal = capMods(modSum);
  if (modTotal !== modSum) say(side, 'note.modCap', {sum: signed(modSum), cap: signed(modTotal)});
  return {
    [`successValue${side}`]: clamp(LIMITS.successValue, attackStat(x.profile, x.weapon.row) + modTotal),
    [`burst${side}`]: clamp(LIMITS.burst, total(ccBurst(x, side === 'A', y))),
    [`bonusBurst${side}`]: clamp(LIMITS.bonusBurst, total(ccSd(x))),
    [`template${side}`]: false,
    ...hitInputs(x, y, side, say),
  };
}

// What x's hits do to y: PS, ammunition, Continuous Damage, Shock, with the
// notes on Immunity and Vulnerability. The same for a shot and a CC Attack.
function hitInputs(x, y, side, say) {
  const {t} = say;
  const {row, mods} = x.weapon;
  const noEffect = hasNoEffect(y?.traits, row);
  const immunity = immunityAgainst(y?.traits, row);
  // Immunity (Continuous Damage): the Trait is ignored, the hit is not.
  const contImmune = hasImmunity(y?.traits, 'Continuous Damage', row);
  const out = {
    [`damage${side}`]: clamp(LIMITS.damage, weaponPS(row, mods)),
    [`ammo${side}`]: noEffect ? 'NONE' : calcAmmo(row, y?.traits),
    [`cont${side}`]: !immunity && !contImmune && hasContinuousDamage(row, mods),
    [`shock${side}`]: shockApplies(row, y),
  };
  if (out[`shock${side}`]) say(side, 'note.shock');
  const state = stateCaused(row);
  if (state && !noEffect) say(side, 'note.stateCaused', {weapon: row.name, state: t(`state.${state.toLowerCase()}`)});
  // State-only weapons get a warning instead (no effect), or play as always (Stunned).
  if (!immunity && contImmune && hasContinuousDamage(row, mods)) {
    say(side, 'note.contImmune');
  }
  const note = immunity && causesWounds(row) && immunityNote(immunity, row, mods, t);
  if (note) say(side, 'note.text', {text: note});
  const vulnerable = vulnerabilityTo(y?.traits, row);
  const lost = vulnerable && immunityFor(y.traits, row);
  if (lost) say(side, 'note.vulnerability', {vulnerable: t.term('extras', vulnerable), immunity: t.term('extras', lost)});
  return out;
}

// A Dodge: one PH roll (Dodge MODs, Bangbomb, IMM-A and the Fireteam's +1 included,
// Dodge (+1SD) as Special Dice) that causes no Saving Rolls. `incoming`: the
// weapon being Dodged, if any.
function dodgeInputs(x, side, opposing = 0, incoming = null) {
  return {
    [`ammo${side}`]: 'DODGE',
    [`burst${side}`]: 1,
    [`bonusBurst${side}`]: clamp(LIMITS.bonusBurst, dodgeExtras(x.traits).sd),
    [`successValue${side}`]: dodgeSuccessValue(x.profile, x.traits, fireteamBonuses(x.ftSize).dodge + bangbombMod(x, incoming) + immADodgeMod(x) + opposing),
    [`cont${side}`]: false,
    [`shock${side}`]: false,
  };
}

// A Reset: one WIP roll against a Comms Attack (the opponent's BS Attack
// (-X), Surprise Attack, Targeted and the Hacked chip included) that causes no Saving
// Rolls, like a Dodge. Zero Pain: two WIP rolls, in either turn.
function resetInputs(x, side, opposing = 0) {
  return {
    [`ammo${side}`]: 'DODGE',
    [`burst${side}`]: x.weapon.zeroPain ? ZERO_PAIN.burst : 1,
    [`bonusBurst${side}`]: 0,
    [`successValue${side}`]: resetSuccessValue(x.profile, targetedResetMod(x) + hackedResetMod(x) + opposing),
    [`cont${side}`]: false,
    [`shock${side}`]: false,
    [`template${side}`]: false,
  };
}

// A Dodge or Reset that can't evade the attack it faces (modifiers.js
// evades) isn't rolled against it: the attack is a Normal Roll.
function evadeInputs(x, side, opposing, incoming, say) {
  if (!evades(x, incoming)) {
    say(side, x.weapon.pseudo === 'reset' ? 'note.resetOnlyComms' : 'note.dodgeNotComms', {weapon: incoming.row.name});
    return noLofInputs(side);
  }
  if (x.weapon.pseudo === 'reset') return resetInputs(x, side, opposing);
  return {...dodgeInputs(x, side, opposing, incoming), [`template${side}`]: false};
}

// `dodging`: y Dodges this attack, so Dodge (ARM +3) adds to its ARM.
function defenseInputs(y, incoming, side, dodging = false) {
  const p = y.profile;
  const save = incoming?.row?.save ?? {attr: 'ARM'};
  // Immune: the Attribute is rolled as printed, no ARM=0 and no AP halving.
  const immune = Boolean(immunityAgainst(y.traits, incoming?.row));
  const arm = (p.arm ?? 0) + (dodging ? dodgeExtras(y.traits).arm : 0);
  // PARA: a PH roll at the weapon's MOD (PH-6), with PS 0 (weaponPS).
  let base = save.attr === 'PH' ? (p.ph ?? 0) + (save.mod ?? 0)
    : save.attr === 'BTS' ? p.bts : save.armZero && !immune ? 0 : arm;
  base = Math.max(0, base ?? 0);
  // AP or printed halving (saves.js saveHalving).
  if (saveHalving(incoming?.row, incoming?.mods, y.traits).halves) base = Math.ceil(base / 2);
  // Cover's +3 is a Saving Roll MOD, not ARM: add it after AP halving. The
  // calculator saves on d20 <= PS + ARM, so this input is where the MOD goes.
  // Cover and Nanoscreen are against BS Attacks: nothing against a CC Attack.
  // A Comms Attack: Firewall's +3 instead, cover and Nanoscreen do nothing.
  const templateIncoming = ignoresCoverOnSaves(incoming?.row);
  const ccIncoming = Boolean(incoming?.cc);
  const comms = isCommsAttack(incoming?.row);
  const coverSave = benefitsFromCover(y) && !templateIncoming && !ccIncoming && !comms ? COVER_SAVE_MOD : 0;
  const nanoSave = hasNanoscreen(y) && !ccIncoming && !comms ? COVER_SAVE_MOD : 0;
  const firewallSave = comms && firewallOf(y) ? FIREWALL_SAVE_MOD : 0;
  const cover = Math.max(coverSave, nanoSave, firewallSave);
  return {
    [`arm${side}`]: clamp(LIMITS.arm, base + cover),
    [`bts${side}`]: clamp(LIMITS.bts, Math.max(0, p.bts ?? 0) + cover),
    [`critImmune${side}`]: hasImmunity(y.traits, 'Critical', incoming?.row),
  };
}

// No LoF through Smoke / White Noise, or a program the target isn't a valid
// target for: the side's attack never happens, so it rolls nothing (like No ARO).
function noLofInputs(side) {
  return {[`burst${side}`]: 0, [`bonusBurst${side}`]: 0, [`shock${side}`]: false, [`template${side}`]: false};
}

// Builds the partial calculator input object for both sides.
// `active` / `reactive` are results of resolveSelection() (or null).
// rangeCm is the distance both shoot at, unless the reactive shoots at its own
// rangeCmB (a split range: it answers from somewhere else on the table).
// t: the language of the notes, warnings and errors (src/i18n).
export function deriveInputs({active, reactive, rangeCm, rangeCmB, zones, t = tEn}) {
  const rangeB = rangeCmB ?? rangeCm;
  const inputs = {};
  const errors = [];
  const notes = [];
  const warnings = [];
  // say(side, key, params) adds a note, "Active: ..."; side null for both.
  const sayTo = (list) => (side, key, params) =>
    list.push(side ? t('note.side', {side: t(side === 'A' ? 'side.active' : 'side.reactive'), text: t(key, params)}) : t(key, params));
  const say = Object.assign(sayTo(notes), {t});
  const warn = Object.assign(sayTo(warnings), {t});
  // A side still waiting on its weapon: nothing to report, but not ready to apply.
  let incomplete = false;
  const a = active?.profile ? active : null;
  const b = reactive?.profile ? reactive : null;
  const usesTemplate = (x) => Boolean(x?.weapon?.row && isTemplate(x.weapon.row));
  const aTemplate = usesTemplate(a);
  const bTemplate = usesTemplate(b);
  // BS Attack (-X) MODs on each side's roll.
  // Smoke / White Noise between them. A side with no line of fire doesn't
  // attack, so its skills put no MODs on the other side's roll.
  const vis = visibility(a, b, zones, t);
  const onA = vis.B.blocked ? 0 : opposingMod(b, a, false, 'A', say);
  const onB = vis.A.blocked ? 0 : opposingMod(a, b, true, 'B', say);
  for (const s of ['A', 'B']) {
    if (vis[s].blocked) say(s, 'note.noLof', {zone: zoneName(vis[s].blocked, t)});
  }

  if (a) {
    if (!a.weapon) {
      incomplete = true;
    } else if (a.weapon.pseudo === 'dodge' || a.weapon.pseudo === 'reset') {
      Object.assign(inputs, evadeInputs(a, 'A', onA, vis.B.blocked ? null : b?.weapon, say));
    } else if (a.weapon.pseudo) {
      incomplete = true; // e.g. "No ARO" carried over; the active side needs a real choice
    } else if (attackStat(a.profile, a.weapon.row) <= 0) {
      sayTo(errors)('A', isCcAttack(a) ? 'error.noCcAttack' : 'error.noBsAttack');
    } else if (isCcAttack(a)) {
      Object.assign(inputs, ccAttackInputs(a, b, 'A', say, onA));
    } else if (vis.A.blocked) {
      Object.assign(inputs, noLofInputs('A'));
    } else if (b && !reaches(a, b)) {
      say('A', 'note.cantTarget', {program: a.weapon.row.name});
      Object.assign(inputs, noLofInputs('A'));
    } else {
      Object.assign(inputs, attackInputs(a, b, rangeCm, 'A', say, onA, vis.A.mod));
      inputs.templateA = aTemplate;
    }
    if (b?.weapon?.row) Object.assign(inputs, defenseInputs(a, b.weapon, 'A', a.weapon?.pseudo === 'dodge'));
    else if (b) Object.assign(inputs, defenseInputs(a, null, 'A'));
  }

  if (b) {
    if (!b.weapon) {
      incomplete = true;
    } else if (b.weapon.pseudo === 'dodge' || b.weapon.pseudo === 'reset') {
      Object.assign(inputs, evadeInputs(b, 'B', onB, vis.A.blocked ? null : a?.weapon, say));
    } else if (b.weapon.pseudo === 'none') {
      inputs.burstB = 0;
      inputs.bonusBurstB = 0;
      inputs.shockB = false;
      inputs.templateB = false;
    } else if (attackStat(b.profile, b.weapon.row) <= 0) {
      sayTo(errors)('B', isCcAttack(b) ? 'error.noCcAttackAro' : 'error.noBsAttackAro');
    } else if (isCcAttack(b)) {
      Object.assign(inputs, ccAttackInputs(b, a, 'B', say, onB));
    } else if (vis.B.blocked) {
      Object.assign(inputs, noLofInputs('B'));
    } else if (a && !reaches(b, a)) {
      say('B', 'note.cantTarget', {program: b.weapon.row.name});
      Object.assign(inputs, noLofInputs('B'));
    } else {
      Object.assign(inputs, attackInputs(b, a, rangeB, 'B', say, onB, vis.B.mod));
      inputs.templateB = bTemplate;
      // A Direct Template on either side: nothing is opposed, each attack is its own roll.
      if ((aTemplate || bTemplate) && !vis.A.blocked && !vis.B.blocked) say(null, 'note.directTemplate');
    }
    if (a?.weapon?.row) Object.assign(inputs, defenseInputs(b, a.weapon, 'B', b.weapon?.pseudo === 'dodge'));
    else if (a) Object.assign(inputs, defenseInputs(b, null, 'B'));
  }

  if (a || b) inputs.fixedFaceToFace = false;
  // Things the result may get wrong; shown as alerts but don't block the calculation.
  const unsupported = [...new Set([...unsupportedTraits(a), ...unsupportedTraits(b)])];
  if (unsupported.length > 0) warn(null, 'warning.unsupported', {names: unsupported.join(', ')});
  approximationWarnings('A', a, b, warn);
  approximationWarnings('B', b, a, warn);
  if (isSpecOps(a) || isSpecOps(b)) warn(null, 'warning.specOps');

  return {inputs, ok: errors.length === 0 && !incomplete && (a !== null || b !== null), errors, warnings, notes};
}
