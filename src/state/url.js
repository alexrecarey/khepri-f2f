// The shareable slices of the state document <-> the URL query string. The
// address bar always shows the current setup, so copying it is a share link.
//   Matchup:  ?mode=matchup&unitA=..&weaponA=..&range=..  (matchup/matchupParams.js)
//   Classic:  ?mode=basic&burstA=4&successValueA=14&psA=12..  (engine/params.js; defaults left out)
// Classic links carry the save each side forces as one number, the way the
// Classic screen shows it: psA = A's weapon PS + B's ARM, psBtsA = PS + B's
// BTS (Plasma only). Older links with damageA / armB / btsB still load.
import {DEFAULT_PARAMS, PARAM_KEYS, parseParams} from '../engine/params.js';
import {decodeMatchup, encodeMatchup} from '../matchup/matchupParams.js';
import {MODES} from './modes.js';
import {armSave, btsSave, classicSave} from './classicView.js';
import {DEFAULT_RANGE_CM, EMPTY_SIDE} from './schema.js';

// Engine params the ps keys replace in new links.
const SPLIT_KEYS = new Set(['A', 'B'].flatMap((s) => [`damage${s}`, `arm${s}`, `bts${s}`]));
const psKey = (s) => `ps${s}`;
const psBtsKey = (s) => `psBts${s}`;

// The ps keys of a link applied over its params (setClassicSave's rules).
function applySaves(classic, params) {
  let c = classic;
  for (const [key, which] of [[psKey, 'arm'], [psBtsKey, 'bts']]) {
    for (const s of ['A', 'B']) {
      const raw = params.get(key(s));
      const n = raw === null || raw.trim() === '' ? NaN : Number(raw);
      if (Number.isFinite(n)) c = classicSave(c, s, which, Math.round(n));
    }
  }
  return c;
}

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
  const hasCalc = PARAM_KEYS.some((k) => params.has(k)) || params.has('dtwVsDodge')
    || ['A', 'B'].some((s) => params.has(psKey(s)) || params.has(psBtsKey(s)));
  if (hasCalc) out.classic = applySaves(parseParams(params), params);
  // A link without a mode opens what it carries: troopers -> Matchup, else
  // calculator values -> Classic (links from before modes were in the URL).
  if (!out.mode && m) out.mode = MODES.matchup;
  else if (!out.mode && hasCalc) out.mode = MODES.basic;
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
    const c = state.classic;
    for (const k of PARAM_KEYS) {
      if (!SPLIT_KEYS.has(k) && c[k] !== DEFAULT_PARAMS[k]) q.set(k, String(c[k]));
    }
    for (const s of ['A', 'B']) {
      if (armSave(c, s) !== armSave(DEFAULT_PARAMS, s)) q.set(psKey(s), String(armSave(c, s)));
      // Only Plasma makes the target save with BTS.
      if (c[`ammo${s}`] === 'PLASMA' && btsSave(c, s) !== btsSave(DEFAULT_PARAMS, s)) q.set(psBtsKey(s), String(btsSave(c, s)));
    }
  }
  return `?${q}`;
}
