// "How the dice were built": every number a matchup puts into the calculator,
// as a list of lines that add up to it, each naming the side that caused it.
//
// deriveInputs (matchup.js) decides the numbers; this file explains them with
// the same rule functions, then reconciles against the real inputs. If a rule
// changes there and not here, the gap shows as an "other rules" line instead of
// a wrong total, and the tests (ledger.test.mjs) fail.
//
// buildLedger({active, reactive, rangeCm, rangeCmB, inputs, zones}) -> {A, B}, per side:
//   kind    'attack' | 'dodge' | 'template' | 'none'
//   dice    'B4 SV14 PS9': burst (+special dice), Success Value, save value
//   burst, sv, save   {lines, total, note}; a line is
//                     {value, label, by: 'A' | 'B' | null, struck: reason?}
//   `by` is whose skill, weapon or position caused the line (the colour);
//   `struck` lines were cancelled and don't count.
//   save is the Saving Roll the OTHER side makes against this side's hits:
//   weapon PS + target ARM (or BTS), on d20 <= total.
import {isHackingProgram} from '../army/hacking.js';
import {SKILL} from '../army/ids.js';
import {upgradeRaising} from '../army/loadouts.js';
import {hasSkill} from '../army/traits.js';
import {
  ammoName, ammoTypes, attackAttribute, bioweaponParts, hasContinuousDamage, isCommsAttack, isImpactTemplate, isPlasma, isTemplate, needsLof,
  weaponPS,
} from '../army/weapons.js';
import {AMMO} from '../engine/calculate.js';
import {
  COVER_BS_MOD, COVER_SAVE_MOD, FIREWALL_SAVE_MOD, LIMITS, MOD_CAP, albedoMod, albedoValue, attackBonuses, attackStat, benefitsFromCover, capMods,
  bangbombMod, bangbombValue, cancelsBangbomb, coverBsMod, dodgeExtras, evades, fireteamBonuses, firewallOf, hasNanoscreen, ignoresCoverOnSaves,
  keepsAroBurst, mimetismMod, neurocineticsAroBurst, mimetismValue, msvName, opposingMods, programSvMods, reaches,
} from './modifiers.js';
import {RANGE_BANDS, bandFrom, rangeModFor} from './ranges.js';
import {hasImmunity, immunityAgainst, saveHalving} from './saves.js';
import {bsAttackWeaponMods, pseudoName} from './trooper.js';
import {ccAttackMods, ccAttackSkill, ccBurst, ccSd, isCcAttack} from './closeCombat.js';
import {visibility, zoneName} from './visibility.js';
import {tEn} from '../i18n/index.js';

const other = (s) => (s === 'A' ? 'B' : 'A');
const line = (value, label, by, struck) => ({value, label, by, ...(struck ? {struck} : {})});
// A line whose source isn't a side ("loadout"): shown as is in the source column.
const fromSource = (l, source) => ({...l, source});
const live = (lines) => lines.filter((l) => !l.struck && typeof l.value === 'number');
const sum = (lines) => live(lines).reduce((t, l) => t + l.value, 0);

// Adds an "other rules" line when the explanation doesn't reach the real total.
function reconcile(lines, total, t) {
  const gap = total - sum(lines);
  return gap === 0 ? lines : [...lines, line(gap, t('ledger.otherRules'), null)];
}

// The MODs y's skills put on x's roll (modifiers.js opposingMods), one line
// each; one x ignores is struck with the reason.
const opposingLines = (y, x, ySide, yActive, t) => opposingMods(y, x, yActive, t)
  .map((m) => line(m.value, m.label, ySide, m.ignoredBy));

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

function attackSv(x, y, s, rangeCm, total, vis, t) {
  const o = other(s);
  const {row, mods} = x.weapon;
  const attr = attackAttribute(row);
  const lines = [line(attackStat(x.profile, row), statLabel(x, attr, t), null)];
  // Fireteam +1 BS: none on a Hacking Program (attackBonuses).
  const ftBs = attackBonuses(x).bs;
  if (ftBs) lines.push(line(ftBs, t('ledger.fireteam', {size: x.ftSize}), s));
  const rangeMod = rangeModFor(row, rangeCm, x.traits);
  if (rangeMod === null) return {lines: [...lines, line('—', t('ledger.outOfRange'), s)], total, note: t('ledger.outOfRangeNote')};
  if (rangeMod) lines.push(line(rangeMod, rangeLabel(rangeCm, t), s));
  if (mods.sv) lines.push(line(mods.sv, t('ledger.loadout'), s));
  // A program's Attack MOD is x's, the target's ECM: Hacker the target's.
  for (const m of programSvMods(x, y, t)) lines.push(line(m.value, m.label, m.target ? other(s) : s));
  if (y) {
    // Mimetism, with what the attacker's MSV cancels shown struck. Mimetism
    // and Albedo need LoF: struck against a Jammer.
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
    // Smoke / White Noise: x's own sight, so x's colour.
    for (const v of vis.lines) lines.push(line(v.value, v.label, s, v.ignoredBy));
    lines.push(...opposingLines(y, x, o, o === 'A', t));
  }
  // Every line after the Attribute is a MOD, Fireteam +1 BS included.
  capLine(lines, t);
  clampSv(lines, t);
  return {lines: reconcile(lines, total, t), total};
}

