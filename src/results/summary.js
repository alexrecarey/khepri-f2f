// Engine result -> the numbers the results card and sheet draw (types.js
// Summary). Pure, so the card, the sheet and the Worker's share card read the
// same figures.
import {RAMP} from './ramp.js';

/** @typedef {import('../types.js').WoundRow} WoundRow */
/** @typedef {import('../types.js').Player} Player */
/** @typedef {'active' | 'reactive'} Role */
/** @typedef {import('../types.js').WoundStep} WoundStep */

// Wounds the bars count one by one; more show as this many ("3+"). Not the
// engine's MAX_WOUNDS (calculate.js), which caps what it calculates.
export const BAR_WOUNDS = 3;

/** @param {{chance: number}[]} rows */
const sum = (rows) => rows.reduce((s, r) => s + r.chance, 0);
// Expected wounds: each outcome's wounds weighted by its chance.
/** @param {WoundRow[]} rows */
const woundsPerOrder = (rows) => rows.reduce((t, r) => t + r.wounds * r.chance, 0);

// One side's attack when nothing opposes it (sideResult = result.unopposed.x).
/**
 * @param {import('../types.js').EngineResult} sideResult
 * @param {Role} player
 * @returns {import('../types.js').AttackOnItsOwn}
 */
function attackOnItsOwn(sideResult, player) {
  const rows = sideResult.expectedWounds.filter((r) => r.player === player);
  const hit = sum((sideResult.faceToFace ?? []).filter((r) => r.player === player));
  // BAR_WOUNDS entries: exactly 1, 2 and 3+.
  const wounds = /** @type {[number, number, number]} */ (Array.from({length: BAR_WOUNDS}, (_, i) => i + 1).map((w) => sum(rows.filter((r) => (w === BAR_WOUNDS ? r.wounds >= w : r.wounds === w)))));
  const wounded = wounds.reduce((a, b) => a + b, 0);
  return {wpo: woundsPerOrder(rows), wounds, wounded, saved: Math.max(0, hit - wounded), miss: Math.max(0, 1 - hit)};
}

// Each side's ramp (ramp.js), mildest to deepest, cut into six steps (1
// lightest). Dead always takes step 6. The other states spread down to step 3
// at most, so the state seen most often (1 wound, or Unconscious on 1 VITA) is
// not the palest; only targets with five or six states reach down to 2 and 1.
const STEPS = 6;
/** @param {string} c */
const hex = (c) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
/**
 * @param {number} i the state's index, mildest first
 * @param {number} n how many states
 */
export function shadeStep(i, n) {
  if (n <= 1) return STEPS;
  const start = n >= 6 ? 1 : n === 5 ? 2 : 3;
  return Math.round(start + (STEPS - start) * i / (n - 1));
}
// Text on a shade: dark ink on the light steps, near white on the deep ones.
/**
 * @param {Role} side
 * @param {number} i
 * @param {number} n
 */
export const shadeInk = (side, i, n) => (shadeStep(i, n) >= 5 ? 'var(--ink-on-deep)' : `var(--${side}-ink)`);
/**
 * @param {Role} side
 * @param {number} i
 * @param {number} n
 */
export function shade(side, i, n) {
  const [from, to] = RAMP[side].map(hex);
  const t = (shadeStep(i, n) - 1) / (STEPS - 1);
  return `#${from.map((f, k) => Math.round(f + (to[k] - f) * t).toString(16).padStart(2, '0')).join('')}`;
}

// A side's rows by its target's states: exactly n wounds for each state, n or
// more for the last (Dead).
/**
 * @param {WoundRow[]} rows
 * @param {WoundStep[]} states
 * @param {Role} side
 * @returns {import('../types.js').WoundState[]}
 */
function byState(rows, states, side) {
  return states.map((st, i) => {
    const last = i === states.length - 1;
    const atLeast = sum(rows.filter((r) => r.wounds >= st.wounds));
    const exactly = last ? atLeast : sum(rows.filter((r) => r.wounds === st.wounds));
    return {...st, index: i, exactly, atLeast, shade: shade(side, i, states.length)};
  });
}

/**
 * @param {import('../types.js').EngineResult | null | undefined} result
 * @param {{active: WoundStep[] | null, reactive: WoundStep[] | null} | null} [targets] each side's target's wound states (rules/woundStates.js)
 * @returns {import('../types.js').Summary | null}
 */
