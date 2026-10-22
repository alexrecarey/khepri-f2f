// Range bands and Range MODs.
import {EQUIP} from '../army/ids.js';
import {isHackingProgram} from '../army/hacking.js';
import {hasEquip} from '../army/traits.js';
import {inZoneOfControl, isTemplate} from '../army/weapons.js';
import {tEn} from '../i18n/index.js';

// Shared distance between the two units. `to` is the upper bound in cm, which
// matches the cumulative band limits in the Army weapon table.
// Same columns as the N5 weapon chart: 8" | 16" | 24" | 32" | 40" | 48" | 96"
// (20 | 40 | ... | 240 cm). Shown in the language's unit (t.distance).
export const RANGE_BANDS = [{to: 20}, {to: 40}, {to: 60}, {to: 80}, {to: 100}, {to: 120}, {to: 240}];

// Band i's lower bound in cm (0 for the first).
export const bandFrom = (i) => (i ? RANGE_BANDS[i - 1].to : 0);
// '24-32"' in English, '60-80 cm' in Spanish.
export const bandLabel = (i, t = tEn) => t('dist.band', {from: t.distance(bandFrom(i)), to: t.distance(RANGE_BANDS[i].to)});

// Zone of Control: 8" around the trooper, the first band.
export const ZOC_CM = RANGE_BANDS[0].to;

// BS MOD of a weapon at the chosen distance; null when out of range.
// X Visor (shooter's traits) turns a -3 Range MOD into 0 and a -6 into -3.
// A Zone of Control weapon (Jammer) has no Range MOD inside it. A Hacking
// Program reaches the Hacking Area (ZoC and Repeaters): never a Range MOD,
// never out of range (Alex, 2026-10-22).
export function rangeModFor(row, distanceCm, traits) {
  if (isTemplate(row) || isHackingProgram(row)) return 0;
  if (inZoneOfControl(row)) return distanceCm <= ZOC_CM ? 0 : null;
  if (!row?.ranges) return null;
  const band = row.ranges.find((b) => distanceCm <= b.to);
  if (!band) return null;
  if (band.mod < 0 && hasEquip(traits, EQUIP.X_VISOR)) return Math.min(0, band.mod + 3);
  return band.mod;
}