// The cover y sits in, by name: its Foxhole, cover, or its Nanoscreen.
const coverLabel = (y, t) => (benefitsFromCover(y) ? (y.sapper ? t('ledger.foxholeCover') : t('ledger.cover')) : t('equip.nanoscreen'));

// MODs over the cap (every line after the Attribute is a MOD): a line takes
// the excess off.
function capLine(lines, t) {
  const modSum = sum(live(lines).slice(1));
  const capped = capMods(modSum);
  if (capped !== modSum) lines.push(line(capped - modSum, t('ledger.modCap', {cap: MOD_CAP[1]}), null));
}

// The Success Value stays within LIMITS: below 0 is 0 (the roll always fails
// and can't crit), above the top it is capped.
function clampSv(lines, t) {
  const [min, max] = LIMITS.successValue;
  const total = sum(lines);
  if (total < min) lines.push(line(min - total, t('ledger.belowZero'), null));
  else if (total > max) lines.push(line(max - total, t('ledger.cappedAt', {max}), null));
}

function dodgeSv(x, y, s, total, yBlocked, t) {
  const o = other(s);
  const d = dodgeExtras(x.traits);
  const lines = [d.ph !== null ? line(d.ph, t('ledger.dodgePh', {ph: d.ph}), s) : line(x.profile.ph ?? 0, statLabel(x, 'ph', t), null)];
  if (d.mod) lines.push(line(d.mod, t('skill.dodgeMod', {mod: `+${d.mod}`}), s));
  const ft = fireteamBonuses(x.ftSize).dodge;
  if (ft) lines.push(line(ft, t('ledger.fireteam', {size: x.ftSize}), s));
  const bang = yBlocked ? 0 : bangbombMod(x, y?.weapon);
  if (bang) lines.push(line(bang, t('equip.bangbombMod', {mod: `+${bang}`}), s));
  else if (x.weapon.bangbomb && !yBlocked && y?.weapon?.row && cancelsBangbomb(y.weapon.row)) {
    const v = bangbombValue(x.traits);
    lines.push(line(v, t('equip.bangbombMod', {mod: `+${v}`}), s, t('ledger.templateWeapon')));
  }
  if (y && !yBlocked) lines.push(...opposingLines(y, x, o, o === 'A', t));
  clampSv(lines, t);
  return {lines: reconcile(lines, total, t), total};
}

// A Reset's Success Value: WIP, with the attacker's MODs on it.
function resetSv(x, y, s, total, t) {
  const o = other(s);
  const lines = [line(x.profile.wip ?? 0, statLabel(x, 'wip', t), null)];
  if (y) lines.push(...opposingLines(y, x, o, o === 'A', t));
  clampSv(lines, t);
  return {lines: reconcile(lines, total, t), total};
}

// A CC Attack's Success Value: CC, its own MODs, the opponent's
// (closeCombat.js). No range, cover, Mimetism or Smoke.
function ccSv(x, y, s, total, t) {
  const o = other(s);
  const lines = [line(attackStat(x.profile, x.weapon.row), statLabel(x, 'cc', t), null)];
  for (const m of ccAttackMods(x, s === 'A', t)) lines.push(line(m.value, m.label, s));
  if (y) lines.push(...opposingLines(y, x, o, o === 'A', t));
  capLine(lines, t);
  clampSv(lines, t);
  return {lines: reconcile(lines, total, t), total};
}

// One line per closeCombat.js line: the weapon's B is the weapon's, ARO is
// the rules', the rest are x's.
const ccLines = (lines, s) => lines.map((l, i) => line(l.value, l.label, i === 0 || l.aro ? null : s));

