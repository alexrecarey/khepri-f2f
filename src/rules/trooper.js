// One side of a matchup: the picker's selection (ids) resolved against the
// Army data into the trooper that rolls.
import {SKILL} from '../army/ids.js';
import {applyStatOverrides, applyUpgrades, pickedUpgrades} from '../army/loadouts.js';
import {effectiveTraits, hasSkill, skillExtras} from '../army/traits.js';
import {ammoTypes, bsWeapons, hasAmmo, isBsAttackWeapon, weaponLabel} from '../army/weapons.js';
import {dodgeSuccessValue} from './modifiers.js';

// What the trooper's BS Attack skill (profile, loadout or upgrade) does to
// every weapon it makes a BS Attack with, templates and grenades included:
//   AP                  AP Ammunition: the target's ARM or BTS is halved
//   T2                  T2 Ammunition added: 2 wounds per failed save
//   SR-1, SR-2          -1 / -2 to the target's Saving Rolls (the PS drops)
//   Continuous Damage   the Continuous Damage Trait
// (+1B / +1SD are roll bonuses, see rules/modifiers.js attackBonuses.)
export const BS_ATTACK_WEAPON_EXTRAS = /^(AP|T2|SR-\d+|Continuous Damage)$/;

export function bsAttackWeaponMods(traits) {
  const extras = skillExtras(traits, SKILL.BS_ATTACK);
  const sr = extras.map((e) => /^SR-(\d+)$/.exec(e)).filter(Boolean).map((m) => Number(m[1]));
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

// Choices that are not weapons.
// Dodge is valid for both sides; "No ARO" only makes sense for the reactive one.
export function pseudoWeapons(profile, traits, side = 'B', dodgeMod = 0) {
  const list = [{key: 'dodge', pseudo: 'dodge', label: `Dodge (PH ${dodgeSuccessValue(profile, traits, dodgeMod)})`}];
  if (side === 'B') list.push({key: 'none', pseudo: 'none', label: 'No ARO (unopposed)'});
  return list;
}

// Resolves a picker selection (ids) against the army data. The returned
// profile has the loadout's stat overrides and any Team-Ops upgrades applied;
// the returned option includes upgrade weapons.
export function resolveSelection(army, sel) {
  if (!army || !sel?.unitId) return null;
  const unit = army.units.find((u) => u.id === sel.unitId);
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
  if (upgrades.length > 0) ({profile, option} = applyUpgrades(profile, baseOption, upgrades));
  // Upgrade weapons the calculator can't roll (e.g. mines), for a warning.
  const unsupportedUpgradeWeapons = upgrades
    .flatMap((u) => u.attrs.filter((x) => x.type === 'weapon'))
    .filter((w) => !(army.weapons[w.id] ?? []).some(isBsAttackWeapon))
    .map((w) => w.name);
  const traits = profile ? effectiveTraits(profile, option) : null;
  let weapon = null;
  if (option && profile && sel.weaponKey) {
    weapon = trooperWeapons(option, army.weapons, traits).find((w) => w.key === sel.weaponKey)
      ?? pseudoWeapons(profile, traits, 'B').find((w) => w.key === sel.weaponKey)
      ?? null;
  }
  return {
    unit, factionId, groups, group, profile, option, traits, weapon,
    upgrades, unsupportedUpgradeWeapons,
    inCover: Boolean(sel.inCover),
    // The player chose to use Surprise Attack (active side only).
    surpriseAttack: Boolean(sel.surpriseAttack),
    ftSize: sel.ftSize ?? 1,
  };
}

// Spec-Ops trooper? Only the Initial profile lists the skill, so check the group.
export const isSpecOps = (side) =>
  (side?.group?.profiles ?? []).some((p) => (p.skills ?? []).some((sk) => sk.id === SKILL.SPEC_OPS));
