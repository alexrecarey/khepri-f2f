// Smoke and Eclipse Ammunition (wiki: Smoke Ammunition, Eclipse Ammunition,
// Multispectral Visor, Dodge): a BS Attack that puts a Zero Visibility Zone
// on the table instead of hitting anyone (Smoke Grenades, Smoke Grenade
// Launcher, Eclipse Grenades, Eclipse Grenade Launcher; army/weapons.js
// isSmoke, kind 'smoke').
// - Targetless: thrown at a point, so none of a target's MODs apply
//   (Mimetism, Albedo, cover, Targeted). Range MODs do (to the shared
//   distance), and so do the user's own: Fireteam +1 BS / +1 SD, the
//   loadout's, BS Attack (-X) on the opponent, Surprise Attack.
// - Non-lethal, no PS: no Saving Roll. Winning the Face to Face Roll keeps
//   the template on the table; losing it, or failing a Normal Roll, removes
//   it. A Critical does nothing more than win. The results show "Smoke
//   placed" in place of wounds (rules/woundStates.js).
// - Face to Face against every enemy attack that needs a Roll and LoF
//   through the template: a rolled BS Attack. Not a Direct Template (no
//   roll: the template hits, the smoke is a Normal Roll, matchup.js), a CC
//   Attack or a Comms Attack (no LoF needed): then each side rolls on its own
//   (params.unopposed). A trooper under the template Dodges with a Normal
//   Roll, not against the smoke: its Dodge isn't rolled here (evade.js).
// - A Multispectral Visor of any level draws LoF through Smoke, so its user
//   makes no Face to Face Roll against it. Eclipse is Reflective: it does.
// Not modelled: Speculative Attack (a Long Skill at -6 without LoF).
import {ammoMsg, isReflective, isPseudo, needsLof, rolls, smokeAmmo} from '../army/weapons.js';
import {hasMsv, msvName} from '../army/traits.js';
import {msg} from '../i18n/message.js';
import {mark, section} from './lines.js';
import {RANGE_BANDS, bestBandTo} from './ranges.js';

/** @typedef {import('../types.js').ResolvedSide} ResolvedSide */
/** @typedef {import('../types.js').Message} Message */

/**
 * @param {ResolvedSide | null | undefined} x
 * @returns {x is ResolvedSide & {weapon: import('../types.js').WeaponEntry & {kind: 'smoke'}}}
 */
export const isSmokeAttack = (x) => x?.weapon?.kind === 'smoke';

// The ammunition's name (ammoMsg 'Smoke' / 'Eclipse') of x's smoke weapon.
/** @param {import('../types.js').WeaponEntry} w */
export const smokeName = (w) => ammoMsg(/** @type {string} */ (smokeAmmo(w.row)));

// Why y's roll is not opposed by x's smoke, as the matchup note says it; null
// when it is (a rolled attack that needs LoF, by a trooper the ammunition
// affects), or when there is no smoke or nothing rolled against it. A Dodge
// or Reset is evade.js' business (a Dodge isn't rolled against Smoke).
/**
 * @param {ResolvedSide | null | undefined} x
 * @param {ResolvedSide | null | undefined} y
 * @returns {Message | null}
 */
export function smokeNotOpposed(x, y) {
  if (!isSmokeAttack(x) || !rolls(y?.weapon) || isPseudo(y.weapon)) return null;
  const w = y.weapon;
  const ammo = smokeName(x.weapon);
  if (w.kind === 'cc') return msg('note.smokeNoLof', {by: msg('note.ccAttack'), ammo});
  if (!needsLof(w.row)) return msg('note.smokeNoLof', {by: w.row.name, ammo});
  if (!isReflective(x.weapon.row) && hasMsv(y.traits)) return msg('note.smokeMsv', {msv: msvName(y.traits), ammo});
  return null;
}

// Smoke Grenades and Eclipse Grenades are thrown at a point near the user:
// their 0 MOD stops at 8", so picking one moves the user's own range there
// (state/reduce.js pickWeapon), the other trooper's stays. A Launcher keeps
// its 0 MOD to 24": its pick leaves the range alone.
/** @param {import('../types.js').WeaponEntry} w */
export const throwsClose = (w) => w.kind === 'smoke' && bestBandTo(w.row) <= RANGE_BANDS[0].to;

// What x's smoke does to the target: nothing to save. The calculator's SMOKE
// ammunition (no Saving Rolls), no PS lines (so no save section in the
// ledger), the ammunition section naming it.
/**
 * @param {ResolvedSide & {weapon: import('../types.js').WeaponEntry}} x
 * @param {import('../types.js').Side} side
 * @returns {{inputs: Partial<import('../types.js').Params>, ps: undefined, ammo: import('../types.js').Section, notes: Message[]}}
 */
export function smokeHit(x, side) {
  const ammo = smokeName(x.weapon);
  // Computed keys: tsc sees an index signature, so the shape is stated.
  const inputs = /** @type {Partial<import('../types.js').Params>} */ ({
    [`damage${side}`]: 0,
    [`ammo${side}`]: 'SMOKE',
    [`cont${side}`]: false,
    [`shock${side}`]: false,
  });
  return {inputs, ps: undefined, ammo: section([mark('', ammo, null)], ammo), notes: []};
}
