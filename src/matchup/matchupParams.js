// Matchup selections <-> URL params, for share links. Both sides use the same
// keys with an A (active) / B (reactive) suffix; range and the zones between
// them (smoke=1, wn=1) are shared, rangeB is the reactive's own distance when
// the range is split.
import {CC_ALLIES_MAX} from '../rules/closeCombat.js';
import {FIRETEAM_MAX, FIRETEAM_MIN} from '../rules/modifiers.js';
import {RANGE_BANDS} from '../rules/ranges.js';

const EMPTY = {
  unitId: null, factionId: null, groupId: null, profileId: null, optionId: null,
  weaponKey: null, inCover: false, sapper: false, surpriseAttack: false, upgrade: null, ball: null, ccAllies: 0, berserk: false,
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
export function encodeMatchup({selA, selB, ftSize, rangeCm, rangeCmB, zones}) {
  const out = {};
  for (const [side, sel] of [['A', selA], ['B', selB]]) {
    if (!sel?.unitId) continue;
    for (const [param, field] of FIELDS) {
      if (sel[field] !== null && sel[field] !== undefined) out[`${param}${side}`] = String(sel[field]);
    }
    if (sel.inCover) out[`cover${side}`] = '1';
    if (sel.sapper) out[`sapper${side}`] = '1';
    if (sel.surpriseAttack) out[`surprise${side}`] = '1';
    if (sel.berserk) out[`berserk${side}`] = '1';
    if (ftSize?.[side] > 1) out[`ft${side}`] = String(ftSize[side]);
    if (sel.ccAllies > 0) out[`allies${side}`] = String(sel.ccAllies);
  }
  if (Object.keys(out).length > 0 && rangeCm) out.range = String(rangeCm);
  if (out.range && rangeCmB) out.rangeB = String(rangeCmB);
  if (Object.keys(out).length > 0) {
    if (zones?.smoke) out.smoke = '1';
    if (zones?.whiteNoise) out.wn = '1';
  }
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
    sel.sapper = get(`sapper${s}`) === '1';
    sel.surpriseAttack = get(`surprise${s}`) === '1';
    sel.berserk = get(`berserk${s}`) === '1';
    const allies = Number(get(`allies${s}`));
    sel.ccAllies = Number.isInteger(allies) && allies > 0 ? Math.min(allies, CC_ALLIES_MAX) : 0;
    return sel;
  };
  const A = side('A');
  const B = side('B');
  if (!A && !B) return null;
  const ft = (s) => {
    const n = Number(get(`ft${s}`));
    return Number.isInteger(n) && n >= FIRETEAM_MIN && n <= FIRETEAM_MAX ? n : 1;
  };
  const band = (cm) => (RANGE_BANDS.some((b) => b.to === cm) ? cm : null);
  const range = band(Number(get('range')));
  return {
    A: A ?? {...EMPTY},
    B: B ?? {...EMPTY},
    ftSize: {A: ft('A'), B: ft('B')},
    rangeCm: range,
    rangeCmB: range && get('rangeB') ? band(Number(get('rangeB'))) : null,
    zones: {smoke: get('smoke') === '1', whiteNoise: get('wn') === '1'},
  };
}