function burstLines(x, y, s, inputs, t) {
  if (isCcAttack(x)) {
    const total = inputs[`burst${s}`];
    const lines = ccLines(ccBurst(x, s === 'A', y, t), s);
    // B over the cap (LIMITS.burst): the rest is lost.
    const over = sum(lines) - total;
    if (over > 0) lines.push(line(-over, t('ledger.burstCap', {max: LIMITS.burst[1]}), null));
    return {lines: reconcile(lines, total, t), total};
  }
  const row = x.weapon.row;
  const total = inputs[`burst${s}`];
  // Neurocinetics is for BS Attacks, not programs (matchup.js attackInputs).
  const neuroApplies = !isHackingProgram(row);
  if (s === 'A' && neuroApplies && hasSkill(x.traits, SKILL.NEUROCINETICS)) {
    return {lines: reconcile([line(1, t('skill.neurocinetics'), s)], total, t), total};
  }
  const lines = [line(row.burst ?? 1, x.weapon.name ?? row.name, null)];
  const b = attackBonuses(x);
  if (b.burst) lines.push(line(b.burst, t('ledger.loadoutOrBsAttack'), s));
  const neuro = s === 'B' && neuroApplies ? neurocineticsAroBurst(x.traits) : 0;
  if (neuro) lines.push(line(neuro, t('skill.neurocinetics'), s));
  // In ARO a trooper rolls one die, whatever its burst (Total Reaction aside).
  if (s === 'B' && !keepsAroBurst(x) && sum(lines) !== 1) lines.push(line(1 - sum(lines), t('ledger.aroOneDie'), null));
  return {lines: reconcile(lines, total, t), total};
}

function sdLines(x, s, inputs, dodge, t) {
  const total = inputs[`bonusBurst${s}`] ?? 0;
  const lines = [];
  if (isCcAttack(x)) {
    lines.push(...ccSd(x, t).map((l) => line(l.value, l.label, s)));
  } else if (dodge) {
    const sd = dodgeExtras(x.traits).sd;
    if (sd) lines.push(line(sd, t('ledger.dodgeSd'), s));
  } else {
    const ft = isHackingProgram(x.weapon.row) ? 0 : fireteamBonuses(x.ftSize).sd;
    const own = attackBonuses(x).sd - ft;
    if (own) lines.push(line(own, t('ledger.loadoutOrBsAttack'), s));
    if (ft) lines.push(line(ft, t('ledger.fireteam', {size: x.ftSize}), s));
  }
  return {lines: reconcile(lines, total, t), total};
}

// The Saving Roll the target y makes against x's hits (matchup.js defenseInputs).
function saveLines(x, y, s, inputs, t) {
  const o = other(s);
  const total = inputs[`damage${s}`] + inputs[`arm${o}`];
  const {row, mods} = x.weapon;
  // The weapon's own PS, then BS Attack (SR-1 / SR-2) as its own line: it is
  // the attacker's skill, not the weapon's (MULTI HMG 5, then -1).
  const lines = [line(weaponPS(row, {...mods, psMod: 0}), t('abbr.PS'), null)];
  // On a program it is the program's upgrade (Trinity (SR-1)).
  const sr = `${t('abbr.SR')}${mods?.psMod}`;
  if (mods?.psMod) {
    lines.push(line(mods.psMod, isHackingProgram(row) ? t('ledger.programMod', {program: row.name, mod: sr}) : t('skill.bsAttackMod', {mod: sr}), s));
  }
  if (!y) return {lines: reconcile(lines, total, t), total};
  const save = row.save ?? {attr: 'ARM'};
  const immune = Boolean(immunityAgainst(y.traits, row));
  const attr = save.attr === 'BTS' || save.attr === 'PH' ? save.attr : 'ARM';
  const p = y.profile;
  const dodging = y.weapon?.pseudo === 'dodge';
  let base = attr === 'BTS' ? p.bts ?? 0 : attr === 'PH' ? p.ph ?? 0 : (p.arm ?? 0);
  if (attr === 'PH') {
    // PARA: the target rolls PH at the weapon's MOD, no PS.
    lines.push(line(base, statLabel(y, 'PH', t), o));
    if (save.mod) lines.push(line(save.mod, row.name, s));
  } else if (attr === 'ARM' && save.armZero && !immune) {
    lines.push(line(base, statLabel(y, 'ARM', t), o, t('ledger.armZeroBy', {weapon: row.name})));
    base = 0;
  } else {
    lines.push(line(base, statLabel(y, attr, t), o));
  }
  // ARM = 0 wins over the Dodge's extra ARM (Alex, 2026-10-10).
  if (attr === 'ARM' && dodging && dodgeExtras(y.traits).arm) {
    const extra = dodgeExtras(y.traits).arm;
    if (save.armZero && !immune) lines.push(line(extra, t('ledger.dodgeArm', {extra}), o, t('ledger.armZero')));
    else {
      lines.push(line(extra, t('ledger.dodgeArm', {extra}), o));
      base += extra;
    }
  }
  const h = saveHalving(row, mods, y.traits);
  if (!immune && (h.other || h.ap)) {
    const halved = Math.ceil(base / 2);
    // Halving 0 or 1 changes nothing: no line.
    if (halved !== base) {
      const stat = t(`stat.${attr.toLowerCase()}`);
      lines.push(line(halved - base, t(h.ap ? 'ledger.halvedAp' : 'ledger.halved', {stat}), s,
        h.halves ? null : t('skill.immunity', {what: 'AP'})));
    }
  }
  const comms = isCommsAttack(row);
  if (comms && firewallOf(y)) lines.push(line(FIREWALL_SAVE_MOD, t('equip.firewall'), o));
  if (benefitsFromCover(y) || hasNanoscreen(y)) {
    const name = coverLabel(y, t);
    if (isCcAttack(x)) lines.push(line(COVER_SAVE_MOD, name, o, t('ledger.closeCombat')));
    else if (comms) lines.push(line(COVER_SAVE_MOD, name, o, t('ledger.commsAttack')));
    else if (ignoresCoverOnSaves(row) && !hasNanoscreen(y)) lines.push(line(COVER_SAVE_MOD, name, o, t('ledger.template')));
    else lines.push(line(COVER_SAVE_MOD, name, o));
  }
  return {lines: reconcile(lines, total, t), total};
}

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

