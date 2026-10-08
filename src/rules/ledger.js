// "How the dice were built": every number a matchup puts into the calculator,
// as a list of lines that add up to it, each naming the side that caused it.
//
// deriveInputs (matchup.js) decides the numbers; this file explains them with
// the same rule functions, then reconciles against the real inputs. If a rule
// changes there and not here, the gap shows as an "other rules" line instead of
// a wrong total, and the tests (ledger.test.mjs) fail.
//
// buildLedger({active, reactive, rangeCm, inputs}) -> {A, B}, per side:
//   kind    'attack' | 'dodge' | 'template' | 'none'
//   dice    'B4 SV14 PS9': burst (+special dice), Success Value, save value
//   burst, sv, save   {lines, total, note}; a line is
//                     {value, label, by: 'A' | 'B' | null, struck: reason?}
//   `by` is whose skill, weapon or position caused the line (the colour);
//   `struck` lines were cancelled and don't count.
//   save is the Saving Roll the OTHER side makes against this side's hits:
//   weapon PS + target ARM (or BTS), on d20 <= total.
import {EQUIP, SKILL} from '../army/ids.js';
import {equipExtra, hasEquip, hasSkill, skillExtra, skillExtras} from '../army/traits.js';
import {
  ammoTypes, attackAttribute, bioweaponProp, hasAmmo, hasContinuousDamage, isImpactTemplate, isPlasma, isTemplate, weaponPS,
} from '../army/weapons.js';
import {
  albedoMod, attackBonuses, attackStat, benefitsFromCover, bsAttackMod, coverBsMod, dodgeExtras, fireteamBonuses,
  hasNanoscreen, ignoresCoverOnSaves, keepsAroBurst, mimetismMod, surpriseAttackMod,
} from './modifiers.js';
import {RANGE_BANDS, rangeModFor} from './ranges.js';
import {immunityAgainst, hasImmunity} from './saves.js';
import {bsAttackWeaponMods} from './trooper.js';

const AMMO_SAVES = {N: 1, DA: 2, EXP: 3, T2: 1, PLASMA: 1};
const other = (s) => (s === 'A' ? 'B' : 'A');
const line = (value, label, by, struck) => ({value, label, by, ...(struck ? {struck} : {})});
// A line whose source isn't a side ("loadout"): shown as is in the source column.
const fromSource = (l, source) => ({...l, source});
const live = (lines) => lines.filter((l) => !l.struck && typeof l.value === 'number');
const sum = (lines) => live(lines).reduce((t, l) => t + l.value, 0);

// Adds an "other rules" line when the explanation doesn't reach the real total.
function reconcile(lines, total) {
  const gap = total - sum(lines);
  return gap === 0 ? lines : [...lines, line(gap, 'other rules', null)];
}

const rolls = (x) => {
  const w = x?.weapon;
  if (!w) return false;
  if (w.pseudo) return w.pseudo === 'dodge';
  return !isTemplate(w.row) && attackStat(x.profile, w.row) > 0;
};

// The MODs y's skills put on x's roll (matchup.js opposingMod), one line each.
function opposingLines(y, x, ySide, yActive) {
  if (!rolls(x) || !rolls(y)) return [];
  if (y.weapon.pseudo === 'dodge') {
    const mod = x.weapon.pseudo ? 0 : dodgeExtras(y.traits).opponentMod;
    return mod ? [line(mod, `Dodge (${mod})`, ySide)] : [];
  }
  const out = [];
  const bs = bsAttackMod(y.traits);
  if (bs) {
    out.push(hasSkill(x.traits, SKILL.WARHORSE)
      ? line(bs, `BS Attack (${bs})`, ySide, 'Warhorse')
      : line(bs, `BS Attack (${bs})`, ySide));
  }
  const surprise = yActive && y.surpriseAttack ? surpriseAttackMod(y.traits) : 0;
  if (surprise) {
    const ignores = hasSkill(x.traits, SKILL.COMBAT_INSTINCT) ? 'Combat Instinct'
      : hasEquip(x.traits, EQUIP.MSV3) ? 'MSV3' : null;
    out.push(line(surprise, 'Surprise attack', ySide, ignores));
  }
  return out;
}

const msvName = (traits) => (hasEquip(traits, EQUIP.MSV3) ? 'MSV3' : hasEquip(traits, EQUIP.MSV2) ? 'MSV2'
  : hasEquip(traits, EQUIP.MSV1) ? 'MSV1' : null);

function rangeLabel(rangeCm) {
  const i = RANGE_BANDS.findIndex((b) => rangeCm <= b.to);
  const band = RANGE_BANDS[i];
  return `range ${i ? RANGE_BANDS[i - 1].inches : 0}–${band.inches}"`;
}

