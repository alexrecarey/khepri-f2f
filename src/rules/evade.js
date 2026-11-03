// A Dodge or a Reset as calculator inputs: one roll that causes no Saving
// Rolls, as the lines it adds up to (lines.js); and the empty inputs of a
// side that rolls nothing. ctx: matchup.js deriveInputs.
import {ZERO_PAIN} from '../army/hacking.js';
import {
  LIMITS, bangbombMod, bangbombValue, cancelsBangbomb, dodgeExtras, evades, fireteamBonuses, hackedResetMod, immADodgeMod, noLofDodgeMods,
  targetedResetMod,
} from './modifiers.js';
import {ZOC_CM, rangeOf} from './ranges.js';
import {other} from '../lib/side.js';
import {clamp} from '../lib/clamp.js';
import {msg} from '../i18n/message.js';
import {compact, line, note, section, statLabel, svSection} from './lines.js';

/** @typedef {import('../types.js').Side} Side */
/** @typedef {import('../types.js').Ctx} Ctx */
/** @typedef {import('../types.js').Trooper} Trooper */
/** @typedef {import('../types.js').Attacker} Attacker */
/** @typedef {import('../types.js').Line} Line */
/** @typedef {import('../types.js').Params} Params */
/** @typedef {import('../types.js').Evader} Evader */

// A Dodge: one PH roll (Dodge MODs, Bangbomb, IMM-A, No LoF and the Fireteam's +1 included,
// Dodge (+1SD) as Special Dice) that causes no Saving Rolls. `incoming`: the
// weapon being Dodged, if any (null when the attacker has no line of fire).
/**
 * @param {Evader} x
 * @param {Trooper | null} y
 * @param {Side} side
 * @param {import('../types.js').Choice | null | undefined} incoming
 * @param {Ctx} ctx
 * @returns {import('../types.js').Roll}
 */
function dodgeInputs(x, y, side, incoming, ctx) {
  const d = dodgeExtras(x.traits);
  const ft = fireteamBonuses(x.ftSize).dodge;
  const bang = bangbombMod(x, incoming);
  // The Bangbomb Dodge against a template: its MOD is struck.
  const bangStruck = !bang && x.weapon.bangbomb && incoming?.row && cancelsBangbomb(incoming.row) ? bangbombValue(x.traits) : 0;
  // The attacker shoots from its own distance (a split range: the reactive's).
  const o = other(side);
  const noLof = noLofDodgeMods(x, incoming, side === 'B', rangeOf(o, ctx.rangeCm, ctx.rangeCmB) <= ZOC_CM);
  const lines = compact([
    // Dodge (PH=14) replaces the Attribute, so it isn't a MOD (MOD_CAP).
    d.ph !== null ? line(d.ph, msg('ledger.dodgePh', {ph: d.ph}), side) : line(x.profile.ph ?? 0, statLabel(x, 'ph'), null),
    d.mod && line(d.mod, msg('skill.dodgeMod', {mod: `+${d.mod}`}), side),
    ft && line(ft, msg('ledger.fireteam', {size: x.ftSize}), side),
    bang && line(bang, msg('equip.bangbombMod', {mod: `+${bang}`}), side),
    bangStruck && line(bangStruck, msg('equip.bangbombMod', {mod: `+${bangStruck}`}), side, msg('ledger.templateWeapon')),
    immADodgeMod(x) && line(immADodgeMod(x), msg('chip.immA'), side),
    noLof.lof && line(noLof.lof, msg('chip.noLof'), side),
    noLof.silent && line(noLof.silent, msg('trait.silentMod', {mod: noLof.silent}), o),
    ...(y && incoming ? ctx.opposing[side] : []),
  ]);
  const {sv, notes} = svSection(lines, side);
  const sd = section(d.sd ? [line(d.sd, msg('ledger.dodgeSd'), side)] : []);
  // Computed keys: tsc sees an index signature, so the shape is stated.
  const inputs = /** @type {Partial<Params>} */ ({
    [`ammo${side}`]: 'DODGE',
    [`burst${side}`]: 1,
    [`bonusBurst${side}`]: clamp(LIMITS.bonusBurst, /** @type {number} */ (sd.total)),
    [`successValue${side}`]: sv.total,
    [`cont${side}`]: false,
    [`shock${side}`]: false,
    [`template${side}`]: false,
  });
  return {inputs, lines: {kind: 'dodge', sv, sd}, notes};
}

// A Reset: one WIP roll against a Comms Attack (the opponent's BS Attack
// (-X), Surprise Attack, Targeted and the Hacked chip included) that causes no Saving
// Rolls, like a Dodge. Zero Pain: two WIP rolls, in either turn.
/**
 * @param {Evader} x
 * @param {Trooper | null} y
 * @param {Side} side
 * @param {Ctx} ctx
 * @returns {import('../types.js').Roll}
 */
function resetInputs(x, y, side, ctx) {
  const lines = compact([
    line(x.profile.wip ?? 0, statLabel(x, 'wip'), null),
    targetedResetMod(x) && line(targetedResetMod(x), msg('chip.targeted'), side),
    hackedResetMod(x) && line(hackedResetMod(x), msg('chip.hacked'), side),
    ...(y ? ctx.opposing[side] : []),
  ]);
  const {sv, notes} = svSection(lines, side);
  const inputs = /** @type {Partial<Params>} */ ({
    [`ammo${side}`]: 'DODGE',
    [`burst${side}`]: x.weapon.zeroPain ? ZERO_PAIN.burst : 1,
    [`bonusBurst${side}`]: 0,
    [`successValue${side}`]: sv.total,
    [`cont${side}`]: false,
    [`shock${side}`]: false,
    [`template${side}`]: false,
  });
  return {inputs, lines: {kind: 'reset', sv}, notes};
}

// A Dodge or Reset that can't evade the attack it faces (modifiers.js
// evades) isn't rolled against it: the attack is a Normal Roll.
/**
 * @param {Evader} x
 * @param {Trooper | null} y
 * @param {Side} side
 * @param {import('../types.js').Choice | null | undefined} incoming the other side's weapon, null when it has no line of fire
 * @param {Ctx} ctx
 * @returns {import('../types.js').Roll}
 */
export function evadeInputs(x, y, side, incoming, ctx) {
  if (!evades(x, incoming)) {
    const reset = x.weapon.kind === 'reset';
    // Only an attack (a weapon) can't be evaded.
    const weapon = /** @type {import('../types.js').WeaponEntry} */ (incoming).row.name;
    return {
      inputs: noLofInputs(side),
      lines: {kind: 'none', reason: msg(reset ? 'ledger.resetOnlyComms' : 'ledger.dodgeNotComms')},
      notes: [note(side, reset ? 'note.resetOnlyComms' : 'note.dodgeNotComms', {weapon})],
    };
  }
  if (x.weapon.kind === 'reset') return resetInputs(x, y, side, ctx);
  return dodgeInputs(x, y, side, incoming, ctx);
}

// No LoF through Smoke / White Noise, or a program the target isn't a valid
// target for: the side's attack never happens, so it rolls nothing (like No ARO).
/**
 * @param {Side} side
 * @returns {Partial<Params>}
 */
export function noLofInputs(side) {
  return /** @type {Partial<Params>} */ ({[`burst${side}`]: 0, [`bonusBurst${side}`]: 0, [`shock${side}`]: false, [`template${side}`]: false});
}
