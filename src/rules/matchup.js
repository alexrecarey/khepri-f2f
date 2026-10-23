// Matchup -> calculator params: applies the N5 rules to two resolved troopers
// (rules/trooper.js resolveSelection) and returns the engine input with the
// notes and warnings to show next to it.
import {ZERO_PAIN} from '../army/hacking.js';
import {SKILL} from '../army/ids.js';
import {upgradeRaising} from '../army/loadouts.js';
import {hasSkill} from '../army/traits.js';
import {attackAttribute, causesWounds, hasContinuousDamage, isCommsAttack, isNonLethal, needsLof, stateCaused, weaponPS} from '../army/weapons.js';
import {
  COVER_BS_MOD, COVER_SAVE_MOD, FIREWALL_SAVE_MOD, LIMITS, albedoMod, albedoValue, attackBonuses, attackStat, benefitsFromCover, clamp, coverBsMod,
  bangbombMod, bangbombValue, cancelsBangbomb, dodgeExtras, evades, fireteamBonuses, firewallOf, hasNanoscreen, ignoresCoverOnSaves, keepsAroBurst,
  hackedResetMod, immADodgeMod, mimetismMod, mimetismValue, msvName, neurocineticsAroBurst, opposingMods, programSvMods, reaches, targetedMod,
  targetedResetMod,
} from './modifiers.js';
import {capLine, clampSv, line, modSum, section, sum} from './lines.js';
import {RANGE_BANDS, bandFrom, rangeModFor} from './ranges.js';
import {visibility, zoneName} from './visibility.js';
import {
  calcAmmo, hasImmunity, hasNoEffect, immunityAgainst, immunityFor, immunityNote, noEffectBy, saveHalving, shockApplies, vulnerabilityTo,
} from './saves.js';
import {isSpecOps} from './trooper.js';
import {ccAttackMods, ccBurst, ccSd, isCcAttack} from './closeCombat.js';
import {tEn} from '../i18n/index.js';

// The Immunities the rules here read, and Immunities to States the calculator
// doesn't model (E/M's IMM-B and Isolated, Possession): recognized, and
// correctly change nothing here, since a hit is scored the same and only the
// State afterwards differs. A weapon that only Isolates (Jammer) is the
// exception: Immunity (Isolated) or Warhorse leaves it without effect
// (saves.js noEffectBy).
// scripts/army-validate.mjs fails on any other Immunity in the army data.
export const MODELED_IMMUNITIES = ['AP', 'ARM', 'BTS', 'Continuous Damage', 'Critical', 'Enhanced', 'Shock'];
export const STATE_IMMUNITIES = ['IMM-B', 'Isolated', 'POS'];

// ctx: what one deriveInputs call shares with its helpers. `say(side, key,
// params)` adds a note ("Active: ..."; side null for both), `warn` a warning,
// `fail` an error; `t` is their language; `vis` the Smoke / White Noise
// blocks (visibility.js); `opposing[s]` the MOD the other side puts on s's roll.
function approximationWarnings(s, side, target, ctx) {
  const {warn, t} = ctx;
  const row = side?.weapon?.row;
  if (row && hasNoEffect(target?.traits, row)) {
    warn(s, 'warning.noEffect', {weapon: row.name, by: noEffectBy(target.traits, row, t)});
  } else if (row && stateCaused(row)) {
    // Not a warning: the results say Isolated / Stunned (rules/woundStates.js).
  } else if (row && isNonLethal(row)) {
    warn(s, 'warning.nonLethal', {weapon: row.name});
  }
  for (const name of side?.unsupportedUpgradeWeapons ?? []) warn(s, 'warning.upgradeWeapon', {weapon: name});
}

const signed = (n) => `${n > 0 ? '+' : ''}${n}`;

// The MODs y's skills put on x's Face to Face Roll (modifiers.js
// opposingMods), one line each in y's colour; one x ignores is struck with the
// reason, and noted. Nothing when y has no line of fire (it doesn't attack).
function opposingLines(y, x, s, ctx) {
  const o = other(s);
  if (ctx.vis[o].blocked) return [];
  const lines = opposingMods(y, x, o === 'A', ctx.t).map((m) => line(m.value, m.label, o, m.ignoredBy));
  for (const l of lines) if (l.struck) ctx.say(s, 'note.ignoresMod', {by: l.struck, mod: l.label});
  return lines;
}

