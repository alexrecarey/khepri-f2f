// Calculator params (src/engine/params.js) -> dice engine (src/engine/f2f.py)
// -> result rows for the display.
//
// The engine only rolls dice. The rules that turn a weapon and a target into
// dice live here: what each ammunition does, PS + ARM (or BTS) as the save
// value, Plasma's second Saving Roll, Immunity (Critical), Shock, and a Direct
// Template against an attack being two separate rolls.

// What a hit with each ammunition does (calculator ammo, params.js AMMO).
//   saves             Saving Rolls per hit
//   woundsPerFailure  wounds per failed Saving Roll
//   secondary         every Saving Roll also needs a BTS one (Plasma)
export const AMMO = {
  N: {saves: 1},
  DA: {saves: 2},
  EXP: {saves: 3},
  T2: {saves: 1, woundsPerFailure: 2},
  PLASMA: {saves: 1, secondary: true},
  // A Dodge wins the Face to Face Roll but causes no Saving Rolls.
  DODGE: {saves: 0},
  // An attack whose hits do nothing to the target (e.g. E/M against Immunity
  // (BTS)): still rolled and opposed, but causes no Saving Rolls.
  NONE: {saves: 0},
};

// Keys of one side's engine input; f2f.py reads these with an A or B suffix.
export const ENGINE_SIDE_KEYS = [
  'successValue', 'burst', 'bonusBurst', 'template',
  'saveValue', 'saves', 'critSave', 'woundsPerFailure', 'cont', 'secondarySave',
];
export const ENGINE_KEYS = [
  ...['A', 'B'].flatMap((s) => ENGINE_SIDE_KEYS.map((k) => k + s)),
  'fixedFaceToFace',
];

// Most wounds shown; more are counted as this many.
export const MAX_WOUNDS = 25;

const other = (s) => (s === 'A' ? 'B' : 'A');

// Side s's attack against the other side, as the engine reads it.
function sideInput(p, s) {
  const t = other(s);
  const ammo = AMMO[p[`ammo${s}`]];
  return {
    [`successValue${s}`]: p[`successValue${s}`],
    [`burst${s}`]: p[`burst${s}`],
    [`bonusBurst${s}`]: p[`bonusBurst${s}`],
    [`template${s}`]: p[`template${s}`],
    // A Saving Roll passes on d20 <= PS + ARM (or BTS), MODs already in ARM.
    [`saveValue${s}`]: p[`damage${s}`] + p[`arm${t}`],
    [`saves${s}`]: ammo.saves,
    // A Critical adds a Saving Roll, unless the target has Immunity (Critical)
    // or the hit causes no Saving Rolls at all.
    [`critSave${s}`]: ammo.saves > 0 && !p[`critImmune${t}`],
    [`woundsPerFailure${s}`]: ammo.woundsPerFailure ?? 1,
    [`cont${s}`]: p[`cont${s}`],
    [`secondarySave${s}`]: ammo.secondary ? p[`damage${s}`] + p[`bts${t}`] : null,
  };
}

// Engine input for the whole roll.
export const engineInput = (p) => ({...sideInput(p, 'A'), ...sideInput(p, 'B'), fixedFaceToFace: p.fixedFaceToFace});

// Does side s attack? A Direct Template always does; a roll does unless it is
// a Dodge or not made.
const attacks = (p, s) => p[`template${s}`] || (p[`burst${s}`] > 0 && p[`ammo${s}`] !== 'DODGE');

// A Direct Template against an attack: nothing is opposed, each side's attack
// is its own roll (a Normal Roll, or the template's automatic hits).
export const isUnopposed = (p) => (p.templateA || p.templateB) && attacks(p, 'A') && attacks(p, 'B');

// Side s's attack on its own: the other side doesn't roll (a fixed roll
// included, it only means anything against the active side's roll).
const alone = (p, s) => ({
  ...p, [`burst${other(s)}`]: 0, [`bonusBurst${other(s)}`]: 0, [`template${other(s)}`]: false, fixedFaceToFace: false,
});

// Shock: a failed Saving Roll against VITA 1 is Dead, one extra wound, once.
function applyShock(p, outcomes) {
  const shock = {active: p.shockA, reactive: p.shockB};
  return outcomes.map((o) => (shock[o.player] && o.wounds > 0 ? {...o, wounds: o.wounds + 1} : o));
}

// Engine output -> {face_to_face, expected_wounds, total_rolls}.
//   face_to_face     [{id, player, raw_chance, chance}] for active, reactive, fail
//   expected_wounds  [{id, player, wounds, raw_chance, chance, cumulative_chance}],
//                    active then fail then reactive, by wounds; cumulative_chance
//                    is that player's chance of this many wounds or more.
// raw_chance is the chance counted in rolls (chance * total_rolls).
export function formatResult(p, {rolls, outcomes}) {
  const chances = {active: new Map(), fail: new Map(), reactive: new Map()};
  for (const o of applyShock(p, outcomes)) {
    const w = Math.min(o.wounds, MAX_WOUNDS);
    chances[o.player].set(w, (chances[o.player].get(w) ?? 0) + o.chance);
  }
  const total = (m) => [...m.values()].reduce((x, y) => x + y, 0);
  const faceToFace = ['active', 'reactive', 'fail'].map((player, id) => {
    const chance = total(chances[player]);
    return {id, player, raw_chance: chance * rolls, chance};
  });
  const expectedWounds = [];
  for (const player of ['active', 'fail', 'reactive']) {
    const rows = [...chances[player]].sort(([x], [y]) => x - y);
    rows.forEach(([wounds, chance], i) => expectedWounds.push({
      id: expectedWounds.length,
      player,
      wounds,
      raw_chance: chance * rolls,
      chance,
      cumulative_chance: rows.slice(i).reduce((sum, [, c]) => sum + c, 0),
    }));
  }
  return {face_to_face: faceToFace, expected_wounds: expectedWounds, total_rolls: rolls};
}

// Runs the calculator params through `runEngine` (engine input -> engine
// output: f2f.py calculate) and returns the result the display reads.
//
// A Direct Template against an attack (isUnopposed) is two engine runs, one
// per side. The result then holds 'unopposed': {active, reactive}, one result
// per side, each without the other's rows; its top-level 'face_to_face' and
// 'expected_wounds' keep only each side's own rows (no 'fail').
export function calculate(p, runEngine) {
  const run = (q) => formatResult(q, runEngine(engineInput(q)));
  if (!isUnopposed(p)) return run(p);
  const active = run(alone(p, 'A'));
  const reactive = run(alone(p, 'B'));
  const own = (r, player) => r.filter((x) => x.player === player);
  const rows = [...own(active.expected_wounds, 'active'), ...own(reactive.expected_wounds, 'reactive')];
  return {
    unopposed: {active, reactive},
    face_to_face: [...own(active.face_to_face, 'active'), ...own(reactive.face_to_face, 'reactive')],
    expected_wounds: rows.map((r, id) => ({...r, id})),
    total_rolls: active.total_rolls + reactive.total_rolls,
  };
}
