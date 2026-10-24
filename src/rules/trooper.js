// One side of a matchup: the picker's selection (ids) resolved against the
// Army data into the trooper that rolls.
import {hasZeroPain, trooperPrograms} from '../army/hacking.js';
import {SKILL} from '../army/ids.js';
import {applyStatOverrides, applyUpgrades, pickedUpgrades} from '../army/loadouts.js';
import {unitById} from '../army/lookup.js';
import {effectiveTraits, hasSkill, skillExtras} from '../army/traits.js';
import {ammoTypes, bsWeapons, ccWeapons, hasAmmo, hasShockAmmo, isBsAttackWeapon, weaponLabel} from '../army/weapons.js';
import {ccAttackSkill} from './closeCombat.js';
import {bangbombValue, fireteamMax, fireteamSize, firewallMod} from './modifiers.js';
import {msg} from '../i18n/message.js';

/** @typedef {import('../types.js').Traits | null | undefined} MaybeTraits */
/** @typedef {import('../types.js').WeaponEntry} WeaponEntry */
/** @typedef {import('../types.js').PseudoEntry} PseudoEntry */
/** @typedef {import('../types.js').Choice} Choice */

// What the trooper's BS Attack skill (profile, loadout or upgrade) does to
// every weapon it makes a BS Attack with, templates and grenades included:
//   AP                  AP Ammunition: the target's ARM or BTS is halved
//   T2                  T2 Ammunition added: 2 wounds per failed save
//   SR-1, SR-2          -1 / -2 to the target's Saving Rolls (the PS drops)
//   Continuous Damage   the Continuous Damage Trait
// (+1B / +1SD are roll bonuses, see rules/modifiers.js attackBonuses.)
export const BS_ATTACK_WEAPON_EXTRAS = /^(AP|T2|SR-\d+|Continuous Damage)$/;

/** @param {MaybeTraits} traits */
export function bsAttackWeaponMods(traits) {
  const extras = skillExtras(traits, SKILL.BS_ATTACK);
  const sr = /** @type {RegExpExecArray[]} */ (extras.map((e) => /^SR-(\d+)$/.exec(e)).filter(Boolean)).map((m) => Number(m[1]));
  return {
    ap: extras.includes('AP'),
    t2: extras.includes('T2'),
    cont: extras.includes('Continuous Damage'),
    // No trooper lists two SR values; the larger one applies.
    sr: sr.length > 0 ? Math.max(...sr) : 0,
  };
}

// The weapons a trooper can make a BS Attack with (army/weapons.js bsWeapons),
// with its BS Attack skill applied. `traits` are effectiveTraits().
/**
 * @param {import('../types.js').OptionRow} option
 * @param {Record<string, import('../types.js').WeaponRow[]>} weapons
 * @param {MaybeTraits} traits
 * @returns {WeaponEntry[]}
 */
export function trooperWeapons(option, weapons, traits) {
  const list = bsWeapons(option, weapons);
  const bs = bsAttackWeaponMods(traits);
  if (!bs.ap && !bs.t2 && !bs.cont && !bs.sr) return list;
  return list.map((w) => {
    let {row, mods} = w;
    if (bs.ap) mods = {...mods, forceAP: true};
    if (bs.cont) mods = {...mods, cont: true};
    if (bs.sr) mods = {...mods, psMod: mods.psMod - bs.sr};
    if (bs.t2 && !hasAmmo(row, 'T2')) row = {...row, ammo: [...ammoTypes(row), 'T2']};
    return {...w, row, mods, label: weaponLabel(row, mods)};
  });
}

// The trooper's CC weapons (army/weapons.js ccWeapons), with its CC Attack
// skill applied: AP, Shock and Continuous Damage go on every one of them.
/**
 * @param {import('../types.js').OptionRow} option
 * @param {Record<string, import('../types.js').WeaponRow[]>} weapons
 * @param {MaybeTraits} traits
 * @returns {WeaponEntry[]}
 */
export function trooperCcWeapons(option, weapons, traits) {
  const list = ccWeapons(option, weapons);
  const cc = ccAttackSkill(traits);
  if (!cc.ap && !cc.shock && !cc.cont) return list;
  return list.map((w) => {
    let {row, mods} = w;
    if (cc.ap) mods = {...mods, forceAP: true};
    if (cc.cont) mods = {...mods, cont: true};
    if (cc.shock && !hasShockAmmo(row)) row = {...row, ammo: [...ammoTypes(row), 'Shock']};
    return {...w, row, mods, label: weaponLabel(row, mods)};
  });
}

