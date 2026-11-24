// Two rolls that don't oppose each other: both sides roll, each on its own
// (params.unopposed, engine/calculate.js isUnopposed), with no Face to Face
// Roll and no opposing MODs. Otherwise a roll is opposed when both sides roll,
// or one side's roll stands alone (a Direct Template, or the other side rolls
// nothing).
// - Smoke against a roll it doesn't oppose (rules/smoke.js smokeNotOpposed).
// - Two evasions (Dodge, Reset): neither attacks, so nothing is opposed.
import {msg} from '../i18n/message.js';
import {smokeNotOpposed} from './smoke.js';

/** @typedef {import('../types.js').ResolvedSide} ResolvedSide */

/** @param {ResolvedSide | null | undefined} x */
export const evading = (x) => x?.weapon?.kind === 'dodge' || x?.weapon?.kind === 'reset';

// Why a's and b's rolls are not opposed, as the matchup note says it; null
// when they are (or when one of them rolls nothing).
/**
 * @param {ResolvedSide | null | undefined} a
 * @param {ResolvedSide | null | undefined} b
 * @returns {import('../types.js').Message | null}
 */
export const notOpposed = (a, b) => smokeNotOpposed(a, b) ?? smokeNotOpposed(b, a)
  ?? (evading(a) && evading(b) ? msg('note.nobodyAttacks') : null);
