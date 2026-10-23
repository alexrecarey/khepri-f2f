// Matchup -> calculator params: applies the N5 rules to two resolved troopers
// (rules/trooper.js resolveSelection) and returns the engine input with the
// notes and warnings to show next to it.
// The roll itself is attack.js, evade.js and hit.js; this file decides which
// one each side makes and what the two sides do to each other's roll.
import {isNonLethal, stateCaused} from '../army/weapons.js';
import {attackStat, opposingMods, reaches} from './modifiers.js';
import {other} from '../lib/side.js';
import {line, section} from './lines.js';
import {visibility, zoneName} from './visibility.js';
import {hasNoEffect, noEffectBy} from './saves.js';
import {isSpecOps} from './trooper.js';
import {isCcAttack} from './closeCombat.js';
import {msg, side as about} from '../i18n/message.js';
import {attackInputs, ccAttackInputs} from './attack.js';
import {evadeInputs, noLofInputs} from './evade.js';
import {defenseInputs} from './hit.js';

/** @typedef {import('../types.js').Side} Side */
/** @typedef {import('../types.js').Ctx} Ctx */
/** @typedef {import('../types.js').Trooper} Trooper */
/** @typedef {import('../types.js').Attacker} Attacker */
/** @typedef {import('../types.js').Line} Line */
/** @typedef {import('../types.js').Params} Params */
/** @typedef {import('../types.js').Evader} Evader */
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

/**
 * @param {Side} s
 * @param {Trooper | null} side
 * @param {Trooper | null} target
 * @param {Ctx} ctx
 */
function approximationWarnings(s, side, target, ctx) {
  const {warn} = ctx;
  const row = side?.weapon?.row;
  if (row && hasNoEffect(target?.traits, row)) {
    // hasNoEffect read the target's traits: it is there.
    warn(s, 'warning.noEffect', {weapon: row.name, by: noEffectBy(/** @type {Trooper} */ (target).traits, row)});
  } else if (row && stateCaused(row)) {
    // Not a warning: the results say Isolated / Stunned (rules/woundStates.js).
  } else if (row && isNonLethal(row)) {
    warn(s, 'warning.nonLethal', {weapon: row.name});
  }
  for (const name of side?.unsupportedUpgradeWeapons ?? []) warn(s, 'warning.upgradeWeapon', {weapon: name});
}

// The MODs y's skills put on x's Face to Face Roll (modifiers.js
// opposingMods), one line each in y's colour; one x ignores is struck with the
// reason, and noted. Nothing when y has no line of fire (it doesn't attack).
/**
 * @param {Trooper | null} y
 * @param {Trooper | null} x
 * @param {Side} s
 * @param {Ctx} ctx
 * @returns {Line[]}
 */
function opposingLines(y, x, s, ctx) {
  const o = other(s);
  if (ctx.vis[o].blocked) return [];
  const lines = opposingMods(y, x, o === 'A').map((m) => line(m.value, m.label, o, m.ignoredBy));
  for (const l of lines) if (l.struck) ctx.say(s, 'note.ignoresMod', {by: l.struck, mod: l.label});
  return lines;
}

// ctx: what one deriveInputs call shares with its helpers (attack.js, hit.js,
// evade.js). `say(side, key, params)` adds a note ("Active: ..."; side null
// for both), `warn` a warning, `fail` an error, each a message descriptor
// (i18n/message.js) the view renders in the player's language; `vis` the
// Smoke / White Noise blocks (visibility.js); `opposing[s]` the lines the
// other side puts on s's roll; `rangeCm`, `rangeCmB` the distances.
// One side's share of the calculator input: x's roll (an attack, a Dodge or a
// Reset) against y, and x's Saving Roll against y's weapon. Returns the
// inputs, whether x still waits on its weapon, the lines its roll is built
// from (null when it has none to show), its hits' PS lines and its Saving
// Roll's lines (`ps`, `arm`: the two halves of a save).
/**
 * @param {Trooper} x
 * @param {Trooper | null} y
 * @param {Side} s
 * @param {Ctx} ctx
 */
