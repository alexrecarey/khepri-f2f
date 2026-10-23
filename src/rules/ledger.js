// "How the dice were built": every number a matchup puts into the calculator,
// as a list of lines that add up to it, each naming the side that caused it.
//
// deriveInputs (matchup.js) applies the rules and returns each number as the
// lines it summed (`derived.lines`, lines.js), worded as message descriptors
// (i18n/message.js). This file is the renderer: renderDerived puts every
// note and line into the player's language, and buildLedger lays the lines
// out per side and adds only display: the dice line, the ammunition lines
// and note.
//
// buildLedger({active, reactive, derived}) -> {A, B}, per side:
//   kind    'attack' | 'dodge' | 'reset' | 'template' | 'none'
//   dice    'B4 SV14 PS9': burst (+special dice), Success Value, save value
//   burst, sd, sv, save   {lines, total, note?}; a line is
//                     {value, label, by: 'A' | 'B' | null, struck: reason?}
//   `by` is whose skill, weapon or position caused the line (the colour);
//   `struck` lines were cancelled and don't count.
//   save is the Saving Roll the OTHER side makes against this side's hits:
//   weapon PS + target ARM (or BTS), on d20 <= total.
//   ammo    {lines, total}: the ammunition and where each part comes from
//   note    what the ammunition does (saves per hit, Continuous Damage...)
//   reason  kind 'none': why nothing is rolled
import {ammoName, ammoTypes, bioweaponParts, hasContinuousDamage, isImpactTemplate, isPlasma, isPseudo} from '../army/weapons.js';
import {AMMO} from '../engine/calculate.js';
import {other} from '../lib/side.js';
import {line} from './lines.js';
import {hasImmunity} from './saves.js';
import {bsAttackWeaponMods, pseudoName} from './trooper.js';
import {ccAttackSkill, isCcAttack} from './closeCombat.js';
import {zoneName} from './visibility.js';
import {tEn} from '../i18n/index.js';
import {render, renderLines} from '../i18n/message.js';

// A line whose source isn't a side ("loadout"): shown as is in the source column.
const fromSource = (l, source) => ({...l, source});

function ammoNote(inputs, s, t) {
  const ammo = inputs[`ammo${s}`];
  const notes = [];
  const a = AMMO[ammo];
  const name = ammoName(ammo, t);
  if (ammo === 'NONE') notes.push(t('ledger.noEffectOnTarget'));
  else if (a?.saves > 1) notes.push(t('ledger.savesPerHit', {ammo: name, count: a.saves}));
  else if (a?.woundsPerFailure > 1) notes.push(t('ledger.woundsPerFailure', {ammo: name, count: a.woundsPerFailure}));
  else if (a?.secondary) notes.push(t('ledger.alsoBts', {ammo: name}));
  if (inputs[`cont${s}`]) notes.push(t('trait.continuousDamage'));
  if (inputs[`shock${s}`]) notes.push(t('ammo.SHOCK'));
  return notes.join(' · ') || null;
}

// The weapon's ammunition for the dice line, as players write it: N is never
// shown; Plasma instead of its N+N; Bioweapon (DA+SHOCK) as "DA Shock"; then
// Cont for Continuous Damage and Blast for an Impact Template (not ammo, but
// it changes the roll). "AP EXP", "DA Cont", "EXP Blast", "" for plain N.
export function ammoTag(row, mods, t = tEn) {
  if (!row) return '';
  const tags = [];
  if (isPlasma(row)) tags.push(t('ammo.PLASMA'));
  tags.push(...bioweaponParts(row).map((a) => ammoName(a, t)));
  for (const a of ammoTypes(row, mods)) if (!tags.includes(ammoName(a, t))) tags.push(ammoName(a, t));
  if (hasContinuousDamage(row, mods)) tags.push(t('tag.cont'));
  if (isImpactTemplate(row)) tags.push(t('tag.blast'));
  return tags.length ? ` ${tags.join(' ')}` : '';
}

