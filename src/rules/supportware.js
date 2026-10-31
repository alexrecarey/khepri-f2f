// Supportware (N5; wiki: Assisted Fire, Enhanced Reaction, Supportware): EVO
// Hacking Device programs that roll nothing but change a REM's roll. The
// target is a REM of the hacker's army list; a trooper benefits from one
// Supportware at a time, so the side holds one choice (a new one replaces it).
//   Assisted Fire       the REM gains Marksmanship
//   Enhanced Reaction   the REM's BS Attack is B2 in ARO
// Not here: Fairy Dust (Firewall (-3) against Comms Attacks: the Firewall
// chip already offers it) and Controlled Jump (Combat Jump only).
import {runsSupportware} from '../army/hacking.js';
import {SKILL} from '../army/ids.js';
import {hasSkill} from '../army/traits.js';
import {attackBonuses, keepsAroBurst} from './modifiers.js';

export const SUPPORTWARE = /** @type {const} */ (['assistedFire', 'enhancedReaction']);
/** @typedef {typeof SUPPORTWARE[number]} Supportware */

// Enhanced Reaction's Burst in ARO.
export const ENHANCED_REACTION_BURST = 2;

// Can the trooper be a Supportware target: a REM whose army list fields an
// EVO hacker. A unit taken in no named faction (an old share link) counts
// any army it is in.
/**
 * @param {import('../types.js').Army} army
 * @param {import('../types.js').UnitRow} unit
 * @param {number | null} factionId
 * @param {import('../types.js').ProfileRow | null} profile
 */
export const supportwareTarget = (army, unit, factionId, profile) =>
  profile?.type === 'REM' && (factionId != null ? [factionId] : unit.inFactions).some((f) => runsSupportware(army, f));

// Marksmanship of its own (not Assisted Fire's).
/** @param {import('../types.js').Traits | null | undefined} traits */
const ownMarksmanship = (traits) => (traits?.skills ?? []).some((s) => s.id === SKILL.MARKSMANSHIP && !s.supportware);

// Assisted Fire: Marksmanship joins the skills, marked so the ledger can say
// why. Nothing to add to a REM that has it already.
/**
 * @param {import('../types.js').Traits} traits
 * @returns {import('../types.js').Traits}
 */
export function assistedFireTraits(traits) {
  if (hasSkill(traits, SKILL.MARKSMANSHIP)) return traits;
  return {...traits, skills: [...traits.skills, {id: SKILL.MARKSMANSHIP, name: 'Marksmanship', supportware: 'assistedFire'}]};
}

// Is x's Marksmanship Assisted Fire's?
/** @param {import('../types.js').Traits | null | undefined} traits */
export const marksmanshipFromAssistedFire = (traits) => hasSkill(traits, SKILL.MARKSMANSHIP) && !ownMarksmanship(traits);

// Assisted Fire can change x's roll: a BS Attack (Marksmanship needs one; a
// Direct Template rolls nothing) by a REM without Marksmanship of its own.
/** @param {import('../types.js').ResolvedSide | null | undefined} x */
export const assistedFireHelps = (x) => x?.weapon?.kind === 'bs' && !ownMarksmanship(x.traits);

// Enhanced Reaction can change x's roll: a BS Attack in ARO that would roll
// more than one die, by a REM whose Burst isn't kept already (Total
// Reaction, Neurocinetics). It raises the ARO's one die to two, never above
// the weapon's own Burst.
/**
 * @param {import('../types.js').ResolvedSide | null | undefined} x
 * @param {import('../types.js').Side} side
 */
export function enhancedReactionHelps(x, side) {
  const w = x?.weapon;
  if (side !== 'B' || w?.kind !== 'bs' || keepsAroBurst(/** @type {import('../types.js').ResolvedSide} */ (x))) return false;
  return (w.row.burst ?? 1) + attackBonuses(/** @type {import('../types.js').ResolvedSide} */ (x)).burst > 1;
}

// x rolls with Enhanced Reaction: chosen and it changes the roll.
/**
 * @param {import('../types.js').ResolvedSide | null | undefined} x
 * @param {import('../types.js').Side} side
 */
export const usesEnhancedReaction = (x, side) => x?.supportware === 'enhancedReaction' && enhancedReactionHelps(x, side);

// The Supportware chips a side card offers: none unless the trooper can be a
// target (resolveSelection), then each that can change its pick.
/**
 * @param {import('../types.js').ResolvedSide | null | undefined} x
 * @param {import('../types.js').Side} side
 * @returns {Supportware[]}
 */
export function supportwareChips(x, side) {
  if (!x?.canSupportware) return [];
  return SUPPORTWARE.filter((id) => (id === 'assistedFire' ? assistedFireHelps(x) : enhancedReactionHelps(x, side)));
}

// The Supportware x rolls with, for the saved roll's line: the chosen one
// while it is offered.
/**
 * @param {import('../types.js').ResolvedSide | null | undefined} x
 * @param {import('../types.js').Side} side
 * @returns {Supportware | null}
 */
export const supportwareInUse = (x, side) => {
  const id = x?.supportware ?? null;
  return id && supportwareChips(x, side).includes(id) ? id : null;
};
