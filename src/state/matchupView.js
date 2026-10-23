// Everything the matchup screens show that isn't in the state document,
// derived from its matchup slice and the army data: each side's trooper and
// weapon list, the calculator inputs, and "How the dice were built".
// Pure, in two passes so a language change re-derives nothing:
// matchupCore(army, matchup) applies the rules (its text is message
// descriptors, i18n/message.js); renderMatchup(core, t) puts it in the
// player's language. matchupView composes them; useMatchupView.js memoises
// each pass for React.
import {SKILL} from '../army/ids.js';
import {extraLoadoutName, shortIsc, unitTag} from '../army/names.js';
import {hasSkill} from '../army/traits.js';
import {trooperPrograms} from '../army/hacking.js';
import {isCommsAttack, isPseudo, stateCaused} from '../army/weapons.js';
import {fullParams} from '../engine/params.js';
import {defaultWeapon, sortWeapons} from '../rules/defaultWeapon.js';
import {buildLedger, renderDerived} from '../rules/ledger.js';
import {deriveInputs} from '../rules/matchup.js';
import {fireteamHelps, surpriseAttackMod, targetedHelps} from '../rules/modifiers.js';
import {RANGE_BANDS, rangeModFor} from '../rules/ranges.js';
import {visibility} from '../rules/visibility.js';
import {berserkMod, ccAlliesMax, hasBerserk, isCcAttack} from '../rules/closeCombat.js';
import {pseudoWeapons, resolveSelection, trooperCcWeapons, trooperWeapons} from '../rules/trooper.js';
import {modeLabels, orderModes} from '../rules/weaponModes.js';
import {woundStates} from '../rules/woundStates.js';
import {ROLE} from './schema.js';
import {crestOf} from '../army/crests.js';
import {vanillaOf} from '../army/factions.js';
import {tEn} from '../i18n/index.js';
import {render} from '../i18n/message.js';

// The weapon a side rolls with: its own pick, else the default for its role.
export function effectiveWeaponKey(army, sel, side) {
  if (sel.weaponKey) return sel.weaponKey;
  const r = resolveSelection(army, sel);
  if (!r?.option || !r.profile) return null;
  const weapons = trooperWeapons(r.option, army.weapons, r.traits);
  return defaultWeapon(weapons, ROLE[side])?.key ?? 'dodge';
}

// Weapon buttons in list order, a weapon's fire modes gathered into one group
// (a CC Mode joins its weapon's BS Mode: Vorpal, Kobra Pistol) and put in
// their order for the side's role:
//   [{key, id, name, w, modes?, labels?}]  modes / labels only for a weapon
//   with several fire modes (labels: modeLabels, descriptors until rendered).
function weaponGroups(list, role) {
  const groups = [];
  for (const w of list) {
    const same = w.mode && !isPseudo(w) ? groups.find((g) => g.id === w.id && g.name === w.name) : null;
    if (same) {
      same.modes ??= [same.w];
      same.modes.push(w);
    } else {
      groups.push({key: w.key, id: w.id, name: w.name, w});
    }
  }
  for (const g of groups) {
    if (!g.modes) continue;
    g.modes = orderModes(g.modes, role, sortWeapons);
    g.labels = modeLabels(g.modes);
  }
  return groups;
}

// A side's Range MOD at a band: null out of range, undefined when it has no
// range bands (nothing picked, Dodge, No ARO, Direct Template, CC Attack,
// Hacking Program).
function bandMod(resolved, to) {
  const w = resolved?.weapon;
  if (w?.kind !== 'bs') return undefined;
  return rangeModFor(w.row, to, resolved.traits);
}

