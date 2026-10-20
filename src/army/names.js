// Display names shared by the search index, the picker, the side cards and
// saved rolls.
import {words} from '../search/text.js';

// "Hexas, Strategic Security Division" -> "Hexas": what players call it.
export const shortIsc = (isc) => (isc ?? '').split(',')[0].trim();

// One word for narrow columns: "Fennec" for Fennec Fusiliers. Names in
// other languages carry their own (`tag`; Spanish puts it last).
export const unitTag = (unit) => unit?.tag ?? shortIsc(unit?.isc).split(' ')[0];

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
// in the button's title and in the results. Per language, for the names in
// that language's names file. Spanish follows the Army's own short forms
// ("F. Precisión" in its extras); its launchers are one word already
// ("Lanzamisiles").
const SHORT_WEAPON = {
  en: [
    [/Heavy Machine Gun/, 'HMG'],
    [/Submachine Gun/, 'SMG'],
    [/Hyper-Rapid Magnetic Cannon/, 'HMC'],
    [/Portable Autocannon/, 'Autocannon'],
    [/(Missile|Grenade|Rocket) Launcher/, '$1 L.'],
    [/MULTI (Sniper|Marksman) Rifle/, 'MULTI $1'],
  ],
  es: [
    [/^Fusil de (Francotirador|Precisión)/, 'F. $1'],
    [/^Cañ[oó]n Magnético Hiperrápido/, 'CMH'],
    [/^Cañ[oó]n Portátil Automático/, 'Autocañón'],
  ],
};

export function shortWeaponName(name, lang = 'en') {
  return (SHORT_WEAPON[lang] ?? SHORT_WEAPON.en).reduce((n, [re, to]) => n.replace(re, to), name ?? '');
}