// Choices that are not weapons.
// Dodge is valid for both sides; "No ARO" only makes sense for the reactive one.
// Bangbomb is a second Dodge, for the player to pick when its LoF/ZoC
// restriction holds.
// Reset: every trooper has it; the card shows it only against a Comms Attack
// (state/matchupView.js). Zero Pain is a better Reset, for hackers that run it
// (army/hacking.js): shown the same way.
/**
 * @param {MaybeTraits} traits
 * @returns {PseudoEntry[]}
 */
function allPseudoWeapons(traits) {
  /** @type {PseudoEntry[]} */
  const list = [{key: 'dodge', kind: 'dodge'}];
  if (bangbombValue(traits)) list.push({key: 'bangbomb', kind: 'dodge', bangbomb: true});
  list.push({key: 'reset', kind: 'reset'});
  if (hasZeroPain(traits)) list.push({key: 'zeroPain', kind: 'reset', zeroPain: true});
  list.push({key: 'none', kind: 'none'});
  return list;
}
/**
 * @param {PseudoEntry[]} list
 * @param {import('../types.js').Side} side
 */
const forRole = (list, side) => (side === 'B' ? list : list.filter((w) => w.kind !== 'none'));
/**
 * @param {MaybeTraits} traits
 * @param {import('../types.js').Side} [side]
 * @returns {PseudoEntry[]}
 */
export const pseudoWeapons = (traits, side = 'B') => forRole(allPseudoWeapons(traits), side);

// The entry `key` names in any of the lists, or null.
/**
 * @param {Choice[][]} lists
 * @param {string} key
 * @returns {Choice | null}
 */
const byKey = (lists, key) => lists.flatMap((l) => l).find((w) => w.key === key) ?? null;

/**
 * The same resolution rolling `key` instead (a weapon in its lists).
 * @param {import('../types.js').ResolvedSide} r
 * @param {string} key
 * @returns {import('../types.js').ResolvedSide}
 */
export const withWeapon = (r, key) => ({...r, weapon: byKey([r.weapons, r.ccWeapons, r.programs, r.pseudo], key)});

// Name of a choice that is not a weapon: "Dodge", "Bangbomb", "Reset", "Zero
// Pain", "No ARO" (a message descriptor, i18n/message.js).
/** @param {PseudoEntry} w */
export const pseudoName = (w) => msg(`pseudo.${w.bangbomb ? 'bangbomb' : w.zeroPain ? 'zeroPain' : w.kind}`);

// The Firewall chip's values (the MOD to the Comms Attack). The chip starts
// on the trooper's own Firewall, off without one (Alex, 2026-10-22): `sel.firewall`
// null is that default, 0 the player's "none", -3 / -6 the player's pick.
// A Firewall of its own can't be switched off: "none" keeps it.
export const FIREWALL_CHIPS = [-3, -6];
/**
 * @param {number | null | undefined} v
 * @param {MaybeTraits} traits
 */
function firewallChip(v, traits) {
  const own = firewallMod(traits);
  // A chip value is a number; null (the default) isn't one.
  return FIREWALL_CHIPS.includes(/** @type {number} */ (v)) ? /** @type {number} */ (v) : own;
}

/**
 * Resolves a picker selection (ids) against the army data. The returned
 * profile has the loadout's stat overrides and any Team-Ops upgrades applied;
 * the returned option includes upgrade weapons. `side`: whose role the
 * choices are for ('A' active, 'B' reactive): its pseudo-weapon list.
 * @param {import('../types.js').Army | null | undefined} army
 * @param {Partial<import('../types.js').Selection> | null | undefined} sel a field left out is its default (a share link's, a test's)
 * @param {import('../types.js').Side} [side]
 * @returns {import('../types.js').ResolvedSide | null}
 */
