// Matchup -> calculator params: applies the N5 rules to two resolved troopers
// (rules/trooper.js resolveSelection) and returns the engine input with the
// notes and warnings to show next to it.
import {ZERO_PAIN} from '../army/hacking.js';
import {SKILL} from '../army/ids.js';
import {hasSkill} from '../army/traits.js';
import {causesWounds, hasContinuousDamage, isCommsAttack, isNonLethal, needsLof, stateCaused, weaponPS} from '../army/weapons.js';
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

// ctx: what one deriveInputs call shares with its helpers. `say(side, key,
// params)` adds a note ("Active: ..."; side null for both), `warn` a warning,
// `fail` an error; `t` is their language; `vis` the Smoke / White Noise
// blocks (visibility.js); `opposing[s]` the MOD the other side puts on s's roll.
function approximationWarnings(s, side, target, ctx) {
  const {warn, t} = ctx;
  const row = side?.weapon?.row;
  if (row && hasNoEffect(target?.traits, row)) {
    warn(s, 'warning.noEffect', {weapon: row.name, by: noEffectBy(target.traits, row, t)});
  } else if (row && stateCaused(row)) {
    // Not a warning: the results say Isolated / Stunned (rules/woundStates.js).
  } else if (row && isNonLethal(row)) {
    warn(s, 'warning.nonLethal', {weapon: row.name});
  }
  for (const name of side?.unsupportedUpgradeWeapons ?? []) warn(s, 'warning.upgradeWeapon', {weapon: name});
}

const signed = (n) => `${n > 0 ? '+' : ''}${n}`;

// The MODs x puts on y's Face to Face Roll (modifiers.js opposingMods), with
// a note for each one y ignores.
function opposingMod(x, y, xActive, ySide, ctx) {
  let total = 0;
  for (const m of opposingMods(x, y, xActive, ctx.t)) {
    if (m.ignoredBy) ctx.say(ySide, 'note.ignoresMod', {by: m.ignoredBy, mod: m.label});
    else total += m.value;
  }
  return total;
}

const total = (lines) => lines.reduce((t, l) => t + l.value, 0);

function attackInputs(x, y, rangeCm, side, ctx, opposing = 0, visMod = 0) {
  const {say} = ctx;
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
  const program = total(programSvMods(x, y, ctx.t));
  const bonus = attackBonuses(x);
  // Every MOD counts toward the cap, Fireteam +1 BS included (Alex, 2026-10-10).
  const modSum = bonus.bs + rangeMod + mim + albedo + cover + firewall + program + targetedMod(x, y) + mods.sv + opposing + visMod;
  const modTotal = capMods(modSum);
  if (!outOfRange && modTotal !== modSum) say(side, 'note.modCap', {sum: signed(modSum), cap: signed(modTotal)});
  const sv = outOfRange
    ? 0
    : clamp(LIMITS.successValue, attackStat(x.profile, row) + modTotal);

  // Neurocinetics is for BS Attacks: a program keeps its Burst.
  const neuro = x.weapon.kind !== 'program';
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
    ...hitInputs(x, y, side, ctx),
  };
}

// A CC Attack (closeCombat.js): CC plus its own MODs and the opponent's,
// capped; no range, cover, Mimetism or Smoke. Burst and Special Dice from
// the weapon and Martial Arts.
function ccAttackInputs(x, y, side, ctx, opposing = 0) {
  const modSum = total(ccAttackMods(x, side === 'A')) + opposing;
  const modTotal = capMods(modSum);
  if (modTotal !== modSum) ctx.say(side, 'note.modCap', {sum: signed(modSum), cap: signed(modTotal)});
  return {
    [`successValue${side}`]: clamp(LIMITS.successValue, attackStat(x.profile, x.weapon.row) + modTotal),
    [`burst${side}`]: clamp(LIMITS.burst, total(ccBurst(x, side === 'A', y))),
    [`bonusBurst${side}`]: clamp(LIMITS.bonusBurst, total(ccSd(x))),
    [`template${side}`]: false,
    ...hitInputs(x, y, side, ctx),
  };
}

