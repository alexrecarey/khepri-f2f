// The committed army data, for tests (never imported by the app: the app
// loads it as a lazy chunk, src/data/army.js). One loader, typed, instead of
// the same JSON.parse(readFileSync(...)) line in every test file.
import {readFileSync} from 'node:fs';

/** @type {import('../types.js').Army} */
export const army = JSON.parse(readFileSync(new URL('./army.json', import.meta.url), 'utf8'));

/**
 * The first unit whose ISC starts with `isc` (a unit the tests know is in the data).
 * @param {string} isc
 */
export const unitByIsc = (isc) => /** @type {import('../types.js').UnitRow} */ (army.units.find((u) => u.isc.startsWith(isc)));
