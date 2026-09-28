// Pure helpers for the per-weapon "wounds per order" previews.
import validateParams from '../inputs/validateParams.js';
import {activePlayer, reactivePlayer, woundsPerOrder} from '../display/DataTransform.js';
import {bsWeapons, deriveInputs, resolveSelection} from './profileToInputs.js';

export const PARAM_KEYS = [
  'burstA', 'bonusBurstA', 'successValueA', 'damageA', 'armA', 'btsA', 'ammoA', 'contA', 'shockA', 'critImmuneA',
  'burstB', 'bonusBurstB', 'successValueB', 'damageB', 'armB', 'btsB', 'ammoB', 'contB', 'shockB', 'critImmuneB',
  'dtwVsDodge', 'fixedFaceToFace',
];

const DEFAULTS = validateParams(new URLSearchParams());

// Full calculator input, defaults filled in for anything not derived.
export function fullParams(inputs) {
  const params = {};
  for (const k of PARAM_KEYS) params[k] = inputs[k] !== undefined ? inputs[k] : DEFAULTS[k];
  return params;
}

// Cache key independent of object key order.
export const paramsKey = (params) => JSON.stringify(PARAM_KEYS.map((k) => params[k]));

// Expected wounds per order for one side from a worker result.
export function woundsFor(value, side) {
  const rows = value?.expected_wounds ?? [];
  return woundsPerOrder((side === 'A' ? activePlayer : reactivePlayer)(rows));
}

// One entry per BS weapon of side X's loadout, with the calculator params that
// weapon would produce against side Y's current choice. params is null when
// Y is not fully chosen or the weapon cannot be used (e.g. out of range).
export function previewCandidates({army, side, selX, selY, rangeCm}) {
  const x = resolveSelection(army, selX);
  if (!x?.option || !x.profile) return [];
  const y = resolveSelection(army, selY);
  const opponentReady = Boolean(y?.profile && y.weapon);
  return bsWeapons(x.option, army.weapons).map((weapon) => {
    const unavailable = {weaponKey: weapon.key, side, params: null, key: null};
    if (!opponentReady) return unavailable;
    const xs = {...x, weapon};
    const r = deriveInputs(side === 'A' ? {active: xs, reactive: y, rangeCm} : {active: y, reactive: xs, rangeCm});
    if (!r.ok) return unavailable;
    const params = fullParams(r.inputs);
    // Both sides can produce identical params for the same matchup, but each
    // side reads its own wounds from the result, so the cache key needs the side.
    return {weaponKey: weapon.key, side, params, key: `${side}:${paramsKey(params)}`};
  });
}