// What a side card shows besides the selection: weapon buttons, which chips
// apply, the trooper's names. Language-free: renderMatchup words the mode
// labels and the Team-Ops options.
function sideView(army, sel, side) {
  const effective = {...sel, weaponKey: effectiveWeaponKey(army, sel, side)};
  const resolved = resolveSelection(army, effective);
  const weapons = resolved?.option ? trooperWeapons(resolved.option, army.weapons, resolved.traits) : [];
  const ccWeapons = resolved?.option ? trooperCcWeapons(resolved.option, army.weapons, resolved.traits) : [];
  const programs = resolved?.option ? trooperPrograms(resolved.traits, army.lang) : [];
  const pseudo = resolved?.profile
    ? pseudoWeapons(resolved.traits, side)
    : [];
  const unit = resolved?.unit;
  return {
    sel: effective, resolved, weapons, ccWeapons, programs, pseudo,
    // CC weapons and Hacking Programs are weapons like any other, after the BS ones.
    groups: weaponGroups([...weapons, ...ccWeapons, ...programs, ...pseudo], ROLE[side]),
    // No Cover: cover does nothing for it, so no Cover chip.
    noCover: hasSkill(resolved?.traits, SKILL.NO_COVER),
    // Situation chips that follow the pick: Hacked for a Reset, IMM-A for a
    // Dodge (Targeted follows both sides' picks: matchupView).
    // Fireteam, only while the pick gets a bonus from it.
    fireteamChip: fireteamHelps(resolved),
    hackedChip: resolved?.weapon?.kind === 'reset',
    immAChip: resolved?.weapon?.kind === 'dodge',
    // Surprise Attack's MOD, offered only on the active side.
    surprise: side === 'A' ? surpriseAttackMod(resolved?.traits) : 0,
    // Berserk's MOD, offered only on the active side (a Long Skill) while it
    // has a CC weapon picked; null otherwise.
    berserk: side === 'A' && isCcAttack(resolved) && hasBerserk(resolved.traits) ? {mod: berserkMod(resolved.traits)} : null,
    // Team-Ops: the chart and TacBall options, by label (the Army's, in
    // inches: renderMatchup puts them in the language's unit), for their chips.
    teamOps: resolved?.teamOps
      ? {chart: (unit.upgrades.chart ?? []).map((u) => u.label), ball: (unit.upgrades.ball ?? []).map((u) => u.label)}
      : null,
    faction: unit ? army.factions[vanillaOf(army, resolved.factionId)]?.name ?? null : null,
    // The vanilla faction id (its crest stands in for a missing unit crest)
    // and the unit crest's slug (src/army/crests.js).
    vanilla: unit ? vanillaOf(army, resolved.factionId) : null,
    crest: unit ? crestOf(unit, resolved.profile) : null,
    short: unit ? shortIsc(unit.isc) : null,
    loadout: unit ? extraLoadoutName(resolved.option?.name, unit.isc) : null,
  };
}

const EMPTY_VIEW_SIDE = (sel) => ({sel, resolved: null, weapons: [], ccWeapons: [], programs: [], pseudo: [], groups: [], cc: false, ccAlliesMax: 0, noCover: false,
  hacked: false, fireteamChip: false, targetedChip: false, hackedChip: false, immAChip: false, surprise: 0, berserk: null, teamOps: null,
  faction: null, vanilla: null, crest: null, short: null, loadout: null});


// The reactive's own distance, or null while both share rangeCm.
const rangeCmB = (matchup) => matchup.rangeCmB ?? null;

