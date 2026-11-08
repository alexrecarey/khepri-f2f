// The results card's big number, chosen by the player (Settings, or a
// sideways swipe on the card): wounds per order, the chance to win the Face
// to Face Roll, or the chance to cause at least one wound. The small line
// under the bar carries what the headline gave up, so wounds per order never
// leaves the card.
import {tEn} from '../i18n/index.js';
import {other} from '../lib/side.js';
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
  /** @param {Role} side */
  const evading = (side) => (sides?.[letter(side)]?.kind === 'reset' ? t('headline.resets')
    : params?.[`ammo${letter(side)}`] === 'DODGE' ? t('headline.dodges') : null);
  // The State's name, or null for a side that wounds.
  /**
   * The State's name, rendered by then (state/matchupView.js renderMatchup).
   * @param {Role} side
   * @returns {string | null}
   */
  const stateOf = (side) => (s.states?.[side]?.length === 1 && s.states[side][0].state ? /** @type {string} */ (s.states[side][0].label) : null);
  // Against a Direct Template nobody wins: the Dodge is cancelling the
  // template's hits, which is when neither side "wins" (engine-rs template_roll).
  /** @param {Role} side */
  const dodged = (side) => (params?.[`template${other(letter(side))}`] ? s.win.none : s.win[side]);
  /** @type {Record<Role, HeadlineChoice>} */
  const kinds = per((side) => (evading(side) ? 'win' : kind));
  const value = per((side) => (evading(side) ? dodged(side) : kind === 'win' ? s.win[side] : stateOf(side) || kind === 'wound' ? wounded[side] : wpo[side]));
  /** @param {Role} side */
  const smallWpo = (side) => (stateOf(side) ? pct(wounded[side]) : wpoText(wpo[side]));
  /** @param {Role} side */
  const smallValue = (side) => (kind === 'wpo' ? pct(wounded[side]) : smallWpo(side));
  /** @param {Role} side */
  const smallLabel = (side) => stateOf(side) ?? t(kind === 'wpo' ? 'headline.woundLabel' : 'headline.wpoLabel');
  // The label goes with the first figure shown. A Dodge is never in an
  // unopposed roll (calculate.js isUnopposed), so never falls back.
  /** @type {[string, string]} */
  const small = evading('active')
    ? ['', evading('reactive') ? '' : `${smallValue('reactive')} ${smallLabel('reactive')}`]
    : [`${fallback ? `${t('headline.notFaceToFace')} · ` : ''}${smallValue('active')} ${smallLabel('active')}`, evading('reactive') ? '' : smallValue('reactive')];
  return {
    kind,
    kinds,
    fallback,
    value,
    text: per((side) => (kinds[side] === 'wpo' && !stateOf(side) ? wpoText(value[side]) : pct(value[side]))),
    label: per((side) => evading(side) ?? (kind === 'win' ? t('headline.winsLabel')
      : stateOf(side) ?? (kind === 'wpo' ? t('headline.wpoLabel') : t('headline.woundLabel')))),
    // The line under the bar: [left, right].
    small,
  };
}