function attackSv(x, y, s, rangeCm, total) {
  const t = other(s);
  const {row, mods} = x.weapon;
  const attr = attackAttribute(row);
  const lines = [line(attackStat(x.profile, row), attr.toUpperCase(), null)];
  const ft = fireteamBonuses(x.ftSize);
  if (ft.bs) lines.push(line(ft.bs, `Fireteam ${x.ftSize}`, s));
  const rangeMod = rangeModFor(row, rangeCm, x.traits);
  if (rangeMod === null) return {lines: [...lines, line('—', 'out of range', s)], total, note: 'out of range: always fails'};
  if (rangeMod) lines.push(line(rangeMod, rangeLabel(rangeCm), s));
  if (mods.sv) lines.push(line(mods.sv, 'loadout', s));
  if (y) {
    // Mimetism, with what the attacker's MSV cancels shown struck.
    if (hasSkill(y.traits, SKILL.MIMETISM)) {
      const raw = Number(skillExtra(y.traits, SKILL.MIMETISM));
      const full = Number.isFinite(raw) && raw < 0 ? raw : -3;
      const applied = mimetismMod(y.traits, x.traits);
      if (applied) lines.push(line(applied, `Mimetism (${full})${applied !== full ? `, ${msvName(x.traits)}` : ''}`, t));
      else lines.push(line(full, `Mimetism (${full})`, t, msvName(x.traits) ?? 'cancelled'));
    }
    const albedo = albedoMod(y.traits, x.traits);
    if (albedo) lines.push(line(albedo, 'Albedo', t));
    else if (hasEquip(y.traits, EQUIP.ALBEDO)) {
      const raw = Number(equipExtra(y.traits, EQUIP.ALBEDO));
      lines.push(line(Number.isFinite(raw) && raw < 0 ? raw : -3, 'Albedo', t, 'only vs MSV or Marksmanship'));
    }
    const cover = coverBsMod(y, x.traits);
    const coverName = benefitsFromCover(y) ? 'cover' : 'Nanoscreen';
    if (cover) lines.push(line(cover, coverName, t));
    else if (benefitsFromCover(y) || hasNanoscreen(y)) {
      const why = hasSkill(x.traits, SKILL.MARKSMANSHIP) ? 'Marksmanship' : 'Limited Cover';
      lines.push(line(-3, coverName, t, why));
    }
    lines.push(...opposingLines(y, x, t, t === 'A'));
  }
  // MODs cap at ±12 (Fireteam BS and the Attribute aren't MODs).
  const modLines = live(lines).slice(1).filter((l) => !l.label.startsWith('Fireteam'));
  const modSum = modLines.reduce((a, l) => a + l.value, 0);
  const capped = Math.max(-12, Math.min(12, modSum));
  if (capped !== modSum) lines.push(line(capped - modSum, 'MODs cap at ±12', null));
  floor(lines);
  return {lines: reconcile(lines, total), total};
}

// A Success Value below 0 is 0: the roll always fails (and can't crit).
function floor(lines) {
  const t = sum(lines);
  if (t < 0) lines.push(line(-t, 'below 0: always fails', null));
  else if (t > 30) lines.push(line(30 - t, 'capped at 30', null));
}

function dodgeSv(x, y, s, total) {
  const t = other(s);
  const d = dodgeExtras(x.traits);
  const lines = [d.ph !== null ? line(d.ph, `Dodge (PH=${d.ph})`, s) : line(x.profile.ph ?? 0, 'PH', null)];
  if (d.mod) lines.push(line(d.mod, `Dodge (+${d.mod})`, s));
  const ft = fireteamBonuses(x.ftSize).dodge;
  if (ft) lines.push(line(ft, `Fireteam ${x.ftSize}`, s));
  if (y) lines.push(...opposingLines(y, x, t, t === 'A'));
  floor(lines);
  return {lines: reconcile(lines, total), total};
}

function burstLines(x, s, inputs) {
  const row = x.weapon.row;
  const total = inputs[`burst${s}`];
  if (s === 'A' && hasSkill(x.traits, SKILL.NEUROCINETICS)) {
    return {lines: reconcile([line(1, 'Neurocinetics', s)], total), total};
  }
  const lines = [line(row.burst ?? 1, x.weapon.name ?? row.name, null)];
  const b = attackBonuses(x);
  if (b.burst) lines.push(line(b.burst, 'loadout / BS Attack', s));
  // In ARO a trooper rolls one die, whatever its burst (Total Reaction aside).
  if (s === 'B' && !keepsAroBurst(x) && sum(lines) !== 1) lines.push(line(1 - sum(lines), 'ARO: one die', null));
  return {lines: reconcile(lines, total), total};
}

