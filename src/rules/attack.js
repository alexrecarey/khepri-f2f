// A shot or a CC Attack as calculator inputs: Success Value, Burst and
// Special Dice, each as the lines it adds up to (lines.js) and summed into
// its input, with what the hit does (hit.js). A shot is a BS Attack, a
// Direct Template or a Hacking Program; the CC Attack's own MODs are in
// closeCombat.js. ctx: matchup.js deriveInputs.
import {SKILL} from '../army/ids.js';
import {hasSkill} from '../army/traits.js';
import {attackAttribute, isCommsAttack, needsLof} from '../army/weapons.js';
import {
  COVER_BS_MOD, LIMITS, albedoMod, albedoValue, attackBonuses, attackStat, benefitsFromCover, coverBsMod, fireteamBonuses, firewallOf, hasNanoscreen, keepsAroBurst, mimetismMod, mimetismValue, msvName, neurocineticsAroBurst, programSvMods, targetedMod,
} from './modifiers.js';
import {clamp} from '../lib/clamp.js';
import {other} from '../lib/side.js';
import {RANGE_BANDS, bandFrom, rangeModFor} from './ranges.js';
import {ccAttackMods, ccBurst, ccSd} from './closeCombat.js';
import {distance, list, msg} from '../i18n/message.js';
import {hitInputs} from './hit.js';
import {coverLabel, line, mark, section, statLabel, sum, svSection} from './lines.js';

/** @typedef {import('../types.js').Side} Side */
/** @typedef {import('../types.js').Ctx} Ctx */
/** @typedef {import('../types.js').Trooper} Trooper */
/** @typedef {import('../types.js').Attacker} Attacker */
/** @typedef {import('../types.js').Line} Line */
/** @typedef {import('../types.js').Params} Params */

/** @param {number} rangeCm */
function rangeLabel(rangeCm) {
  const i = RANGE_BANDS.findIndex((b) => rangeCm <= b.to);
  return msg('ledger.range', {from: distance(bandFrom(i)), to: distance(RANGE_BANDS[i].to)});
}

// "Mimetism (-6)", "Mimetism (-3), Foxhole": the target's Mimetism as the ledger names it.
/**
 * @param {Trooper} y
 * @param {number} full
 */
function mimetismLabel(y, full) {
  const name = msg('skill.mimetismMod', {mod: full});
  // A trooper with a profile has traits.
  return /** @type {import('../types.js').Traits} */ (y.traits).skills.find((k) => k.id === SKILL.MIMETISM)?.foxhole ? list([name, msg('skill.foxhole')]) : name;
}

// The MODs y's position and skills put on x's shot, in y's colour: Mimetism
// (what x's MSV cancels struck), Albedo, cover or Nanoscreen, Firewall.
/**
 * @param {Attacker} x
 * @param {Trooper} y
 * @param {Side} s
 * @returns {Line[]}
 */
function targetSvLines(x, y, s) {
  const o = other(s);
  const {row} = x.weapon;
  /** @type {Line[]} */
  const lines = [];
  // Mimetism and Albedo need LoF (a Jammer or a program has none): struck
  // against one. A Comms Attack takes the target's Firewall in place of cover.
  const lof = needsLof(row);
  const full = mimetismValue(y.traits);
  if (full && !lof) lines.push(line(full, msg('skill.mimetismMod', {mod: full}), o, msg('ledger.noLof')));
  else if (full) {
    const applied = mimetismMod(y.traits, x.traits);
    const name = mimetismLabel(y, full);
    // Part of it applied: the attacker's MSV cancelled the rest.
    if (applied) lines.push(line(applied, applied !== full ? list([name, /** @type {import('../types.js').Message} */ (msvName(x.traits))]) : name, o));
    else lines.push(line(full, name, o, msvName(x.traits) ?? msg('ledger.cancelled')));
  }
  const albedo = lof ? albedoMod(y.traits, x.traits) : 0;
  if (albedo) lines.push(line(albedo, msg('equip.albedo'), o));
  else if (albedoValue(y.traits)) lines.push(line(albedoValue(y.traits), msg('equip.albedo'), o, lof ? msg('ledger.albedoOnly') : msg('ledger.noLof')));
  const comms = isCommsAttack(row);
  const cover = coverBsMod(y, x.traits, row);
  const coverName = coverLabel(y);
  if (cover) lines.push(line(cover, coverName, o));
  else if (benefitsFromCover(y) || hasNanoscreen(y)) {
    const why = comms ? msg('ledger.commsAttack') : hasSkill(x.traits, SKILL.MARKSMANSHIP) ? msg('skill.marksmanship') : msg('skill.limitedCover');
    lines.push(line(COVER_BS_MOD, coverName, o, why));
  }
  // Firewall: a Comms Attack's cover.
  const firewall = comms ? firewallOf(y) : 0;
  if (firewall) lines.push(line(firewall, msg('equip.firewallMod', {mod: firewall}), o));
  return lines;
}

