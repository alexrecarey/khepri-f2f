// Everything the matchup screens show that isn't in the state document,
// derived from its matchup slice and the army data: each side's trooper and
// weapon list, the calculator inputs, and "How the dice were built".
// Pure; useMatchupView.js memoises it for React.
import {SKILL} from '../army/ids.js';
import {extraLoadoutName, shortIsc} from '../army/names.js';
import {hasSkill} from '../army/traits.js';
import {isTemplate} from '../army/weapons.js';
import {fullParams} from '../engine/params.js';
import {defaultWeapon, sortWeapons} from '../rules/defaultWeapon.js';
import {buildLedger} from '../rules/ledger.js';
import {deriveInputs} from '../rules/matchup.js';
import {surpriseAttackMod} from '../rules/modifiers.js';
import {RANGE_BANDS, rangeModFor} from '../rules/ranges.js';
import {visibility} from '../rules/visibility.js';
import {ccAlliesMax, isCcAttack} from '../rules/closeCombat.js';
import {pseudoWeapons, resolveSelection, trooperCcWeapons, trooperWeapons} from '../rules/trooper.js';
import {modeLabels, orderModes} from '../rules/weaponModes.js';
import {woundStates} from '../rules/woundStates.js';
import {rootFaction} from '../search/buildIndex.js';
import {ROLE} from './schema.js';
import {crestOf} from '../army/crests.js';

export const vanillaOf = (army, factionId) => (factionId == null || !army ? null : rootFaction(army.factions, factionId));

// The weapon a side rolls with: its own pick, else the default for its role.
export function effectiveWeaponKey(army, sel, side) {
  if (sel.weaponKey) return sel.weaponKey;
  const r = resolveSelection(army, sel);
  if (!r?.option || !r.profile) return null;
  const weapons = trooperWeapons(r.option, army.weapons, r.traits);
  return defaultWeapon(weapons, ROLE[side])?.key ?? 'dodge';
}

// Weapon buttons in list order, a weapon's fire modes gathered into one group
// and put in their order for the side's role:
//   [{key, id, name, w, modes?, labels?}]  modes / labels only for a weapon
//   with several fire modes (labels: modeLabels).
function weaponGroups(list, role) {
  const groups = [];
  for (const w of list) {
    const prev = groups.at(-1);
    if (w.mode && !w.pseudo && prev?.id === w.id && prev.name === w.name) {
      prev.modes ??= [prev.w];
      prev.modes.push(w);
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
// range bands (nothing picked, Dodge, No ARO, Direct Template, CC Attack).
function bandMod(resolved, to) {
  const row = resolved?.weapon?.row;
  if (!row || isTemplate(row) || isCcAttack(resolved)) return undefined;
  return rangeModFor(row, to, resolved.traits);
}

// What a side card shows besides the selection: weapon buttons, which chips
// apply, the trooper's names.
function sideView(army, sel, side) {
  const effective = {...sel, weaponKey: effectiveWeaponKey(army, sel, side)};
  const resolved = resolveSelection(army, effective);
  const weapons = resolved?.option ? trooperWeapons(resolved.option, army.weapons, resolved.traits) : [];
  const cc = resolved?.option ? trooperCcWeapons(resolved.option, army.weapons, resolved.traits) : [];
  const pseudo = resolved?.profile
    ? pseudoWeapons(resolved.traits, side)
    : [];
  const unit = resolved?.unit;
  return {
    sel: effective, resolved, weapons, pseudo,
    groups: weaponGroups([...weapons, ...pseudo], ROLE[side]),
    // Close combat weapons, a row of their own.
    ccGroups: weaponGroups(cc, ROLE[side]),
    // No Cover: cover does nothing for it, so no Cover chip.
    noCover: hasSkill(resolved?.traits, SKILL.NO_COVER),
    // Surprise Attack's MOD, offered only on the active side.
    surprise: side === 'A' ? surpriseAttackMod(resolved?.traits) : 0,
    faction: unit ? army.factions[vanillaOf(army, resolved.factionId)]?.name ?? null : null,
    // The vanilla faction id (its crest stands in for a missing unit crest)
    // and the unit crest's slug (src/army/crests.js).
    vanilla: unit ? vanillaOf(army, resolved.factionId) : null,
    crest: unit ? crestOf(unit, resolved.profile) : null,
    short: unit ? shortIsc(unit.isc) : null,
    loadout: unit ? extraLoadoutName(resolved.option?.name, unit.isc) : null,
  };
}

const EMPTY_VIEW_SIDE = (sel) => ({sel, resolved: null, weapons: [], pseudo: [], groups: [], ccGroups: [], cc: false, ccAlliesMax: 0, noCover: false, surprise: 0,
  faction: null, vanilla: null, crest: null, short: null, loadout: null});


// The reactive's own distance, or null while both share rangeCm.
const rangeCmB = (matchup) => matchup.rangeCmB ?? null;

export function matchupView(army, matchup) {
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
    x.ccAlliesMax = x.cc ? ccAlliesMax(y.resolved) : 0;
  }
  const derived = deriveInputs({active: A.resolved, reactive: B.resolved, rangeCm: matchup.rangeCm, rangeCmB: rangeCmB(matchup), zones});
  const hasSelection = Boolean(matchup.A.unitId || matchup.B.unitId);
  // Both sides fully chosen (unit through weapon) and the matchup is valid.
  const complete = Boolean(A.resolved?.weapon && B.resolved?.weapon && derived?.ok);
  const params = derived?.ok ? fullParams(derived.inputs) : null;
  const ledger = complete ? {
    ledger: buildLedger({active: A.resolved, reactive: B.resolved, rangeCm: matchup.rangeCm, rangeCmB: rangeCmB(matchup), inputs: params, zones}),
    names: {A: shortIsc(A.resolved.unit.isc), B: shortIsc(B.resolved.unit.isc)},
    weapons: {A: A.resolved.weapon?.name, B: B.resolved.weapon?.name},
    notes: [...derived.warnings, ...derived.notes],
  } : null;
  // The states each side's hits push its target through. The active side's
  // results are what it does to the reactive trooper, so they follow B's
  // states (and the other way round).
  const statesOf = (target, shock) => (target?.profile ? woundStates(target.profile, target.traits, {shock}) : null);
  const targets = complete ? {active: statesOf(B.resolved, params.shockA), reactive: statesOf(A.resolved, params.shockB)} : null;
  // Each band's Range MOD per side, for the range selector's stripes.
  const bands = RANGE_BANDS.map((b) => ({to: b.to, A: bandMod(A.resolved, b.to), B: bandMod(B.resolved, b.to)}));
  // What Smoke / White Noise do to each side, for the range selector.
  const vis = visibility(A.resolved, B.resolved, zones);
  // Both in close combat: the distance plays no part.
  const rangeUnused = isCcAttack(A.resolved) && isCcAttack(B.resolved);
  return {ready: true, rangeUnused, A, B, rangeCm: matchup.rangeCm, rangeCmB: rangeCmB(matchup), zones, vis, derived, params, ledger, bands, hasSelection, complete, targets};
}
