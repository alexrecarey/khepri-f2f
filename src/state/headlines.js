// Which big number the results card shows (results/headline.js works it
// out): a player pref, and also part of a Matchup address (url.js), so a
// link's preview card shows what its sender saw, wherever it was copied from.
import {HEADLINES} from '../results/headline.js';

// The stored pref, or the default for anything missing or unknown.
export const headlineChoice = (prefs) => (HEADLINES.includes(prefs?.headline) ? prefs.headline : 'wpo');

// The action that sets it, from the Settings, the headline dots and the swipe.
export const setHeadline = (choice) => ({type: 'setPref', key: 'headline', value: choice});

// The address's key. Opening a link leaves the receiver's own pref alone.
export const HEADLINE_PARAM = 'headline';
