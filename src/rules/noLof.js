// No LoF (a chip; Alex, 2026-10-31 and 2026-11-22): the attacker is outside
// the trooper's LoF (wiki: ARO, Dodge, Template Weapons, Traits).
// - In ARO it can react only to an attacker inside its ZoC, or to a Template
//   Weapon it is under: beyond the ZoC against a shot, No ARO is its only
//   choice. Without LoF it can't shoot back either: it Dodges or does nothing.
// - Its Dodge takes -3 (in ARO, or against a template in either turn; one -3
//   however many apply), and the weapon's Silent (X) while the attacker is
//   inside its ZoC, on top of the -3 (an active Dodger takes Silent alone).
// Sixth Sense (or a Fireteam of 5) has a 360° LoF: never out of it, so no
// chip. A Deployable's -3 (Mines) isn't modelled.
import {isCommsAttack, isTemplateWeapon, silentMod} from '../army/weapons.js';
import {evades, hasSixthSense} from './modifiers.js';
import {ZOC_CM, rangeOf} from './ranges.js';
import {withWeapon} from './trooper.js';
import {other} from '../lib/side.js';

/** @typedef {import('../types.js').ResolvedSide} ResolvedSide */
/** @typedef {import('../types.js').Choice} Choice */

export const NO_LOF_DODGE_MOD = -3;

// Is side s's attacker (the other side) inside s's ZoC? It attacks from its
// own distance (a split range: the reactive's).
/**
 * @param {import('../types.js').Side} s
 * @param {number} rangeCm
 * @param {number | null | undefined} rangeCmB
 */
export const attackerInZoc = (s, rangeCm, rangeCmB) => rangeOf(other(s), rangeCm, rangeCmB) <= ZOC_CM;

// A shot or a template: what LoF decides whether x may react to. Not a
// Comms Attack (the Hacking Area, not LoF) or a CC Attack (base contact).
/** @param {Choice | null | undefined} incoming */
const lofAttack = (incoming) => Boolean(incoming?.row) && (incoming?.kind === 'bs' || incoming?.kind === 'template')
  && !isCommsAttack(incoming?.row);

// Can the No LoF chip change x's roll against `incoming` (the other side's
// pick)? The chip shows only then. In ARO it always does (it limits the
// choices); in the Active Turn only a Dodge of a template, or of a Silent
// weapon inside the ZoC.
/**
 * @param {ResolvedSide | null | undefined} x
 * @param {Choice | null | undefined} incoming
 * @param {boolean} reactive x is the reactive side
 * @param {boolean} inZoc the attacker is inside x's ZoC
 */
export function noLofHelps(x, incoming, reactive, inZoc) {
  if (!x || hasSixthSense(x) || !lofAttack(incoming)) return false;
  if (reactive) return true;
  const row = incoming?.row;
  return evades(x, incoming) && (isTemplateWeapon(row) || (inZoc && silentMod(row) !== 0));
}

// With the chip on, the only choices x has left (pseudo-weapon keys, which
// are also their kinds), the first being what its pick reads as otherwise;
// null when No LoF limits nothing. Only the reactive is limited: the active
// trooper's chip shows only on a Dodge.
/**
 * @param {ResolvedSide | null | undefined} x
 * @param {Choice | null | undefined} incoming
 * @param {boolean} reactive
 * @param {boolean} inZoc
 * @returns {('none' | 'dodge')[] | null}
 */
export function noLofChoices(x, incoming, reactive, inZoc) {
  if (!reactive || !x?.noLof || !noLofHelps(x, incoming, reactive, inZoc)) return null;
  return inZoc || isTemplateWeapon(incoming?.row) ? ['dodge', 'none'] : ['none'];
}

// The two MODs on x's Dodge with the chip on: the -3 (`lof`) and the
// weapon's Silent (X) (`silent`), 0 where they don't apply.
/**
 * @param {ResolvedSide | null | undefined} x
 * @param {Choice | null | undefined} incoming
 * @param {boolean} reactive
 * @param {boolean} inZoc
 */
export function noLofDodgeMods(x, incoming, reactive, inZoc) {
  if (!x?.noLof || x.weapon?.kind !== 'dodge' || !evades(x, incoming) || !noLofHelps(x, incoming, reactive, inZoc)) return {lof: 0, silent: 0};
  const row = incoming?.row;
  return {
    lof: reactive || isTemplateWeapon(row) ? NO_LOF_DODGE_MOD : 0,
    silent: inZoc ? silentMod(row) : 0,
  };
}

// Does No LoF leave x (the reactive) nothing but No ARO?
/**
 * @param {ResolvedSide | null | undefined} x
 * @param {Choice | null | undefined} incoming
 * @param {boolean} inZoc
 */
export const noLofForcesNoAro = (x, incoming, inZoc) => noLofChoices(x, incoming, true, inZoc)?.[0] === 'none';

// The reactive x with the pick No LoF leaves it: its own while still allowed,
// else the first choice left (No ARO, or a Dodge). Applied where the default
// weapon is (state/matchupView.js), before deriveInputs; never written to the
// document, so switching the chip off gives the pick back.
/**
 * @template {ResolvedSide | null} T
 * @param {T} x
 * @param {Choice | null | undefined} incoming
 * @param {boolean} inZoc
 * @returns {T}
 */
export function withNoLofPick(x, incoming, inZoc) {
  const only = noLofChoices(x, incoming, true, inZoc);
  return x && only && !only.includes(/** @type {'none' | 'dodge'} */ (x.weapon?.kind)) ? /** @type {T} */ (withWeapon(x, only[0])) : x;
}