// A shot's Success Value: the Attribute, then every MOD as a line.
/**
 * @param {Attacker} x
 * @param {Trooper | null} y
 * @param {number} rangeCm
 * @param {Side} s
 * @param {Ctx} ctx
 * @returns {import('../types.js').Section}
 */
function attackSv(x, y, rangeCm, s, ctx) {
  const {vis} = ctx;
  const o = other(s);
  const {row, mods} = x.weapon;
  const lines = [line(attackStat(x.profile, row), statLabel(x, attackAttribute(row)), null)];
  // Fireteam +1 BS: none on a Hacking Program (attackBonuses).
  const ftBs = attackBonuses(x).bs;
  if (ftBs) lines.push(line(ftBs, msg('ledger.fireteam', {size: x.ftSize}), s));
  const rangeMod = rangeModFor(row, rangeCm, x.traits);
  // Out of range: the attack still happens but always fails. A success value
  // of 0 misses on every roll, with no crit.
  if (rangeMod === null) return {...section([...lines, mark('—', msg('ledger.outOfRange'), s)], 0), note: msg('ledger.outOfRangeNote')};
  if (rangeMod) lines.push(line(rangeMod, rangeLabel(rangeCm), s));
  if (mods.sv) lines.push(line(mods.sv, msg('ledger.loadout'), s));
  // A program's Attack MOD is x's, the target's ECM: Hacker the target's.
  for (const m of programSvMods(x, y)) lines.push(line(m.value, m.label, m.target ? o : s));
  // Targeted is the target's State.
  if (targetedMod(x, y)) lines.push(line(targetedMod(x, y), msg('chip.targeted'), o));
  if (y) {
    lines.push(...targetSvLines(x, y, s));
    // Smoke / White Noise: x's own sight, so x's colour.
    for (const v of vis[s].lines) lines.push(line(v.value, v.label, s, v.ignoredBy));
    lines.push(...ctx.opposing[s]);
  }
  return svSection(lines, s, ctx);
}

// A shot's Burst: the weapon's, the loadout's and BS Attack's +B, and in ARO
// one die unless Total Reaction or Neurocinetics keep it.
/**
 * @param {Attacker} x
 * @param {Side} s
 * @param {Ctx} ctx
 * @returns {Line[]}
 */
function burstLines(x, s, ctx) {
  const {say} = ctx;
  const {row} = x.weapon;
  // Neurocinetics is for BS Attacks: a program keeps its Burst.
  const neuro = x.weapon.kind !== 'program';
  // Neurocinetics: B 1 in the Active Turn, Burst MODs included (wiki).
  if (s === 'A' && neuro && hasSkill(x.traits, SKILL.NEUROCINETICS)) {
    say(s, 'note.neurocinetics');
    return [line(1, msg('skill.neurocinetics'), s)];
  }
  const lines = [line(row.burst ?? 1, x.weapon.name ?? row.name, null)];
  const b = attackBonuses(x).burst;
  if (b) lines.push(line(b, msg('ledger.loadoutOrBsAttack'), s));
  const aro = s === 'B' && neuro ? neurocineticsAroBurst(x.traits) : 0;
  if (aro) lines.push(line(aro, msg('skill.neurocinetics'), s));
  // In ARO a trooper rolls one die, whatever its burst (Total Reaction aside).
  if (s === 'B' && !keepsAroBurst(x) && sum(lines) !== 1) lines.push(line(1 - sum(lines), msg('ledger.aroOneDie'), null));
  return lines;
}

