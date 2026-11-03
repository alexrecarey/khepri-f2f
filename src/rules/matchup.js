// Matchup -> calculator params: applies the N5 rules to two resolved troopers
// (rules/trooper.js resolveSelection) and returns the engine input with the
// notes and warnings to show next to it.
// The roll itself is attack.js, evade.js and hit.js; this file decides which
// one each side makes and what the two sides do to each other's roll. Every
// helper returns what it found (inputs, lines, notes); this is the one place
// that puts the two sides' results together.
import {isNonLethal, stateCaused} from '../army/weapons.js';
import {attackStat, opposingMods, reaches} from './modifiers.js';
import {SIDES, other} from '../lib/side.js';
import {compact, line, note, section} from './lines.js';
import {visibility, zoneName} from './visibility.js';
import {rangeOf} from './ranges.js';
import {hasNoEffect, noEffectBy} from './saves.js';
import {isSpecOps} from './trooper.js';
import {isCcAttack} from './closeCombat.js';
import {msg} from '../i18n/message.js';
import {attackInputs, ccAttackInputs} from './attack.js';
import {evadeInputs, noLofInputs} from './evade.js';
import {defenseInputs} from './hit.js';

/** @typedef {import('../types.js').Side} Side */
/** @typedef {import('../types.js').Ctx} Ctx */
/** @typedef {import('../types.js').Trooper} Trooper */
/** @typedef {import('../types.js').Attacker} Attacker */
/** @typedef {import('../types.js').Line} Line */
/** @typedef {import('../types.js').Message} Message */
/** @typedef {import('../types.js').Params} Params */
/** @typedef {import('../types.js').Evader} Evader */
/** @typedef {import('../types.js').Roll} Roll */
/** @typedef {import('../types.js').SideLines} SideLines */

// The Immunities the rules here read, and Immunities to States the calculator
// doesn't model (E/M's IMM-B and Isolated, Possession): recognized, and
// correctly change nothing here, since a hit is scored the same and only the
// State afterwards differs. A weapon that only Isolates (Jammer) is the
// exception: Immunity (Isolated) or Warhorse leaves it without effect
// (saves.js noEffectBy).
// scripts/army-validate.mjs fails on any other Immunity in the army data.
export const MODELED_IMMUNITIES = ['AP', 'ARM', 'BTS', 'Continuous Damage', 'Critical', 'Enhanced', 'Shock'];
export const STATE_IMMUNITIES = ['IMM-B', 'Isolated', 'POS'];

// Things the result may get wrong with this side's weapon; shown as alerts
// but they don't block the calculation.
/**
 * @param {Side} s
 * @param {Trooper | null} side
 * @param {Trooper | null} target
 * @returns {Message[]}
 */
function approximationWarnings(s, side, target) {
  const row = side?.weapon?.row;
  // hasNoEffect read the target's traits: it is there.
  const weapon = !row ? null
    : hasNoEffect(target?.traits, row) ? note(s, 'warning.noEffect', {weapon: row.name, by: noEffectBy(/** @type {Trooper} */ (target).traits, row)})
      // Not a warning: the results say Isolated / Stunned (rules/woundStates.js).
      : stateCaused(row) ? null
        : isNonLethal(row) ? note(s, 'warning.nonLethal', {weapon: row.name})
          : null;
  return compact([
    weapon,
    ...(side?.unsupportedUpgradeWeapons ?? []).map((name) => note(s, 'warning.upgradeWeapon', {weapon: name})),
  ]);
}

// The MODs y's skills put on x's Face to Face Roll (modifiers.js
// opposingMods), one line each in y's colour; one x ignores is struck with the
// reason, and noted. Nothing when y has no line of fire (it doesn't attack).
/**
 * @param {Trooper | null} y
 * @param {Trooper | null} x
 * @param {Side} s
 * @param {import('../types.js').Visibility} vis
 * @returns {{lines: Line[], notes: Message[]}}
 */
