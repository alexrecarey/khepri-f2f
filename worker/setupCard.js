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
import {HEADLINES, headline} from '../src/results/headline.js';
import {LINK_HEADLINE} from '../src/share/card.js';
import {HEADLINE_PARAM} from '../src/state/headlines.js';
import {summarize} from '../src/results/summary.js';

// The card for search ("?mode=..") given the army data and the engine's
// calculate, or null when it isn't a complete matchup.
export function cardFromSetup(search, army, engine) {
  const {mode, matchup} = stateFromUrl(search);
  if (mode !== MODES.matchup || !matchup) return null;
  const view = matchupView(army, {...NO_ZONES, ...matchup});
  if (!view.complete) return null;
  const s = summarize(calculate(view.params, engine), view.targets);
  // The headline the sender saw (the address carries it), else the default.
  const asked = new URLSearchParams(search).get(HEADLINE_PARAM);
  const choice = HEADLINES.includes(asked) ? asked : LINK_HEADLINE;
  return s && matchupShareCard(view, headline(s, choice, view.params, view.ledger?.ledger));
}