function sdLines(x, s, inputs, dodge) {
  const total = inputs[`bonusBurst${s}`] ?? 0;
  const lines = [];
  if (dodge) {
    const sd = dodgeExtras(x.traits).sd;
    if (sd) lines.push(line(sd, 'Dodge (+SD)', s));
  } else {
    const ft = fireteamBonuses(x.ftSize).sd;
    const own = attackBonuses(x).sd - ft;
    if (own) lines.push(line(own, 'loadout / BS Attack', s));
    if (ft) lines.push(line(ft, `Fireteam ${x.ftSize}`, s));
  }
  return {lines: reconcile(lines, total), total};
}

// The Saving Roll the target y makes against x's hits (matchup.js defenseInputs).
function saveLines(x, y, s, inputs) {
  const t = other(s);
  const total = inputs[`damage${s}`] + inputs[`arm${t}`];
  const {row, mods} = x.weapon;
  // The weapon's own PS, then BS Attack (SR-1 / SR-2) as its own line: it is
  // the attacker's skill, not the weapon's (MULTI HMG 5, then -1).
  const lines = [line(weaponPS(row, {...mods, psMod: 0}), 'PS', null)];
  if (mods?.psMod) lines.push(line(mods.psMod, `BS Attack (SR${mods.psMod})`, s));
  if (!y) return {lines: reconcile(lines, total), total};
  const save = row.save ?? {attr: 'ARM'};
  const immune = Boolean(immunityAgainst(y.traits, row));
  const attr = save.attr === 'BTS' ? 'BTS' : 'ARM';
  const p = y.profile;
  const dodging = y.weapon?.pseudo === 'dodge';
  let base = attr === 'BTS' ? p.bts ?? 0 : (p.arm ?? 0);
  if (attr === 'ARM' && save.armZero && !immune) {
    lines.push(line(base, 'ARM', t, `${row.name}: ARM = 0`));
    base = 0;
  } else {
    lines.push(line(base, attr, t));
  }
  if (attr === 'ARM' && dodging && dodgeExtras(y.traits).arm) {
    const extra = dodgeExtras(y.traits).arm;
    lines.push(line(extra, `Dodge (ARM +${extra})`, t));
    base += extra;
  }
  const apHalving = Boolean(mods?.forceAP) || (Boolean(save.halved) && hasAmmo(row, 'AP'));
  const otherHalving = Boolean(save.halved) && !hasAmmo(row, 'AP');
  if (!immune && (otherHalving || apHalving)) {
    const halved = Math.ceil(base / 2);
    // Halving 0 or 1 changes nothing: no line.
    if (halved === base) { /* nothing to show */ } else if (otherHalving || !hasImmunity(y.traits, 'AP', row)) lines.push(line(halved - base, `${attr} halved${apHalving ? ' (AP)' : ''}`, s));
    else lines.push(line(halved - base, `${attr} halved (AP)`, s, 'Immunity (AP)'));
  }
  if (benefitsFromCover(y) || hasNanoscreen(y)) {
    const name = benefitsFromCover(y) ? 'cover' : 'Nanoscreen';
    if (ignoresCoverOnSaves(row) && !hasNanoscreen(y)) lines.push(line(3, name, t, 'template'));
    else lines.push(line(3, name, t));
  }
  return {lines: reconcile(lines, total), total};
}

function ammoNote(inputs, s) {
  const ammo = inputs[`ammo${s}`];
  const notes = [];
  if (ammo === 'NONE') notes.push('no effect on this target');
  else if (AMMO_SAVES[ammo] > 1) notes.push(`${ammo}: ${AMMO_SAVES[ammo]} saves per hit`);
  else if (ammo === 'T2') notes.push('T2: 2 wounds per failed save');
  else if (ammo === 'PLASMA') notes.push('Plasma: also a BTS save');
  if (inputs[`cont${s}`]) notes.push('Continuous Damage');
  if (inputs[`shock${s}`]) notes.push('Shock');
  return notes.join(' · ') || null;
}

// The weapon's ammunition for the dice line, as players write it: N is never
// shown; Plasma instead of its N+N; Bioweapon (DA+SHOCK) as "DA Shock"; then
// Cont for Continuous Damage and Blast for an Impact Template (not ammo, but
// it changes the roll). "AP EXP", "DA Cont", "EXP Blast", "" for plain N.
export function ammoTag(row, mods) {
  if (!row) return '';
  const tags = [];
  if (isPlasma(row)) tags.push('Plasma');
  const bio = bioweaponProp(row)?.match(/\(([^)]+)\)/)?.[1];
  if (bio) tags.push(...bio.split('+').map(pretty));
  for (const a of ammoTypes(row, mods)) if (!tags.includes(pretty(a))) tags.push(pretty(a));
  if (hasContinuousDamage(row, mods)) tags.push('Cont');
  if (isImpactTemplate(row)) tags.push('Blast');
  return tags.length ? ` ${tags.join(' ')}` : '';
}
const SHORT = {EXP: 'EXP', DA: 'DA', AP: 'AP', T2: 'T2', SHOCK: 'Shock', STUN: 'Stun', PLASMA: 'Plasma'};
const pretty = (a) => SHORT[a.toUpperCase()] ?? a;

