// What a hit does and the Saving Roll against it, as calculator inputs: PS,
// ammunition, Continuous Damage and Shock on the attacker's side (hitInputs),
// the target's ARM / BTS / PH with halving and cover on the other
// (defenseInputs). The save section of the ledger is the two halves
// together: the attacker's PS lines, then the target's (matchup.js). Every
// builder returns its lines and notes; nothing is pushed into a shared list.
import {
  ammoMsg, ammoTypes, bioweaponParts, causesWounds, hasContinuousDamage, isCommsAttack, isPlasma, stateCaused, weaponPS,
} from '../army/weapons.js';
import {
  COVER_SAVE_MOD, FIREWALL_SAVE_MOD, LIMITS, benefitsFromCover, dodgeExtras, firewallOf, hasNanoscreen, ignoresCoverOnSaves,
} from './modifiers.js';
import {clamp} from '../lib/clamp.js';
import {other} from '../lib/side.js';
import {calcAmmo, hasImmunity, hasNoEffect, immunityAgainst, immunityFor, immunityNote, saveHalving, shockApplies, vulnerabilityTo} from './saves.js';
import {bsAttackWeaponMods} from './trooper.js';
import {ccAttackSkill, isCcAttack} from './closeCombat.js';
import {list, msg, term} from '../i18n/message.js';
import {compact, coverLabel, line, mark, note, statLabel, sum} from './lines.js';

/** @typedef {import('../types.js').Side} Side */
/** @typedef {import('../types.js').Trooper} Trooper */
/** @typedef {import('../types.js').Attacker} Attacker */
/** @typedef {import('../types.js').Line} Line */
/** @typedef {import('../types.js').Message} Message */
/** @typedef {import('../types.js').Params} Params */

// The PS of x's hits: the weapon's own, then BS Attack (SR-1 / SR-2) as its
// own line: it is the attacker's skill, not the weapon's (MULTI HMG 5, then
// -1). On a program it is the program's upgrade (Trinity (SR-1)).
/**
 * @param {Attacker} x
 * @param {Side} s
 * @returns {Line[]}
 */
export function psLines(x, s) {
  const {row, mods} = x.weapon;
  const sr = list([msg('abbr.SR'), mods?.psMod], '');
  return compact([
    line(weaponPS(row, {...mods, psMod: 0}), msg('abbr.PS'), null),
    mods?.psMod && line(mods.psMod, x.weapon.kind === 'program' ? msg('ledger.programMod', {program: row.name, mod: sr}) : msg('skill.bsAttackMod', {mod: sr}), s),
  ]);
}

// The ammunition x fires with: the weapon's own first (N, EXP, AP+EXP,
// Plasma...), then what the trooper adds, one line each with its source
// (BS Attack (AP / T2 / Continuous Damage), the loadout's AP / T2 / Shock /
// Viral). A target's immunity strikes the line it cancels. Lines are
// display-only marks ('+' and a name, '' for the weapon's own), the total
// the ammo as players say it: "AP+CONT".
// `plain` marks the N line, `cont` the Continuous Damage ones. `ammo`: the
// calculator's ammunition for the hit (NONE: the target is immune to it).
/**
 * @param {Attacker} x
 * @param {Side} s
 * @param {import('../types.js').Ammo} ammo
 * @param {boolean} contImmune
 * @returns {import('../types.js').Section}
 */
