// Which big number the results card shows (results/headline.js works it
// out): a player pref, and also part of a Matchup address (url.js), so a
// link's preview card shows what its sender saw, wherever it was copied from.
import {HEADLINES} from '../results/headline.js';

// The stored pref, or the default for anything missing or unknown.
/**
 * @param {import('../types.js').Prefs | null | undefined} prefs
 * @returns {import('../types.js').HeadlineChoice}
 */
export const headlineChoice = (prefs) => (HEADLINES.includes(/** @type {import('../types.js').HeadlineChoice} */ (prefs?.headline)) ? /** @type {import('../types.js').HeadlineChoice} */ (/** @type {import('../types.js').Prefs} */ (prefs).headline) : 'wpo');

// The action that sets it, from the Settings, the headline dots and the swipe.
/**
 * @param {import('../types.js').HeadlineChoice} choice
 * @returns {import('../types.js').Action}
 */
export const setHeadline = (choice) => ({type: 'setPref', key: 'headline', value: choice});

// The address's key. Opening a link leaves the receiver's own pref alone.
export const HEADLINE_PARAM = 'headline';
