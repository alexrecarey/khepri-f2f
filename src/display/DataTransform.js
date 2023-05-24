import {
  propEq,
  pipe,
  multiply,
  filter,
  sort,
  prop,
  ascend,
  descend,
  propSatisfies,
  reduce,
  __,
  anyPass,
  allPass,
  sum,
  pluck
} from "ramda";

export const isActive = propEq('player', 'active');
export const isReactive = propEq('player', 'reactive');
export const isFailure = propEq('player', 'fail');
export const hasNoWounds = propSatisfies(x => x === 0, 'wounds');
export const hasWounds = propSatisfies(x => x >= 1, 'wounds');
export const oneDecimalPlace = (n, d=1) => n.toFixed(d);
export const twoDecimalPlaces = (n, d=2) => n.toFixed(d);
export const formatPercentage = pipe(multiply(100), oneDecimalPlace);
export const activePlayer = filter(isActive);
export const reactivePlayer = filter(isReactive);
export const failurePlayer = filter(isFailure);
export const ascendByWounds = sort(ascend(prop('wounds')));
export const descendByWounds = sort(descend(prop('wounds')));
export const activePlayerWithWounds = filter(allPass([isActive, hasWounds]));
export const reactivePlayerWithWounds = filter(allPass([isReactive, hasWounds]));
export const failurePlayerWithNoWounds = filter(anyPass([isFailure, hasNoWounds]));
// export const resultReductor = (x, y) => {
//   let prevChance  = x?.chance ? x.chance : 0;
//   let prevRawChance = x?.raw_chance ? x.raw_chance : 0;
//   //let prevCumulativeChance = x?.cumulative_chance ? x.cumulative_chance : 0;  // you cannot sum cumulative
//   return ({
//     id: y?.id,
//     player: 'fail',
//     wounds: 0,
//     raw_chance: (prevRawChance + y?.raw_chance),
//     chance: (prevChance + y?.chance),
//     //cumulative_chance: (prevCumulativeChance + y?.cumulative_chance),
//   })
// }
// export const squashResults = reduce(resultReductor, {}, failurePlayerWithNoWounds);
//export const sumChance = reduce(sum, 0, pluck('chance', __));
//
export const sumChance = pipe(pluck('chance'), sum)


export const woundsByChance = (x, y) => x + y['wounds'] * y['chance'];
export const woundsPerOrder = reduce(woundsByChance, 0, __);
