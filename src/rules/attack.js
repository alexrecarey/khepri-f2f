// A shot or a CC Attack as calculator inputs: Success Value, Burst and
// Special Dice, each as the lines it adds up to (lines.js) and summed into
// its input, with what the hit does (hit.js). A shot is a BS Attack, a
// Direct Template or a Hacking Program; the CC Attack's own MODs are in
// closeCombat.js. ctx: matchup.js deriveInputs. Every builder here returns
// its lines (and the notes it makes); nothing is pushed into a shared list.
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
import {ENHANCED_REACTION_BURST, marksmanshipFromAssistedFire, usesEnhancedReaction} from './supportware.js';
import {distance, list, msg} from '../i18n/message.js';
import {hitInputs} from './hit.js';
import {compact, coverLabel, line, mark, note, section, statLabel, sum, svSection} from './lines.js';

/** @typedef {import('../types.js').Side} Side */
/** @typedef {import('../types.js').Ctx} Ctx */
/** @typedef {import('../types.js').Trooper} Trooper */
/** @typedef {import('../types.js').Attacker} Attacker */
/** @typedef {import('../types.js').Line} Line */
/** @typedef {import('../types.js').Message} Message */
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

// The target's Mimetism on x's shot: struck without LoF (a Jammer or a
// program has none); what x's MSV cancels struck, or part of it applied
// (the MSV cancelled the rest).
/**
 * @param {Attacker} x
 * @param {Trooper} y
 * @param {Side} o the target's side (the line's colour)
 * @returns {Line | null}
 */
function mimetismLine(x, y, o) {
  const full = mimetismValue(y.traits);
  if (!full) return null;
  if (!needsLof(x.weapon.row)) return line(full, msg('skill.mimetismMod', {mod: full}), o, msg('ledger.noLof'));
  const applied = mimetismMod(y.traits, x.traits);
  const name = mimetismLabel(y, full);
  const msv = msvName(x.traits);
  if (!applied) return line(full, name, o, msv ?? msg('ledger.cancelled'));
  // Part of it applied, so the attacker has an MSV.
  return line(applied, applied !== full ? list([name, /** @type {Message} */ (msv)]) : name, o);
}

// "Marksmanship", or "Marksmanship, Assisted Fire" when the Supportware gave it.
/** @param {import('../types.js').Traits | null} traits */
const marksmanshipName = (traits) =>
  (marksmanshipFromAssistedFire(traits) ? list([msg('skill.marksmanship'), msg('supportware.assistedFire')]) : msg('skill.marksmanship'));

// The MODs y's position and skills put on x's shot, in y's colour: Mimetism,
// Albedo (both need LoF), cover or Nanoscreen, Firewall. A Comms Attack
// takes the target's Firewall in place of cover.
/**
 * @param {Attacker} x
 * @param {Trooper} y
 * @param {Side} s
 * @returns {Line[]}
 */
function targetSvLines(x, y, s) {
  const o = other(s);
  const {row} = x.weapon;
  const lof = needsLof(row);
  const albedo = lof ? albedoMod(y.traits, x.traits) : 0;
  const comms = isCommsAttack(row);
  const cover = coverBsMod(y, x.traits, row);
  const coverName = coverLabel(y);
  // Cover that does nothing to this shot, struck with the reason.
  const coverWhy = comms ? msg('ledger.commsAttack') : hasSkill(x.traits, SKILL.MARKSMANSHIP) ? marksmanshipName(x.traits) : msg('skill.limitedCover');
  const firewall = comms ? firewallOf(y) : 0;
  return compact([
    mimetismLine(x, y, o),
    albedo && line(albedo, msg('equip.albedo'), o),
    !albedo && albedoValue(y.traits) && line(albedoValue(y.traits), msg('equip.albedo'), o, lof ? msg('ledger.albedoOnly') : msg('ledger.noLof')),
    cover && line(cover, coverName, o),
    !cover && (benefitsFromCover(y) || hasNanoscreen(y)) && line(COVER_BS_MOD, coverName, o, coverWhy),
    firewall && line(firewall, msg('equip.firewallMod', {mod: firewall}), o),
  ]);
}

// A shot's Success Value: the Attribute, then every MOD as a line.
/**
 * @param {Attacker} x
 * @param {Trooper | null} y
 * @param {number} rangeCm
 * @param {Side} s
 * @param {Ctx} ctx
 * @returns {{sv: import('../types.js').Section, notes: Message[]}}
 */
function attackSv(x, y, rangeCm, s, ctx) {
  const o = other(s);
  const {row, mods} = x.weapon;
  const stat = line(attackStat(x.profile, row), statLabel(x, attackAttribute(row)), null);
  // Fireteam +1 BS: none on a Hacking Program (attackBonuses).
  const ftBs = attackBonuses(x).bs;
  const fireteam = ftBs ? [line(ftBs, msg('ledger.fireteam', {size: x.ftSize}), s)] : [];
  const rangeMod = rangeModFor(row, rangeCm, x.traits);
  // Out of range: the attack still happens but always fails. A success value
  // of 0 misses on every roll, with no crit.
  if (rangeMod === null) {
    return {sv: {...section([stat, ...fireteam, mark('—', msg('ledger.outOfRange'), s)], 0), note: msg('ledger.outOfRangeNote')}, notes: []};
  }
  const targeted = targetedMod(x, y);
  const lines = compact([
    stat,
    ...fireteam,
    rangeMod && line(rangeMod, rangeLabel(rangeCm), s),
    mods.sv && line(mods.sv, msg('ledger.loadout'), s),
    // A program's Attack MOD is x's, the target's ECM: Hacker the target's.
    ...programSvMods(x, y).map((m) => line(m.value, m.label, m.target ? o : s)),
    // Targeted is the target's State.
    targeted && line(targeted, msg('chip.targeted'), o),
    ...(y ? [
      ...targetSvLines(x, y, s),
      // Smoke / White Noise: x's own sight, so x's colour.
      ...ctx.vis[s].lines.map((v) => line(v.value, v.label, s, v.ignoredBy)),
      ...ctx.opposing[s],
    ] : []),
  ]);
  return svSection(lines, s);
}

