// Engine result -> the numbers the results card and sheet draw. Pure, so the
// card and the sheet read the same figures.
//
//   wpo        {active, reactive}: expected wounds per order
//   win        {active, reactive, none}: chance each side wins the Face to Face
//              Roll (none = both fail, or a tie)
//   bar        7 segments, left to right: active 3+ / 2 / 1, nobody wounded,
//              reactive 1 / 2 / 3+ ({side, wounds, chance})
//   atLeast    {active: [p1, p2, p3], reactive: [...]}: chance of 1+, 2+, 3+
//   saved      {active, reactive}: won the roll, but every hit was saved
//   unopposed  true when each side rolled on its own (Direct Template vs attack)
//   attacks    unopposed only: {active, reactive}, each attack on its own:
//              {wpo, wounds: [p1, p2, p3+] exactly, wounded, saved, miss}
//   states     with targets only: {active, reactive}, the target's wound states
//              (rules/woundStates.js), each with {exactly, atLeast, shade}:
//              exactly its own share of the rolls, atLeast that state or worse
//   stateBar   with targets only: the wound bar by state, left to right: active
//              deepest first, nobody wounded, reactive mildest first
//              ({side, key, index, chance, shade})
//   joint      unopposed only: the two attacks are independent, so the order
//              ends one of four ways: {both, onlyActive, onlyReactive, neither}
//              (onlyActive = only the active side causes wounds)
import {woundsPerOrder} from '../display/DataTransform.js';

export const MAX_WOUNDS = 3;

const sum = (rows) => rows.reduce((s, r) => s + r.chance, 0);

// One side's attack when nothing opposes it (sideResult = result.unopposed.x).
function attackOnItsOwn(sideResult, player) {
  const rows = sideResult.expected_wounds.filter((r) => r.player === player);
  const hit = sum((sideResult.face_to_face ?? []).filter((r) => r.player === player));
  const wounds = [1, 2, 3].map((w) => sum(rows.filter((r) => (w === MAX_WOUNDS ? r.wounds >= w : r.wounds === w))));
  const wounded = wounds.reduce((a, b) => a + b, 0);
  return {wpo: woundsPerOrder(rows), wounds, wounded, saved: Math.max(0, hit - wounded), miss: Math.max(0, 1 - hit)};
}

// One ramp per side, mildest to deepest, cut into six steps (1 lightest).
// Dead always takes step 6. The other states spread down to step 3 at most,
// so the state seen most often (1 wound, or Unconscious on 1 VITA) is not
// the palest; only targets with five or six states reach down to 2 and 1.
const RAMP = {active: ['#cdeee2', '#1f6b52'], reactive: ['#f6d9e8', '#8e3b67']};
const STEPS = 6;
const hex = (c) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
export function shadeStep(i, n) {
  if (n <= 1) return STEPS;
  const start = n >= 6 ? 1 : n === 5 ? 2 : 3;
  return Math.round(start + (STEPS - start) * i / (n - 1));
}
function shade(side, i, n) {
  const [from, to] = RAMP[side].map(hex);
  const t = (shadeStep(i, n) - 1) / (STEPS - 1);
  return `#${from.map((f, k) => Math.round(f + (to[k] - f) * t).toString(16).padStart(2, '0')).join('')}`;
}

// A side's rows by its target's states: exactly n wounds for each state, n or
// more for the last (Dead).
function byState(rows, states, side) {
  return states.map((st, i) => {
    const last = i === states.length - 1;
    const atLeast = sum(rows.filter((r) => r.wounds >= st.wounds));
    const exactly = last ? atLeast : sum(rows.filter((r) => r.wounds === st.wounds));
    return {...st, index: i, exactly, atLeast, shade: shade(side, i, states.length)};
  });
}

export function summarize(result, targets = null) {
  if (!result?.expected_wounds) return null;
  const rows = result.expected_wounds;
  const of = (player) => rows.filter((r) => r.player === player);
  const exactly = (player, w) => sum(of(player).filter((r) => (w === MAX_WOUNDS ? r.wounds >= w : r.wounds === w)));
  const atLeast = (player) => [1, 2, 3].map((w) => sum(of(player).filter((r) => r.wounds >= w)));

  const ftf = result.face_to_face ?? [];
  const won = (player) => sum(ftf.filter((r) => r.player === player));
  const win = {active: won('active'), reactive: won('reactive')};
  win.none = Math.max(0, 1 - win.active - win.reactive);

  const bar = [];
  for (let w = MAX_WOUNDS; w >= 1; w--) bar.push({side: 'active', wounds: w, chance: exactly('active', w)});
  const woundedA = sum(of('active').filter((r) => r.wounds > 0));
  const woundedB = sum(of('reactive').filter((r) => r.wounds > 0));
  // In an unopposed result both sides can wound in the same order, so "nobody"
  // is not the remainder there; the card then shows each side's own chance.
  const unopposed = Boolean(result.unopposed);
  bar.push({side: 'none', wounds: 0, chance: unopposed ? 0 : Math.max(0, 1 - woundedA - woundedB)});
  for (let w = 1; w <= MAX_WOUNDS; w++) bar.push({side: 'reactive', wounds: w, chance: exactly('reactive', w)});

  const states = !unopposed && targets?.active && targets?.reactive
    ? {active: byState(of('active'), targets.active, 'active'), reactive: byState(of('reactive'), targets.reactive, 'reactive')}
    : null;
  const stateBar = states && [
    ...[...states.active].reverse().map((st) => ({side: 'active', key: st.key, index: st.index, chance: st.exactly, shade: st.shade})),
    {side: 'none', key: 'none', index: 0, chance: bar.find((b) => b.side === 'none').chance, shade: null},
    ...states.reactive.map((st) => ({side: 'reactive', key: st.key, index: st.index, chance: st.exactly, shade: st.shade})),
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

function unopposedParts(result) {
  const a = attackOnItsOwn(result.unopposed.active, 'active');
  const r = attackOnItsOwn(result.unopposed.reactive, 'reactive');
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

export const pct = (p) => `${(100 * p).toFixed(1)}%`;

// Worth a row or a bar segment: at least 0.05%, which shows as 0.1%. Float
// remainders like 1e-17 ("misses" for a template that never misses) don't.
export const shows = (p) => p >= 0.0005;
