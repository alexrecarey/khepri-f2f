// Forward Observer (wiki): a skill used as a BS Attack with a BS Weapon (WIP).
// A hit puts the target in Targeted State, with no Saving Roll.
//
// The Army data lists it as a skill, not a weapon, so its row is built here
// from the wiki's chart (as army/hacking.js does for the programs): B2, no
// PS, 0 to 24", -3 to 48", -6 to 96".
import {SKILL} from './ids.js';
import {skillExtras} from './traits.js';
import {parseWeaponMods, weaponLabel} from './weapons.js';

const NAME = 'Forward Observer';
// Upper bounds in cm, as army.json writes range bands.
const RANGES = [{to: 60, mod: 0}, {to: 120, mod: -3}, {to: 240, mod: -6}];
// The entry's key and id: no Army weapon id, so no `${id}:${mode}`.
export const FORWARD_OBSERVER_KEY = 'fo';

/**
 * The skill as a weapon row. `name`: the skill's name in the army's language.
 * @param {string} [name]
 * @returns {import('../types.js').WeaponRow}
 */
export const forwardObserverRow = (name = NAME) => ({
  name, ...(name !== NAME && {en: NAME}), mode: null, burst: 2, dmg: null, ranges: RANGES, ammo: null,
  props: ['BS Weapon (WIP)', 'State: Targeted', 'Non-lethal'],
});

/**
 * The trooper's Forward Observer as a weapon entry (kind 'bs': a rolled BS
 * Attack like any shot), with the skill's own MODs ("Forward Observer
 * (+1SD)"); none without the skill.
 * @param {import('../types.js').Traits | null | undefined} traits
 * @returns {import('../types.js').WeaponEntry[]}
 */
export function trooperForwardObserver(traits) {
  const skill = (traits?.skills ?? []).find((s) => s.id === SKILL.FORWARD_OBSERVER);
  if (!skill) return [];
  const row = forwardObserverRow(skill.name);
  const mods = parseWeaponMods(skillExtras(traits, SKILL.FORWARD_OBSERVER));
  return [{key: FORWARD_OBSERVER_KEY, kind: 'bs', id: FORWARD_OBSERVER_KEY, name: row.name, mode: null, row, mods, label: weaponLabel(row, mods)}];
}
