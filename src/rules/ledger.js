// "How the dice were built": every number a matchup puts into the calculator,
// as a list of lines that add up to it, each naming the side that caused it.
//
// deriveInputs (matchup.js) applies the rules and returns each number as the
// lines it summed (`derived.lines`, lines.js), worded as message descriptors
// (i18n/message.js). This file is the renderer: renderDerived puts every
// note and line into the player's language, and buildLedger lays the lines
// out per side (types.js LedgerSide) and adds only display: the dice line,
// the ammunition lines and note.
import {ammoName, ammoTypes, bioweaponParts, hasContinuousDamage, isImpactTemplate, isPlasma, isPseudo} from '../army/weapons.js';
import {AMMO} from '../engine/calculate.js';
import {pseudoName} from './trooper.js';
import {isCcAttack} from './closeCombat.js';
import {zoneName} from './visibility.js';
import {tEn} from '../i18n/index.js';
import {render, renderLines} from '../i18n/message.js';

/** @typedef {import('../types.js').Side} Side */
/** @typedef {import('../types.js').Translator} Translator */
/** @typedef {import('../types.js').Params} Params */
/** @typedef {import('../types.js').LedgerSide} LedgerSide */

/**
 * @param {Partial<Params>} inputs
 * @param {Side} s
 * @param {Translator} t
 */
function ammoNote(inputs, s, t) {
  // A side with an attack to note has its ammo set.
  const ammo = /** @type {import('../types.js').Ammo} */ (inputs[`ammo${s}`]);
  const notes = [];
  const a = AMMO[ammo];
  const name = ammoName(ammo, t);
  if (ammo === 'NONE') notes.push(t('ledger.noEffectOnTarget'));
  else if (a?.saves > 1) notes.push(t('ledger.savesPerHit', {ammo: name, count: a.saves}));
  // No woundsPerFailure compares as false, like 1 would.
  else if (/** @type {number} */ (a?.woundsPerFailure) > 1) notes.push(t('ledger.woundsPerFailure', {ammo: name, count: a.woundsPerFailure}));
  else if (a?.secondary) notes.push(t('ledger.alsoBts', {ammo: name}));
  if (inputs[`cont${s}`]) notes.push(t('trait.continuousDamage'));
  if (inputs[`shock${s}`]) notes.push(t('ammo.SHOCK'));
  return notes.join(' · ') || null;
}

// The weapon's ammunition for the dice line, as players write it: N is never
// shown; Plasma instead of its N+N; Bioweapon (DA+SHOCK) as "DA Shock"; then
// Cont for Continuous Damage and Blast for an Impact Template (not ammo, but
// it changes the roll). "AP EXP", "DA Cont", "EXP Blast", "" for plain N.
/**
 * @param {import('../types.js').WeaponRow | null | undefined} row
 * @param {import('../types.js').WeaponMods} mods
 * @param {Translator} [t]
 */
export function ammoTag(row, mods, t = tEn) {
  if (!row) return '';
  /** @type {string[]} */
  const tags = [];
  if (isPlasma(row)) tags.push(t('ammo.PLASMA'));
  tags.push(...bioweaponParts(row).map((a) => ammoName(a, t)));
  for (const a of ammoTypes(row, mods)) if (!tags.includes(ammoName(a, t))) tags.push(ammoName(a, t));
  if (hasContinuousDamage(row, mods)) tags.push(t('tag.cont'));
  if (isImpactTemplate(row)) tags.push(t('tag.blast'));
  return tags.length ? ` ${tags.join(' ')}` : '';
}

// The dice line's parts, in t's language: "B4+1", "SV14", "PS9".
/**
 * @param {number | import('../types.js').Message} n
 * @param {number | import('../types.js').Message} sd
 * @param {Translator} t
 */
const burstText = (n, sd, t) => `${t('abbr.B')}${n}${sd ? `+${sd}` : ''}`;
/**
 * @param {number | import('../types.js').Message} n
 * @param {Translator} t
 */
const svText = (n, t) => `${t('abbr.SV')}${n}`;

// l: the side's lines from deriveInputs (matchup.js), which decided what x
// rolls and why; this lays them out and adds the display.
/**
 * @param {import('../types.js').ResolvedSide | null} x
 * @param {import('../types.js').ResolvedSide | null} y
 * @param {Side} s
 * @param {import('../types.js').SideLines | null} l
 * @param {Partial<Params>} inputs
 * @param {Translator} t
 * @returns {LedgerSide | null}
 */