// The ammunition x fires with: the weapon's own first (N, EXP, AP+EXP,
// Plasma...), then what the trooper adds, one line each with its source
// (BS Attack (AP / T2 / Continuous Damage), the loadout's AP / T2 / Shock /
// Viral). A target's immunity strikes the line it cancels. Lines are text
// ('+' and a name), the total the ammo as players say it: "AP+CONT".
// `plain` marks the N line, `cont` the Continuous Damage ones.
function ammoLines(x, y, s, inputs, t) {
  const o = other(s);
  const {row, mods} = x.weapon;
  const loadout = (l) => fromSource(l, t('ledger.loadout'));
  // What the trooper's skill adds: CC Attack for a CC weapon, else BS Attack.
  const cc = isCcAttack(x) ? ccAttackSkill(x.traits) : null;
  const bs = cc ? {ap: cc.ap, cont: cc.cont, t2: false} : bsAttackWeaponMods(x.traits);
  const added = [];
  // The chart's ammo, before the loadout and skills.
  let own = ammoTypes(row).map((a) => a.toUpperCase());
  if (mods.ammo && mods.ammo !== 'Viral') {
    own = own.filter((a) => a !== mods.ammo.toUpperCase());
    added.push(loadout(line('+', ammoName(mods.ammo, t), null)));
  }
  if (cc?.shock && own.includes('SHOCK')) {
    own = own.filter((a) => a !== 'SHOCK');
    added.push(line('+', t('ammo.SHOCK'), s));
  }
  if (bs.t2 && own.includes('T2')) {
    own = own.filter((a) => a !== 'T2');
    added.push(line('+', t('ammo.T2'), s));
  }
  if (mods.forceAP && !own.includes('AP')) {
    added.push(bs.ap ? line('+', t('ammo.AP'), s) : loadout(line('+', t('ammo.AP'), null)));
  }
  const bio = mods.ammo === 'Viral' ? [] : bioweaponParts(row);
  const contTag = t('tag.contUpper');
  const ownCont = (row.props ?? []).includes('Continuous Damage');
  const base = [
    ...(isPlasma(row) ? [t('ammo.PLASMA')] : []),
    ...bio.map((a) => ammoName(a, t)),
    ...own.map((a) => ammoName(a, t)),
    ...(ownCont ? [contTag] : []),
  ];
  if (mods.ammo === 'Viral') added.push(loadout(line('+', t('ledger.viral'), null)));
  if (mods.cont && !ownCont) {
    const l = {...line('+', contTag, null), cont: true};
    added.push(bs.cont ? {...l, by: s} : loadout(l));
  }
  // Immunity (Continuous Damage): the Trait goes, the hit stays.
  const contImmune = y && hasContinuousDamage(row, mods) && hasImmunity(y.traits, 'Continuous Damage', row);
  // Plain N: ammoTypes lists no N, so nothing here is N.
  const first = base.length ? {...line('', base.join('+'), null), ...(ownCont && {cont: true})} : {...line('', t('ammo.N'), null), plain: true};
  const lines = [first, ...added].map((l) => (
    contImmune && l.cont ? {...l, struck: t('skill.immunity', {what: t('trait.continuousDamage')})} : l));
  if (inputs[`ammo${s}`] === 'NONE') lines.push(line('', t('ledger.noEffectImmune'), o));
  // N only counts when it's all there is: N with AP added is just "AP".
  const kept = lines.filter((l) => !l.struck && l.by !== o);
  const named = kept.filter((l) => !l.plain);
  const total = inputs[`ammo${s}`] === 'NONE' ? t('ledger.noEffect') : (named.length ? named : kept).map((l) => l.label).join('+');
  return {lines, total};
}

// The dice line's parts, in t's language: "B4+1", "SV14", "PS9".
const burstText = (n, sd, t) => `${t('abbr.B')}${n}${sd ? `+${sd}` : ''}`;
const svText = (n, t) => `${t('abbr.SV')}${n}`;

