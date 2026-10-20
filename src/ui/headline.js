// The results card's big number, chosen by the player (Settings, or a
// sideways swipe on the card): wounds per order, the chance to win the Face
// to Face Roll, or the chance to cause at least one wound. The small line
// under the bar carries what the headline gave up, so wounds per order never
// leaves the card.
import {pct} from './results.js';

export const HEADLINES = ['wpo', 'win', 'wound'];
export const HEADLINE_NAMES = {wpo: 'Wounds per order', win: 'Wins face to face', wound: 'At least one wound'};
export const HEADLINE_HINTS = {wpo: 'Average wounds this order causes', win: 'Chance to win the roll', wound: 'Chance the target takes a wound'};

// The stored pref, or the default for anything missing or unknown.
export const headlineChoice = (prefs) => (HEADLINES.includes(prefs?.headline) ? prefs.headline : 'wpo');

// step +1 / -1, wrapping round: the swipe goes on past the last one.
export const nextHeadline = (choice, step) =>
  HEADLINES[(HEADLINES.indexOf(choice) + step + HEADLINES.length) % HEADLINES.length];

export const wpoText = (n) => (n == null ? '—' : n.toFixed(2));

// What the card shows for summary s (results.js summarize). A roll that is
// not face to face (Direct Template vs a shot) has nobody to win, so "wins
// face to face" falls back to at least one wound there and says so (fallback).
// A Dodging side's win means it dodged: no wounds either way, so it says that.
// params: the engine params, for who is dodging; may be null. sides: the
// ledger's sides ({A, B}, rules/ledger.js), to tell a Reset from a Dodge.
// A side whose hits cause a State instead of wounds (Jammer: Isolated, Flash
// Pulse: Stunned) shows the chance of that State in place of wounds per order
// and at least one wound.
export function headline(s, choice, params = null, sides = null) {
  const roles = ['active', 'reactive'];
  const wpo = s.unopposed ? {active: s.attacks.active.wpo, reactive: s.attacks.reactive.wpo} : s.wpo;
  const wounded = s.unopposed
    ? {active: s.attacks.active.wounded, reactive: s.attacks.reactive.wounded}
    : {active: s.atLeast.active[0], reactive: s.atLeast.reactive[0]};
  const fallback = choice === 'win' && Boolean(s.unopposed);
  const kind = fallback ? 'wound' : choice;
  const per = (f) => Object.fromEntries(roles.map((side) => [side, f(side)]));
  const letter = (side) => (side === 'active' ? 'A' : 'B');
  const evading = (side) => (sides?.[letter(side)]?.kind === 'reset' ? 'resets'
    : params?.[`ammo${letter(side)}`] === 'DODGE' ? 'dodges' : null);
  // The State's name, or null for a side that wounds.
  const stateOf = (side) => (s.states?.[side]?.length === 1 && s.states[side][0].state ? s.states[side][0].label : null);
  const value = per((side) => (kind === 'win' ? s.win[side] : stateOf(side) || kind === 'wound' ? wounded[side] : wpo[side]));
  const smallWpo = (side) => (stateOf(side) ? pct(wounded[side]) : wpoText(wpo[side]));
  return {
    kind,
    fallback,
    value,
    text: per((side) => (kind === 'wpo' && !stateOf(side) ? wpoText(value[side]) : pct(value[side]))),
    label: per((side) => (kind === 'win' ? evading(side) ?? 'wins face to face'
      : stateOf(side) ?? (kind === 'wpo' ? 'wounds / order' : 'at least one wound'))),
    // The line under the bar: [left, right].
    small: kind === 'wpo'
      ? [`${pct(wounded.active)} ${stateOf('active') ?? 'at least one wound'}`, pct(wounded.reactive)]
      : [`${fallback ? 'Not face to face · ' : ''}${smallWpo('active')} ${stateOf('active') ?? 'wounds / order'}`, smallWpo('reactive')],
  };
}
