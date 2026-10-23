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
//   ammo    {lines, total}: the ammunition and where each part comes from (matchup.js)
//   note    what the ammunition does (saves per hit, Continuous Damage...)
//   reason  kind 'none': why nothing is rolled
import {ammoName, ammoTypes, bioweaponParts, hasContinuousDamage, isImpactTemplate, isPlasma, isPseudo} from '../army/weapons.js';
import {AMMO} from '../engine/calculate.js';
import {pseudoName} from './trooper.js';
import {isCcAttack} from './closeCombat.js';
import {zoneName} from './visibility.js';
import {tEn} from '../i18n/index.js';
import {render, renderLines} from '../i18n/message.js';

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
  const {burst, sd, save, ammo} = l;
  if (l.kind === 'dodge') {
    return {kind: 'dodge', dice: `${t('pseudo.dodge')}${sd.total ? ` +${sd.total}${t('abbr.SD')}` : ''} ${svText(sv.total, t)}`, sv, sd};
  }
  const b = burstText(burst.total, sd.total, t);
  const tag = ammoTag(w.row, w.mods, t);
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
  ? {...sec, lines: renderLines(t, sec.lines), total: render(t, sec.total), ...(sec.note !== undefined && {note: render(t, sec.note)})} : sec);

// The deriveInputs result with every descriptor rendered in t's language:
// notes, warnings, errors, and each side's lines (label, struck, source,
// reason, note). Rendered once per view (state/matchupView.js), before
// buildLedger.
export function renderDerived(derived, t = tEn) {
  const say = (m) => render(t, m);
  const side = (l) => (l ? {
    ...l,
    ...(l.reason !== undefined && {reason: say(l.reason)}),
    ...(l.sv && {sv: renderSection(t, l.sv)}),
    ...(l.burst && {burst: renderSection(t, l.burst)}),
    ...(l.sd && {sd: renderSection(t, l.sd)}),
    ...(l.save && {save: renderSection(t, l.save)}),
    ...(l.ammo && {ammo: renderSection(t, l.ammo)}),
  } : l);
  return {
    ...derived,
    errors: derived.errors.map(say), warnings: derived.warnings.map(say), notes: derived.notes.map(say),
    lines: {A: side(derived.lines.A), B: side(derived.lines.B)},
  };
}

// derived: the deriveInputs result for the same two sides, rendered with t
// (renderDerived) by the caller. t: the language of the display text here.
export function buildLedger({active, reactive, derived, t = tEn}) {
  const {inputs, lines} = derived;
  return {
    A: sideLedger(active, reactive, 'A', lines.A, inputs, t),
    B: sideLedger(reactive, active, 'B', lines.B, inputs, t),
  };
}
