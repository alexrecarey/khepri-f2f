// Which big number the results card shows (results/headline.js works it
// out): a player pref, and also part of a Matchup address (url.js), so a
// link's preview card shows what its sender saw, wherever it was copied from.
import {parseOr} from '../lib/parse.js';
import {DEFAULT_HEADLINE} from '../results/headline.js';
import {HeadlineSchema} from './schema.js';

// The stored pref, or the default for anything missing or unknown.
/**
 * @param {{headline?: unknown} | null | undefined} prefs stored prefs, so anything may be in there
 * @returns {import('../types.js').HeadlineChoice}
 */
export const headlineChoice = (prefs) => parseOr(HeadlineSchema, prefs?.headline, DEFAULT_HEADLINE);

// The action that sets it, from the Settings, the headline dots and the swipe.
/**
 * @param {import('../types.js').HeadlineChoice} choice
 * @returns {import('../types.js').Action}
 */
export const setHeadline = (choice) => ({type: 'setPref', key: 'headline', value: choice});

// The address's key. Opening a link leaves the receiver's own pref alone.
export const HEADLINE_PARAM = 'headline';