// An Attribute's name, and the Team-Ops upgrade that raised it: "BS (Team-Ops: BS+1)".
function statLabel(x, attr, t) {
  const name = t(`stat.${attr.toLowerCase()}`);
  const u = upgradeRaising(x.upgrades, attr.toLowerCase());
  return u ? t('ledger.teamOpsStat', {stat: name, upgrade: u.label}) : name;
}

function rangeLabel(rangeCm, t) {
  const i = RANGE_BANDS.findIndex((b) => rangeCm <= b.to);
  return t('ledger.range', {from: t.distance(bandFrom(i)), to: t.distance(RANGE_BANDS[i].to)});
}

// "Mimetism (-6)", "Mimetism (-3), Foxhole": the target's Mimetism as the ledger names it.
function mimetismLabel(y, full, t) {
  const name = t('skill.mimetismMod', {mod: full});
  return y.traits.skills.find((k) => k.id === SKILL.MIMETISM)?.foxhole ? `${name}, ${t('skill.foxhole')}` : name;
}

// The cover y sits in, by name: its Foxhole, cover, or its Nanoscreen.
const coverLabel = (y, t) => (benefitsFromCover(y) ? (y.sapper ? t('ledger.foxholeCover') : t('ledger.cover')) : t('equip.nanoscreen'));

// A Success Value from its lines: the MODs (every line after the Attribute,
// Fireteam +1 BS included: Alex, 2026-10-10) capped at +/-12, with a note
// when the cap bites (`noted`: an attack says so, a Dodge or Reset doesn't),
// then the total within LIMITS (lines.js).
function svSection(lines, s, ctx, noted = true) {
  const cap = capLine(lines, ctx.t);
  if (cap) {
    const mods = modSum(lines);
    if (noted) ctx.say(s, 'note.modCap', {sum: signed(mods), cap: signed(mods + cap.value)});
    lines.push(cap);
  }
  const c = clampSv(lines, ctx.t);
  if (c) lines.push(c);
  return section(lines);
}

// The MODs y's position and skills put on x's shot, in y's colour: Mimetism
// (what x's MSV cancels struck), Albedo, cover or Nanoscreen, Firewall.
function targetSvLines(x, y, s, t) {
  const o = other(s);
  const {row} = x.weapon;
  const lines = [];
  // Mimetism and Albedo need LoF (a Jammer or a program has none): struck
  // against one. A Comms Attack takes the target's Firewall in place of cover.
  const lof = needsLof(row);
  const full = mimetismValue(y.traits);
  if (full && !lof) lines.push(line(full, t('skill.mimetismMod', {mod: full}), o, t('ledger.noLof')));
  else if (full) {
    const applied = mimetismMod(y.traits, x.traits);
    const name = mimetismLabel(y, full, t);
    if (applied) lines.push(line(applied, `${name}${applied !== full ? `, ${msvName(x.traits, t)}` : ''}`, o));
    else lines.push(line(full, name, o, msvName(x.traits, t) ?? t('ledger.cancelled')));
  }
  const albedo = lof ? albedoMod(y.traits, x.traits) : 0;
  if (albedo) lines.push(line(albedo, t('equip.albedo'), o));
  else if (albedoValue(y.traits)) lines.push(line(albedoValue(y.traits), t('equip.albedo'), o, lof ? t('ledger.albedoOnly') : t('ledger.noLof')));
  const comms = isCommsAttack(row);
  const cover = coverBsMod(y, x.traits, row);
  const coverName = coverLabel(y, t);
  if (cover) lines.push(line(cover, coverName, o));
  else if (benefitsFromCover(y) || hasNanoscreen(y)) {
    const why = comms ? t('ledger.commsAttack') : hasSkill(x.traits, SKILL.MARKSMANSHIP) ? t('skill.marksmanship') : t('skill.limitedCover');
    lines.push(line(COVER_BS_MOD, coverName, o, why));
  }
  // Firewall: a Comms Attack's cover.
  const firewall = comms ? firewallOf(y) : 0;
  if (firewall) lines.push(line(firewall, t('equip.firewallMod', {mod: firewall}), o));
  return lines;
}

