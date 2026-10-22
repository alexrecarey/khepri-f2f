// One side of a matchup: the picker's selection (ids) resolved against the
// Army data into the trooper that rolls.
import {hasZeroPain, trooperPrograms} from '../army/hacking.js';
import {SKILL} from '../army/ids.js';
import {applyStatOverrides, applyUpgrades, pickedUpgrades} from '../army/loadouts.js';
import {unitById} from '../army/lookup.js';
import {effectiveTraits, hasSkill, skillExtras} from '../army/traits.js';
import {ammoTypes, bsWeapons, ccWeapons, hasAmmo, hasShockAmmo, isBsAttackWeapon, weaponLabel} from '../army/weapons.js';
import {ccAttackSkill} from './closeCombat.js';
import {bangbombValue, fireteamMax, fireteamSize} from './modifiers.js';
import {tEn} from '../i18n/index.js';

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

// The trooper's CC weapons (army/weapons.js ccWeapons), with its CC Attack
// skill applied: AP, Shock and Continuous Damage go on every one of them.
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
export function pseudoWeapons(traits, side = 'B') {
  const list = [{key: 'dodge', pseudo: 'dodge'}];
  if (bangbombValue(traits)) list.push({key: 'bangbomb', pseudo: 'dodge', bangbomb: true});
  list.push({key: 'reset', pseudo: 'reset'});
  if (hasZeroPain(traits)) list.push({key: 'zeroPain', pseudo: 'reset', zeroPain: true});
  if (side === 'B') list.push({key: 'none', pseudo: 'none'});
  return list;
}

// Name of a choice that is not a weapon: "Dodge", "Bangbomb", "Reset", "Zero Pain", "No ARO".
export const pseudoName = (w, t = tEn) => t(`pseudo.${w.bangbomb ? 'bangbomb' : w.zeroPain ? 'zeroPain' : w.pseudo}`);

// The Firewall chip's values (the MOD to the Comms Attack); 0 is none.
export const FIREWALL_CHIPS = [-3, -6];
const firewallChip = (v) => (FIREWALL_CHIPS.includes(v) ? v : 0);

// Resolves a picker selection (ids) against the army data. The returned
// profile has the loadout's stat overrides and any Team-Ops upgrades applied;
// the returned option includes upgrade weapons.
export function resolveSelection(army, sel) {
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
  if (upgrades.length > 0) ({profile, option} = applyUpgrades(profile, baseOption, upgrades));
  // Upgrade weapons the calculator can't roll (e.g. mines), for a warning.
  const unsupportedUpgradeWeapons = upgrades
    .flatMap((u) => u.attrs.filter((x) => x.type === 'weapon'))
    .filter((w) => !(army.weapons[w.id] ?? []).some(isBsAttackWeapon))
    .map((w) => w.name);
  const baseTraits = profile ? effectiveTraits(profile, option) : null;
  // Sapper: the trooper may sit in a Foxhole (player's chip), which gives it
  // Partial Cover and Mimetism (-3) (wiki, Foxhole State). Cover doesn't
  // stack: the Foxhole is its cover.
  const canSapper = hasSkill(baseTraits, SKILL.SAPPER);
  const sapper = canSapper && Boolean(sel.sapper);
  const traits = sapper ? foxholeTraits(baseTraits) : baseTraits;
  let weapon = null;
  if (option && profile && sel.weaponKey) {
    weapon = trooperWeapons(option, army.weapons, traits).find((w) => w.key === sel.weaponKey)
      ?? trooperCcWeapons(option, army.weapons, traits).find((w) => w.key === sel.weaponKey)
      ?? trooperPrograms(traits, army.lang).find((w) => w.key === sel.weaponKey)
      ?? pseudoWeapons(traits, 'B').find((w) => w.key === sel.weaponKey)
      ?? null;
  }
  const ftMax = fireteamMax(unit, baseOption);
  return {
    unit, factionId, groups, group, profile, option, traits, weapon,
    // Team-Ops trooper: it may pick from unit.upgrades (chart and TacBall).
    teamOps: teamOps && Boolean(unit.upgrades),
    upgrades, unsupportedUpgradeWeapons,
    inCover: Boolean(sel.inCover) || sapper,
    // The Firewall the player gives it against a Comms Attack (chip): -3, -6 or 0.
    firewall: firewallChip(sel.firewall),
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
function foxholeTraits(traits) {
  if (hasSkill(traits, SKILL.MIMETISM)) return traits;
  return {...traits, skills: [...traits.skills, {id: SKILL.MIMETISM, name: 'Mimetism', extra: ['-3'], foxhole: true}]};
}

// Spec-Ops trooper? Only the Initial profile lists the skill, so check the group.
export const isSpecOps = (side) =>
  (side?.group?.profiles ?? []).some((p) => (p.skills ?? []).some((sk) => sk.id === SKILL.SPEC_OPS));
