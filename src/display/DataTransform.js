import {propEq, pipe, multiply, filter, sort, prop, ascend, descend} from "ramda";

export const oneDecimalPlace = (n, d=1) => n.toFixed(d);
export const twoDecimalPlaces = (n, d=2) => n.toFixed(d);
export const formatPercentage = pipe(multiply(100), oneDecimalPlace);
export const activePlayer = filter(propEq('player', 'active'));
export const reactivePlayer = filter(propEq('player', 'reactive'));
export const failurePlayer = filter(propEq('player', 'fail'));
export const ascendByWounds = sort(ascend(prop('wounds')));
export const descendByWounds = sort(descend(prop('wounds')));