// A shot's Success Value: the Attribute, then every MOD as a line.
function attackSv(x, y, rangeCm, s, ctx) {
  const {t, vis} = ctx;
  const o = other(s);
  const {row, mods} = x.weapon;
  const lines = [line(attackStat(x.profile, row), statLabel(x, attackAttribute(row), t), null)];
  // Fireteam +1 BS: none on a Hacking Program (attackBonuses).
  const ftBs = attackBonuses(x).bs;
  if (ftBs) lines.push(line(ftBs, t('ledger.fireteam', {size: x.ftSize}), s));
  const rangeMod = rangeModFor(row, rangeCm, x.traits);
  // Out of range: the attack still happens but always fails. A success value
  // of 0 misses on every roll, with no crit.
  if (rangeMod === null) return {...section([...lines, line('—', t('ledger.outOfRange'), s)], 0), note: t('ledger.outOfRangeNote')};
  if (rangeMod) lines.push(line(rangeMod, rangeLabel(rangeCm, t), s));
  if (mods.sv) lines.push(line(mods.sv, t('ledger.loadout'), s));
  // A program's Attack MOD is x's, the target's ECM: Hacker the target's.
  for (const m of programSvMods(x, y, t)) lines.push(line(m.value, m.label, m.target ? o : s));
  // Targeted is the target's State.
  if (targetedMod(x, y)) lines.push(line(targetedMod(x, y), t('chip.targeted'), o));
  if (y) {
    lines.push(...targetSvLines(x, y, s, t));
    // Smoke / White Noise: x's own sight, so x's colour.
    for (const v of vis[s].lines) lines.push(line(v.value, v.label, s, v.ignoredBy));
    lines.push(...ctx.opposing[s]);
  }
  return svSection(lines, s, ctx);
}

// A shot's Burst: the weapon's, the loadout's and BS Attack's +B, and in ARO
// one die unless Total Reaction or Neurocinetics keep it.
function burstLines(x, s, ctx) {
  const {say, t} = ctx;
  const {row} = x.weapon;
  // Neurocinetics is for BS Attacks: a program keeps its Burst.
  const neuro = x.weapon.kind !== 'program';
  // Neurocinetics: B 1 in the Active Turn, Burst MODs included (wiki).
  if (s === 'A' && neuro && hasSkill(x.traits, SKILL.NEUROCINETICS)) {
    say(s, 'note.neurocinetics');
    return [line(1, t('skill.neurocinetics'), s)];
  }
  const lines = [line(row.burst ?? 1, x.weapon.name ?? row.name, null)];
  const b = attackBonuses(x).burst;
  if (b) lines.push(line(b, t('ledger.loadoutOrBsAttack'), s));
  const aro = s === 'B' && neuro ? neurocineticsAroBurst(x.traits) : 0;
  if (aro) lines.push(line(aro, t('skill.neurocinetics'), s));
  // In ARO a trooper rolls one die, whatever its burst (Total Reaction aside).
  if (s === 'B' && !keepsAroBurst(x) && sum(lines) !== 1) lines.push(line(1 - sum(lines), t('ledger.aroOneDie'), null));
  return lines;
}

// A shot's Special Dice: the loadout's and BS Attack's (+1SD), the Fireteam's.
function sdLines(x, s, t) {
  const lines = [];
  const ft = x.weapon.kind === 'program' ? 0 : fireteamBonuses(x.ftSize).sd;
  const own = attackBonuses(x).sd - ft;
  if (own) lines.push(line(own, t('ledger.loadoutOrBsAttack'), s));
  if (ft) lines.push(line(ft, t('ledger.fireteam', {size: x.ftSize}), s));
  return lines;
}