function sideLedger(x, y, s, rangeCm, inputs, vis, t) {
  if (!x?.weapon) return null;
  const w = x.weapon;
  if (w.pseudo === 'none') return {kind: 'none', dice: t('pseudo.none')};
  if (vis[s].blocked) return {kind: 'none', dice: t('ledger.noLofZone', {zone: zoneName(vis[s].blocked, t)})};
  // A Dodge can't evade a Comms Attack, a Reset evades nothing else.
  const incoming = vis[other(s)].blocked ? null : y?.weapon;
  if (w.pseudo && !evades(x, incoming)) {
    const reason = w.pseudo === 'reset' ? t('ledger.resetOnlyComms') : t('ledger.dodgeNotComms');
    return {kind: 'none', dice: t('ledger.notRolled', {choice: pseudoName(w, t)}), reason};
  }
  if (w.pseudo === 'reset') {
    // Zero Pain rolls two dice.
    const sv = resetSv(x, y, s, inputs[`successValue${s}`], t);
    const burst = inputs[`burst${s}`] > 1 ? ` ${t('abbr.B')}${inputs[`burst${s}`]}` : '';
    return {kind: 'reset', dice: `${pseudoName(w, t)}${burst} ${svText(sv.total, t)}`, sv};
  }
  // A program its target isn't a valid target for: nothing is rolled.
  if (y && !reaches(x, y)) {
    return {kind: 'none', dice: t('ledger.notRolled', {choice: w.row.name}), reason: t('ledger.cantTarget', {program: w.row.name})};
  }
  if (w.pseudo === 'dodge') {
    const sv = dodgeSv(x, y, s, inputs[`successValue${s}`], Boolean(vis[other(s)].blocked), t);
    const sd = sdLines(x, s, inputs, true, t);
    return {kind: 'dodge', dice: `${t('pseudo.dodge')}${sd.total ? ` +${sd.total}${t('abbr.SD')}` : ''} ${svText(sv.total, t)}`, sv, sd};
  }
  const burst = burstLines(x, y, s, inputs, t);
  const sd = sdLines(x, s, inputs, false, t);
  const save = saveLines(x, y, s, inputs, t);
  const b = burstText(burst.total, sd.total, t);
  const tag = ammoTag(w.row, w.mods, t);
  const ammo = ammoLines(x, y, s, inputs, t);
  const note = ammoNote(inputs, s, t);
  if (isCcAttack(x)) {
    const sv = ccSv(x, y, s, inputs[`successValue${s}`], t);
    // PARA's save is the target's PH roll, not PS + ARM.
    const saveTag = w.row.save?.attr === 'PH' ? t('stat.ph') : t('abbr.PS');
    return {kind: 'attack', dice: `${t('abbr.CC')} ${b} ${svText(sv.total, t)} ${saveTag}${save.total}${tag}`, burst, sd, sv, save, ammo, note};
  }
  if (isTemplate(w.row)) {
    return {kind: 'template', dice: `${b} ${t('ledger.template')} ${t('abbr.PS')}${save.total}${tag}`, burst, sd, save, ammo, note};
  }
  const sv = attackSv(x, y, s, rangeCm, inputs[`successValue${s}`], vis[s], t);
  return {kind: 'attack', dice: `${b} ${svText(sv.total, t)} ${t('abbr.PS')}${save.total}${tag}`, burst, sd, sv, save, ammo, note};
}

// rangeCmB: the reactive's own distance when the range is split (deriveInputs).
// t: the language of the labels (src/i18n).
export function buildLedger({active, reactive, rangeCm, rangeCmB, inputs, zones, t = tEn}) {
  const vis = visibility(active, reactive, zones, t);
  return {
    A: sideLedger(active, reactive, 'A', rangeCm, inputs, vis, t),
    B: sideLedger(reactive, active, 'B', rangeCmB ?? rangeCm, inputs, vis, t),
  };
}
