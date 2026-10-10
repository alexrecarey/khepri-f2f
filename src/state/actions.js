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

// Which faction a side's picker shows: the one last chosen for that side,
// else the faction of its trooper, else its starting faction (Settings), else
// All. Never the other side's: each side keeps its own.
export function scopeFor(army, state, side) {
  if (state.scopes && side in state.scopes) return state.scopes[side];
  return vanillaOf(army, state.matchup[side].factionId) ?? state.prefs.startFaction?.[side] ?? null;
}

// The picked trooper's faction becomes its side's scope. `next`: the picker
// stays open on the other side, with that side's scope.
// ftMax: the new trooper's largest fireteam, so a kept fireteam size shrinks
// to fit (or goes) when the new trooper can't match it.
export function pickTrooper(army, side, hit, {next = false, state = null} = {}) {
  const otherSide = side === 'A' ? 'B' : 'A';
  const sel = selectionFromHit(army, hit, side);
  return {
    type: 'pickTrooper',
    side,
    sel,
    ftMax: resolveSelection(army, sel)?.ftMax ?? 1,
    recent: {unitId: hit.unitId, groupId: hit.groupId, optionId: hit.optionId, armyFactionId: hit.armyFactionId},
    scope: hit.factionId ?? null,
    ...(next ? {next: true, nextScope: state ? scopeFor(army, state, otherSide) : null} : {}),
  };
}

export const openPicker = (army, state, side) => ({type: 'openPicker', side, scope: scopeFor(army, state, side)});

// Desktop picker: switch sides, each with its own scope.
export const pickerSide = (army, state, side) => ({type: 'pickerSide', side, scope: scopeFor(army, state, side)});