// A shot (a BS Attack, a Direct Template, a Hacking Program): Success Value,
// Burst and Special Dice as lines, each summed into its input.
function attackInputs(x, y, rangeCm, side, ctx) {
  const sv = attackSv(x, y, rangeCm, side, ctx);
  const burst = section(burstLines(x, side, ctx));
  const sd = section(sdLines(x, side, ctx.t));
  const hit = hitInputs(x, y, side, ctx);
  const inputs = {
    [`successValue${side}`]: sv.total,
    [`burst${side}`]: clamp(LIMITS.burst, burst.total),
    [`bonusBurst${side}`]: clamp(LIMITS.bonusBurst, sd.total),
    ...hit.inputs,
  };
  return {inputs, lines: {kind: x.weapon.kind === 'template' ? 'template' : 'attack', sv, burst, sd}, ps: hit.ps};
}

// A CC Attack (closeCombat.js): CC plus its own MODs and the opponent's,
// capped; no range, cover, Mimetism or Smoke. Burst and Special Dice from
// the weapon and Martial Arts.
function ccAttackInputs(x, y, side, ctx) {
  const {t} = ctx;
  const lines = [line(attackStat(x.profile, x.weapon.row), statLabel(x, 'cc', t), null)];
  for (const m of ccAttackMods(x, side === 'A', t)) lines.push(line(m.value, m.label, side));
  if (y) lines.push(...ctx.opposing[side]);
  const sv = svSection(lines, side, ctx);
  // The weapon's B is the weapon's, ARO is the rules', the rest are x's.
  const bursts = ccBurst(x, side === 'A', y, t).map((l, i) => line(l.value, l.label, i === 0 || l.aro ? null : side));
  // B over the cap (LIMITS.burst): the rest is lost.
  const over = sum(bursts) - clamp(LIMITS.burst, sum(bursts));
  if (over > 0) bursts.push(line(-over, t('ledger.burstCap', {max: LIMITS.burst[1]}), null));
  const burst = section(bursts);
  const sd = section(ccSd(x, t).map((l) => line(l.value, l.label, side)));
  const hit = hitInputs(x, y, side, ctx);
  const inputs = {
    [`successValue${side}`]: sv.total,
    [`burst${side}`]: burst.total,
    [`bonusBurst${side}`]: clamp(LIMITS.bonusBurst, sd.total),
    [`template${side}`]: false,
    ...hit.inputs,
  };
  return {inputs, lines: {kind: 'attack', sv, burst, sd}, ps: hit.ps};
}

// The PS of x's hits: the weapon's own, then BS Attack (SR-1 / SR-2) as its
// own line: it is the attacker's skill, not the weapon's (MULTI HMG 5, then
// -1). On a program it is the program's upgrade (Trinity (SR-1)).
function psLines(x, s, t) {
  const {row, mods} = x.weapon;
  const lines = [line(weaponPS(row, {...mods, psMod: 0}), t('abbr.PS'), null)];
  const sr = `${t('abbr.SR')}${mods?.psMod}`;
  if (mods?.psMod) {
    lines.push(line(mods.psMod, x.weapon.kind === 'program' ? t('ledger.programMod', {program: row.name, mod: sr}) : t('skill.bsAttackMod', {mod: sr}), s));
  }
  return lines;
}

// What x's hits do to y: PS, ammunition, Continuous Damage, Shock, with the
// notes on Immunity and Vulnerability. The same for a shot and a CC Attack.
// Returns the inputs and the PS lines (the save section's first lines).
function hitInputs(x, y, side, ctx) {
  const {say, t} = ctx;
  const {row, mods} = x.weapon;
  const noEffect = hasNoEffect(y?.traits, row);
  const immunity = immunityAgainst(y?.traits, row);
  // Immunity (Continuous Damage): the Trait is ignored, the hit is not.
  const contImmune = hasImmunity(y?.traits, 'Continuous Damage', row);
  const ps = psLines(x, side, t);
  const out = {
    [`damage${side}`]: clamp(LIMITS.damage, sum(ps)),
    [`ammo${side}`]: noEffect ? 'NONE' : calcAmmo(row, y?.traits),
    [`cont${side}`]: !immunity && !contImmune && hasContinuousDamage(row, mods),
    [`shock${side}`]: shockApplies(row, y),
  };
  if (out[`shock${side}`]) say(side, 'note.shock');
  const state = stateCaused(row);
  if (state && !noEffect) say(side, 'note.stateCaused', {weapon: row.name, state: t(`state.${state.toLowerCase()}`)});
  // State-only weapons get a warning instead (no effect), or play as always (Stunned).
  if (!immunity && contImmune && hasContinuousDamage(row, mods)) {
    say(side, 'note.contImmune');
  }
  const note = immunity && causesWounds(row) && immunityNote(immunity, row, mods, t);
  if (note) say(side, 'note.text', {text: note});
  const vulnerable = vulnerabilityTo(y?.traits, row);
  const lost = vulnerable && immunityFor(y.traits, row);
  if (lost) say(side, 'note.vulnerability', {vulnerable: t.term('extras', vulnerable), immunity: t.term('extras', lost)});
  return {inputs: out, ps};
}

