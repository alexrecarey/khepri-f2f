// Actions whose payload needs the army data. The reducer stays pure; these
// work out the payload first and return a plain action to dispatch.
import {defaultWeapon} from '../rules/defaultWeapon.js';
import {resolveSelection, trooperWeapons} from '../rules/trooper.js';
import {ROLE, vanillaOf} from './matchupView.js';
import {EMPTY_SIDE} from './schema.js';

// A search hit -> a side's selection. The weapon the query matched ("fus ml")
// is preselected, else the default weapon for the side. Before the army data
// has loaded the weapon stays open (null = default, matchupView.js).
export function selectionFromHit(army, hit, side) {
  const sel = {
    ...EMPTY_SIDE,
    unitId: hit.unitId,
    factionId: hit.armyFactionId,
    groupId: hit.groupId,
    profileId: hit.profileId,
    optionId: hit.optionId,
  };
  const resolved = army ? resolveSelection(army, sel) : null;
  if (!resolved?.option) return sel;
  const weapons = trooperWeapons(resolved.option, army.weapons, resolved.traits);
  const matched = hit.weaponId != null ? weapons.find((w) => w.id === hit.weaponId) : null;
  const weapon = matched ?? defaultWeapon(weapons, ROLE[side]);
  return {...sel, weaponKey: weapon?.key ?? 'dodge'};
}

export function pickTrooper(army, side, hit) {
  return {
    type: 'pickTrooper',
    side,
    sel: selectionFromHit(army, hit, side),
    recent: {unitId: hit.unitId, groupId: hit.groupId, optionId: hit.optionId, armyFactionId: hit.armyFactionId},
  };
}

// The picker opens scoped to that side's current faction, else the starting
// faction set for the side (Settings), else the other side's, else the
// faction of the last trooper picked.
export function openPicker(army, state, side) {
  const fac = (s) => vanillaOf(army, state.matchup[s].factionId);
  const start = state.prefs.startFaction?.[side] ?? null;
  const last = vanillaOf(army, state.lists.recents[0]?.armyFactionId);
  return {type: 'openPicker', side, scope: fac(side) ?? start ?? fac(side === 'A' ? 'B' : 'A') ?? last ?? null};
}
