// Face to face breakdown: the chance of each side's best die. The winner of a
// Face to Face Roll depends only on the two best dice: the higher one wins,
// equal ones (both miss, the same number, two Criticals) cancel. So these
// numbers explain the roll exactly; engine.test.mjs checks them against the
// engine's own win / nobody / lose chances.

// What a die can read, low to high: a miss, 1-19, a Critical.
export const MISS = 'x';
export const CRIT = 'C';
export const READINGS = [MISS, ...Array.from({length: 19}, (_, i) => i + 1), CRIT];

// One d20 against a Success Value, as f2f.py read_roll reads it: a roll equal
// to the SV is a Critical, under it a hit, over it a miss. Over 20 the excess
// is added to every roll and anything that reaches 20 is a Critical.
export function readRoll(roll, sv) {
  if (sv > 20) return roll + sv - 20 >= 20 ? CRIT : roll + sv - 20;
  if (roll === sv) return CRIT;
  return roll < sv ? roll : MISS;
}

// Chance of each reading for one die.
function perDie(sv) {
  const p = new Map(READINGS.map((r) => [r, 0]));
  for (let roll = 1; roll <= 20; roll++) p.set(readRoll(roll, sv), p.get(readRoll(roll, sv)) + 1 / 20);
  return p;
}

// Chance that the best of `dice` dice reads each value.
export function bestOf(sv, dice) {
  const one = perDie(sv);
  const out = new Map();
  let cdf = 0;
  for (const r of READINGS) {
    const prev = cdf;
    cdf += one.get(r);
    out.set(r, cdf ** dice - prev ** dice);
  }
  return out;
}

// Both sides' best dice from the engine params. Special Dice are rolled too
// and only the best Burst kept, so the best die is the best of all of them.
// null when there is no Face to Face Roll to explain (a side rolls nothing,
// a Direct Template, a fixed roll).
//   active / reactive  {dice, best: [{reading, chance, wins}]}: wins is the
//                      part of chance where that best die wins the roll
//   readings           the columns worth drawing: a miss, 1 up to the highest
//                      hit either side can roll, a Critical
export function faceToFaceBreakdown(p) {
  if (!p || p.templateA || p.templateB || p.fixedFaceToFace) return null;
  const diceA = (p.burstA ?? 0) + (p.bonusBurstA ?? 0);
  const diceB = (p.burstB ?? 0) + (p.bonusBurstB ?? 0);
  // Burst 0 keeps none of the dice, Special Dice included: no roll.
  if (!(p.burstA > 0) || !(p.burstB > 0)) return null;
  const A = bestOf(p.successValueA, diceA);
  const B = bestOf(p.successValueB, diceB);
  const below = (D) => {
    const m = new Map();
    let t = 0;
    for (const r of READINGS) { m.set(r, t); t += D.get(r); }
    return m;
  };
  const belowA = below(A);
  const belowB = below(B);
  const top = Math.max(...READINGS.filter((r) => typeof r === 'number' && (A.get(r) > 0 || B.get(r) > 0)), 0);
  const readings = READINGS.filter((r) => typeof r !== 'number' || r <= top);
  const side = (D, beats, dice) => ({
    dice,
    // A miss never wins: it is 0 below everything.
    best: readings.map((r) => ({reading: r, chance: D.get(r), wins: r === MISS ? 0 : D.get(r) * beats.get(r)})),
  });
  return {active: side(A, belowB, diceA), reactive: side(B, belowA, diceB), readings};
}

// Win / nobody / lose from the breakdown (what the engine says too).
export function breakdownWins(b) {
  const total = (s) => s.best.reduce((t, x) => t + x.wins, 0);
  const active = total(b.active);
  const reactive = total(b.reactive);
  return {active, reactive, none: 1 - active - reactive};
}

// What the explainer under the chart says: how much of each side's win comes
// from its Critical, and how the cancelled rolls split (the same number, two
// Criticals, both miss). The three cancel parts add up to breakdownWins' none.
export function breakdownParts(b) {
  const at = (side, r) => b[side].best.find((x) => x.reading === r) ?? {chance: 0, wins: 0};
  const both = (r) => at('active', r).chance * at('reactive', r).chance;
  const numbers = b.readings.filter((r) => typeof r === 'number');
  return {
    critWins: {active: at('active', CRIT).wins, reactive: at('reactive', CRIT).wins},
    cancel: {same: numbers.reduce((t, r) => t + both(r), 0), crits: both(CRIT), misses: both(MISS)},
  };
}