// A Dodge: one PH roll (Dodge MODs, Bangbomb, IMM-A and the Fireteam's +1 included,
// Dodge (+1SD) as Special Dice) that causes no Saving Rolls. `incoming`: the
// weapon being Dodged, if any (null when the attacker has no line of fire).
function dodgeInputs(x, y, side, incoming, ctx) {
  const {t} = ctx;
  const d = dodgeExtras(x.traits);
  // Dodge (PH=14) replaces the Attribute, so it isn't a MOD (MOD_CAP).
  const lines = [d.ph !== null ? line(d.ph, t('ledger.dodgePh', {ph: d.ph}), side) : line(x.profile.ph ?? 0, statLabel(x, 'ph', t), null)];
  if (d.mod) lines.push(line(d.mod, t('skill.dodgeMod', {mod: `+${d.mod}`}), side));
  const ft = fireteamBonuses(x.ftSize).dodge;
  if (ft) lines.push(line(ft, t('ledger.fireteam', {size: x.ftSize}), side));
  const bang = bangbombMod(x, incoming);
  if (bang) lines.push(line(bang, t('equip.bangbombMod', {mod: `+${bang}`}), side));
  else if (x.weapon.bangbomb && incoming?.row && cancelsBangbomb(incoming.row)) {
    const v = bangbombValue(x.traits);
    lines.push(line(v, t('equip.bangbombMod', {mod: `+${v}`}), side, t('ledger.templateWeapon')));
  }
  if (immADodgeMod(x)) lines.push(line(immADodgeMod(x), t('chip.immA'), side));
  if (y && incoming) lines.push(...ctx.opposing[side]);
  const sv = svSection(lines, side, ctx, false);
  const sd = section(d.sd ? [line(d.sd, t('ledger.dodgeSd'), side)] : []);
  const inputs = {
    [`ammo${side}`]: 'DODGE',
    [`burst${side}`]: 1,
    [`bonusBurst${side}`]: clamp(LIMITS.bonusBurst, sd.total),
    [`successValue${side}`]: sv.total,
    [`cont${side}`]: false,
    [`shock${side}`]: false,
    [`template${side}`]: false,
  };
  return {inputs, lines: {kind: 'dodge', sv, sd}};
}

// A Reset: one WIP roll against a Comms Attack (the opponent's BS Attack
// (-X), Surprise Attack, Targeted and the Hacked chip included) that causes no Saving
// Rolls, like a Dodge. Zero Pain: two WIP rolls, in either turn.
function resetInputs(x, y, side, ctx) {
  const {t} = ctx;
  const lines = [line(x.profile.wip ?? 0, statLabel(x, 'wip', t), null)];
  if (targetedResetMod(x)) lines.push(line(targetedResetMod(x), t('chip.targeted'), side));
  if (hackedResetMod(x)) lines.push(line(hackedResetMod(x), t('chip.hacked'), side));
  if (y) lines.push(...ctx.opposing[side]);
  const sv = svSection(lines, side, ctx, false);
  const inputs = {
    [`ammo${side}`]: 'DODGE',
    [`burst${side}`]: x.weapon.zeroPain ? ZERO_PAIN.burst : 1,
    [`bonusBurst${side}`]: 0,
    [`successValue${side}`]: sv.total,
    [`cont${side}`]: false,
    [`shock${side}`]: false,
    [`template${side}`]: false,
  };
  return {inputs, lines: {kind: 'reset', sv}};
}

