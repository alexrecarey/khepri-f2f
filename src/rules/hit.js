// What a hit does and the Saving Roll against it, as calculator inputs: PS,
// ammunition, Continuous Damage and Shock on the attacker's side (hitInputs),
// the target's ARM / BTS / PH with halving and cover on the other
// (defenseInputs). The save section of the ledger is the two halves
// together: the attacker's PS lines, then the target's (matchup.js).
// ctx: matchup.js deriveInputs.
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
import {coverLabel, line, mark, statLabel, sum} from './lines.js';

// The PS of x's hits: the weapon's own, then BS Attack (SR-1 / SR-2) as its
// own line: it is the attacker's skill, not the weapon's (MULTI HMG 5, then
// -1). On a program it is the program's upgrade (Trinity (SR-1)).
export function psLines(x, s) {
  const {row, mods} = x.weapon;
  const lines = [line(weaponPS(row, {...mods, psMod: 0}), msg('abbr.PS'), null)];
  const sr = list([msg('abbr.SR'), mods?.psMod], '');
  if (mods?.psMod) {
    lines.push(line(mods.psMod, x.weapon.kind === 'program' ? msg('ledger.programMod', {program: row.name, mod: sr}) : msg('skill.bsAttackMod', {mod: sr}), s));
  }
  return lines;
}

// The ammunition x fires with: the weapon's own first (N, EXP, AP+EXP,
// Plasma...), then what the trooper adds, one line each with its source
// (BS Attack (AP / T2 / Continuous Damage), the loadout's AP / T2 / Shock /
// Viral). A target's immunity strikes the line it cancels. Lines are
// display-only marks ('+' and a name, '' for the weapon's own), the total
// the ammo as players say it: "AP+CONT".
// `plain` marks the N line, `cont` the Continuous Damage ones. `ammo`: the
// calculator's ammunition for the hit (NONE: the target is immune to it).
export function ammoLines(x, s, ammo, contImmune) {
  const o = other(s);
  const {row, mods} = x.weapon;
  const loadout = (l) => ({...l, source: msg('ledger.loadout')});
  // What the trooper's skill adds: CC Attack for a CC weapon, else BS Attack.
  const cc = isCcAttack(x) ? ccAttackSkill(x.traits) : null;
  const bs = cc ? {ap: cc.ap, cont: cc.cont, t2: false} : bsAttackWeaponMods(x.traits);
  const added = [];
  // The chart's ammo, before the loadout and skills.
  let own = ammoTypes(row).map((a) => a.toUpperCase());
  if (mods.ammo && mods.ammo !== 'Viral') {
    own = own.filter((a) => a !== mods.ammo.toUpperCase());
    added.push(loadout(mark('+', ammoMsg(mods.ammo), null)));
  }
  if (cc?.shock && own.includes('SHOCK')) {
    own = own.filter((a) => a !== 'SHOCK');
    added.push(mark('+', msg('ammo.SHOCK'), s));
  }
  if (bs.t2 && own.includes('T2')) {
    own = own.filter((a) => a !== 'T2');
    added.push(mark('+', msg('ammo.T2'), s));
  }
  if (mods.forceAP && !own.includes('AP')) {
    added.push(bs.ap ? mark('+', msg('ammo.AP'), s) : loadout(mark('+', msg('ammo.AP'), null)));
  }
  const bio = mods.ammo === 'Viral' ? [] : bioweaponParts(row);
  const contTag = msg('tag.contUpper');
  const ownCont = (row.props ?? []).includes('Continuous Damage');
  const base = [
    ...(isPlasma(row) ? [msg('ammo.PLASMA')] : []),
    ...bio.map(ammoMsg),
    ...own.map(ammoMsg),
    ...(ownCont ? [contTag] : []),
  ];
  if (mods.ammo === 'Viral') added.push(loadout(mark('+', msg('ledger.viral'), null)));
  if (mods.cont && !ownCont) {
    const l = {...mark('+', contTag, null), cont: true};
    added.push(bs.cont ? {...l, by: s} : loadout(l));
  }
  // Plain N: ammoTypes lists no N, so nothing here is N.
  const first = base.length ? {...mark('', list(base, '+'), null), ...(ownCont && {cont: true})} : {...mark('', msg('ammo.N'), null), plain: true};
  // Immunity (Continuous Damage): the Trait goes, the hit stays.
  const lines = [first, ...added].map((l) => (
    contImmune && l.cont ? {...l, struck: msg('skill.immunity', {what: msg('trait.continuousDamage')})} : l));
  if (ammo === 'NONE') lines.push(mark('', msg('ledger.noEffectImmune'), o));
  // N only counts when it's all there is: N with AP added is just "AP".
  const kept = lines.filter((l) => !l.struck && l.by !== o);
  const named = kept.filter((l) => !l.plain);
  const total = ammo === 'NONE' ? msg('ledger.noEffect') : list((named.length ? named : kept).map((l) => l.label), '+');
  return {lines, total};
}

