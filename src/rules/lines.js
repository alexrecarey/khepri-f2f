// The lines a number in "How the dice were built" adds up to. deriveInputs
// (matchup.js) computes every calculator input as lines and sums them; the
// ledger (ledger.js) lays the same lines out.
//
// A line (types.js Line) says whose skill, weapon or position caused it and
// why it was cancelled, as message descriptors (i18n/message.js) or the
// army's own names; the ledger renders them. Only a live line counts: not
// struck, and its value a number (a display-only line has a string: '—',
// '+', '').
import {msg} from '../i18n/message.js';
import {benefitsFromCover, capMods, LIMITS, MOD_CAP} from './modifiers.js';
import {upgradeRaising} from '../army/loadouts.js';

/**
 * @param {number | string} value
 * @param {import('../types.js').Message} label
 * @param {'A' | 'B' | null} by
 * @param {import('../types.js').Message} [struck]
 * @returns {import('../types.js').Line}
 */
export const line = (value, label, by, struck) => ({value, label, by, ...(struck ? {struck} : {})});
export const live = (lines) => lines.filter((l) => !l.struck && typeof l.value === 'number');
export const sum = (lines) => live(lines).reduce((t, l) => t + l.value, 0);

/**
 * A section of the ledger: its lines and what they add up to.
 * @param {import('../types.js').Line[]} lines
 * @returns {import('../types.js').Section}
 */
export const section = (lines, total = sum(lines)) => ({lines, total});

// The MODs on a roll: every live line after the Attribute, Fireteam +1 BS
// included (modifiers.js MOD_CAP).
export const modSum = (lines) => sum(live(lines).slice(1));

// MODs over the cap: a line takes the excess off. Null when within it.
export function capLine(lines) {
  const mods = modSum(lines);
  const capped = capMods(mods);
  return capped === mods ? null : line(capped - mods, msg('ledger.modCap', {cap: MOD_CAP[1]}), null);
}

// The Success Value stays within LIMITS: below 0 is 0 (the roll always fails
// and can't crit), above the top it is capped. Null when within them.
export function clampSv(lines) {
  const [min, max] = LIMITS.successValue;
  const total = sum(lines);
  if (total < min) return line(min - total, msg('ledger.belowZero'), null);
  if (total > max) return line(max - total, msg('ledger.cappedAt', {max}), null);
  return null;
}

export const signed = (n) => `${n > 0 ? '+' : ''}${n}`;

// An Attribute's name, and the Team-Ops upgrade that raised it: "BS (Team-Ops: BS+1)".
export function statLabel(x, attr) {
  const name = msg(`stat.${attr.toLowerCase()}`);
  const u = upgradeRaising(x.upgrades, attr.toLowerCase());
  return u ? msg('ledger.teamOpsStat', {stat: name, upgrade: u.label}) : name;
}

// The cover y sits in, by name: its Foxhole, cover, or its Nanoscreen.
export const coverLabel = (y) => (benefitsFromCover(y) ? (y.sapper ? msg('ledger.foxholeCover') : msg('ledger.cover')) : msg('equip.nanoscreen'));

// A Success Value from its lines: the MODs (every line after the Attribute,
// Fireteam +1 BS included: Alex, 2026-10-10) capped at +/-12, with a note
// when the cap bites (`noted`: an attack says so, a Dodge or Reset doesn't),
// then the total within LIMITS (lines.js).
export function svSection(lines, s, ctx, noted = true) {
  const cap = capLine(lines);
  if (cap) {
    const mods = modSum(lines);
    if (noted) ctx.say(s, 'note.modCap', {sum: signed(mods), cap: signed(mods + cap.value)});
    lines.push(cap);
  }
  const c = clampSv(lines);
  if (c) lines.push(c);
  return section(lines);
}