function sideInputs(x, y, s, ctx) {
  const {say, fail, vis} = ctx;
  /** @type {Partial<Params>} */
  const inputs = {};
  /** @type {SideLines | null} */
  let lines = null;
  /** @type {Line[] | null} */
  let ps = null;
  /** @type {Line[] | null} */
  let arm = null;
  let incomplete = false;
  const w = x.weapon;
  const active = s === 'A';
  // The branches below pick the roll by w's kind, so each cast of x says
  // what w is.
  /** @param {import('../types.js').Roll} r */
  const roll = (r) => {
    Object.assign(inputs, r.inputs);
    lines = r.lines;
    ps = r.ps ?? null;
  };
  if (!w) {
    incomplete = true;
  } else if (w.kind === 'dodge' || w.kind === 'reset') {
    roll(evadeInputs(/** @type {Evader} */ (x), y, s, vis[other(s)].blocked ? null : y?.weapon, ctx));
  } else if (w.kind === 'none') {
    // No ARO exists only on the reactive side: no roll, no template. On the
    // active side it is a leftover (carried over by a swap; swapSides already
    // drops it), so the setup is not complete until a real choice is made.
    if (active) incomplete = true;
    else roll({inputs: noLofInputs(s), lines: {kind: 'none'}});
  } else if (attackStat(x.profile, w.row) <= 0) {
    // The error names the roll: an Attack in the Active Turn, an ARO otherwise.
    const key = isCcAttack(x) ? 'error.noCcAttack' : 'error.noBsAttack';
    fail(s, active ? key : `${key}Aro`);
  } else if (isCcAttack(x)) {
    roll(ccAttackInputs(/** @type {Attacker} */ (x), y, s, ctx));
  } else if (vis[s].blocked) {
    roll({inputs: noLofInputs(s), lines: {kind: 'none', blockedZone: vis[s].blocked}});
  } else if (y && !reaches(x, y)) {
    say(s, 'note.cantTarget', {program: w.row.name});
    roll({inputs: noLofInputs(s), lines: {kind: 'none', reason: msg('ledger.cantTarget', {program: w.row.name})}});
  } else {
    // Both shoot at rangeCm, unless the reactive answers from its own rangeCmB.
    const rangeCm = active ? ctx.rangeCm : ctx.rangeCmB ?? ctx.rangeCm;
    roll(attackInputs(/** @type {Attacker} */ (x), y, rangeCm, s, ctx));
    inputs[`template${s}`] = w.kind === 'template';
  }
  if (y) {
    const d = defenseInputs(x, y.weapon?.row ? y.weapon : null, s, w?.kind === 'dodge', ctx);
    Object.assign(inputs, d.inputs);
    arm = d.lines;
  }
  return {inputs, incomplete, lines, ps, arm};
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
 *   rangeCm: number, rangeCmB: number | null, zones: import('../types.js').Zones}} matchup
 * @returns {import('../types.js').Derived}
 */
export function deriveInputs({active, reactive, rangeCm, rangeCmB, zones}) {
  /** @type {Partial<Params>} */
  const inputs = {};
  /** @type {import('../types.js').Message[]} */
  const errors = [];
  /** @type {import('../types.js').Message[]} */
  const notes = [];
  /** @type {import('../types.js').Message[]} */
  const warnings = [];
  /**
   * say(side, key, params) adds a note, "Active: ..."; side null for both.
   * @param {import('../types.js').Message[]} into
   * @returns {import('../types.js').Say}
   */
  const sayTo = (into) => (side, key, params) => into.push(about(side, msg(key, params)));
  // A side with a profile is a Trooper (types.js).
  const a = /** @type {Trooper | null} */ (active?.profile ? active : null);
  const b = /** @type {Trooper | null} */ (reactive?.profile ? reactive : null);
  const x = {A: a, B: b};
  // BS Attack (-X) MODs on each side's roll.
  // Smoke / White Noise between them. A side with no line of fire doesn't
  // attack, so its skills put no MODs on the other side's roll.
  const vis = visibility(a, b, zones);
  // opposing: filled for both sides just below.
  /** @type {Ctx} */
  const ctx = {say: sayTo(notes), warn: sayTo(warnings), fail: sayTo(errors), vis, rangeCm, rangeCmB, opposing: /** @type {Ctx['opposing']} */ ({})};
  ctx.opposing.A = opposingLines(b, a, 'A', ctx);
  ctx.opposing.B = opposingLines(a, b, 'B', ctx);
  for (const s of /** @type {Side[]} */ (['A', 'B'])) {
    if (vis[s].blocked) ctx.say(s, 'note.noLof', {zone: zoneName(/** @type {import('../types.js').Zone} */ (vis[s].blocked))});
  }

  // A side still waiting on its weapon: nothing to report, but not ready to apply.
  let incomplete = false;
  /** @type {{A: SideLines | null, B: SideLines | null}} */
  const lines = {A: null, B: null};
  /** @type {{A?: Line[] | null, B?: Line[] | null}} */
  const ps = {};
  /** @type {{A?: Line[] | null, B?: Line[] | null}} */
  const arm = {};
  for (const s of /** @type {Side[]} */ (['A', 'B'])) {
    if (!x[s]) continue;
    const r = sideInputs(x[s], x[other(s)], s, ctx);
    Object.assign(inputs, r.inputs);
    incomplete ||= r.incomplete;
    lines[s] = r.lines;
    ps[s] = r.ps;
    arm[s] = r.arm;
  }
  // The save the target makes against a side's hits: the side's PS, then
  // the target's ARM (or BTS / PH) against that weapon, from the other pass.
  for (const s of /** @type {Side[]} */ (['A', 'B'])) {
    // PS lines come from a roll, so the side has lines.
    if (ps[s]) /** @type {SideLines} */ (lines[s]).save = section([.../** @type {Line[]} */ (ps[s]), ...(arm[other(s)] ?? [])]);
  }
  // A Direct Template on either side: nothing is opposed, each attack is its
  // own roll. Said whatever the other side does, a Dodge, a Reset or No ARO
  // included (Alex, 2026-10-23); a template a zone blocks rolls nothing
  // (lines.kind 'none'), so it says nothing.
  if (/** @type {Side[]} */ (['A', 'B']).some((s) => lines[s]?.kind === 'template')) ctx.say(null, 'note.directTemplate');

  if (a || b) inputs.fixedFaceToFace = false;
  // Things the result may get wrong; shown as alerts but don't block the calculation.
  approximationWarnings('A', a, b, ctx);
  approximationWarnings('B', b, a, ctx);
  if (isSpecOps(a) || isSpecOps(b)) ctx.warn(null, 'warning.specOps');

  return {inputs, ok: errors.length === 0 && !incomplete && (a !== null || b !== null), errors, warnings, notes, lines};
}
