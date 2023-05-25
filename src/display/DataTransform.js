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
  pluck,
} from "ramda";

// Conditions
export const isActive = propEq('player', 'active');
export const isReactive = propEq('player', 'reactive');
export const isFailure = propEq('player', 'fail');
export const hasNoWounds = propSatisfies(x => x === 0, 'wounds');
export const hasWounds = propSatisfies(x => x >= 1, 'wounds');

// Utility functions
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
export const sumChance = pipe(pluck('chance'), sum)
export const sumRawChance = pipe(pluck('raw_chance'), sum)
export const woundsByChance = (x, y) => x + y['wounds'] * y['chance'];
export const woundsPerOrder = reduce(woundsByChance, 0, __);

// Data transformation functions
export const squashResults = (results, maxWoundsActive, maxWoundsReactive) => {
  let totalRawResults = sumRawChance(results);
  let activeResults = activePlayerWithWounds(results);
  let reactiveResults = reactivePlayerWithWounds(results);
  let activeResultsOverMax = filter(propSatisfies(x => x > maxWoundsActive, 'wounds'), activeResults);
  let activeOverMaxRawChance = sumRawChance(activeResultsOverMax);
  let reactiveResultsOverMax = filter(propSatisfies(x => x > maxWoundsReactive, 'wounds'), reactiveResults);
  let reactiveOverMaxRawChance = sumRawChance(reactiveResultsOverMax);

  let newResults = [];
  let idx = 0;
  // iterate over results and add to newResults
  for (let i = 0; i < results.length; i++) {
    if (results[i].player === 'active') {
      if (results[i].wounds < maxWoundsActive) {
        // add to newResults
        newResults.push(results[i]);
        idx++;
      } else if (results[i].wounds === maxWoundsActive) {
        if (activeOverMaxRawChance > 0) {
          let rawChance = results[i].raw_chance + activeOverMaxRawChance;
          newResults.push({
            id: idx,
            player: 'active',
            wounds: maxWoundsActive,
            raw_chance: rawChance,
            chance: rawChance / totalRawResults,
            cumulative_chance: rawChance / totalRawResults,
          });
        } else {
          newResults.push(results[i]);
        }
        idx++;
      } else {
        // Active result that is over maxWoundsActive, skip it
      }
    } else if (results[i].player === 'fail') {
      // add all failures to newResults
      newResults.push(results[i]);
      idx++;
    } else if (results[i].player === 'reactive') {
      if (results[i].wounds < maxWoundsReactive) {
        // add to newResults
        newResults.push(results[i]);
        idx++;
      } else if (results[i].wounds === maxWoundsReactive) {
        if (reactiveOverMaxRawChance > 0) {
          let rawChance = results[i].raw_chance + reactiveOverMaxRawChance;
          newResults.push({
            id: idx,
            player: 'reactive',
            wounds: maxWoundsReactive,
            raw_chance: rawChance,
            chance: rawChance / totalRawResults,
            cumulative_chance: rawChance / totalRawResults,
          });
        } else {
          newResults.push(results[i]);
        }
        idx++;
      } else {
        // reactive result that is over maxWoundsReactive, skip it
      }
    }
  }
  return newResults;
}