export function summarize(result, targets = null) {
  if (!result?.expectedWounds) return null;
  const rows = result.expectedWounds;
  /** @param {Player} player */
  const of = (player) => rows.filter((r) => r.player === player);
  /**
   * @param {Player} player
   * @param {number} w
   */
  const exactly = (player, w) => sum(of(player).filter((r) => (w === BAR_WOUNDS ? r.wounds >= w : r.wounds === w)));
  /**
   * @param {Player} player
   * @returns {[number, number, number]}
   */
  const atLeast = (player) => /** @type {[number, number, number]} */ ([1, 2, 3].map((w) => sum(of(player).filter((r) => r.wounds >= w))));

  const ftf = result.faceToFace ?? [];
  /** @param {Player} player */
  const won = (player) => sum(ftf.filter((r) => r.player === player));
  // `none` is the remainder, set once both are known.
  /** @type {import('../types.js').Summary['win']} */
  const win = {active: won('active'), reactive: won('reactive'), none: 0};
  win.none = Math.max(0, 1 - win.active - win.reactive);

  /** @type {import('../types.js').BarSegment[]} */
  const bar = [];
  for (let w = BAR_WOUNDS; w >= 1; w--) bar.push({side: 'active', wounds: w, chance: exactly('active', w)});
  const woundedA = sum(of('active').filter((r) => r.wounds > 0));
  const woundedB = sum(of('reactive').filter((r) => r.wounds > 0));
  // In an unopposed result both sides can wound in the same order, so "nobody"
  // is not the remainder there; the card then shows each side's own chance.
  const unopposed = Boolean(result.unopposed);
  bar.push({side: 'none', wounds: 0, chance: unopposed ? 0 : Math.max(0, 1 - woundedA - woundedB)});
  for (let w = 1; w <= BAR_WOUNDS; w++) bar.push({side: 'reactive', wounds: w, chance: exactly('reactive', w)});

  const states = !unopposed && targets?.active && targets?.reactive
    ? {active: byState(of('active'), targets.active, 'active'), reactive: byState(of('reactive'), targets.reactive, 'reactive')}
    : null;
  /** @type {import('../types.js').StateBarSegment[] | null} */
  const stateBar = states && [
    ...[...states.active].reverse().map((st) => ({side: /** @type {const} */ ('active'), key: st.key, index: st.index, chance: st.exactly, shade: st.shade})),
    // The bar always has its 'none' segment (pushed above).
    {side: /** @type {const} */ ('none'), key: 'none', index: 0, chance: /** @type {import('../types.js').BarSegment} */ (bar.find((b) => b.side === 'none')).chance, shade: null},
    ...states.reactive.map((st) => ({side: /** @type {const} */ ('reactive'), key: st.key, index: st.index, chance: st.exactly, shade: st.shade})),
  ];

  return {
    states,
    stateBar,
    wpo: {active: woundsPerOrder(of('active')), reactive: woundsPerOrder(of('reactive'))},
    win,
    bar,
    atLeast: {active: atLeast('active'), reactive: atLeast('reactive')},
    saved: {
      active: sum(of('active').filter((r) => r.wounds === 0)),
      reactive: sum(of('reactive').filter((r) => r.wounds === 0)),
    },
    unopposed,
    ...(unopposed ? unopposedParts(result) : {}),
  };
}

/**
 * @param {import('../types.js').EngineResult} result an unopposed one
 * @returns {Pick<Required<import('../types.js').Summary>, 'attacks' | 'joint'>}
 */
function unopposedParts(result) {
  const a = attackOnItsOwn(/** @type {NonNullable<typeof result.unopposed>} */ (result.unopposed).active, 'active');
  const r = attackOnItsOwn(/** @type {NonNullable<typeof result.unopposed>} */ (result.unopposed).reactive, 'reactive');
  return {
    attacks: {active: a, reactive: r},
    joint: {
      both: a.wounded * r.wounded,
      onlyActive: a.wounded * (1 - r.wounded),
      onlyReactive: (1 - a.wounded) * r.wounded,
      neither: (1 - a.wounded) * (1 - r.wounded),
    },
  };
}

/** @param {number} p */
export const pct = (p) => `${(100 * p).toFixed(1)}%`;

// Worth a row or a bar segment: at least 0.05%, which shows as 0.1%. Float
// remainders like 1e-17 ("misses" for a template that never misses) don't.
/** @param {number} p */
export const shows = (p) => p >= 0.0005;