// l: the side's lines from deriveInputs (matchup.js), which decided what x
// rolls and why; this lays them out and adds the display.
function sideLedger(x, y, s, l, inputs, t) {
  if (!x?.weapon || !l) return null;
  const w = x.weapon;
  if (l.kind === 'none') {
    if (l.blockedZone) return {kind: 'none', dice: t('ledger.noLofZone', {zone: render(t, zoneName(l.blockedZone))})};
    // A Dodge that can't evade a Comms Attack, a Reset that evades nothing
    // else, a program its target isn't a valid target for: nothing is rolled.
    if (l.reason) return {kind: 'none', dice: t('ledger.notRolled', {choice: isPseudo(w) ? render(t, pseudoName(w)) : w.row.name}), reason: l.reason};
    return {kind: 'none', dice: t('pseudo.none')};
  }
  const {sv} = l;
  if (l.kind === 'reset') {
    // Zero Pain rolls two dice.
    const burst = inputs[`burst${s}`] > 1 ? ` ${t('abbr.B')}${inputs[`burst${s}`]}` : '';
    return {kind: 'reset', dice: `${render(t, pseudoName(w))}${burst} ${svText(sv.total, t)}`, sv};
  }
  const {burst, sd, save} = l;
  if (l.kind === 'dodge') {
    return {kind: 'dodge', dice: `${t('pseudo.dodge')}${sd.total ? ` +${sd.total}${t('abbr.SD')}` : ''} ${svText(sv.total, t)}`, sv, sd};
  }
  const b = burstText(burst.total, sd.total, t);
  const tag = ammoTag(w.row, w.mods, t);
  const ammo = ammoLines(x, y, s, inputs, t);
  const note = ammoNote(inputs, s, t);
  if (isCcAttack(x)) {
    // PARA's save is the target's PH roll, not PS + ARM.
    const saveTag = w.row.save?.attr === 'PH' ? t('stat.ph') : t('abbr.PS');
    return {kind: 'attack', dice: `${t('abbr.CC')} ${b} ${svText(sv.total, t)} ${saveTag}${save.total}${tag}`, burst, sd, sv, save, ammo, note};
  }
  if (l.kind === 'template') {
    return {kind: 'template', dice: `${b} ${t('ledger.template')} ${t('abbr.PS')}${save.total}${tag}`, burst, sd, save, ammo, note};
  }
  return {kind: 'attack', dice: `${b} ${svText(sv.total, t)} ${t('abbr.PS')}${save.total}${tag}`, burst, sd, sv, save, ammo, note};
}

// A section ({lines, total, note?}) with its lines and note rendered.
const renderSection = (t, sec) => (sec
  ? {...sec, lines: renderLines(t, sec.lines), ...(sec.note !== undefined && {note: render(t, sec.note)})} : sec);

// The deriveInputs result with every descriptor rendered in t's language:
// notes, warnings, errors, and each side's lines (label, struck, source,
// reason, note). Text already rendered passes through, so rendering twice
// is harmless.
export function renderDerived(derived, t = tEn) {
  const say = (m) => render(t, m);
  const side = (l) => (l ? {
    ...l,
    ...(l.reason !== undefined && {reason: say(l.reason)}),
    ...(l.sv && {sv: renderSection(t, l.sv)}),
    ...(l.burst && {burst: renderSection(t, l.burst)}),
    ...(l.sd && {sd: renderSection(t, l.sd)}),
    ...(l.save && {save: renderSection(t, l.save)}),
  } : l);
  return {
    ...derived,
    errors: derived.errors.map(say), warnings: derived.warnings.map(say), notes: derived.notes.map(say),
    lines: {A: side(derived.lines.A), B: side(derived.lines.B)},
  };
}

// derived: the deriveInputs result for the same two sides, rendered or not.
// t: the language of the labels (src/i18n).
export function buildLedger({active, reactive, derived, t = tEn}) {
  const {inputs, lines} = renderDerived(derived, t);
  return {
    A: sideLedger(active, reactive, 'A', lines.A, inputs, t),
    B: sideLedger(reactive, active, 'B', lines.B, inputs, t),
  };
}
