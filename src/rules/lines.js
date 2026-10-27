// The lines a number in "How the dice were built" adds up to. deriveInputs
// (matchup.js) computes every calculator input as lines and sums them; the
// ledger (ledger.js) lays the same lines out.
//
// A line (types.js Line) says whose skill, weapon or position caused it and
// why it was cancelled, as message descriptors (i18n/message.js) or the
// army's own names; the ledger renders them. Only a live line counts: not
// struck, and its value a number. A display-only line (mark) has value null
// and a `text` for the value column ('—' out of range, '+' an ammunition
// part, '' the weapon's own ammunition): it says what it is instead of
// being told apart by its type.
import {msg, side as about} from '../i18n/message.js';
import {benefitsFromCover, capMods, LIMITS, MOD_CAP} from './modifiers.js';
import {upgradeRaising} from '../army/loadouts.js';

/** @typedef {import('../types.js').Line} Line */
/** @typedef {import('../types.js').Message} Message */

/**
 * @param {number} value
 * @param {import('../types.js').Message} label
 * @param {'A' | 'B' | null} by
 * @param {import('../types.js').Message | null} [struck] why it was cancelled (null: it wasn't)
 * @returns {import('../types.js').Line}
 */
export const line = (value, label, by, struck) => ({value, label, by, ...(struck ? {struck} : {})});

/**
 * A display-only line: it shows `text` in the value column and adds nothing.
 * @param {'—' | '+' | ''} text
 * @param {import('../types.js').Message} label
 * @param {'A' | 'B' | null} by
 * @param {import('../types.js').Message | null} [struck]
 * @returns {import('../types.js').Line}
 */
export const mark = (text, label, by, struck) => ({value: null, text, label, by, ...(struck ? {struck} : {})});
/**
 * The lines among `xs`: a builder lists every candidate line, with false /
 * null / 0 where its condition fails, and this keeps the lines. The same for
 * notes (Message), or anything else listed that way.
 * @template T
 * @param {(T | false | null | undefined | 0 | '')[]} xs
 * @returns {T[]}
 */
export const compact = (xs) => /** @type {T[]} */ (xs.filter(Boolean));

/**
 * A note about a side (null: both) as the rules word it: "Active: ..."
 * (i18n/message.js), for deriveInputs' notes, warnings and errors.
 * @param {import('../types.js').Side | null} side
 * @param {string} key
 * @param {Record<string, unknown>} [params]
 * @returns {Message}
 */
export const note = (side, key, params) => about(side, msg(key, params));

/** @param {Line[]} lines */
export const live = (lines) => lines.filter((l) => l.value !== null && !l.struck);
/** @param {Line[]} lines */
export const sum = (lines) => live(lines).reduce((t, l) => t + /** @type {number} */ (l.value), 0);

/**
 * A section of the ledger: its lines and what they add up to.
 * @param {Line[]} lines
 * @param {number | Message} [total]
 * @returns {import('../types.js').Section}
 */
export const section = (lines, total = sum(lines)) => ({lines, total});

// The MODs on a roll: every live line after the Attribute, Fireteam +1 BS
// included (modifiers.js MOD_CAP).
/** @param {Line[]} lines */
export const modSum = (lines) => sum(live(lines).slice(1));

// MODs over the cap: a line takes the excess off. Null when within it.
/**
 * @param {Line[]} lines
 * @returns {Line | null}
 */
export function capLine(lines) {
  const mods = modSum(lines);
  const capped = capMods(mods);
  return capped === mods ? null : line(capped - mods, msg('ledger.modCap', {cap: MOD_CAP[1]}), null);
}

// The Success Value stays within LIMITS: below 0 is 0 (the roll always fails
// and can't crit), above the top it is capped. Null when within them.
/**
 * @param {Line[]} lines
 * @returns {Line | null}
 */
export function clampSv(lines) {
  const [min, max] = LIMITS.successValue;
  const total = sum(lines);
  if (total < min) return line(min - total, msg('ledger.belowZero'), null);
  if (total > max) return line(max - total, msg('ledger.cappedAt', {max}), null);
  return null;
}

/** @param {number} n */
export const signed = (n) => `${n > 0 ? '+' : ''}${n}`;

// An Attribute's name, and the Team-Ops upgrade that raised it: "BS (Team-Ops: BS+1)".
/**
 * @param {Pick<import('../types.js').ResolvedSide, 'upgrades'>} x
 * @param {string} attr
 * @returns {Message}
 */
export function statLabel(x, attr) {
  const name = msg(`stat.${attr.toLowerCase()}`);
  const u = upgradeRaising(x.upgrades, attr.toLowerCase());
  return u ? msg('ledger.teamOpsStat', {stat: name, upgrade: u.label}) : name;
}

// The cover y sits in, by name: its Foxhole, cover, or its Nanoscreen.
/** @param {import('../types.js').ResolvedSide} y */
export const coverLabel = (y) => (benefitsFromCover(y) ? (y.sapper ? msg('ledger.foxholeCover') : msg('ledger.cover')) : msg('equip.nanoscreen'));

// A Success Value from its lines: the MODs (every line after the Attribute,
// Fireteam +1 BS included: Alex, 2026-10-10) capped at +/-12, with a note
// when the cap bites, on a Dodge or Reset as on an attack (Alex, 2026-10-23),
// then the total within LIMITS (lines.js). Returns the section and the notes
// it adds; `lines` is left as it was.
/**
 * @param {Line[]} lines
 * @param {import('../types.js').Side} s
 * @returns {{sv: import('../types.js').Section, notes: Message[]}}
 */
export function svSection(lines, s) {
  const cap = capLine(lines);
  const capped = cap ? [...lines, cap] : lines;
  const c = clampSv(capped);
  const mods = modSum(lines);
  return {
    sv: section(c ? [...capped, c] : capped),
    notes: cap ? [note(s, 'note.modCap', {sum: signed(mods), cap: signed(mods + /** @type {number} */ (cap.value))})] : [],
  };
}
