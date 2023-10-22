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
  pluck, append, concat,
} from "ramda";

// Conditions
export const isActive = propEq('active', 'player');
export const isReactive = propEq('reactive', 'player');
export const isFailure = propEq('fail', 'player');
export const hasNoWounds = propSatisfies(x => x === 0, 'wounds');
export const hasWounds = propSatisfies(x => x >= 1, 'wounds');
export const oneWound = propSatisfies(x => x === 1, 'wounds');

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
export const activePlayerWithOneWound = filter(allPass([isActive, oneWound]));
export const reactivePlayerWithOneWound = filter(allPass([isReactive, oneWound]));
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
  let activeResultsExactlyMax = filter(propSatisfies(x => x === maxWoundsActive, 'wounds'), activeResults);
  let activeResultsUnderMax = filter(propSatisfies(x => x < maxWoundsActive, 'wounds'), activeResults);
  let activeOverMaxRawChance = sumRawChance(activeResultsOverMax);
  let reactiveResultsOverMax = filter(propSatisfies(x => x > maxWoundsReactive, 'wounds'), reactiveResults);
  let reactiveResultsExactlyMax = filter(propSatisfies(x => x === maxWoundsReactive, 'wounds'), reactiveResults);
  let reactiveResultsUnderMax = filter(propSatisfies(x => x < maxWoundsReactive, 'wounds'), reactiveResults);
  let reactiveOverMaxRawChance = sumRawChance(reactiveResultsOverMax);

  let newResults = [];

  // Add active < max
  newResults = concat(newResults, activeResultsUnderMax);

  // Add active == max
  if (activeResultsExactlyMax.length > 0) {
    if (activeOverMaxRawChance > 0) {
      let r = activeResultsExactlyMax[0];
      let rawChance = r.raw_chance + activeOverMaxRawChance;
      newResults = append({
        id: 0,
        player: 'active',
        wounds: maxWoundsActive,
        raw_chance: rawChance,
        chance: rawChance / totalRawResults,
        cumulative_chance: rawChance / totalRawResults,
      }, newResults);
    } else {
      newResults = append(activeResultsExactlyMax[0], newResults);
    }
  }

  // Add failures
  newResults = concat(newResults, failurePlayerWithNoWounds(results));

  // Add reactive < max
  newResults = concat(newResults, reactiveResultsUnderMax);

  // Add reactive == max
  if (reactiveResultsExactlyMax.length > 0) {
    if (reactiveOverMaxRawChance > 0) {
      let r = reactiveResultsExactlyMax[0];
      let rawChance = r.raw_chance + reactiveOverMaxRawChance;
      newResults = append({
        id: 0,
        player: 'reactive',
        wounds: maxWoundsReactive,
        raw_chance: rawChance,
        chance: rawChance / totalRawResults,
        cumulative_chance: rawChance / totalRawResults,
      }, newResults);
    } else {
      newResults = append(reactiveResultsExactlyMax[0], newResults);
    }
  }

  // Reindex results
  newResults = newResults.map((r, i) => {
    r.id = i;
    return r;
  });

  return newResults;
}