// A Dodge or Reset that can't evade the attack it faces (modifiers.js
// evades) isn't rolled against it: the attack is a Normal Roll.
function evadeInputs(x, y, side, incoming, ctx) {
  if (!evades(x, incoming)) {
    const reset = x.weapon.kind === 'reset';
    ctx.say(side, reset ? 'note.resetOnlyComms' : 'note.dodgeNotComms', {weapon: incoming.row.name});
    return {inputs: noLofInputs(side), lines: {kind: 'none', reason: ctx.t(reset ? 'ledger.resetOnlyComms' : 'ledger.dodgeNotComms')}};
  }
  if (x.weapon.kind === 'reset') return resetInputs(x, y, side, ctx);
  return dodgeInputs(x, y, side, incoming, ctx);
}

// y's Saving Roll against `incoming` (the other side's weapon, null when it
// has none), as lines in y's colour (`s`), the attacker's where its weapon or
// skill changes the save. `dodging`: y Dodges this attack, so Dodge (ARM +3)
// adds to its ARM. Returns the inputs and the lines.
function defenseInputs(y, incoming, s, dodging, ctx) {
  const {t} = ctx;
  const o = other(s);
  const p = y.profile;
  const row = incoming?.row;
  const save = row?.save ?? {attr: 'ARM'};
  // Immune: the Attribute is rolled as printed, no ARM=0 and no AP halving.
  const immune = Boolean(immunityAgainst(y.traits, row));
  const attr = save.attr === 'BTS' || save.attr === 'PH' ? save.attr : 'ARM';
  const base = attr === 'BTS' ? p.bts ?? 0 : attr === 'PH' ? p.ph ?? 0 : p.arm ?? 0;
  const lines = [];
  if (attr === 'PH') {
    // PARA: a PH roll at the weapon's MOD (PH-6), with PS 0 (weaponPS).
    lines.push(line(base, statLabel(y, 'PH', t), s));
    if (save.mod) lines.push(line(save.mod, row.name, o));
  } else if (attr === 'ARM' && save.armZero && !immune) {
    lines.push(line(base, statLabel(y, 'ARM', t), s, t('ledger.armZeroBy', {weapon: row.name})));
  } else {
    lines.push(line(base, statLabel(y, attr, t), s));
  }
  // ARM = 0 wins over the Dodge's extra ARM (Alex, 2026-10-10).
  const extra = attr === 'ARM' && dodging ? dodgeExtras(y.traits).arm : 0;
  if (extra) lines.push(line(extra, t('ledger.dodgeArm', {extra}), s, save.armZero && !immune ? t('ledger.armZero') : null));
  // An Attribute below 0 (a Netrod's PH at PARA's -6) saves as 0.
  if (sum(lines) < 0) lines.push(line(-sum(lines), t('ledger.notBelowZero'), null));
  // AP or printed halving (saves.js saveHalving); halving 0 or 1 changes
  // nothing: no line. Immunity (AP) keeps the line, struck.
  const h = saveHalving(row, incoming?.mods, y.traits);
  if (!immune && (h.other || h.ap)) {
    const whole = sum(lines);
    const halved = Math.ceil(whole / 2);
    if (halved !== whole) {
      lines.push(line(halved - whole, t(h.ap ? 'ledger.halvedAp' : 'ledger.halved', {stat: t(`stat.${attr.toLowerCase()}`)}), o,
        h.halves ? null : t('skill.immunity', {what: 'AP'})));
    }
  }
  // Cover's +3 is a Saving Roll MOD, not ARM: add it after AP halving. The
  // calculator saves on d20 <= PS + ARM, so this input is where the MOD goes.
  // Cover and Nanoscreen are against BS Attacks: nothing against a CC Attack,
  // and a template ignores cover (not Nanoscreen). A Comms Attack: Firewall's
  // +3 instead, cover and Nanoscreen do nothing.
  const ccIncoming = incoming?.kind === 'cc';
  const comms = isCommsAttack(row);
  const mods = [];
  if (comms && firewallOf(y)) mods.push(line(FIREWALL_SAVE_MOD, t('equip.firewall'), s));
  if (benefitsFromCover(y) || hasNanoscreen(y)) {
    const name = coverLabel(y, t);
    if (ccIncoming) mods.push(line(COVER_SAVE_MOD, name, s, t('ledger.closeCombat')));
    else if (comms) mods.push(line(COVER_SAVE_MOD, name, s, t('ledger.commsAttack')));
    else if (ignoresCoverOnSaves(row) && !hasNanoscreen(y)) mods.push(line(COVER_SAVE_MOD, name, s, t('ledger.template')));
    else mods.push(line(COVER_SAVE_MOD, name, s));
  }
  lines.push(...mods);
  const inputs = {
    [`arm${s}`]: clamp(LIMITS.arm, sum(lines)),
    [`bts${s}`]: clamp(LIMITS.bts, Math.max(0, p.bts ?? 0) + sum(mods)),
    [`critImmune${s}`]: hasImmunity(y.traits, 'Critical', row),
  };
  return {inputs, lines};
}

