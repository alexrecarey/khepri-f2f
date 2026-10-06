// Display names shared by the picker and the side cards.
import {words} from '../search/text.js';

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
