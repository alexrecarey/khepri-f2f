// Display names shared by the search index, the picker, the side cards and
// saved rolls.
import {words} from '../search/text.js';

// "Hexas, Strategic Security Division" -> "Hexas": what players call it.
export const shortIsc = (isc) => (isc ?? '').split(',')[0].trim();

// The loadout's own name when it says something the unit name doesn't
// ("BIPANDRA", "Hacker"), else null. Army names most loadouts after the unit
// in capitals ("FENNEC" for Fennec Fusiliers, "FUSILIER" for Fusiliers), which
// is just noise next to the unit name.
export function extraLoadoutName(loadout, unitName) {
  if (!loadout) return null;
  const unitWords = words(unitName);
  const same = words(loadout).every((w) => unitWords.some((u) => u.startsWith(w) || w.startsWith(u)));
  return same ? null : loadout;
}

// Short weapon names for buttons, the way players say them ("HMG",
// "Missile L."), so a card's weapons fit on fewer rows. The full name stays
// in the button's title and in the results.
const SHORT_WEAPON = [
  [/Heavy Machine Gun/, 'HMG'],
  [/Submachine Gun/, 'SMG'],
  [/Hyper-Rapid Magnetic Cannon/, 'HMC'],
  [/Portable Autocannon/, 'Autocannon'],
  [/(Missile|Grenade|Rocket) Launcher/, '$1 L.'],
  [/MULTI (Sniper|Marksman) Rifle/, 'MULTI $1'],
];

export function shortWeaponName(name) {
  return SHORT_WEAPON.reduce((n, [re, to]) => n.replace(re, to), name ?? '');
}