// No LoF through Smoke / White Noise, or a program the target isn't a valid
// target for: the side's attack never happens, so it rolls nothing (like No ARO).
function noLofInputs(side) {
  return {[`burst${side}`]: 0, [`bonusBurst${side}`]: 0, [`shock${side}`]: false, [`template${side}`]: false};
}

const other = (s) => (s === 'A' ? 'B' : 'A');

// One side's share of the calculator input: x's roll (an attack, a Dodge or a
// Reset) against y, and x's Saving Roll against y's weapon. Returns the
// inputs, whether x still waits on its weapon, whether x shoots (rolls a
// ranged attack, as opposed to a CC Attack, an evasion, or nothing), the
// lines its roll is built from (null when it has none to show), its hits' PS
// lines and its Saving Roll's lines (`ps`, `arm`: the two halves of a save).
function sideInputs(x, y, s, ctx) {
  const {say, fail, vis} = ctx;
  const inputs = {};
  let lines = null;
  let ps = null;
  let arm = null;
  let incomplete = false;
  let shoots = false;
  const w = x.weapon;
  const active = s === 'A';
  const roll = (r) => {
    Object.assign(inputs, r.inputs);
    lines = r.lines;
    ps = r.ps ?? null;
  };
  if (!w) {
    incomplete = true;
  } else if (w.kind === 'dodge' || w.kind === 'reset') {
    roll(evadeInputs(x, y, s, vis[other(s)].blocked ? null : y?.weapon, ctx));
  } else if (w.kind === 'none') {
    // No ARO exists only on the reactive side: no roll, no template. On the
    // active side it is a leftover (carried over by a swap; swapSides already
    // drops it), so the setup is not complete until a real choice is made.
    if (active) incomplete = true;
    else roll({inputs: noLofInputs(s), lines: {kind: 'none'}});
  } else if (attackStat(x.profile, w.row) <= 0) {
    // The error names the roll: an Attack in the Active Turn, an ARO otherwise.
    const key = isCcAttack(x) ? 'error.noCcAttack' : 'error.noBsAttack';
    fail(s, active ? key : `${key}Aro`);
  } else if (isCcAttack(x)) {
    roll(ccAttackInputs(x, y, s, ctx));
  } else if (vis[s].blocked) {
    roll({inputs: noLofInputs(s), lines: {kind: 'none', blockedZone: vis[s].blocked}});
  } else if (y && !reaches(x, y)) {
    say(s, 'note.cantTarget', {program: w.row.name});
    roll({inputs: noLofInputs(s), lines: {kind: 'none', reason: ctx.t('ledger.cantTarget', {program: w.row.name})}});
  } else {
    // Both shoot at rangeCm, unless the reactive answers from its own rangeCmB.
    const rangeCm = active ? ctx.rangeCm : ctx.rangeCmB ?? ctx.rangeCm;
    roll(attackInputs(x, y, rangeCm, s, ctx));
    inputs[`template${s}`] = w.kind === 'template';
    shoots = true;
  }
  if (y) {
    const d = defenseInputs(x, y.weapon?.row ? y.weapon : null, s, w?.kind === 'dodge', ctx);
    Object.assign(inputs, d.inputs);
    arm = d.lines;
  }
  return {inputs, incomplete, shoots, lines, ps, arm};
}

