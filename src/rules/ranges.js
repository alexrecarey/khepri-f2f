// Range bands and Range MODs.
import {EQUIP} from '../army/ids.js';
import {hasEquip} from '../army/traits.js';
import {inZoneOfControl, isTemplate} from '../army/weapons.js';

// Shared distance between the two units. `to` is the upper bound in cm, which
// matches the cumulative band limits in the Army weapon table.
// Same columns as the N5 weapon chart: 8" | 16" | 24" | 32" | 40" | 48" | 96".
export const RANGE_BANDS = [
  {to: 20, inches: 8, label: '0-8"'},
  {to: 40, inches: 16, label: '8-16"'},
  {to: 60, inches: 24, label: '16-24"'},
  {to: 80, inches: 32, label: '24-32"'},
  {to: 100, inches: 40, label: '32-40"'},
  {to: 120, inches: 48, label: '40-48"'},
  {to: 240, inches: 96, label: '48-96"'},
];

// Zone of Control: 8" around the trooper, the first band.
export const ZOC_CM = RANGE_BANDS[0].to;

// BS MOD of a weapon at the chosen distance; null when out of range.
// X Visor (shooter's traits) turns a -3 Range MOD into 0 and a -6 into -3.
// A Zone of Control weapon (Jammer) has no Range MOD inside it.
export function rangeModFor(row, distanceCm, traits) {
  if (isTemplate(row)) return 0;
  if (inZoneOfControl(row)) return distanceCm <= ZOC_CM ? 0 : null;
  if (!row?.ranges) return null;
  const band = row.ranges.find((b) => distanceCm <= b.to);
  if (!band) return null;
  if (band.mod < 0 && hasEquip(traits, EQUIP.X_VISOR)) return Math.min(0, band.mod + 3);
  return band.mod;
}
