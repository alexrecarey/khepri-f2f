// Matchup selections <-> URL params, for share links. Both sides use the same
// keys with an A (active) / B (reactive) suffix; range is shared.
import {RANGE_BANDS} from '../rules/ranges.js';

const EMPTY = {
  unitId: null, factionId: null, groupId: null, profileId: null, optionId: null,
  weaponKey: null, inCover: false, upgrade: null, ball: null,
};

// param name -> selection field, and how to read it back
const FIELDS = [
  ['unit', 'unitId', Number],
  ['faction', 'factionId', Number],
  ['group', 'groupId', Number],
  ['profile', 'profileId', Number],
  ['option', 'optionId', Number],
  ['weapon', 'weaponKey', String],
  ['upgrade', 'upgrade', Number],
  ['ball', 'ball', Number],
];

// Only what's set, so links stay short.
export function encodeMatchup({selA, selB, ftSize, rangeCm}) {
  const out = {};
  for (const [side, sel] of [['A', selA], ['B', selB]]) {
    if (!sel?.unitId) continue;
    for (const [param, field] of FIELDS) {
      if (sel[field] !== null && sel[field] !== undefined) out[`${param}${side}`] = String(sel[field]);
    }
    if (sel.inCover) out[`cover${side}`] = '1';
    if (ftSize?.[side] > 1) out[`ft${side}`] = String(ftSize[side]);
  }
  if (Object.keys(out).length > 0 && rangeCm) out.range = String(rangeCm);
  return out;
}

// null when the params hold no matchup.
export function decodeMatchup(params) {
  const get = (k) => params.get(k);
  const side = (s) => {
    const unit = Number(get(`unit${s}`));
    if (!Number.isInteger(unit) || unit <= 0) return null;
    const sel = {...EMPTY};
    for (const [param, field, read] of FIELDS) {
      const raw = get(`${param}${s}`);
      if (raw === null || raw === '') continue;
      const v = read(raw);
      if (read === Number && !Number.isFinite(v)) continue;
      sel[field] = v;
    }
    sel.inCover = get(`cover${s}`) === '1';
    return sel;
  };
  const A = side('A');
  const B = side('B');
  if (!A && !B) return null;
  const ft = (s) => {
    const n = Number(get(`ft${s}`));
    return Number.isInteger(n) && n >= 2 && n <= 5 ? n : 1;
  };
  const range = Number(get('range'));
  return {
    A: A ?? {...EMPTY},
    B: B ?? {...EMPTY},
    ftSize: {A: ft('A'), B: ft('B')},
    rangeCm: RANGE_BANDS.some((b) => b.to === range) ? range : null,
  };
}