function opposingLines(y, x, s, vis) {
  const o = other(s);
  if (vis[o].blocked) return {lines: [], notes: []};
  const lines = opposingMods(y, x, o === 'A').map((m) => line(m.value, m.label, o, m.ignoredBy));
  return {lines, notes: compact(lines.map((l) => l.struck && note(s, 'note.ignoresMod', {by: l.struck, mod: l.label})))};
}

// The roll x makes against y (an attack, a Dodge or a Reset), picked by its
// weapon's kind, or why there is none yet: `incomplete` while x waits on its
// weapon, `error` when x can't make the roll it picked.
/**
 * @param {Trooper} x
 * @param {Trooper | null} y
 * @param {Side} s
 * @param {Ctx} ctx
 * @returns {{roll: Roll} | {incomplete: true} | {error: Message}}
 */
function sideRoll(x, y, s, ctx) {
  const {vis} = ctx;
  const w = x.weapon;
  const active = s === 'A';
  // The branches below pick the roll by w's kind, so each cast of x says
  // what w is.
  if (!w) return {incomplete: true};
  if (w.kind === 'dodge' || w.kind === 'reset') {
    return {roll: evadeInputs(/** @type {Evader} */ (x), y, s, vis[other(s)].blocked ? null : y?.weapon, ctx)};
  }
  if (w.kind === 'none') {
    // No ARO exists only on the reactive side: no roll, no template. On the
    // active side it is a leftover (carried over by a swap; swapSides already
    // drops it), so the setup is not complete until a real choice is made.
    return active ? {incomplete: true} : {roll: {inputs: noLofInputs(s), lines: {kind: 'none'}}};
  }
  if (attackStat(x.profile, w.row) <= 0) {
    // The error names the roll: an Attack in the Active Turn, an ARO otherwise.
    const key = isCcAttack(x) ? 'error.noCcAttack' : 'error.noBsAttack';
    return {error: note(s, active ? key : `${key}Aro`)};
  }
  if (isCcAttack(x)) return {roll: ccAttackInputs(/** @type {Attacker} */ (x), y, s, ctx)};
  if (vis[s].blocked) return {roll: {inputs: noLofInputs(s), lines: {kind: 'none', blockedZone: vis[s].blocked}}};
  if (y && !reaches(x, y)) {
    return {roll: {
      inputs: noLofInputs(s),
      lines: {kind: 'none', reason: msg('ledger.cantTarget', {program: w.row.name})},
      notes: [note(s, 'note.cantTarget', {program: w.row.name})],
    }};
  }
  const roll = attackInputs(/** @type {Attacker} */ (x), y, rangeOf(s, ctx.rangeCm, ctx.rangeCmB), s, ctx);
  return {roll: {...roll, inputs: {...roll.inputs, [`template${s}`]: w.kind === 'template'}}};
}

// One side's share of the calculator input: x's roll against y (sideRoll)
// and x's Saving Roll against y's weapon (hit.js defenseInputs). `lines`:
// what x's roll is built from (null while it has none to show); `ps` its
// hits' PS lines and `arm` its Saving Roll's lines, the two halves of a save.
/**
 * @param {Trooper} x
 * @param {Trooper | null} y
 * @param {Side} s
 * @param {Ctx} ctx
 */
function sideInputs(x, y, s, ctx) {
  const r = sideRoll(x, y, s, ctx);
  const roll = 'roll' in r ? r.roll : null;
  const defense = y ? defenseInputs(x, y.weapon?.row ? y.weapon : null, s, x.weapon?.kind === 'dodge') : null;
  return {
    inputs: {...roll?.inputs, ...defense?.inputs},
    incomplete: 'incomplete' in r,
    error: 'error' in r ? r.error : null,
    lines: roll?.lines ?? null,
    ps: roll?.ps ?? null,
    arm: defense?.lines ?? null,
    notes: roll?.notes ?? [],
  };
}

