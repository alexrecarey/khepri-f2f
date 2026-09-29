// Range bands and Range MODs.
import {EQUIP} from '../army/ids.js';
import {hasEquip} from '../army/traits.js';
import {isTemplate} from '../army/weapons.js';

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

// BS MOD of a weapon at the chosen distance; null when out of range.
// X Visor (shooter's traits) turns a -3 Range MOD into 0 and a -6 into -3.
export function rangeModFor(row, distanceCm, traits) {
  if (isTemplate(row)) return 0;
  if (!row?.ranges) return null;
  const band = row.ranges.find((b) => distanceCm <= b.to);
  if (!band) return null;
  if (band.mod < 0 && hasEquip(traits, EQUIP.X_VISOR)) return Math.min(0, band.mod + 3);
  return band.mod;
}