// The ammunition x fires with: the weapon's own first (N, EXP, AP+EXP,
// Plasma...), then what the trooper adds, one line each with its source
// (BS Attack (AP / T2 / Continuous Damage), the loadout's AP / T2 / Shock /
// Viral). A target's immunity strikes the line it cancels. Lines are text
// ('+' and a name), the total the ammo as players say it: "AP+CONT".
function ammoLines(x, y, s, inputs) {
  const t = other(s);
  const {row, mods} = x.weapon;
  const bs = bsAttackWeaponMods(x.traits);
  const added = [];
  // The chart's ammo, before the loadout and skills.
  let own = ammoTypes(row).map((a) => a.toUpperCase());
  if (mods.ammo && mods.ammo !== 'Viral') {
    own = own.filter((a) => a !== mods.ammo.toUpperCase());
    added.push(fromSource(line('+', pretty(mods.ammo), null), 'loadout'));
  }
  if (bs.t2 && own.includes('T2')) {
    own = own.filter((a) => a !== 'T2');
    added.push(line('+', 'T2', s));
  }
  if (mods.forceAP && !own.includes('AP')) {
    added.push(bs.ap ? line('+', 'AP', s) : fromSource(line('+', 'AP', null), 'loadout'));
  }
  const bio = mods.ammo === 'Viral' ? null : bioweaponProp(row)?.match(/\(([^)]+)\)/)?.[1];
  const base = [
    ...(isPlasma(row) ? ['Plasma'] : []),
    ...(bio ? bio.split('+').map(pretty) : []),
    ...own.map(pretty),
    ...((row.props ?? []).includes('Continuous Damage') ? ['CONT'] : []),
  ];
  if (mods.ammo === 'Viral') added.push(fromSource(line('+', 'Viral (DA+Shock)', null), 'loadout'));
  if (mods.cont && !(row.props ?? []).includes('Continuous Damage')) {
    added.push(bs.cont ? line('+', 'CONT', s) : fromSource(line('+', 'CONT', null), 'loadout'));
  }
  // Immunity (Continuous Damage): the Trait goes, the hit stays.
  const contImmune = y && hasContinuousDamage(row, mods) && hasImmunity(y.traits, 'Continuous Damage', row);
  const lines = [line('', base.join('+') || 'N', null), ...added].map((l) => (
    contImmune && /CONT/.test(l.label) ? {...l, struck: 'Immunity (Continuous Damage)'} : l));
  if (inputs[`ammo${s}`] === 'NONE') lines.push(line('', 'no effect: target immune', t));
  // N only counts when it's all there is: N with AP added is just "AP".
  const kept = lines.filter((l) => !l.struck && l.by !== t).map((l) => l.label);
  const named = kept.filter((k) => k !== 'N');
  const total = inputs[`ammo${s}`] === 'NONE' ? 'no effect' : (named.length ? named : kept).join('+');
  return {lines, total};
}

function sideLedger(x, y, s, rangeCm, inputs) {
  if (!x?.weapon) return null;
  const w = x.weapon;
  if (w.pseudo === 'none') return {kind: 'none', dice: 'No ARO'};
  if (w.pseudo === 'dodge') {
    const sv = dodgeSv(x, y, s, inputs[`successValue${s}`]);
    const sd = sdLines(x, s, inputs, true);
    return {kind: 'dodge', dice: `Dodge${sd.total ? ` +${sd.total}SD` : ''} SV${sv.total}`, sv, sd};
  }
  const burst = burstLines(x, s, inputs);
  const sd = sdLines(x, s, inputs, false);
  const save = saveLines(x, y, s, inputs);
  const b = `B${burst.total}${sd.total ? `+${sd.total}` : ''}`;
  const tag = ammoTag(w.row, w.mods);
  if (isTemplate(w.row)) {
    return {kind: 'template', dice: `${b} template PS${save.total}${tag}`, burst, sd, save, ammo: ammoLines(x, y, s, inputs), note: ammoNote(inputs, s)};
  }
  const sv = attackSv(x, y, s, rangeCm, inputs[`successValue${s}`]);
  return {kind: 'attack', dice: `${b} SV${sv.total} PS${save.total}${tag}`, burst, sd, sv, save, ammo: ammoLines(x, y, s, inputs), note: ammoNote(inputs, s)};
}

export function buildLedger({active, reactive, rangeCm, inputs}) {
  return {
    A: sideLedger(active, reactive, 'A', rangeCm, inputs),
    B: sideLedger(reactive, active, 'B', rangeCm, inputs),
  };
}
