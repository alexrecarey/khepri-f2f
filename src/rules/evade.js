// A Dodge or a Reset as calculator inputs: one roll that causes no Saving
// Rolls, as the lines it adds up to (lines.js); and the empty inputs of a
// side that rolls nothing. ctx: matchup.js deriveInputs.
import {ZERO_PAIN} from '../army/hacking.js';
import {
  LIMITS, bangbombMod, bangbombValue, cancelsBangbomb, dodgeExtras, evades, fireteamBonuses, hackedResetMod, immADodgeMod, targetedResetMod,
} from './modifiers.js';
import {clamp} from '../lib/clamp.js';
import {msg} from '../i18n/message.js';
import {line, section, statLabel, svSection} from './lines.js';

// A Dodge: one PH roll (Dodge MODs, Bangbomb, IMM-A and the Fireteam's +1 included,
// Dodge (+1SD) as Special Dice) that causes no Saving Rolls. `incoming`: the
// weapon being Dodged, if any (null when the attacker has no line of fire).
function dodgeInputs(x, y, side, incoming, ctx) {
  const d = dodgeExtras(x.traits);
  // Dodge (PH=14) replaces the Attribute, so it isn't a MOD (MOD_CAP).
  const lines = [d.ph !== null ? line(d.ph, msg('ledger.dodgePh', {ph: d.ph}), side) : line(x.profile.ph ?? 0, statLabel(x, 'ph'), null)];
  if (d.mod) lines.push(line(d.mod, msg('skill.dodgeMod', {mod: `+${d.mod}`}), side));
  const ft = fireteamBonuses(x.ftSize).dodge;
  if (ft) lines.push(line(ft, msg('ledger.fireteam', {size: x.ftSize}), side));
  const bang = bangbombMod(x, incoming);
  if (bang) lines.push(line(bang, msg('equip.bangbombMod', {mod: `+${bang}`}), side));
  else if (x.weapon.bangbomb && incoming?.row && cancelsBangbomb(incoming.row)) {
    const v = bangbombValue(x.traits);
    lines.push(line(v, msg('equip.bangbombMod', {mod: `+${v}`}), side, msg('ledger.templateWeapon')));
  }
  if (immADodgeMod(x)) lines.push(line(immADodgeMod(x), msg('chip.immA'), side));
  if (y && incoming) lines.push(...ctx.opposing[side]);
  const sv = svSection(lines, side, ctx);
  const sd = section(d.sd ? [line(d.sd, msg('ledger.dodgeSd'), side)] : []);
  const inputs = {
    [`ammo${side}`]: 'DODGE',
    [`burst${side}`]: 1,
    [`bonusBurst${side}`]: clamp(LIMITS.bonusBurst, sd.total),
    [`successValue${side}`]: sv.total,
    [`cont${side}`]: false,
    [`shock${side}`]: false,
    [`template${side}`]: false,
  };
  return {inputs, lines: {kind: 'dodge', sv, sd}};
}

// A Reset: one WIP roll against a Comms Attack (the opponent's BS Attack
// (-X), Surprise Attack, Targeted and the Hacked chip included) that causes no Saving
// Rolls, like a Dodge. Zero Pain: two WIP rolls, in either turn.
function resetInputs(x, y, side, ctx) {
  const lines = [line(x.profile.wip ?? 0, statLabel(x, 'wip'), null)];
  if (targetedResetMod(x)) lines.push(line(targetedResetMod(x), msg('chip.targeted'), side));
  if (hackedResetMod(x)) lines.push(line(hackedResetMod(x), msg('chip.hacked'), side));
  if (y) lines.push(...ctx.opposing[side]);
  const sv = svSection(lines, side, ctx);
  const inputs = {
    [`ammo${side}`]: 'DODGE',
    [`burst${side}`]: x.weapon.zeroPain ? ZERO_PAIN.burst : 1,
    [`bonusBurst${side}`]: 0,
    [`successValue${side}`]: sv.total,
    [`cont${side}`]: false,
    [`shock${side}`]: false,
    [`template${side}`]: false,
  };
  return {inputs, lines: {kind: 'reset', sv}};
}

// A Dodge or Reset that can't evade the attack it faces (modifiers.js
// evades) isn't rolled against it: the attack is a Normal Roll.
export function evadeInputs(x, y, side, incoming, ctx) {
  if (!evades(x, incoming)) {
    const reset = x.weapon.kind === 'reset';
    ctx.say(side, reset ? 'note.resetOnlyComms' : 'note.dodgeNotComms', {weapon: incoming.row.name});
    return {inputs: noLofInputs(side), lines: {kind: 'none', reason: msg(reset ? 'ledger.resetOnlyComms' : 'ledger.dodgeNotComms')}};
  }
  if (x.weapon.kind === 'reset') return resetInputs(x, y, side, ctx);
  return dodgeInputs(x, y, side, incoming, ctx);
}

// No LoF through Smoke / White Noise, or a program the target isn't a valid
// target for: the side's attack never happens, so it rolls nothing (like No ARO).
export function noLofInputs(side) {
  return {[`burst${side}`]: 0, [`bonusBurst${side}`]: 0, [`shock${side}`]: false, [`template${side}`]: false};
}
