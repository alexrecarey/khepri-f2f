// Which big number the results card shows (ui/headline.js draws it): a
// player pref, and also part of a Matchup address (url.js), so a link's
// preview card shows what its sender saw, wherever it was copied from.
export const HEADLINES = ['wpo', 'win', 'wound'];

// The stored pref, or the default for anything missing or unknown.
export const headlineChoice = (prefs) => (HEADLINES.includes(prefs?.headline) ? prefs.headline : 'wpo');

// The address's key. Opening a link leaves the receiver's own pref alone.
export const HEADLINE_PARAM = 'headline';