/**
 * Builds the partial calculator input object for both sides.
 * `active` / `reactive` are results of resolveSelection() (or null).
 * rangeCm is the distance both shoot at, unless the reactive shoots at its own
 * rangeCmB (a split range: it answers from somewhere else on the table).
 * Notes, warnings and errors are message descriptors (i18n/message.js), as
 * is every label, reason and note in the lines: the view renders them in the
 * player's language (ledger.js renderDerived), so a language change
 * re-derives nothing. `lines[side]` is what the side's roll is built from,
 * for "How the dice were built" (ledger.js), or null while the side has
 * nothing to roll with.
 * @param {{active: import('../types.js').ResolvedSide | null, reactive: import('../types.js').ResolvedSide | null,
 *   rangeCm: number, rangeCmB?: number | null, zones?: Partial<import('../types.js').Zones> | null}} matchup no rangeCmB: one distance; no zones: none
 * @returns {import('../types.js').Derived}
 */
export function deriveInputs({active, reactive, rangeCm, rangeCmB, zones}) {
  // A side with a profile is a Trooper (types.js).
  const a = /** @type {Trooper | null} */ (active?.profile ? active : null);
  const b = /** @type {Trooper | null} */ (reactive?.profile ? reactive : null);
  // Smoke / White Noise between them. A side with no line of fire doesn't
  // attack, so its skills put no MODs on the other side's roll.
  const vis = visibility(a, b, zones);
  const opposing = {A: opposingLines(b, a, 'A', vis), B: opposingLines(a, b, 'B', vis)};
  /** @type {Ctx} */
  const ctx = {vis, rangeCm, rangeCmB, opposing: {A: opposing.A.lines, B: opposing.B.lines}};
  const sides = {A: a ? sideInputs(a, b, 'A', ctx) : null, B: b ? sideInputs(b, a, 'B', ctx) : null};
  // The save the target makes against a side's hits: the side's PS, then
  // the target's ARM (or BTS / PH) against that weapon, from the other pass.
  // PS lines come from a roll, so the side has lines.
  /** @param {Side} s */
  const sideLines = (s) => {
    const l = sides[s]?.lines ?? null;
    const ps = sides[s]?.ps;
    return l && ps ? {...l, save: section([...ps, ...(sides[other(s)]?.arm ?? [])])} : l;
  };
  const lines = {A: sideLines('A'), B: sideLines('B')};
  const errors = compact(SIDES.map((s) => sides[s]?.error));
  // A side still waiting on its weapon: nothing to report, but not ready to apply.
  const incomplete = SIDES.some((s) => sides[s]?.incomplete);
  const notes = [
    ...opposing.A.notes,
    ...opposing.B.notes,
    ...compact(SIDES.map((s) => vis[s].blocked && note(s, 'note.noLof', {zone: zoneName(/** @type {import('../types.js').Zone} */ (vis[s].blocked))}))),
    ...(sides.A?.notes ?? []),
    ...(sides.B?.notes ?? []),
    // A Direct Template on either side: nothing is opposed, each attack is its
    // own roll. Said whatever the other side does, a Dodge, a Reset or No ARO
    // included (Alex, 2026-10-23); a template a zone blocks rolls nothing
    // (lines.kind 'none'), so it says nothing.
    ...(SIDES.some((s) => lines[s]?.kind === 'template') ? [note(null, 'note.directTemplate')] : []),
  ];
  const warnings = [
    ...approximationWarnings('A', a, b),
    ...approximationWarnings('B', b, a),
    ...(isSpecOps(a) || isSpecOps(b) ? [note(null, 'warning.specOps')] : []),
  ];
  /** @type {Partial<Params>} */
  const inputs = {...sides.A?.inputs, ...sides.B?.inputs, ...((a || b) && {fixedFaceToFace: false})};
  return {inputs, ok: errors.length === 0 && !incomplete && (a !== null || b !== null), errors, warnings, notes, lines};
}
