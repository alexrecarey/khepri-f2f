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
import {woundsPerOrder} from '../display/DataTransform.js';

export const MAX_WOUNDS = 3;

const sum = (rows) => rows.reduce((s, r) => s + r.chance, 0);

export function summarize(result) {
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

  return {
    wpo: {active: woundsPerOrder(of('active')), reactive: woundsPerOrder(of('reactive'))},
    win,
    bar,
    atLeast: {active: atLeast('active'), reactive: atLeast('reactive')},
    saved: {
      active: sum(of('active').filter((r) => r.wounds === 0)),
      reactive: sum(of('reactive').filter((r) => r.wounds === 0)),
    },
    unopposed,
  };
}

export const pct = (p) => `${(100 * p).toFixed(1)}%`;
