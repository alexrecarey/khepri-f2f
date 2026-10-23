// Smoke and White Noise between the two troopers (Alex's rulings, 2026-10-13).
// Both are Zero Visibility Zones for some troopers: no LoF through them,
// unless the trooper is being attacked through the zone, when it may shoot back
// at the Poor Visibility Zone MOD.
//
// Smoke blocks troopers without a Multispectral Visor. MSV1 sees through at
// -3 when it is attacked and -6 (Zero Visibility) when it isn't (the opponent
// Dodges or does nothing); MSV2 and MSV3 ignore Smoke.
// White Noise blocks troopers WITH a Multispectral Visor (any level) or
// Marksmanship; everyone else ignores it. MSV1 can't soften it.
// Sixth Sense (the skill, or a Fireteam of 5) cancels the Poor Visibility
// MOD of a trooper being attacked; not the Zero Visibility one.
// With both zones on nobody sees (one or the other blocks every trooper), so
// nobody shoots. Albedo is not a visibility MOD and adds on top (modifiers.js).
// A No LoF attack (Jammer) ignores both zones.
import {EQUIP, SKILL} from '../army/ids.js';
import {hasEquip, hasSkill} from '../army/traits.js';
import {isPseudo, needsLof} from '../army/weapons.js';
import {isCcAttack} from './closeCombat.js';
import {hasSixthSense, msvName} from './modifiers.js';
import {msg} from '../i18n/message.js';

/** @typedef {import('../types.js').Zone} Zone */
/** @typedef {import('../types.js').ResolvedSide} ResolvedSide */
/** @typedef {import('../types.js').VisSide} VisSide */
/** What one zone does to a trooper: no LoF unless it is attacked, or MSV1's MODs through Smoke.
 * @typedef {{sees: false} | {sees: true, attacked: number, notAttacked: number}} ZoneFx */

/** @type {Zone[]} */
export const ZONES = ['smoke', 'whiteNoise'];
/**
 * A zone's name (a message descriptor).
 * @param {Zone} zone
 */
export const zoneName = (zone) => msg(`zone.${zone}`);
// Poor Visibility Zone, and MSV1 shot at through Smoke.
export const POOR_VISIBILITY_MOD = -6;
export const MSV1_SMOKE_MOD = -3;
// Zero Visibility Zone: MSV1 through Smoke when nobody is shooting at it.
export const ZERO_VISIBILITY_MOD = -6;

// Is x's choice an attack? Any BS Attack, a Direct Template included (it
// needs LoF too); not a Dodge or No ARO.
/** @param {ResolvedSide | null | undefined} x */
const attacks = (x) => Boolean(x?.weapon) && !isPseudo(/** @type {ResolvedSide} */ (x).weapon);

// What one zone does to x: null (nothing), or {sees: false} (no LoF unless it
// is attacked; then -6), or {sees: true, attacked, notAttacked} for MSV1 in
// Smoke.
/**
 * @param {Zone} zone
 * @param {import('../types.js').Traits | null | undefined} traits
 * @returns {ZoneFx | null}
 */
function zoneOn(zone, traits) {
  const msv1 = hasEquip(traits, EQUIP.MSV1);
  const msv23 = hasEquip(traits, EQUIP.MSV2) || hasEquip(traits, EQUIP.MSV3);
  if (zone === 'smoke') {
    if (msv23) return null;
    if (msv1) return {sees: true, attacked: MSV1_SMOKE_MOD, notAttacked: ZERO_VISIBILITY_MOD};
    return {sees: false};
  }
  if (msv1 || msv23 || hasSkill(traits, SKILL.MARKSMANSHIP)) return {sees: false};
  return null;
}

// Why x ignores a zone that is on, for the ledger's struck line.
/**
 * @param {Zone} zone
 * @param {import('../types.js').Traits | null | undefined} traits
 */
function ignoredBy(zone, traits) {
  return zone === 'smoke' ? msvName(traits) : msg('zone.noMsv');
}

// The zones that are on, from {smoke, whiteNoise}.
/** @param {import('../types.js').Zones | null | undefined} zones */
export const zonesOn = (zones) => ZONES.filter((z) => zones?.[z]);

// Both sides' visibility through the zones: per side,
//   blocked   the zone name that stops it attacking, or null
//   lines     [{zone, value, label, ignoredBy}]: the MOD each zone puts on its
//             attack roll; a struck line (ignoredBy) doesn't count. label and
//             ignoredBy are message descriptors (i18n/message.js)
//   mod       the MOD that counts (the sum of the lines that do), 0 without one
// A side that can't see through a zone may still shoot back when the other
// side attacks it AND can see. So if either side is blocked, nobody shoots.
/**
 * @param {ResolvedSide | null} a
 * @param {ResolvedSide | null} b
 * @param {import('../types.js').Zones | null | undefined} zones
 * @returns {import('../types.js').Visibility}
 */
export function visibility(a, b, zones) {
  const on = zonesOn(zones);
  /** @type {VisSide} */
  const empty = {blocked: null, lines: [], mod: 0};
  if (!on.length || !a || !b) return {A: empty, B: empty};
  // A CC Attack is in base contact: no zone between them, so none applies.
  // An attack that needs no LoF (Jammer) goes through any zone.
  /** @param {ResolvedSide} x */
  const fx = (x) => (isCcAttack(x) || !needsLof(x.weapon?.row) ? [] : on.map((zone) => ({zone, fx: zoneOn(zone, x.traits)})));
  /** @param {ResolvedSide} x */
  const sees = (x) => fx(x).every(({fx: f}) => !f || f.sees);
  const canA = attacks(a) && (sees(a) || (attacks(b) && sees(b)));
  const canB = attacks(b) && (sees(b) || (attacks(a) && sees(a)));
  /**
   * @param {ResolvedSide} x
   * @param {boolean} can
   * @param {boolean} attacked
   * @returns {VisSide}
   */
  const side = (x, can, attacked) => {
    if (!attacks(x)) return empty;
    // Not `can`: a zone blocks x.
    if (!can) return {blocked: /** @type {{zone: Zone}} */ (fx(x).find(({fx: f}) => f && !f.sees)).zone, lines: [], mod: 0};
    const sixth = attacked && hasSixthSense(x) ? msg('skill.sixthSense') : null;
    /** @type {VisSide['lines']} */
    const lines = fx(x).map(({zone, fx: f}) => {
      const name = zoneName(zone);
      if (!f) return {zone, value: 0, label: name, ignoredBy: ignoredBy(zone, x.traits)};
      if (f.sees && !attacked) return {zone, value: f.notAttacked, label: msg('zone.zeroVisibility', {zone: name}), ignoredBy: null};
      const value = f.sees ? f.attacked : POOR_VISIBILITY_MOD;
      return {zone, value, label: msg('zone.poorVisibility', {zone: name}), ignoredBy: sixth};
    });
    // Zones don't stack: the worst MOD applies, the other zone's is struck by it
    // (an MSV1 shot at in CC through Smoke and White Noise: -6, not -9).
    const live = lines.filter((l) => !l.ignoredBy && l.value);
    const mod = live.length ? Math.min(...live.map((l) => l.value)) : 0;
    const worst = live.find((l) => l.value === mod);
    // `live` has `worst` in it when it has anything.
    for (const l of live) if (l !== worst) l.ignoredBy = /** @type {NonNullable<typeof worst>} */ (worst).label;
    return {blocked: null, lines, mod};
  };
  return {A: side(a, canA, canB), B: side(b, canB, canA)};
}
