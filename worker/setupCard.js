// The share card for an app address (/?mode=matchup&unitA=..), worked out
// from the setup alone: the same view, engine and headline the app runs, so
// a pasted link unfurls with the numbers its sender saw (the engine is
// exact). Only link-preview bots get here: a rewrite rule on the zone sends
// their / requests to /s (scripts/cloudflare/), people never wait on it.
// Pure: preview.js hands in the army data and the WASM engine.
import {calculate} from '../src/engine/calculate.js';
import {MODES} from '../src/state/modes.js';
import {matchupView} from '../src/state/matchupView.js';
import {matchupShareCard} from '../src/state/rolls.js';
import {NO_ZONES} from '../src/state/schema.js';
import {stateFromUrl} from '../src/state/url.js';
import {headline} from '../src/ui/headline.js';
import {summarize} from '../src/ui/results.js';

// A link has no headline choice (that's the sender's setting): the default.
export const SETUP_HEADLINE = 'wpo';

// The card for search ("?mode=..") given the army data and the engine's
// calculate, or null when it isn't a complete matchup.
export function cardFromSetup(search, army, engine) {
  const {mode, matchup} = stateFromUrl(search);
  if (mode !== MODES.matchup || !matchup) return null;
  const view = matchupView(army, {...NO_ZONES, ...matchup});
  if (!view.complete) return null;
  const s = summarize(calculate(view.params, engine), view.targets);
  return s && matchupShareCard(view, headline(s, SETUP_HEADLINE, view.params, view.ledger?.ledger));
}

