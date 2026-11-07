// The results card's big number, chosen by the player (Settings, or a
// sideways swipe on the card): wounds per order, the chance to win the Face
// to Face Roll, or the chance to cause at least one wound. The small line
// under the bar carries what the headline gave up, so wounds per order never
// leaves the card.
import {tEn} from '../i18n/index.js';
import {dodgeWinsByNone} from '../rules/evade.js';
import {pct} from './summary.js';

// The choices. Their names and hints are src/i18n's headline.<choice> /
// headline.<choice>Hint. The player's pick lives in state (state/headlines.js:
// a pref, and part of a Matchup address too).
/** @typedef {import('../types.js').HeadlineChoice} HeadlineChoice */
/** @typedef {'active' | 'reactive'} Role */

/** @type {HeadlineChoice[]} */
export const HEADLINES = ['wpo', 'win', 'wound'];
// What a player who never chose sees: wounds per order.
/** @type {HeadlineChoice} */
export const DEFAULT_HEADLINE = 'wpo';

// step +1 / -1, wrapping round: the swipe goes on past the last one.
/**
 * @param {HeadlineChoice} choice
 * @param {number} step
 */
export const nextHeadline = (choice, step) =>
  HEADLINES[(HEADLINES.indexOf(choice) + step + HEADLINES.length) % HEADLINES.length];

/** @param {number | null | undefined} n */
const wpoText = (n) => (n == null ? '—' : n.toFixed(2));

// What the card shows for summary s (summary.js summarize). A roll that is
// not face to face (Direct Template vs a shot) has nobody to win, so "wins
// face to face" falls back to at least one wound there and says so (fallback).
// A Dodging (or Resetting) side causes no wounds, so whatever the choice it
// shows its chance to dodge, and the small line leaves it out.
// params: the engine params, for who is dodging; may be null. sides: the
// ledger's sides ({A, B}, rules/ledger.js), to tell a Reset from a Dodge.
// A side whose hits cause a State instead of wounds (Jammer: Isolated, Flash
// Pulse: Stunned) shows the chance of that State in place of wounds per order
// and at least one wound. t: the labels' language (src/i18n).
/**
 * @param {import('../types.js').Summary} s
 * @param {import('../types.js').HeadlineChoice} choice
 * @param {import('../types.js').Params | null} [params]
 * @param {import('../types.js').Ledger | null} [sides]
 * @param {import('../types.js').Translator} [t]
 * @returns {import('../types.js').Headline}
 */
export function headline(s, choice, params = null, sides = null, t = tEn) {
  /** @type {Role[]} */
  const roles = ['active', 'reactive'];
  // An unopposed summary carries each attack on its own (summary.js).
  const wpo = s.unopposed ? {active: /** @type {NonNullable<typeof s.attacks>} */ (s.attacks).active.wpo, reactive: /** @type {NonNullable<typeof s.attacks>} */ (s.attacks).reactive.wpo} : s.wpo;
  const wounded = s.unopposed
    ? {active: /** @type {NonNullable<typeof s.attacks>} */ (s.attacks).active.wounded, reactive: /** @type {NonNullable<typeof s.attacks>} */ (s.attacks).reactive.wounded}
    : {active: s.atLeast.active[0], reactive: s.atLeast.reactive[0]};
  const fallback = choice === 'win' && Boolean(s.unopposed);
  const kind = fallback ? 'wound' : choice;
  /**
   * @template V
   * @param {(side: Role) => V} f
   * @returns {Record<Role, V>}
   */
  const per = (f) => /** @type {Record<Role, V>} */ (Object.fromEntries(roles.map((side) => [side, f(side)])));
  /** @param {Role} side */
  const letter = (side) => (side === 'active' ? 'A' : 'B');
  // A Dodging or Resetting side's label ('dodges' / 'resets'), or null. Not
  // face to face (a Dodge against Smoke) it has its own roll: a State (Dodged).
  const evade = per((side) => (s.unopposed ? null : sides?.[letter(side)]?.kind === 'reset' ? t('headline.resets')
    : params?.[`ammo${letter(side)}`] === 'DODGE' ? t('headline.dodges') : null));
  // The State's name (rendered by then: state/matchupView.js renderMatchup),
  // or null for a side that wounds.
  const state = per((side) => /** @type {string | null} */ (s.unopposed ? /** @type {NonNullable<typeof s.attacks>} */ (s.attacks)[side].state
    : s.states?.[side]?.length === 1 && s.states[side][0].state ? s.states[side][0].label : null));
  // Each side's big number and what it is. A Dodge causes no wounds, so it
  // shows its chance to dodge (rules/evade.js dodgeWinsByNone: against a
  // Direct Template that is the chance nobody wins).
  /**
   * @param {Role} side
   * @returns {{kind: HeadlineChoice, value: number}}
   */
  const shown = (side) => {
    if (evade[side]) return {kind: 'win', value: dodgeWinsByNone(params, letter(side)) ? s.win.none : s.win[side]};
    if (kind === 'win') return {kind, value: s.win[side]};
    return {kind, value: state[side] || kind === 'wound' ? wounded[side] : wpo[side]};
  };
  const big = per(shown);
  const kinds = per((side) => big[side].kind);
  const value = per((side) => big[side].value);
  // The small line: what the headline gave up, per side. A Dodger has nothing
  // to give up, so its half is empty; the label (and the not-face-to-face
  // note) goes with the first figure shown.
  /** @param {Role} side */
  const smallFigure = (side) => (evade[side] ? ''
    : kind === 'wpo' || state[side] ? pct(wounded[side]) : wpoText(wpo[side]));
  /** @param {Role} side */
  const smallLabel = (side) => state[side] ?? t(kind === 'wpo' ? 'headline.woundLabel' : 'headline.wpoLabel');
  const first = evade.active ? 'reactive' : 'active';
  const note = fallback ? `${t('headline.notFaceToFace')} · ` : '';
  const small = per((side) => (smallFigure(side) && side === first ? `${note}${smallFigure(side)} ${smallLabel(side)}` : smallFigure(side)));
  return {
    kind,
    kinds,
    fallback,
    value,
    text: per((side) => (kinds[side] === 'wpo' && !state[side] ? wpoText(value[side]) : pct(value[side]))),
    label: per((side) => evade[side] ?? (kind === 'win' ? t('headline.winsLabel')
      : state[side] ?? (kind === 'wpo' ? t('headline.wpoLabel') : t('headline.woundLabel')))),
    // The line under the bar: [left, right].
    small: [small.active, small.reactive],
  };
}