// A shot's Burst: the weapon's, the loadout's and BS Attack's +B, and in ARO
// one die unless Total Reaction or Neurocinetics keep it (two with Enhanced
// Reaction, rules/supportware.js).
/**
 * @param {Attacker} x
 * @param {Side} s
 * @returns {{lines: Line[], notes: Message[]}}
 */
function burstLines(x, s) {
  const {row} = x.weapon;
  // Neurocinetics is for BS Attacks: a program keeps its Burst.
  const neuro = x.weapon.kind !== 'program';
  // Neurocinetics: B 1 in the Active Turn, Burst MODs included (wiki).
  if (s === 'A' && neuro && hasSkill(x.traits, SKILL.NEUROCINETICS)) {
    return {lines: [line(1, msg('skill.neurocinetics'), s)], notes: [note(s, 'note.neurocinetics')]};
  }
  const bonus = attackBonuses(x).burst;
  const aro = s === 'B' && neuro ? neurocineticsAroBurst(x.traits) : 0;
  const base = compact([
    line(row.burst ?? 1, x.weapon.name ?? row.name, null),
    bonus && line(bonus, msg('ledger.loadoutOrBsAttack'), s),
    aro && line(aro, msg('skill.neurocinetics'), s),
  ]);
  // In ARO a trooper rolls one die, whatever its burst (Total Reaction aside).
  // Enhanced Reaction makes it two: the Supportware's line, in x's colour,
  // even when it takes nothing off (a B2 weapon), so the ledger names it.
  if (usesEnhancedReaction(x, s)) {
    const label = msg('supportware.enhancedReactionBurst', {burst: ENHANCED_REACTION_BURST});
    return {lines: [...base, line(ENHANCED_REACTION_BURST - sum(base), label, s)], notes: []};
  }
  const oneDie = s === 'B' && !keepsAroBurst(x) && sum(base) !== 1 ? [line(1 - sum(base), msg('ledger.aroOneDie'), null)] : [];
  return {lines: [...base, ...oneDie], notes: []};
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
  const ft = x.weapon.kind === 'bs' ? fireteamBonuses(x.ftSize).sd : 0;
  const own = attackBonuses(x).sd - ft;
  return compact([
    own && line(own, msg('ledger.loadoutOrBsAttack'), s),
    ft && line(ft, msg('ledger.fireteam', {size: x.ftSize}), s),
  ]);
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
  const {sv, notes: svNotes} = attackSv(x, y, rangeCm, side, ctx);
  const b = burstLines(x, side);
  const burst = section(b.lines);
  const sd = section(sdLines(x, side));
  const hit = hitInputs(x, y, side);
  // Computed keys: tsc sees an index signature, so the shape is stated. The
  // totals of these sections are numbers (lines.js sum).
  const inputs = /** @type {Partial<Params>} */ ({
    [`successValue${side}`]: sv.total,
    [`burst${side}`]: clamp(LIMITS.burst, /** @type {number} */ (burst.total)),
    [`bonusBurst${side}`]: clamp(LIMITS.bonusBurst, /** @type {number} */ (sd.total)),
    ...hit.inputs,
  });
  return {
    inputs,
    lines: {kind: x.weapon.kind === 'template' ? 'template' : 'attack', sv, burst, sd, ammo: hit.ammo},
    ps: hit.ps,
    notes: [...svNotes, ...b.notes, ...hit.notes],
  };
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
  const lines = [
    line(attackStat(x.profile, x.weapon.row), statLabel(x, 'cc'), null),
    ...ccAttackMods(x, side === 'A').map((m) => line(m.value, m.label, side)),
    ...(y ? ctx.opposing[side] : []),
  ];
  const {sv, notes: svNotes} = svSection(lines, side);
  // The weapon's B is the weapon's, ARO is the rules', the rest are x's.
  const base = ccBurst(x, side === 'A', y).map((l, i) => line(l.value, l.label, i === 0 || l.aro ? null : side));
  // B over the cap (LIMITS.burst): the rest is lost.
  const over = sum(base) - clamp(LIMITS.burst, sum(base));
  const burst = section(over > 0 ? [...base, line(-over, msg('ledger.burstCap', {max: LIMITS.burst[1]}), null)] : base);
  const sd = section(ccSd(x).map((l) => line(l.value, l.label, side)));
  const hit = hitInputs(x, y, side);
  const inputs = /** @type {Partial<Params>} */ ({
    [`successValue${side}`]: sv.total,
    [`burst${side}`]: burst.total,
    [`bonusBurst${side}`]: clamp(LIMITS.bonusBurst, /** @type {number} */ (sd.total)),
    [`template${side}`]: false,
    ...hit.inputs,
  });
  return {inputs, lines: {kind: 'attack', sv, burst, sd, ammo: hit.ammo}, ps: hit.ps, notes: [...svNotes, ...hit.notes]};
}