export function resolveSelection(army, sel, side = 'B') {
  if (!army || !sel?.unitId) return null;
  const unit = unitById(army, sel.unitId);
  if (!unit) return null;
  const factionId = sel.factionId ?? (unit.inFactions.length === 1 ? unit.inFactions[0] : null);
  const groups = factionId ? unit.byFaction[factionId]?.groups ?? null : null;
  const group = groups?.find((g) => g.id === sel.groupId) ?? (groups?.length === 1 ? groups[0] : null);
  const baseProfile = group?.profiles.find((p) => p.id === sel.profileId) ?? (group?.profiles.length === 1 ? group.profiles[0] : null);
  const baseOption = group?.options.find((o) => o.id === sel.optionId) ?? null;
  let profile = baseProfile ? applyStatOverrides(baseProfile, baseOption) : null;
  let option = baseOption;
  const teamOps = Boolean(profile) && hasSkill(effectiveTraits(profile, baseOption), SKILL.TEAM_OPS);
  const upgrades = teamOps ? pickedUpgrades(unit, sel) : [];
  // Upgrades come with a profile (teamOps).
  if (upgrades.length > 0) ({profile, option} = applyUpgrades(/** @type {import('../types.js').ProfileRow} */ (profile), baseOption, upgrades));
  // Upgrade weapons the calculator can't roll (e.g. mines), for a warning.
  const unsupportedUpgradeWeapons = upgrades
    .flatMap((u) => u.attrs.filter((x) => x.type === 'weapon'))
    .filter((w) => !(army.weapons[/** @type {number} */ (w.id)] ?? []).some(isBsAttackWeapon))
    .map((w) => /** @type {string} */ (w.name));
  const baseTraits = profile ? effectiveTraits(profile, option) : null;
  // Sapper: the trooper may sit in a Foxhole (player's chip), which gives it
  // Partial Cover and Mimetism (-3) (wiki, Foxhole State). Cover doesn't
  // stack: the Foxhole is its cover.
  const canSapper = hasSkill(baseTraits, SKILL.SAPPER);
  const sapper = canSapper && Boolean(sel.sapper);
  // Sapper needs traits, so a Foxhole has them.
  const traits = sapper ? foxholeTraits(/** @type {import('../types.js').Traits} */ (baseTraits)) : baseTraits;
  // What the trooper can roll with, built once: the side card shows these
  // lists and the weapon key is looked up in them. BS and CC weapons and
  // programs need a loadout; Dodge and Reset only a profile.
  const weapons = option ? trooperWeapons(option, army.weapons, traits) : [];
  const ccWeapons = option ? trooperCcWeapons(option, army.weapons, traits) : [];
  const programs = option ? trooperPrograms(traits, army.lang) : [];
  // No ARO is looked up whichever the side (a share link may carry it), but
  // only the reactive side is offered it.
  const allPseudo = profile ? allPseudoWeapons(traits) : [];
  const weapon = option && profile && sel.weaponKey ? byKey([weapons, ccWeapons, programs, allPseudo], sel.weaponKey) : null;
  const ftMax = fireteamMax(unit, baseOption);
  return {
    unit, factionId, groups, group, profile, option, traits, weapon,
    weapons, ccWeapons, programs, pseudo: forRole(allPseudo, side),
    // Team-Ops trooper: it may pick from unit.upgrades (chart and TacBall).
    teamOps: teamOps && Boolean(unit.upgrades),
    upgrades, unsupportedUpgradeWeapons,
    inCover: Boolean(sel.inCover) || sapper,
    // Situation chips on its own roll (modifiers.js targetedMod, hackedResetMod,
    // immADodgeMod): read only while the weapon they need is picked.
    targeted: Boolean(sel.targeted),
    hackedReset: sel.hackedReset ?? 0,
    immA: Boolean(sel.immA),
    // Its Firewall against a Comms Attack (the chip): -3, -6 or 0.
    firewall: firewallChip(sel.firewall, traits),
    canSapper,
    sapper,
    // The player chose to use Surprise Attack (active side only).
    surpriseAttack: Boolean(sel.surpriseAttack),
    // The player declared Berserk (active side, units with the skill).
    berserk: Boolean(sel.berserk),
    // Fireteam: the largest this trooper can join, and the size in use
    // (a stored size above the max, e.g. from a share link, drops to it).
    ftMax,
    ftSize: fireteamSize(sel.ftSize, ftMax),
    // Allies in contact with the target (a CC Attack's +1 B each); what fits
    // against the actual target is closeCombat.js ccAllies.
    ccAllies: sel.ccAllies ?? 0,
  };
}

// In a Foxhole, Mimetism (-3) joins the trooper's skills unless it already has
// Mimetism (no stacking: a -6 stays -6). Marked so the ledger can say why.
/**
 * @param {import('../types.js').Traits} traits
 * @returns {import('../types.js').Traits}
 */
function foxholeTraits(traits) {
  if (hasSkill(traits, SKILL.MIMETISM)) return traits;
  return {...traits, skills: [...traits.skills, {id: SKILL.MIMETISM, name: 'Mimetism', extra: ['-3'], foxhole: true}]};
}

// Spec-Ops trooper? Only the Initial profile lists the skill, so check the group.
/** @param {import('../types.js').ResolvedSide | null | undefined} side */
export const isSpecOps = (side) =>
  (side?.group?.profiles ?? []).some((p) => (p.skills ?? []).some((sk) => sk.id === SKILL.SPEC_OPS));