// Builds the partial calculator input object for both sides.
// `active` / `reactive` are results of resolveSelection() (or null).
// rangeCm is the distance both shoot at, unless the reactive shoots at its own
// rangeCmB (a split range: it answers from somewhere else on the table).
// t: the language of the notes, warnings and errors (src/i18n).
// Returns {inputs, ok, errors, warnings, notes, lines}: `lines[side]` is what
// the side's roll is built from, for "How the dice were built" (ledger.js):
//   kind      'attack' | 'template' | 'dodge' | 'reset' | 'none'
//   sv        {lines, total, note?}: the Success Value (lines.js section)
//   burst, sd {lines, total}: Burst and Special Dice (not on a Reset)
//   save      {lines, total}: the Saving Roll the other side makes against
//             this side's hits, weapon PS + target ARM (attacks only)
//   reason    kind 'none': why a Dodge, Reset or program isn't rolled
//   blockedZone   kind 'none': the Smoke / White Noise it can't see through
// or null while the side has nothing to roll with.
export function deriveInputs({active, reactive, rangeCm, rangeCmB, zones, t = tEn}) {
  const inputs = {};
  const errors = [];
  const notes = [];
  const warnings = [];
  // say(side, key, params) adds a note, "Active: ..."; side null for both.
  const sayTo = (list) => (side, key, params) =>
    list.push(side ? t('note.side', {side: t(side === 'A' ? 'side.active' : 'side.reactive'), text: t(key, params)}) : t(key, params));
  const a = active?.profile ? active : null;
  const b = reactive?.profile ? reactive : null;
  const x = {A: a, B: b};
  // BS Attack (-X) MODs on each side's roll.
  // Smoke / White Noise between them. A side with no line of fire doesn't
  // attack, so its skills put no MODs on the other side's roll.
  const vis = visibility(a, b, zones, t);
  const ctx = {t, say: sayTo(notes), warn: sayTo(warnings), fail: sayTo(errors), vis, rangeCm, rangeCmB, opposing: {}};
  ctx.opposing.A = opposingLines(b, a, 'A', ctx);
  ctx.opposing.B = opposingLines(a, b, 'B', ctx);
  for (const s of ['A', 'B']) {
    if (vis[s].blocked) ctx.say(s, 'note.noLof', {zone: zoneName(vis[s].blocked, t)});
  }

  // A side still waiting on its weapon: nothing to report, but not ready to apply.
  let incomplete = false;
  const shoots = {A: false, B: false};
  const lines = {A: null, B: null};
  const ps = {};
  const arm = {};
  for (const s of ['A', 'B']) {
    if (!x[s]) continue;
    const r = sideInputs(x[s], x[other(s)], s, ctx);
    Object.assign(inputs, r.inputs);
    incomplete ||= r.incomplete;
    shoots[s] = r.shoots;
    lines[s] = r.lines;
    ps[s] = r.ps;
    arm[s] = r.arm;
  }
  // The save the target makes against a side's hits: the side's PS, then
  // the target's ARM (or BTS / PH) against that weapon, from the other pass.
  for (const s of ['A', 'B']) {
    if (ps[s]) lines[s].save = section([...ps[s], ...(arm[other(s)] ?? [])]);
  }
  // A Direct Template on either side: nothing is opposed, each attack is its
  // own roll. Said when the reactive shoots (a Dodge against a template, or a
  // template against No ARO, says nothing).
  const usesTemplate = (s) => x[s]?.weapon?.kind === 'template';
  if (shoots.B && (usesTemplate('A') || usesTemplate('B')) && !vis.A.blocked && !vis.B.blocked) ctx.say(null, 'note.directTemplate');

  if (a || b) inputs.fixedFaceToFace = false;
  // Things the result may get wrong; shown as alerts but don't block the calculation.
  approximationWarnings('A', a, b, ctx);
  approximationWarnings('B', b, a, ctx);
  if (isSpecOps(a) || isSpecOps(b)) ctx.warn(null, 'warning.specOps');

  return {inputs, ok: errors.length === 0 && !incomplete && (a !== null || b !== null), errors, warnings, notes, lines};
}