// A shot's Special Dice: the loadout's and BS Attack's (+1SD), the Fireteam's.
// The Fireteam's +1 SD is a BS Attack's: a Direct Template or a program gets
// none (attackBonuses), so no line for it and none to cancel it (Alex, 2026-10-23).
/**
 * @param {Attacker} x
 * @param {Side} s
 * @returns {Line[]}
 */
function sdLines(x, s) {
  /** @type {Line[]} */
  const lines = [];
  const ft = x.weapon.kind === 'bs' ? fireteamBonuses(x.ftSize).sd : 0;
  const own = attackBonuses(x).sd - ft;
  if (own) lines.push(line(own, msg('ledger.loadoutOrBsAttack'), s));
  if (ft) lines.push(line(ft, msg('ledger.fireteam', {size: x.ftSize}), s));
  return lines;
}

// A shot (a BS Attack, a Direct Template, a Hacking Program): Success Value,
// Burst and Special Dice as lines, each summed into its input.
/**
 * @param {Attacker} x
 * @param {Trooper | null} y
 * @param {number} rangeCm
 * @param {Side} side
 * @param {Ctx} ctx
 * @returns {import('../types.js').Roll}
 */
export function attackInputs(x, y, rangeCm, side, ctx) {
  const sv = attackSv(x, y, rangeCm, side, ctx);
  const burst = section(burstLines(x, side, ctx));
  const sd = section(sdLines(x, side));
  const hit = hitInputs(x, y, side, ctx);
  // Computed keys: tsc sees an index signature, so the shape is stated. The
  // totals of these sections are numbers (lines.js sum).
  const inputs = /** @type {Partial<Params>} */ ({
    [`successValue${side}`]: sv.total,
    [`burst${side}`]: clamp(LIMITS.burst, /** @type {number} */ (burst.total)),
    [`bonusBurst${side}`]: clamp(LIMITS.bonusBurst, /** @type {number} */ (sd.total)),
    ...hit.inputs,
  });
  return {inputs, lines: {kind: x.weapon.kind === 'template' ? 'template' : 'attack', sv, burst, sd, ammo: hit.ammo}, ps: hit.ps};
}

// A CC Attack (closeCombat.js): CC plus its own MODs and the opponent's,
// capped; no range, cover, Mimetism or Smoke. Burst and Special Dice from
// the weapon and Martial Arts.
/**
 * @param {Attacker} x
 * @param {Trooper | null} y
 * @param {Side} side
 * @param {Ctx} ctx
 * @returns {import('../types.js').Roll}
 */
export function ccAttackInputs(x, y, side, ctx) {
  const lines = [line(attackStat(x.profile, x.weapon.row), statLabel(x, 'cc'), null)];
  for (const m of ccAttackMods(x, side === 'A')) lines.push(line(m.value, m.label, side));
  if (y) lines.push(...ctx.opposing[side]);
  const sv = svSection(lines, side, ctx);
  // The weapon's B is the weapon's, ARO is the rules', the rest are x's.
  const bursts = ccBurst(x, side === 'A', y).map((l, i) => line(l.value, l.label, i === 0 || l.aro ? null : side));
  // B over the cap (LIMITS.burst): the rest is lost.
  const over = sum(bursts) - clamp(LIMITS.burst, sum(bursts));
  if (over > 0) bursts.push(line(-over, msg('ledger.burstCap', {max: LIMITS.burst[1]}), null));
  const burst = section(bursts);
  const sd = section(ccSd(x).map((l) => line(l.value, l.label, side)));
  const hit = hitInputs(x, y, side, ctx);
  const inputs = /** @type {Partial<Params>} */ ({
    [`successValue${side}`]: sv.total,
    [`burst${side}`]: burst.total,
    [`bonusBurst${side}`]: clamp(LIMITS.bonusBurst, /** @type {number} */ (sd.total)),
    [`template${side}`]: false,
    ...hit.inputs,
  });
  return {inputs, lines: {kind: 'attack', sv, burst, sd, ammo: hit.ammo}, ps: hit.ps};
}
