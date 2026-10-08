// The shareable slices of the state document <-> the URL query string. The
// address bar always shows the current setup, so copying it is a share link.
//   Matchup:  ?mode=matchup&unitA=..&weaponA=..&range=..  (matchup/matchupParams.js)
//   Classic:  ?mode=basic&burstA=4&successValueA=14..      (engine/params.js; defaults left out)
import {DEFAULT_PARAMS, PARAM_KEYS, parseParams} from '../engine/params.js';
import {decodeMatchup, encodeMatchup} from '../matchup/matchupParams.js';
import {MODES} from '../ui/modes.js';
import {DEFAULT_RANGE_CM, EMPTY_SIDE} from './schema.js';

// What a URL says about the document: {mode?, matchup?, classic?}; only the
// keys the URL actually sets.
export function stateFromUrl(search) {
  const params = new URLSearchParams(search);
  const out = {};
  const mode = params.get('mode');
  if (Object.values(MODES).includes(mode)) out.mode = mode;

  const m = decodeMatchup(params);
  if (m) {
    out.matchup = {
      A: {...EMPTY_SIDE, ...m.A, ftSize: m.ftSize.A},
      B: {...EMPTY_SIDE, ...m.B, ftSize: m.ftSize.B},
      rangeCm: m.rangeCm ?? DEFAULT_RANGE_CM,
    };
  }
  const hasCalc = PARAM_KEYS.some((k) => params.has(k)) || params.has('dtwVsDodge');
  if (hasCalc) out.classic = parseParams(params);
  // A link from the classic calculator before modes were in the URL.
  if (!out.mode && hasCalc && !m) out.mode = MODES.basic;
  return out;
}

// The query string ("?mode=..") for the document's current mode.
export function urlFromState(state) {
  const q = new URLSearchParams({mode: state.mode});
  if (state.mode === MODES.matchup) {
    const {A, B, rangeCm} = state.matchup;
    const enc = encodeMatchup({selA: A, selB: B, ftSize: {A: A.ftSize, B: B.ftSize}, rangeCm});
    for (const [k, v] of Object.entries(enc)) q.set(k, v);
  } else {
    for (const k of PARAM_KEYS) {
      if (state.classic[k] !== DEFAULT_PARAMS[k]) q.set(k, String(state.classic[k]));
    }
  }
  return `?${q}`;
}