// What x's hits do to y: PS, ammunition, Continuous Damage, Shock, with the
// notes on Immunity and Vulnerability. The same for a shot and a CC Attack.
// Returns the inputs, the PS lines (the save section's first lines) and the
// ammunition lines.
export function hitInputs(x, y, side, ctx) {
  const {say} = ctx;
  const {row, mods} = x.weapon;
  const noEffect = hasNoEffect(y?.traits, row);
  const immunity = immunityAgainst(y?.traits, row);
  // Immunity (Continuous Damage): the Trait is ignored, the hit is not.
  const contImmune = hasImmunity(y?.traits, 'Continuous Damage', row);
  const ps = psLines(x, side);
  const out = {
    [`damage${side}`]: clamp(LIMITS.damage, sum(ps)),
    [`ammo${side}`]: noEffect ? 'NONE' : calcAmmo(row, y?.traits),
    [`cont${side}`]: !immunity && !contImmune && hasContinuousDamage(row, mods),
    [`shock${side}`]: shockApplies(row, y),
  };
  const ammo = ammoLines(x, side, out[`ammo${side}`], contImmune);
  if (out[`shock${side}`]) say(side, 'note.shock');
  const state = stateCaused(row);
  if (state && !noEffect) say(side, 'note.stateCaused', {weapon: row.name, state: msg(`state.${state.toLowerCase()}`)});
  // State-only weapons get a warning instead (no effect), or play as always (Stunned).
  if (!immunity && contImmune && hasContinuousDamage(row, mods)) {
    say(side, 'note.contImmune');
  }
  const note = immunity && causesWounds(row) && immunityNote(immunity, row, mods);
  if (note) say(side, 'note.text', {text: note});
  const vulnerable = vulnerabilityTo(y?.traits, row);
  const lost = vulnerable && immunityFor(y.traits, row);
  if (lost) say(side, 'note.vulnerability', {vulnerable: term('extras', vulnerable), immunity: term('extras', lost)});
  return {inputs: out, ps, ammo};
}

// y's Saving Roll against `incoming` (the other side's weapon, null when it
// has none), as lines in y's colour (`s`), the attacker's where its weapon or
// skill changes the save. `dodging`: y Dodges this attack, so Dodge (ARM +3)
// adds to its ARM. Returns the inputs and the lines.
export function defenseInputs(y, incoming, s, dodging, ctx) {
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
    lines.push(line(base, statLabel(y, 'PH'), s));
    if (save.mod) lines.push(line(save.mod, row.name, o));
  } else if (attr === 'ARM' && save.armZero && !immune) {
    lines.push(line(base, statLabel(y, 'ARM'), s, msg('ledger.armZeroBy', {weapon: row.name})));
  } else {
    lines.push(line(base, statLabel(y, attr), s));
  }
  // ARM = 0 wins over the Dodge's extra ARM (Alex, 2026-10-10).
  const extra = attr === 'ARM' && dodging ? dodgeExtras(y.traits).arm : 0;
  if (extra) lines.push(line(extra, msg('ledger.dodgeArm', {extra}), s, save.armZero && !immune ? msg('ledger.armZero') : null));
  // An Attribute below 0 (a Netrod's PH at PARA's -6) saves as 0.
  if (sum(lines) < 0) lines.push(line(-sum(lines), msg('ledger.notBelowZero'), null));
  // AP or printed halving (saves.js saveHalving); halving 0 or 1 changes
  // nothing: no line. Immunity (AP) keeps the line, struck.
  const h = saveHalving(row, incoming?.mods, y.traits);
  if (!immune && (h.other || h.ap)) {
    const whole = sum(lines);
    const halved = Math.ceil(whole / 2);
    if (halved !== whole) {
      lines.push(line(halved - whole, msg(h.ap ? 'ledger.halvedAp' : 'ledger.halved', {stat: msg(`stat.${attr.toLowerCase()}`)}), o,
        h.halves ? null : msg('skill.immunity', {what: 'AP'})));
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
  if (comms && firewallOf(y)) mods.push(line(FIREWALL_SAVE_MOD, msg('equip.firewall'), s));
  if (benefitsFromCover(y) || hasNanoscreen(y)) {
    const name = coverLabel(y);
    if (ccIncoming) mods.push(line(COVER_SAVE_MOD, name, s, msg('ledger.closeCombat')));
    else if (comms) mods.push(line(COVER_SAVE_MOD, name, s, msg('ledger.commsAttack')));
    else if (ignoresCoverOnSaves(row) && !hasNanoscreen(y)) mods.push(line(COVER_SAVE_MOD, name, s, msg('ledger.template')));
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
