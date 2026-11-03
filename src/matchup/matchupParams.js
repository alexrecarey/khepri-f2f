// Matchup selections <-> URL params, for share links. Both sides use the same
// keys with an A (active) / B (reactive) suffix; range and the zones between
// them (smoke=1, wn=1) are shared, rangeB is the reactive's own distance when
// the range is split.
import {parseOr} from '../lib/parse.js';
import {CC_ALLIES_MAX} from '../rules/closeCombat.js';
import {HACKED_RESET_MODS} from '../rules/modifiers.js';
import {FIREWALL_CHIPS} from '../rules/trooper.js';
import {BandSchema, EMPTY_SIDE, SelectionSchema} from '../state/schema.js';

/** @typedef {import('../types.js').Selection} Selection */
/** @typedef {import('../types.js').Side} Side */

// param name -> selection field, and how to read it back
/** @type {[string, keyof Omit<Selection, 'ftSize'>, NumberConstructor | StringConstructor][]} */
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
/**
 * @param {{selA: Selection | null | undefined, selB: Selection | null | undefined, ftSize?: {A: number, B: number} | null,
 *   rangeCm?: number | null, rangeCmB?: number | null, zones?: import('../types.js').Zones | null}} matchup
 * @returns {Record<string, string>}
 */
export function encodeMatchup({selA, selB, ftSize, rangeCm, rangeCmB, zones}) {
  /** @type {Record<string, string>} */
  const out = {};
  for (const [side, sel] of /** @type {[Side, Selection | null | undefined][]} */ ([['A', selA], ['B', selB]])) {
    if (!sel?.unitId) continue;
    for (const [param, field] of FIELDS) {
      if (sel[field] !== null && sel[field] !== undefined) out[`${param}${side}`] = String(sel[field]);
    }
    if (sel.inCover) out[`cover${side}`] = '1';
    // firewall=3 / 6, or 0 for none; left out for the trooper's own.
    // A chip value is a number; null (the trooper's own) isn't one.
    if (sel.firewall === 0 || FIREWALL_CHIPS.includes(/** @type {number} */ (sel.firewall))) out[`firewall${side}`] = String(-/** @type {number} */ (sel.firewall));
    if (sel.sapper) out[`sapper${side}`] = '1';
    if (sel.targeted) out[`targeted${side}`] = '1';
    if (HACKED_RESET_MODS.includes(sel.hackedReset)) out[`hacked${side}`] = String(-sel.hackedReset);
    if (sel.immA) out[`imma${side}`] = '1';
    if (sel.surpriseAttack) out[`surprise${side}`] = '1';
    if (sel.berserk) out[`berserk${side}`] = '1';
    if (sel.supportware) out[`sw${side}`] = sel.supportware;
    // No ftSize compares as false.
    if (/** @type {number} */ (ftSize?.[side]) > 1) out[`ft${side}`] = String(/** @type {{A: number, B: number}} */ (ftSize)[side]);
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

// null when the params hold no matchup. Each side is assembled from the
// codec above and read through SelectionSchema: a field the schema refuses
// (an id of 1.5, a 300-character weapon key) falls back to EMPTY_SIDE's.
/**
 * @param {URLSearchParams} params
 */
export function decodeMatchup(params) {
  /** @param {string} k */
  const get = (k) => params.get(k);
  /**
   * The side's selection, whether or not it has a trooper (its ftSize is
   * read either way, as it always was).
   * @param {Side} s
   */
  const side = (s) => {
    /** @type {Record<string, unknown>} */
    const raw = {};
    for (const [param, field, read] of FIELDS) {
      const value = get(`${param}${s}`);
      if (value !== null && value !== '') raw[field] = read(value);
    }
    raw.inCover = get(`cover${s}`) === '1';
    const firewall = get(`firewall${s}`);
    // 0 - n, not -n: "0" must read back as 0, not -0.
    raw.firewall = firewall ? 0 - Number(firewall) : null;
    raw.sapper = get(`sapper${s}`) === '1';
    raw.targeted = get(`targeted${s}`) === '1';
    raw.hackedReset = 0 - Number(get(`hacked${s}`));
    raw.immA = get(`imma${s}`) === '1';
    raw.surpriseAttack = get(`surprise${s}`) === '1';
    raw.berserk = get(`berserk${s}`) === '1';
    raw.supportware = get(`sw${s}`);
    raw.ftSize = Number(get(`ft${s}`));
    // More allies than fit around a base are the most that fit.
    raw.ccAllies = Math.min(Number(get(`allies${s}`)), CC_ALLIES_MAX);
    return parseOr(SelectionSchema, raw, EMPTY_SIDE);
  };
  const {ftSize: ftA, ...A} = side('A');
  const {ftSize: ftB, ...B} = side('B');
  if (!A.unitId && !B.unitId) return null;
  const {ftSize: _, ...empty} = EMPTY_SIDE;
  const range = parseOr(BandSchema, Number(get('range')), null);
  return {
    // Only a side with a trooper keeps its chips.
    A: A.unitId ? A : {...empty},
    B: B.unitId ? B : {...empty},
    ftSize: {A: ftA, B: ftB},
    rangeCm: range,
    rangeCmB: range && get('rangeB') ? parseOr(BandSchema, Number(get('rangeB')), null) : null,
    zones: {smoke: get('smoke') === '1', whiteNoise: get('wn') === '1'},
  };
}