export function ammoLines(x, s, ammo, contImmune) {
  const o = other(s);
  const {row, mods} = x.weapon;
  /** @param {Line} l */
  const loadout = (l) => ({...l, source: msg('ledger.loadout')});
  // What the trooper's skill adds: CC Attack for a CC weapon, else BS Attack.
  const cc = isCcAttack(x) ? ccAttackSkill(x.traits) : null;
  const bs = cc ? {ap: cc.ap, cont: cc.cont, t2: false} : bsAttackWeaponMods(x.traits);
  // The chart's ammo, before the loadout and skills; what the loadout or a
  // skill adds leaves the chart's list for a line of its own.
  const chart = ammoTypes(row).map((a) => a.toUpperCase());
  const fromLoadout = mods.ammo && mods.ammo !== 'Viral' ? mods.ammo.toUpperCase() : null;
  const shockBySkill = Boolean(cc?.shock) && chart.includes('SHOCK') && fromLoadout !== 'SHOCK';
  const t2BySkill = bs.t2 && chart.includes('T2') && fromLoadout !== 'T2';
  const own = chart.filter((a) => a !== fromLoadout && !(shockBySkill && a === 'SHOCK') && !(t2BySkill && a === 'T2'));
  const bio = mods.ammo === 'Viral' ? [] : bioweaponParts(row);
  const contTag = msg('tag.contUpper');
  const ownCont = (row.props ?? []).includes('Continuous Damage');
  /** @type {Line} */
  const contLine = {...mark('+', contTag, null), cont: true};
  /** @type {Line[]} */
  const added = compact([
    fromLoadout && loadout(mark('+', ammoMsg(/** @type {string} */ (mods.ammo)), null)),
    shockBySkill && mark('+', msg('ammo.SHOCK'), s),
    t2BySkill && mark('+', msg('ammo.T2'), s),
    mods.forceAP && !own.includes('AP') && (bs.ap ? mark('+', msg('ammo.AP'), s) : loadout(mark('+', msg('ammo.AP'), null))),
    mods.ammo === 'Viral' && loadout(mark('+', msg('ledger.viral'), null)),
    mods.cont && !ownCont && (bs.cont ? {...contLine, by: s} : loadout(contLine)),
  ]);
  /** @type {Message[]} */
  const base = [
    ...(isPlasma(row) ? [msg('ammo.PLASMA')] : []),
    ...bio.map(ammoMsg),
    ...own.map(ammoMsg),
    ...(ownCont ? [contTag] : []),
  ];
  // Plain N: ammoTypes lists no N, so nothing here is N.
  /** @type {Line} */
  const first = base.length ? {...mark('', list(base, '+'), null), ...(ownCont && {cont: true})} : {...mark('', msg('ammo.N'), null), plain: true};
  const lines = [
    // Immunity (Continuous Damage): the Trait goes, the hit stays.
    ...[first, ...added].map((l) => (contImmune && l.cont ? {...l, struck: msg('skill.immunity', {what: msg('trait.continuousDamage')})} : l)),
    ...(ammo === 'NONE' ? [mark('', msg('ledger.noEffectImmune'), o)] : []),
  ];
  // N only counts when it's all there is: N with AP added is just "AP".
  const kept = lines.filter((l) => !l.struck && l.by !== o);
  const named = kept.filter((l) => !l.plain);
  const total = ammo === 'NONE' ? msg('ledger.noEffect') : list((named.length ? named : kept).map((l) => l.label), '+');
  return {lines, total};
}

// What x's hits do to y: PS, ammunition, Continuous Damage, Shock, with the
// notes on Immunity and Vulnerability. The same for a shot and a CC Attack.
// Returns the inputs, the PS lines (the save section's first lines), the
// ammunition lines and the notes.
/**
 * @param {Attacker} x
 * @param {Trooper | null} y
 * @param {Side} side
 * @returns {{inputs: Partial<Params>, ps: Line[], ammo: import('../types.js').Section, notes: Message[]}}
 */
export function hitInputs(x, y, side) {
  const {row, mods} = x.weapon;
  const noEffect = hasNoEffect(y?.traits, row);
  const immunity = immunityAgainst(y?.traits, row);
  // Immunity (Continuous Damage): the Trait is ignored, the hit is not.
  const contImmune = hasImmunity(y?.traits, 'Continuous Damage', row);
  const ps = psLines(x, side);
  /** @type {import('../types.js').Ammo} */
  const ammo = noEffect ? 'NONE' : calcAmmo(row, y?.traits);
  const cont = hasContinuousDamage(row, mods);
  const shock = shockApplies(row, y);
  // Computed keys: tsc sees an index signature, so the shape is stated.
  const inputs = /** @type {Partial<Params>} */ ({
    [`damage${side}`]: clamp(LIMITS.damage, sum(ps)),
    [`ammo${side}`]: ammo,
    [`cont${side}`]: !immunity && !contImmune && cont,
    [`shock${side}`]: shock,
  });
  const state = stateCaused(row);
  const immunityText = immunity && causesWounds(row) && immunityNote(immunity, row, mods);
  const vulnerable = vulnerabilityTo(y?.traits, row);
  // Vulnerability was read from y's traits: y is there.
  const lost = vulnerable && immunityFor(/** @type {Trooper} */ (y).traits, row);
  const notes = compact([
    shock && note(side, 'note.shock'),
    // State-only weapons get a warning instead (no effect), or play as always (Stunned).
    state && !noEffect && note(side, 'note.stateCaused', {weapon: row.name, state: msg(`state.${state.toLowerCase()}`)}),
    !immunity && contImmune && cont && note(side, 'note.contImmune'),
    immunityText && note(side, 'note.text', {text: immunityText}),
    lost && note(side, 'note.vulnerability', {vulnerable: term('extras', vulnerable), immunity: term('extras', lost)}),
  ]);
  return {inputs, ps, ammo: ammoLines(x, side, ammo, contImmune), notes};
}