// What x's hits do to y: PS, ammunition, Continuous Damage, Shock, with the
// notes on Immunity and Vulnerability. The same for a shot and a CC Attack.
function hitInputs(x, y, side, ctx) {
  const {say, t} = ctx;
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
function evadeInputs(x, side, opposing, incoming, ctx) {
  if (!evades(x, incoming)) {
    ctx.say(side, x.weapon.kind === 'reset' ? 'note.resetOnlyComms' : 'note.dodgeNotComms', {weapon: incoming.row.name});
    return noLofInputs(side);
  }
  if (x.weapon.kind === 'reset') return resetInputs(x, side, opposing);
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
  const ccIncoming = incoming?.kind === 'cc';
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

const other = (s) => (s === 'A' ? 'B' : 'A');

// One side's share of the calculator input: x's roll (an attack, a Dodge or a
// Reset) against y, and x's Saving Roll against y's weapon. Returns the
// inputs, whether x still waits on its weapon, and whether x shoots (rolls a
// ranged attack, as opposed to a CC Attack, an evasion, or nothing).
function sideInputs(x, y, s, ctx) {
  const {say, fail, vis} = ctx;
  const inputs = {};
  let incomplete = false;
  let shoots = false;
  const w = x.weapon;
  const active = s === 'A';
  if (!w) {
    incomplete = true;
  } else if (w.kind === 'dodge' || w.kind === 'reset') {
    Object.assign(inputs, evadeInputs(x, s, ctx.opposing[s], vis[other(s)].blocked ? null : y?.weapon, ctx));
  } else if (w.kind === 'none') {
    // No ARO exists only on the reactive side: no roll, no template. On the
    // active side it is a leftover (carried over by a swap; swapSides already
    // drops it), so the setup is not complete until a real choice is made.
    if (active) incomplete = true;
    else Object.assign(inputs, noLofInputs(s));
  } else if (attackStat(x.profile, w.row) <= 0) {
    // The error names the roll: an Attack in the Active Turn, an ARO otherwise.
    const key = isCcAttack(x) ? 'error.noCcAttack' : 'error.noBsAttack';
    fail(s, active ? key : `${key}Aro`);
  } else if (isCcAttack(x)) {
    Object.assign(inputs, ccAttackInputs(x, y, s, ctx, ctx.opposing[s]));
  } else if (vis[s].blocked) {
    Object.assign(inputs, noLofInputs(s));
  } else if (y && !reaches(x, y)) {
    say(s, 'note.cantTarget', {program: w.row.name});
    Object.assign(inputs, noLofInputs(s));
  } else {
    // Both shoot at rangeCm, unless the reactive answers from its own rangeCmB.
    const rangeCm = active ? ctx.rangeCm : ctx.rangeCmB ?? ctx.rangeCm;
    Object.assign(inputs, attackInputs(x, y, rangeCm, s, ctx, ctx.opposing[s], vis[s].mod));
    inputs[`template${s}`] = w.kind === 'template';
    shoots = true;
  }
  if (y?.weapon?.row) Object.assign(inputs, defenseInputs(x, y.weapon, s, w?.kind === 'dodge'));
  else if (y) Object.assign(inputs, defenseInputs(x, null, s));
  return {inputs, incomplete, shoots};
}

// Builds the partial calculator input object for both sides.
// `active` / `reactive` are results of resolveSelection() (or null).
// rangeCm is the distance both shoot at, unless the reactive shoots at its own
// rangeCmB (a split range: it answers from somewhere else on the table).
// t: the language of the notes, warnings and errors (src/i18n).
export function deriveInputs({active, reactive, rangeCm, rangeCmB, zones, t = tEn}) {
  const inputs = {};
  const errors = [];
  const notes = [];
  const warnings = [];
  // say(side, key, params) adds a note, "Active: ..."; side null for both.
  const sayTo = (list) => (side, key, params) =>
    list.push(side ? t('note.side', {side: t(side === 'A' ? 'side.active' : 'side.reactive'), text: t(key, params)}) : t(key, params));
  const a = active?.profile ? active : null;
  const b = reactive?.profile ? reactive : null;
  const x = {A: a, B: b};
  // BS Attack (-X) MODs on each side's roll.
  // Smoke / White Noise between them. A side with no line of fire doesn't
  // attack, so its skills put no MODs on the other side's roll.
  const vis = visibility(a, b, zones, t);
  const ctx = {t, say: sayTo(notes), warn: sayTo(warnings), fail: sayTo(errors), vis, rangeCm, rangeCmB, opposing: {}};
  ctx.opposing.A = vis.B.blocked ? 0 : opposingMod(b, a, false, 'A', ctx);
  ctx.opposing.B = vis.A.blocked ? 0 : opposingMod(a, b, true, 'B', ctx);
  for (const s of ['A', 'B']) {
    if (vis[s].blocked) ctx.say(s, 'note.noLof', {zone: zoneName(vis[s].blocked, t)});
  }

  // A side still waiting on its weapon: nothing to report, but not ready to apply.
  let incomplete = false;
  const shoots = {A: false, B: false};
  for (const s of ['A', 'B']) {
    if (!x[s]) continue;
    const r = sideInputs(x[s], x[other(s)], s, ctx);
    Object.assign(inputs, r.inputs);
    incomplete ||= r.incomplete;
    shoots[s] = r.shoots;
  }
  // A Direct Template on either side: nothing is opposed, each attack is its
  // own roll. Said when the reactive shoots (a Dodge against a template, or a
  // template against No ARO, says nothing).
  const usesTemplate = (s) => x[s]?.weapon?.kind === 'template';
  if (shoots.B && (usesTemplate('A') || usesTemplate('B')) && !vis.A.blocked && !vis.B.blocked) ctx.say(null, 'note.directTemplate');

  if (a || b) inputs.fixedFaceToFace = false;
  // Things the result may get wrong; shown as alerts but don't block the calculation.
  approximationWarnings('A', a, b, ctx);
  approximationWarnings('B', b, a, ctx);
  if (isSpecOps(a) || isSpecOps(b)) ctx.warn(null, 'warning.specOps');

  return {inputs, ok: errors.length === 0 && !incomplete && (a !== null || b !== null), errors, warnings, notes};
}
