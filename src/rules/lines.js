// The lines a number in "How the dice were built" adds up to. deriveInputs
// (matchup.js) computes every calculator input as lines and sums them; the
// ledger (ledger.js) lays the same lines out.
//
// A line is {value, label, by: 'A' | 'B' | null, struck?: reason, source?}:
// `by` is whose skill, weapon or position caused it (the colour), `struck`
// why it was cancelled. `label`, `struck` and `source` are message
// descriptors (i18n/message.js) or the army's own names; the ledger renders them. Only a live line counts: not struck, and its value a
// number (a display-only line has a string: '—', '+', '').
import {msg} from '../i18n/message.js';
import {LIMITS, MOD_CAP, capMods} from './modifiers.js';

export const line = (value, label, by, struck) => ({value, label, by, ...(struck ? {struck} : {})});
export const live = (lines) => lines.filter((l) => !l.struck && typeof l.value === 'number');
export const sum = (lines) => live(lines).reduce((t, l) => t + l.value, 0);

// A section of the ledger: its lines and what they add up to.
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