// y's Saving Roll against `incoming` (the other side's weapon, null when it
// has none), as lines in y's colour (`s`), the attacker's where its weapon or
// skill changes the save. `dodging`: y Dodges this attack, so Dodge (ARM +3)
// adds to its ARM. Returns the inputs and the lines.
/**
 * @param {Trooper} y
 * @param {import('../types.js').WeaponEntry | null} incoming
 * @param {Side} s
 * @param {boolean} dodging
 * @returns {{inputs: Partial<Params>, lines: Line[]}}
 */
export function defenseInputs(y, incoming, s, dodging) {
  const o = other(s);
  const p = y.profile;
  const row = incoming?.row;
  /** @type {NonNullable<import('../types.js').WeaponRow['save']>} */
  const save = row?.save ?? {attr: 'ARM'};
  // Immune: the Attribute is rolled as printed, no ARM=0 and no AP halving.
  const immune = Boolean(immunityAgainst(y.traits, row));
  const attr = save.attr === 'BTS' || save.attr === 'PH' ? save.attr : 'ARM';
  const base = attr === 'BTS' ? p.bts ?? 0 : attr === 'PH' ? p.ph ?? 0 : p.arm ?? 0;
  // A save with a MOD or ARM=0 is a weapon's: `row` is there.
  const weapon = /** @type {import('../types.js').WeaponRow} */ (row);
  // PARA: a PH roll at the weapon's MOD (PH-6), with PS 0 (weaponPS).
  const stat = attr === 'PH' ? line(base, statLabel(y, 'PH'), s)
    : attr === 'ARM' && save.armZero && !immune ? line(base, statLabel(y, 'ARM'), s, msg('ledger.armZeroBy', {weapon: weapon.name}))
      : line(base, statLabel(y, attr), s);
  // ARM = 0 wins over the Dodge's extra ARM (Alex, 2026-10-10).
  const extra = attr === 'ARM' && dodging ? dodgeExtras(y.traits).arm : 0;
  const attribute = compact([
    stat,
    attr === 'PH' && save.mod && line(save.mod, weapon.name, o),
    extra && line(extra, msg('ledger.dodgeArm', {extra}), s, save.armZero && !immune ? msg('ledger.armZero') : null),
  ]);
  // An Attribute below 0 (a Netrod's PH at PARA's -6) saves as 0.
  const floored = sum(attribute) < 0 ? [...attribute, line(-sum(attribute), msg('ledger.notBelowZero'), null)] : attribute;
  // AP or printed halving (saves.js saveHalving); halving 0 or 1 changes
  // nothing: no line. Immunity (AP) keeps the line, struck.
  const h = saveHalving(row, incoming?.mods, y.traits);
  const whole = sum(floored);
  const halved = Math.ceil(whole / 2);
  const halving = !immune && (h.other || h.ap) && halved !== whole
    ? [line(halved - whole, msg(h.ap ? 'ledger.halvedAp' : 'ledger.halved', {stat: msg(`stat.${attr.toLowerCase()}`)}), o, h.halves ? null : msg('skill.immunity', {what: 'AP'}))]
    : [];
  // Cover's +3 is a Saving Roll MOD, not ARM: add it after AP halving. The
  // calculator saves on d20 <= PS + ARM, so this input is where the MOD goes.
  // Cover and Nanoscreen are against BS Attacks: nothing against a CC Attack,
  // and a template ignores cover (not Nanoscreen). A Comms Attack: Firewall's
  // +3 instead, cover and Nanoscreen do nothing.
  const ccIncoming = incoming?.kind === 'cc';
  const comms = isCommsAttack(row);
  const coverName = coverLabel(y);
  const coverStruck = ccIncoming ? msg('ledger.closeCombat') : comms ? msg('ledger.commsAttack') : ignoresCoverOnSaves(row) && !hasNanoscreen(y) ? msg('ledger.template') : null;
  const mods = compact([
    comms && firewallOf(y) && line(FIREWALL_SAVE_MOD, msg('equip.firewall'), s),
    (benefitsFromCover(y) || hasNanoscreen(y)) && line(COVER_SAVE_MOD, coverName, s, coverStruck),
  ]);
  const lines = [...floored, ...halving, ...mods];
  const inputs = /** @type {Partial<Params>} */ ({
    [`arm${s}`]: clamp(LIMITS.arm, sum(lines)),
    [`bts${s}`]: clamp(LIMITS.bts, Math.max(0, p.bts ?? 0) + sum(mods)),
    [`critImmune${s}`]: hasImmunity(y.traits, 'Critical', row),
  });
  return {inputs, lines};
}
