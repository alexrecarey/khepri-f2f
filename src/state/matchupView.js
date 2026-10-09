// Everything the matchup screens show that isn't in the state document,
// derived from its matchup slice and the army data: each side's trooper and
// weapon list, the calculator inputs, and "How the dice were built".
// Pure; useMatchupView.js memoises it for React.
import {woundStates} from '../rules/woundStates.js';
import {fullParams} from '../engine/params.js';
import {defaultWeapon} from '../rules/defaultWeapon.js';
import {buildLedger} from '../rules/ledger.js';
import {deriveInputs} from '../rules/matchup.js';
import {fireteamBonuses} from '../rules/modifiers.js';
import {pseudoWeapons, resolveSelection, trooperWeapons} from '../rules/trooper.js';
import {rootFaction} from '../search/buildIndex.js';

export const ROLE = {A: 'active', B: 'reactive'};

export const vanillaOf = (army, factionId) => (factionId == null || !army ? null : rootFaction(army.factions, factionId));

// The weapon a side rolls with: its own pick, else the default for its role.
export function effectiveWeaponKey(army, sel, side) {
  if (sel.weaponKey) return sel.weaponKey;
  const r = resolveSelection(army, sel);
  if (!r?.option || !r.profile) return null;
  const weapons = trooperWeapons(r.option, army.weapons, r.traits);
  return defaultWeapon(weapons, ROLE[side])?.key ?? 'dodge';
}

function sideView(army, sel, side) {
  const effective = {...sel, weaponKey: effectiveWeaponKey(army, sel, side)};
  const resolved = resolveSelection(army, effective);
  const weapons = resolved?.option ? trooperWeapons(resolved.option, army.weapons, resolved.traits) : [];
  const pseudo = resolved?.profile
    ? pseudoWeapons(resolved.profile, resolved.traits, side, fireteamBonuses(sel.ftSize).dodge)
    : [];
  return {sel: effective, resolved, weapons, pseudo};
}

const shortName = (unit) => unit.isc.split(',')[0].trim();

export function matchupView(army, matchup) {
  if (!army) {
    return {ready: false, rangeCm: matchup.rangeCm, A: {sel: matchup.A, resolved: null, weapons: [], pseudo: []},
      B: {sel: matchup.B, resolved: null, weapons: [], pseudo: []}, derived: null, params: null, ledger: null,
      hasSelection: Boolean(matchup.A.unitId || matchup.B.unitId), complete: false, targets: null};
  }
  const A = sideView(army, matchup.A, 'A');
  const B = sideView(army, matchup.B, 'B');
  const derived = deriveInputs({active: A.resolved, reactive: B.resolved, rangeCm: matchup.rangeCm});
  const hasSelection = Boolean(matchup.A.unitId || matchup.B.unitId);
  // Both sides fully chosen (unit through weapon) and the matchup is valid.
  const complete = Boolean(A.resolved?.weapon && B.resolved?.weapon && derived?.ok);
  const params = derived?.ok ? fullParams(derived.inputs) : null;
  const ledger = complete ? {
    ledger: buildLedger({active: A.resolved, reactive: B.resolved, rangeCm: matchup.rangeCm, inputs: params}),
    names: {A: shortName(A.resolved.unit), B: shortName(B.resolved.unit)},
    weapons: {A: A.resolved.weapon?.name, B: B.resolved.weapon?.name},
    notes: [...derived.warnings, ...derived.notes],
  } : null;
  // The states each side's hits push its target through. The active side's
  // results are what it does to the reactive trooper, so they follow B's
  // states (and the other way round).
  const statesOf = (target, shock) => (target?.profile ? woundStates(target.profile, target.traits, {shock}) : null);
  const targets = complete ? {active: statesOf(B.resolved, params.shockA), reactive: statesOf(A.resolved, params.shockB)} : null;
  return {ready: true, A, B, rangeCm: matchup.rangeCm, derived, params, ledger, hasSelection, complete, targets};
}