// The rules applied to the matchup, with no language in it: what
// renderMatchup words. Memoised on (army, matchup) alone (useMatchupView.js).
export function matchupCore(army, matchup) {
  const zones = {smoke: Boolean(matchup.smoke), whiteNoise: Boolean(matchup.whiteNoise)};
  if (!army) {
    return {ready: false, rangeCm: matchup.rangeCm, rangeCmB: rangeCmB(matchup), zones, A: EMPTY_VIEW_SIDE(matchup.A), B: EMPTY_VIEW_SIDE(matchup.B),
      derived: null, params: null, ledger: null, bands: RANGE_BANDS.map((b) => ({to: b.to})),
      hasSelection: Boolean(matchup.A.unitId || matchup.B.unitId), complete: false, targets: null};
  }
  const A = sideView(army, matchup.A, 'A');
  const B = sideView(army, matchup.B, 'B');
  // A side CC attacking may count allies in contact, as many as fit around
  // the other side's base.
  for (const [x, y] of [[A, B], [B, A]]) {
    x.cc = isCcAttack(x.resolved);
    // Targeted: while the other side's shot or program gains from it, or this
    // side Resets (-3 to it).
    x.targetedChip = targetedHelps(y.resolved) || (x.resolved?.weapon?.kind === 'reset' && !x.resolved.weapon.zeroPain);
    x.ccAlliesMax = x.cc ? ccAlliesMax(y.resolved) : 0;
    // Reset and Zero Pain are buttons only against a Comms Attack (or once picked).
    x.hacked = isCommsAttack(y.resolved?.weapon?.row);
    const shown = (w) => w.kind !== 'reset' || x.hacked || x.sel.weaponKey === w.key;
    x.pseudo = x.pseudo.filter(shown);
    x.groups = x.groups.filter((g) => shown(g.w));
  }
  const derived = deriveInputs({active: A.resolved, reactive: B.resolved, rangeCm: matchup.rangeCm, rangeCmB: rangeCmB(matchup), zones});
  const hasSelection = Boolean(matchup.A.unitId || matchup.B.unitId);
  // Both sides fully chosen (unit through weapon) and the matchup is valid.
  const complete = Boolean(A.resolved?.weapon && B.resolved?.weapon && derived?.ok);
  const params = derived?.ok ? fullParams(derived.inputs) : null;
  // "How the dice were built", but for the ledger itself and the notes,
  // which renderMatchup adds in the player's language.
  const ledger = complete ? {
    names: {A: shortIsc(A.resolved.unit.isc), B: shortIsc(B.resolved.unit.isc)},
    tags: {A: unitTag(A.resolved.unit, A.resolved.option), B: unitTag(B.resolved.unit, B.resolved.option)},
    // As the side cards name them: "Squalos Mk-II · CRABBOT" for a Peripheral.
    labels: {A: [A.short, A.loadout].filter(Boolean).join(' · '), B: [B.short, B.loadout].filter(Boolean).join(' · ')},
    weapons: {A: A.resolved.weapon?.name, B: B.resolved.weapon?.name},
  } : null;
  // The states each side's hits push its target through. The active side's
  // results are what it does to the reactive trooper, so they follow B's
  // states (and the other way round).
  // A Jammer's failed save is Isolated, a Flash Pulse's Stunned, not a wound.
  const statesOf = (target, shock, attacker) => (target?.profile
    ? woundStates(target.profile, target.traits, {shock, state: stateCaused(attacker?.weapon?.row)}) : null);
  const targets = complete
    ? {active: statesOf(B.resolved, params.shockA, A.resolved), reactive: statesOf(A.resolved, params.shockB, B.resolved)} : null;
  // Each band's Range MOD per side, for the range selector's stripes.
  const bands = RANGE_BANDS.map((b) => ({to: b.to, A: bandMod(A.resolved, b.to), B: bandMod(B.resolved, b.to)}));
  // What Smoke / White Noise do to each side, for the range selector.
  const vis = visibility(A.resolved, B.resolved, zones);
  // Both in close combat: the distance plays no part.
  const rangeUnused = isCcAttack(A.resolved) && isCcAttack(B.resolved);
  return {ready: true, rangeUnused, A, B, rangeCm: matchup.rangeCm, rangeCmB: rangeCmB(matchup), zones, vis, derived, params, ledger, bands, hasSelection, complete, targets};
}

// The core in t's language: every descriptor rendered (notes, ledger lines,
// zone lines, wound states, mode labels), the Team-Ops labels in its unit.
// t: the player's translator (src/i18n), with the army's terms.
export function renderMatchup(core, t = tEn) {
  if (!core.ready) return core;
  const say = (m) => render(t, m);
  const side = (x) => ({
    ...x,
    groups: x.groups.map((g) => (g.labels ? {...g, labels: new Map([...g.labels].map(([k, m]) => [k, say(m)]))} : g)),
    teamOps: x.teamOps && {chart: x.teamOps.chart.map(t.inchText), ball: x.teamOps.ball.map(t.inchText)},
  });
  const A = side(core.A);
  const B = side(core.B);
  const derived = renderDerived(core.derived, t);
  const ledger = core.ledger && {
    ledger: buildLedger({active: A.resolved, reactive: B.resolved, derived, t}),
    ...core.ledger,
    notes: [...derived.warnings, ...derived.notes],
  };
  const zoneLines = (v) => ({...v, lines: v.lines.map((l) => ({...l, label: say(l.label), ignoredBy: say(l.ignoredBy)}))});
  const vis = {A: zoneLines(core.vis.A), B: zoneLines(core.vis.B)};
  const states = (list) => list && list.map((s) => ({...s, label: say(s.label)}));
  const targets = core.targets && {active: states(core.targets.active), reactive: states(core.targets.reactive)};
  return {...core, A, B, derived, ledger, vis, targets};
}

// t: the language of every label and note (src/i18n), with the army's terms.
export const matchupView = (army, matchup, t = tEn) => renderMatchup(matchupCore(army, matchup), t);