function sideLedger(x, y, s, l, inputs, t) {
  if (!x?.weapon || !l) return null;
  const w = x.weapon;
  if (l.kind === 'none') {
    if (l.blockedZone) return {kind: 'none', dice: t('ledger.noLofZone', {zone: render(t, zoneName(l.blockedZone))})};
    // A Dodge that can't evade a Comms Attack, a Reset that evades nothing
    // else, a program its target isn't a valid target for: nothing is rolled.
    // Rendered by renderDerived before this (buildLedger's caller).
    if (l.reason) return {kind: 'none', dice: t('ledger.notRolled', {choice: isPseudo(w) ? render(t, pseudoName(w)) : w.row.name}), reason: /** @type {string} */ (l.reason)};
    return {kind: 'none', dice: t('pseudo.none')};
  }
  // A roll's lines carry the sections its kind has (types.js SideLines).
  const sv = /** @type {import('../types.js').Section} */ (l.sv);
  if (l.kind === 'reset') {
    // Zero Pain rolls two dice.
    const burst = /** @type {number} */ (inputs[`burst${s}`]) > 1 ? ` ${t('abbr.B')}${inputs[`burst${s}`]}` : '';
    // A Reset is a pseudo-weapon.
    return {kind: 'reset', dice: `${render(t, pseudoName(/** @type {import('../types.js').PseudoEntry} */ (w)))}${burst} ${svText(sv.total, t)}`, sv};
  }
  const {burst, sd, save, ammo} = /** @type {Required<Pick<import('../types.js').SideLines, 'burst' | 'sd' | 'save' | 'ammo'>>} */ (l);
  if (l.kind === 'dodge') {
    return {kind: 'dodge', dice: `${t('pseudo.dodge')}${sd.total ? ` +${sd.total}${t('abbr.SD')}` : ''} ${svText(sv.total, t)}`, sv, sd};
  }
  const b = burstText(burst.total, sd.total, t);
  // The kinds left (attack, template) fire a weapon.
  const tag = ammoTag(w.row, /** @type {import('../types.js').WeaponMods} */ (w.mods), t);
  const note = ammoNote(inputs, s, t);
  if (isCcAttack(x)) {
    // PARA's save is the target's PH roll, not PS + ARM.
    const saveTag = /** @type {import('../types.js').WeaponRow} */ (w.row).save?.attr === 'PH' ? t('stat.ph') : t('abbr.PS');
    return {kind: 'attack', dice: `${t('abbr.CC')} ${b} ${svText(sv.total, t)} ${saveTag}${save.total}${tag}`, burst, sd, sv, save, ammo, note};
  }
  if (l.kind === 'template') {
    return {kind: 'template', dice: `${b} ${t('ledger.template')} ${t('abbr.PS')}${save.total}${tag}`, burst, sd, save, ammo, note};
  }
  return {kind: 'attack', dice: `${b} ${svText(sv.total, t)} ${t('abbr.PS')}${save.total}${tag}`, burst, sd, sv, save, ammo, note};
}

// A section ({lines, total, note?}) with its lines and note rendered.
/**
 * @template {import('../types.js').Section | undefined} S
 * @param {Translator} t
 * @param {S} sec
 * @returns {S}
 */
const renderSection = (t, sec) => (sec
  ? /** @type {S} */ ({...sec, lines: renderLines(t, sec.lines), total: render(t, sec.total), ...(sec.note !== undefined && {note: render(t, sec.note)})}) : sec);

/**
 * The deriveInputs result with every descriptor rendered in t's language:
 * notes, warnings, errors, and each side's lines (label, struck, source,
 * reason, note). Rendered once per view (state/matchupView.js), before
 * buildLedger.
 * @param {import('../types.js').Derived} derived
 * @param {Translator} [t]
 * @returns {import('../types.js').Derived}
 */
export function renderDerived(derived, t = tEn) {
  /** @param {import('../types.js').Message} m */
  const say = (m) => render(t, m);
  /**
   * @param {import('../types.js').SideLines | null} l
   * @returns {import('../types.js').SideLines | null}
   */
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

/**
 * derived: the deriveInputs result for the same two sides, rendered with t
 * (renderDerived) by the caller. t: the language of the display text here.
 * @param {{active: import('../types.js').ResolvedSide | null, reactive: import('../types.js').ResolvedSide | null,
 *   derived: import('../types.js').Derived, t?: Translator}} _
 * @returns {import('../types.js').Ledger}
 */
export function buildLedger({active, reactive, derived, t = tEn}) {
  const {inputs, lines} = derived;
  return {
    A: sideLedger(active, reactive, 'A', lines.A, inputs, t),
    B: sideLedger(reactive, active, 'B', lines.B, inputs, t),
  };
}
