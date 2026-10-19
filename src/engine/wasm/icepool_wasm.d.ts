/* tslint:disable */
/* eslint-disable */

/**
 * Python's binary operators on dice (`Die.binary_operator` with `operator.add`, ...).
 */
export enum BinaryOp {
    Add = 0,
    Sub = 1,
    Mul = 2,
    TrueDiv = 3,
    FloorDiv = 4,
    Mod = 5,
    Pow = 6,
    LShift = 7,
    RShift = 8,
    And = 9,
    Or = 10,
    Xor = 11,
    Lt = 12,
    Le = 13,
    Gt = 14,
    Ge = 15,
    Eq = 16,
    Ne = 17,
}

/**
 * `Deck(outcomes, times)` once the TypeScript has itemized its arguments (creation_args.py `itemize`) and expanded
 * each (`expand_arg`: a die or deck stays a population, a tuple holding dice is their Cartesian product): each
 * argument with its time, a non-negative number. `build` merges them (`expand_args_for_deck`, `merge_duplicates`).
 */
export class DeckBuilder {
    free(): void;
    [Symbol.dispose](): void;
    build(): WasmDeck;
    /**
     * A deck, flattened into the result (`time` duplicates the whole deck).
     */
    deck(deck: WasmDeck, time: any): void;
    /**
     * A die: its outcomes, each duplicated by its quantity times `time`.
     */
    die(die: WasmDie, time: any): void;
    constructor();
    /**
     * An outcome: one card, times `time`.
     */
    outcome(outcome: any, time: any): void;
    /**
     * A tuple holding `Reroll`: `cartesian_product` makes it `Reroll` itself, which `expand_arg` passes on as it
     * is (it is not in `REROLL_TYPES` by then: the check came first), so `merge_duplicates` asks it for `items()`
     * unless its time is zero.
     */
    rerollTuple(time: any): void;
    /**
     * `Reroll` (or `Restart`): `expand_arg` makes it `{}`, no cards.
     */
    reroll(time: any): void;
}

/**
 * The arguments of a free function that takes dice and plain outcomes alike (`tupleize(d(6), 1)`), in order:
 * wasm-bindgen passes dice to Rust one by one, so the TypeScript adds each argument here.
 */
export class DiceArgs {
    free(): void;
    [Symbol.dispose](): void;
    /**
     * A die.
     */
    die(die: WasmDie): void;
    constructor();
    /**
     * A plain outcome.
     */
    outcome(outcome: any): void;
    /**
     * `pointwise_max` (`max`) / `pointwise_min` of dice whose denominators are already harmonized.
     */
    pointwise(max: boolean): WasmDie;
    /**
     * `cartesian_product(*args, outcome_type=tuple)` once the TypeScript has found a die among them: a die of
     * tuples.
     */
    tupleize(): WasmDie;
    /**
     * `cartesian_product(*args, outcome_type=Vector)` (`vectorize`), as `tupleize`.
     */
    vectorize(): WasmDie;
}

/**
 * `Die(outcomes, times)` once the TypeScript `Die` has itemized its arguments (creation_args.py `itemize`): each
 * element of `outcomes` with its weight (a time as `itemize` leaves it: a non-negative number, which must be an int
 * unless it is zero). `build` mixes them (`expand_args_for_die`).
 */
export class DieBuilder {
    free(): void;
    [Symbol.dispose](): void;
    build(): WasmDie;
    /**
     * A die, mixed in with its outcomes sharing the weight.
     */
    die(die: WasmDie, weight: any): void;
    constructor();
    /**
     * An outcome.
     */
    outcome(outcome: any, weight: any): void;
    /**
     * `Reroll` (or `Restart`): drops out.
     */
    reroll(weight: any): void;
}

/**
 * Builds the core's tree of one evaluation's inputs from the TypeScript's expressions, in postfix order (each node
 * after its children), then evaluates them. Tracing a multiset function's body fills one with what the body
 * returned: its raw results, each over nodes pushed before it (`multiset_function.rs`).
 */
export class ExpressionBuilder {
    free(): void;
    [Symbol.dispose](): void;
    /**
     * A binary operator (operator/binary.py) over the last `arity` nodes, by its class's name.
     */
    binary(name: string, arity: number): void;
    /**
     * `f.evaluate(*inputs, **kwargs)` of a multiset function over the last `inputs` nodes: its evaluations (see
     * `evaluator::evaluations_to_js`). All preparations are made before any is evaluated, as the program runner
     * does.
     */
    evaluateFunction(_function: any, inputs: number, kwargs: any): any;
    /**
     * `evaluator.evaluate(*inputs)` of a JS evaluator over the last `inputs` nodes: its evaluations (see
     * [`evaluations_to_js`]).
     */
    evaluateHost(evaluator: any, inputs: number): any;
    /**
     * `evaluator.evaluate(*inputs)` of the built-in evaluator `name` (with `params`, as for the Python facade's
     * `evaluate_builtin`) over the last `inputs` nodes: each prepared evaluation gives
     * `Die(final_outcomes, final_weights)`, and those are mixed by weight.
     */
    evaluate(name: string, params: any[], inputs: number): WasmDie;
    /**
     * `MultisetFilterOutcomesBinary`: the first node's count where the second's is positive (`!= invert`).
     */
    filterBinary(invert: boolean): void;
    /**
     * `MultisetFilterOutcomes` with a JS callable.
     */
    filterFunction(invert: boolean, f: any): void;
    /**
     * `MultisetFilterOutcomes` with a collection of outcomes (Python's `frozenset`).
     */
    filterSet(invert: boolean, outcomes: any[]): void;
    /**
     * `MultisetFloordivCounts(constant)`.
     */
    floordivCounts(constant: any): void;
    /**
     * `MultisetForceOrder(force_order)`.
     */
    forceOrder(force_order: number): void;
    /**
     * A keep generator (`_make_source`).
     */
    generator(g: WasmGenerator): void;
    /**
     * `MultisetKeepCounts(comparison, constant)` (the comparison already checked).
     */
    keepCounts(comparison: string, constant: any): void;
    /**
     * `MultisetKeep` with an index of another type (by its Python type name): it raises when evaluated.
     */
    keepInvalid(type_name: string): void;
    /**
     * `MultisetKeep` with a sequence index: ints, null for `...`.
     */
    keepSequence(counts: any[]): void;
    /**
     * `MultisetKeep` with a slice index (bounds ints or null; `step` whether one was given).
     */
    keepSlice(start: any, stop: any, step: boolean): void;
    /**
     * `MultisetMapCounts` over the last `arity` nodes, with this JS function.
     */
    mapCounts(f: any, arity: number): void;
    /**
     * `MultisetMaxPairEarly` (`early`) or `MultisetMaxPairLate`.
     */
    maxPair(early: boolean, max_order: number, pair_equal: boolean, keep: boolean): void;
    /**
     * `MultisetMixture` of the last `weights.len()` nodes, with these weights.
     */
    mixture(weights: any[]): void;
    /**
     * `MultisetModuloCounts(constant)`.
     */
    moduloCounts(constant: any): void;
    /**
     * A `MultiDeal` (`_make_source`): a multiset tuple generator.
     */
    multiDeal(md: WasmMultiDeal): void;
    /**
     * `MultisetMultiplyCounts(constant)`.
     */
    multiplyCounts(constant: any): void;
    constructor();
    /**
     * A `MultisetParameter` of the multiset function being traced: argument `arg_index` (its `star_index` element
     * if starred).
     */
    parameter(arg_index: number, star_index?: number | null): void;
    /**
     * A raw result of the built-in evaluator `name` (with `params`, as for `evaluate`) over the last `inputs`
     * nodes.
     */
    rawBuiltin(name: string, params: any[], inputs: number): void;
    /**
     * `convert_die_to_raw_result` of a result that is not an evaluation: a constant (`reroll` if it is a reroll
     * type).
     */
    rawConstant(value: any, reroll: boolean): void;
    /**
     * A raw result of a multiset function called on the last `inputs` nodes with these keyword arguments.
     */
    rawFunction(_function: any, inputs: number, kwargs: any): void;
    /**
     * A raw result of a JS evaluator over the last `inputs` nodes.
     */
    rawHost(evaluator: any, inputs: number): void;
    /**
     * `MultisetSortPairWhile`.
     */
    sortPairWhile(keep: boolean, comparison: string, sort_order: number, extra: string): void;
    /**
     * `MultisetSortPair` (`sort_order` already `Descending` if `Any` was given).
     */
    sortPair(comparison: string, sort_order: number, extra: string): void;
    /**
     * `MultisetTupleIndex(child, index=index)` of the multiset tuple expression just pushed.
     */
    tupleIndex(index: any): void;
    /**
     * A `MultisetTupleParameter`: argument `arg_index`, a multiset tuple expression of `len` multisets.
     */
    tupleParameter(arg_index: number, len: number): void;
    /**
     * `MultisetTupleSlice(child, index=slice(start, stop, step))` of the multiset tuple expression just pushed.
     */
    tupleSlice(start: any, stop: any, step: any): void;
    /**
     * `MultisetUnique(constant)`.
     */
    unique(constant: any): void;
    /**
     * `MultisetVersus(lexi_tuple, order)`.
     */
    versus(lexi_tuple: Int32Array, versus_order: number): void;
    /**
     * `WeightlessGenerator(generator)` of the generator just pushed.
     */
    weightless(): void;
}

/**
 * `Pool(dice, times)` once the TypeScript has itemized its arguments and converted each element to a die
 * (`implicit_convert_to_die`): each die with its count, in order. `build` makes the pool.
 */
export class PoolBuilder {
    free(): void;
    [Symbol.dispose](): void;
    /**
     * A die put in `count` times (a time of `itemize`, already checked to be a non-negative number).
     */
    add(die: WasmDie, count: any): void;
    build(): WasmGenerator;
    constructor();
}

/**
 * Python's unary operators on dice (`Die.unary_operator` with `operator.neg`, `math.floor`, ...).
 */
export enum UnaryOp {
    Neg = 0,
    Pos = 1,
    Invert = 2,
    Abs = 3,
    Trunc = 4,
    Floor = 5,
    Ceil = 6,
}

/**
 * A deck of the core.
 */
export class WasmDeck {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    /**
     * `deck.append(outcome, quantity)`.
     */
    append(outcome: any, quantity: any): WasmDeck;
    /**
     * Another handle on the same deck.
     */
    copy(): WasmDeck;
    /**
     * `deck <op> other` with `Counter(other)` of an iterable: its elements, counted.
     */
    counterElements(op: string, elements: any[]): WasmDeck;
    /**
     * `deck <op> other` with `Counter(other)` of a mapping: its keys with their int counts.
     */
    counterMapping(op: string, keys: any[], counts: any[]): WasmDeck;
    /**
     * `deck <op> other` for another deck or a die (a mapping of its quantities).
     */
    counterPopulation(op: string, other: WasmDie): WasmDeck;
    /**
     * `Deal(deck, hand_size)` for an int (the TypeScript checks the type).
     */
    deal(hand_size: any): WasmGenerator;
    /**
     * `deck == other`: their `hash_key`s `(Deck, tuple(items))`.
     */
    equals(other: WasmDeck): boolean;
    /**
     * `format(deck, spec)` (`''` is `str(deck)`, its table).
     */
    format(spec: string): string;
    /**
     * `MultiDeal(deck, hand_groups)`: `[hand_size, group_size, ...]` flat, ints (the TypeScript checks).
     */
    multiDeal(hand_groups: any[]): WasmMultiDeal;
    /**
     * `deck.pad_to_denominator(denominator, outcome)`.
     */
    padToDenominator(denominator: any, outcome: any): WasmDeck;
    /**
     * The cards as a die, for the `Population` methods a deck shares with a die.
     */
    population(): WasmDie;
    /**
     * `deck.multiply_quantities(n)` (`deck * n`), `divide_quantities` (`//`) or `modulo_quantities` (`%`) by
     * name, for an int `n`.
     */
    quantities(op: string, n: any): WasmDeck;
    /**
     * `deck.remove(outcome, quantity)`: `null` removes all of it.
     */
    remove(outcome: any, quantity: any): WasmDeck;
    /**
     * `repr(deck)`: `Deck({outcome!r: quantity, ...})`.
     */
    repr(): string;
    /**
     * `deck.sequence(deals)` for `deals >= 1` (the TypeScript checks the rest, and Python's cache): the sequences
     * of `deals` cards dealt one by one, as a die of tuples.
     *
     * Python builds them step by step from `Die([()])`: each step maps every sequence so far to the die of the
     * cards left (`Die(self - curr)`) appended to it.
     */
    sequence(deals: number): WasmDie;
    /**
     * `deck.split(which)` once the TypeScript has selected the outcomes (one flag per outcome): `[selected,
     * rest]`.
     */
    split(mask: Uint8Array): WasmDeck[];
    /**
     * `deck.zero()`.
     */
    zero(): WasmDeck;
}

/**
 * A die of the core. JS frees it with `free()` (the TypeScript `Die` does so on `dispose`, or when it is
 * garbage-collected).
 */
export class WasmDie {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    /**
     * `die.append(outcome, quantity)`: that much more of the outcome (a negative quantity removes, down to zero).
     */
    append(outcome: any, quantity: any): WasmDie;
    /**
     * `self <op> other` outcome by outcome (`Die.binary_operator`).
     */
    binary(op: BinaryOp, other: WasmDie): WasmDie;
    /**
     * `die.clip(min, max)` (`null` for no bound).
     */
    clip(min: any, max: any): WasmDie;
    /**
     * `die.cmp(other)`: 1, -1 or 0 per pair of outcomes.
     */
    cmp(other: WasmDie): WasmDie;
    /**
     * `die.common_outcome_length()`: a number, or `null`.
     */
    commonOutcomeLength(): number | undefined;
    /**
     * A new `WasmDie` of this die, for a JS callback's result the core takes over (taking it empties the JS
     * object, so the callback hands over a copy rather than a die of the API).
     */
    copy(): WasmDie;
    correlation(i: any, j: any): any;
    /**
     * `die.covariance(i, j)` of two elements of tuple outcomes.
     */
    covariance(i: any, j: any): any;
    cramerVonMises(other: WasmDie): any;
    /**
     * `icepool.d(sides)`.
     */
    static d(sides: any): WasmDie;
    denominator(): any;
    /**
     * `die.divide_quantities(divisor)`.
     */
    divideQuantities(divisor: any): WasmDie;
    /**
     * The die with no outcomes (`Die([])`, `Die([Reroll])`).
     */
    static empty(): WasmDie;
    entropy(base: any): any;
    /**
     * `die.equals(other, simplify=simplify)` for another die.
     */
    equals(other: WasmDie, simplify: boolean): boolean;
    /**
     * population/again.py `evaluate_agains_using_count` once the TypeScript has checked `again_count`, built
     * `not_again_die` (the outcomes that are not `Again`), its `zero` outcome, `step_die` (one tupleized step
     * outcome per face) and `again_end_die` (ignored when `restart`, for `again_end=Restart`).
     */
    static evaluateAgainsUsingCount(step_die: WasmDie, not_again_die: WasmDie, zero: any, again_count: number, again_end_die: WasmDie, restart: boolean): WasmDie;
    excessKurtosis(): any;
    /**
     * `format(die, spec)` (`''` is `str(die)`); `type_name` is Python's `type(die).__name__` (`Die`, or
     * `DieWithTruth` for the result of `==` / `!=`).
     */
    format(spec: string, type_name: string): string;
    /**
     * The quantity of an outcome (a `KeyError` if it is not one). Python looks it up in a dict, which hashes
     * the key first.
     */
    get(outcome: any): any;
    /**
     * `outcome[index]` for each outcome, in order (the keys of `die.group_by[index]`).
     */
    getitems(index: any): any[];
    /**
     * `die.group_by(...)` given each outcome's key (plain values): `[key, die]` pairs for each distinct key (by
     * Python's `==`), in order of first appearance.
     */
    groupBy(keys: any[]): any[];
    /**
     * `outcome in die`.
     */
    has(outcome: any): boolean;
    /**
     * `[outcome, quantity]` pairs in sorted order, zero quantities included.
     */
    items(): any[];
    /**
     * `die._highest_single(rolls)` (`highest`) or `_lowest_single(rolls)` for an int `rolls > 0` (the TypeScript
     * makes `rolls == 0` `zero().simplify()`): `from_cumulative` over each cumulative quantity `** rolls`. The
     * core refuses results no memory holds (`MemoryError`), and a die whose quantities are all 0 or 1 answers for
     * any number of rolls, as Python does.
     */
    keepSingle(rolls: any, highest: boolean): WasmDie;
    kolmogorovSmirnov(other: WasmDie): any;
    /**
     * `die.marginals[start:stop:step]`.
     */
    marginalSlice(start: any, stop: any, step: any): WasmDie;
    /**
     * `die.marginals[index]`.
     */
    marginal(index: any): WasmDie;
    /**
     * `len(die.marginals)`.
     */
    marginalsLength(): number;
    /**
     * `self @ die`: roll this die, then roll `die` that many times and sum.
     */
    matmul(die: WasmDie): WasmDie;
    maxOutcome(): any;
    /**
     * `die.mean_time_to_sum(target)`, extending this die's cache as Python's loop does.
     */
    meanTimeToSum(target: any): any;
    mean(): any;
    /**
     * `outcome in collection` for each outcome (`_select_outcomes` given a collection): Python's `==` between the
     * collection's elements and the outcome, element by element.
     */
    memberships(collection: any[]): Uint8Array;
    minOutcome(): any;
    modalQuantity(): any;
    /**
     * `die.mode()`: a tuple of the outcomes with the highest quantity.
     */
    mode(): any;
    /**
     * `die.modulo_quantities(divisor)`.
     */
    moduloQuantities(divisor: any): WasmDie;
    /**
     * `die.multiply_quantities(scale)`.
     */
    multiplyQuantities(scale: any): WasmDie;
    /**
     * `die.multiply_to_denominator(denominator)`.
     */
    multiplyToDenominator(denominator: any): WasmDie;
    /**
     * `die.nearest(comparison, outcome)`: `null` if no outcome fits.
     */
    nearest(comparison_: string, outcome: any): any;
    /**
     * The outcomes in sorted order.
     */
    outcomes(): any[];
    /**
     * `die.pad_to_denominator(denominator, outcome)`.
     */
    padToDenominator(denominator: any, outcome: any): WasmDie;
    /**
     * `die.probabilities(comparison, percent=percent)`.
     */
    probabilities(comparison_: string | null | undefined, percent: boolean): any;
    /**
     * `die.probability_where(..., percent=percent)` once the selection is known.
     */
    probabilityWhere(mask: Uint8Array, percent: boolean): any;
    /**
     * `die.probability(comparison, outcome, percent=percent)`.
     */
    probability(comparison_: string | null | undefined, outcome: any, percent: boolean): any;
    quantileHigh(n: any, d: any): any;
    quantileLow(n: any, d: any): any;
    /**
     * `die.quantile(n, d)` (`median` is `quantile(1, 2)`).
     */
    quantile(n: any, d: any): any;
    /**
     * `tuple(die.quantities(comparison))`.
     */
    quantities(comparison_?: string | null): any[];
    /**
     * `die.quantity_where(...)` once the selection is known.
     */
    quantityWhere(mask: Uint8Array): any;
    /**
     * `die.quantity(comparison, outcome)`.
     */
    quantity(comparison_: string | null | undefined, outcome: any): any;
    /**
     * `die.remove(outcome, quantity)`: that much less of the outcome; `null` removes all of it.
     */
    remove(outcome: any, quantity: any): WasmDie;
    /**
     * `repr(die)`: `Die({outcome!r: quantity, ...})`, or `DieWithTruth(...)`.
     */
    repr(type_name: string): string;
    /**
     * `die.reroll(...)` once the selection is known: the selected outcomes are rerolled up to `depth` times
     * (`undefined`: until they stop coming up).
     */
    reroll(mask: Uint8Array, depth?: number | null): WasmDie;
    /**
     * `round(die, ndigits)`: each outcome rounded (so a bad `ndigits` only raises if there is an outcome).
     */
    round(ndigits: any): WasmDie;
    /**
     * `[die.sample() for _ in range(n)]` after Python's `random.seed(seed)` (an int seed).
     */
    sample(seed: any, n: number): any[];
    /**
     * `die.sequence(rolls)` for `rolls >= 1`: the die of the tuples of `rolls` rolls in order (`MemoryError` past
     * what memory holds).
     */
    sequence(rolls: any): WasmDie;
    /**
     * `die.sign()`.
     */
    sign(): WasmDie;
    /**
     * `die.simplify()`.
     */
    simplify(): WasmDie;
    /**
     * `Die([outcome])`.
     */
    static single(outcome: any): WasmDie;
    skewness(): any;
    /**
     * `die.split(...)` once the selection is known: `[selected, rest]`.
     */
    split(mask: Uint8Array): WasmDie[];
    standardDeviation(): any;
    standardizedMoment(k: any): any;
    /**
     * `die.to_one_hot(outcomes)` once the TypeScript has looked each of this die's outcomes up in `outcomes`
     * (Python's `in` and `index`): `positions` holds the index of each, or -1 for one not there; `len` is
     * `len(outcomes)`.
     */
    toOneHot(len: number, positions: Int32Array): WasmDie;
    /**
     * `die.truncate(min, max)` (`null` for no bound).
     */
    truncate(min: any, max: any): WasmDie;
    /**
     * `<op> self` outcome by outcome (`Die.unary_operator`).
     */
    unary(op: UnaryOp): WasmDie;
    variance(): any;
    /**
     * `icepool.z(sides)`.
     */
    static z(sides: any): WasmDie;
    /**
     * `die.zero_outcome()`: `self.zero().outcomes()[0]`.
     */
    zeroOutcome(): any;
    /**
     * `die.zero()`.
     */
    zero(): WasmDie;
    /**
     * The number of outcomes.
     */
    readonly size: number;
}

/**
 * A keep generator of the core, held by the TypeScript `Pool` (and the other keep generators it makes).
 */
export class WasmGenerator {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    /**
     * `CompoundKeepGenerator(generators, (1, ) * sum(generator.keep_size() for generator in generators))`: the
     * additive union of keep generators without negative keeps.
     */
    static compound(generators: WasmGenerator[]): WasmGenerator;
    /**
     * Another handle on the same generator, for a call that takes generators by value.
     */
    copy(): WasmGenerator;
    /**
     * `[repr(deal), str(deal)]`.
     */
    dealStrs(): string[];
    /**
     * `deck()`.
     */
    deck(): WasmDeck;
    /**
     * `denominator()` (also a deal's).
     */
    denominator(): any;
    /**
     * `_dice`: the `(die, count)` pairs (in `hash_key` order), as `[die, count, die, count, ...]`.
     */
    dice(): any[];
    /**
     * `hand_size()`.
     */
    handSize(): number;
    /**
     * `has_negative_keeps()`.
     */
    hasNegativeKeeps(): boolean;
    /**
     * Whether this is a `Deal` (neither: a `CompoundKeepGenerator`).
     */
    isDeal(): boolean;
    /**
     * Whether this is a `Pool`.
     */
    isPool(): boolean;
    /**
     * `keep(int)` up to the generator Python then evaluates into a die (the keep evaluator, `evaluate.rs`).
     */
    keepIndex(index: any): WasmGenerator;
    /**
     * `keep(sequence)`: one count per element, `null` for `...`.
     */
    keepSequence(counts: any[]): WasmGenerator;
    /**
     * `keep_size()`.
     */
    keepSize(): any;
    /**
     * `keep(slice(start, stop, step))`: the bounds as ints (or null), `step` whether one was given (an
     * `IndexError`).
     */
    keepSlice(start: any, stop: any, step: boolean): WasmGenerator;
    /**
     * `keep_tuple()`.
     */
    keepTuple(): any[];
    /**
     * `Pool.additive_union` of pools: one pool if every sorted position counts the same, else `undefined` (the
     * TypeScript goes on to `KeepGenerator.additive_union`).
     */
    static mergePools(generators: WasmGenerator[]): WasmGenerator | undefined;
    /**
     * `multiply_counts(constant)` (also `generator * n` and `-generator`).
     */
    multiplyCounts(constant: any): WasmGenerator;
    /**
     * `outcomes()`: the union of the dice's outcomes, ascending (dice put in zero times included).
     */
    outcomes(): any;
    /**
     * `raw_size()`: the number of dice before the keep tuple is applied.
     */
    rawSize(): number;
    /**
     * Whether the two have equal `hash_key`s (a `MultisetMixture` counts equal inners as one).
     */
    sameKey(other: WasmGenerator): boolean;
    /**
     * `str(generator)`: `Pool.__str__`, `Deal.__str__` or `CompoundKeepGenerator.__str__`.
     */
    toString(): string;
}

/**
 * A multi-deal of the core: a multiset tuple generator, under the TypeScript `MultiDeal`.
 */
export class WasmMultiDeal {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    /**
     * `deck()`.
     */
    deck(): WasmDeck;
    /**
     * `denominator()`.
     */
    denominator(): any;
    /**
     * `hand_sizes()`.
     */
    handSizes(): Uint32Array;
    /**
     * Whether the two have equal `hash_key`s `(MultiDeal, deck, hand_groups)`.
     */
    sameKey(other: WasmMultiDeal): boolean;
    /**
     * `[repr(multi_deal), str(multi_deal)]`.
     */
    strs(): string[];
    /**
     * `total_cards_dealt()`.
     */
    totalCardsDealt(): number;
    /**
     * `len(multi_deal)`: the number of hands.
     */
    readonly length: number;
}

/**
 * `absorbing_markov_chain_impl(transition_cache, initial_state)` once the TypeScript has made `initial_die =
 * Die([initial_state])`: `[absorption die, mean absorption time]`, the time a `Fraction`, or `null` if a `Restart`
 * was possible.
 */
export function absorbingMarkovChain(transition: any, extra_quantities: any[], initial_die: WasmDie): any[];

/**
 * `[make_step_outcome(outcome) for outcome in outcomes]` of `evaluate_agains_using_count`, before tupleizing:
 * `[zero, 1, -1]` for an outcome that is not an expression, `[outcome._evaluate(zero), 0, outcome._again_count()
 * - 1]` for an additive one (a `ValueError` for any other). `Die(...)` then tupleizes these arrays as Python's
 * `make_step_outcome` does.
 */
export function againStepOutcomes(outcomes: any[], zero: any): any[];

/**
 * khepri's `f2f.calculate`: the engine input object in,
 * `{rolls, outcomes: [{player, wounds, chance}, ...]}` out. Throws an `Error` where Python raises.
 *
 * `rolls` is a Number when it is a safe integer and a BigInt beyond 2**53, as Pyodide's `to_js` converts a Python
 * int. `chance` is `float(Fraction(q, denominator))`, bit for bit.
 */
export function calculate(engine_input: any): any;

/**
 * The `dict` items of `coin(n, d)` (ints, once a non-int numerator has become a Fraction's numerator and
 * denominator), as `[outcome, quantity]` pairs.
 */
export function coinData(n: any, d: any): any[];

/**
 * `consecutive(*args)` given what each of its two chains over the arguments yields.
 */
export function consecutive(first: any[], second: any[]): any;

/**
 * The keys of a Python dict literal `{k0: ..., k1: ..., ...}` with plain-value keys: for each key, the index of the
 * first key equal to it (itself if none is), as Python's dict keeps the first spelling of a key (and the last
 * value). Keys must be hashable; equal keys are those Python's `==` (and hash) find equal: `1`, `1.0` and `true`
 * are one key, as are two arrays with equal elements.
 */
export function dictKeys(keys: any[]): Uint32Array;

/**
 * `mapping.get(x)` for each of `xs`, in a dict with these distinct plain keys: the index of the key equal to each
 * (Python's `==` and hash), or -1 for none. Each `x` must be hashable, as Python's lookup requires.
 */
export function dictLookup(keys: any[], xs: any[]): Int32Array;

/**
 * `evaluate_agains_using_depth(outcomes, times, again_depth, again_end)` after the TypeScript has checked
 * `again_depth`, replaced a `null` `again_end` with the zero outcome and rejected `Restart`: `end_is_reroll` for
 * `again_end=Reroll` (every expression at the innermost level becomes `reroll`, the JS `Reroll`). Returns the
 * TypeScript die.
 */
export function evaluateAgainsUsingDepth(outcomes: any[], times: any[], again_depth: number, again_end: any, end_is_reroll: boolean, reroll: any): any;

/**
 * `explode_to_pool`'s `count_die = rolls @ Die(single_data)` once the TypeScript has split `die` into `explode` and
 * `not_explode` and checked `depth` (an int): a die of `Vector((exploded, not_exploded))` counts.
 */
export function explodeCounts(die: WasmDie, explode: WasmDie, not_explode: WasmDie, rolls: any, depth: any): WasmDie;

/**
 * `format_probability_inverse(probability, int_start)`.
 */
export function formatProbabilityInverse(probability: any, int_start: any): string;

/**
 * `Fraction(x)`, limited to `max_denominator` unless that is `null` (`Fraction.limit_denominator`), as its
 * `[numerator, denominator]` (ints): what `coin` does with a non-int numerator.
 */
export function fractionParts(x: any, max_denominator: any): any[];

/**
 * The weights of creation_args.py `itemize(keys, times)` once the TypeScript has one time per key: each time,
 * multiplied by the mapping's value for that key when there is one (`base`: `v * x`), then checked as Python's
 * `any(x < 0 for x in times)` checks them (a `TypeError` for anything that is not a number, a `ValueError` for a
 * negative one).
 */
export function itemizeTimes(base: any[] | null | undefined, times: any[]): any[];

/**
 * population/keep.py `highest_slice(keep, drop)` (`highest`) or `lowest_slice(keep, drop)`: `[start, stop]`,
 * null for no bound. `keep` and `drop` are ints or null.
 */
export function keepDropSlice(highest: boolean, keep: any, drop: any): any[];

/**
 * keep.py `_highest_single(*dice)` (`highest`) or `_lowest_single(*dice)`: roll all the dice (at least one, none
 * empty) and take the highest (lowest) single one. wasm-bindgen takes the dice over, so the TypeScript passes
 * copies.
 */
export function keepSingleOf(dice: WasmDie[], highest: boolean): WasmDie;

/**
 * lexi.py `compute_lexi_tuple(comparison, order)`, for `max_pair_keep` / `max_pair_drop`.
 */
export function lexiTuple(comparison: string, order: number): Int32Array;

/**
 * lexi.py `compute_lexi_tuple_with_zero_right_first(comparison)`, for `versus_all` / `versus_any`: the tuple,
 * then the order.
 */
export function lexiTupleZeroRightFirst(comparison: string): Int32Array;

/**
 * How many dice JS holds (for leak checks).
 */
export function liveDice(): number;

/**
 * `map_and_time(...)` from `initial_die = Die([initial_state])`: the die of `(state, time)`; `repeat` as for
 * `mapRepeat` (a negative one is 0: `range` is then empty).
 */
export function mapAndTime(transition: any, extra_quantities: any[], initial_die: WasmDie, repeat?: number | null): WasmDie;

/**
 * The `else` branch of `map(repeat=repeat)` (a `repeat` that is not infinite, negative or zero), from
 * `initial_die = Die([first_arg])`; `repeat` is `undefined` where `range(repeat)` raises (a non-int).
 */
export function mapRepeat(transition: any, extra_quantities: any[], initial_die: WasmDie, repeat?: number | null): WasmDie;

/**
 * `KeepGenerator.middle(keep, tie=tie)` up to the slice it keeps of `keep_size` elements: `[start, stop]`.
 */
export function middleSlice(keep_size: any, keep: any, tie: any): any[];

/**
 * Python's `min(items)` (`max` false) or `max(items)` (`min_outcome` / `max_outcome`).
 */
export function minMax(items: any[], max: boolean): any;

/**
 * `one_hot(sides)`.
 */
export function oneHot(sides: any): WasmDie;

/**
 * Python's `sorted(values)` (wallenius.py sorts the weights pulled).
 */
export function pySorted(values: any[]): any;

/**
 * After a trap (a Rust panic: WASM has no unwinding), once JS has left every call into the instance: resets the
 * core's per-call state, which the trap skipped the destructors of, and returns the panic's message (empty if
 * none was recorded).
 */
export function recover(): string;

/**
 * `reroll_to_pool`'s `pool_composition` for a finite `max_rerolls` (`depth` already resolved: `'inf'` is
 * `max_rerolls`): a die of `(rerollable, rerolled, rerolled_to_rerollable)` tuples. `rerollable` is the rerollable
 * half of `die` after `split`. The counts are Python values, so all arithmetic on them is `Value`'s.
 */
export function rerollComposition(die: WasmDie, rerollable: WasmDie, rolls: any, max_rerolls: any, depth: any): WasmDie;

/**
 * `len([None] * len[start:stop:step])`: the `len()` of a slice of a multiset tuple expression of `len` multisets
 * (`MultisetTupleSlice.__len__`); the bounds as Python takes them (ints, None, or anything else to raise).
 */
export function sliceLength(len: number, start: any, stop: any, step: any): number;

/**
 * `sorted_union(*args)` given the elements of each argument (an array per argument).
 */
export function sortedUnion(args: any[]): any;

/**
 * The instance's shadow stack pointer, the `WebAssembly.Global` `__stack_pointer` (exported by build.rs), or
 * `undefined`. Rust keeps its frames' locals on this stack in linear memory; a trap abandons them without
 * popping them, so the JS facade saves its value before each outermost call and puts it back after a trap.
 */
export function stack_pointer(): any;

/**
 * `d_pool` of a mapping builds `itertools.chain.from_iterable([k] * v for k, v in die_sizes.items())`: the
 * length of that list once `count` more copies of a size are added to the `len` it has (a negative count adds
 * none), or Python's `MemoryError` past what memory holds (as the program runner checks it).
 */
export function standardPoolLength(len: number, count: any): number;

/**
 * Runs when the module is instantiated: panics record their message (the default hook would print it to a
 * console the caller may not see, and the trap itself only says "unreachable").
 */
export function start(): void;

/**
 * `Symbols(x)` for a string (parsed: the characters after a dash count negatively), an iterable of characters (`x`
 * an array), or a mapping (`mapping`: `x` its `[key, count]` pairs).
 */
export function symbolsFrom(x: any, mapping: boolean): any;

/**
 * A `Symbols`' method `name` (snake_case) or protocol (see `protocol`), with one argument (`count_subset`: the
 * array `[divisor, empty_divisor]`; `count_subset_mapping`: a mapping's `[key, count]` items; `getattr`:
 * `s.<arg>`, which is `s[arg]` for a public name).
 */
export function symbolsMethod(s: any, name: string, arg: any): any;

/**
 * `a <op> b` for two plain values.
 */
export function valueBinary(op: BinaryOp, a: any, b: any): any;

/**
 * Python's `repr(a)` for a plain value.
 */
export function valueRepr(a: any): string;

/**
 * `round(a, ndigits)` for a plain value.
 */
export function valueRound(a: any, ndigits: any): any;

/**
 * Python's `str(a)` for a plain value.
 */
export function valueStr(a: any): string;

/**
 * Python's `bool(a)` for a plain value (a Vector from a comparison has its truth value; Symbols theirs).
 */
export function valueTruth(a: any): boolean;

/**
 * `<op> a` for a plain value.
 */
export function valueUnary(op: UnaryOp, a: any): any;

/**
 * A `Vector`'s method `name` (`append`, `concatenate`) or protocol (see `protocol`), with one argument.
 */
export function vectorMethod(v: any, name: string, arg: any): any;

/**
 * math.py `weighted_lcm(denominators, weights)`: the scale factor for each die (`harmonize_denominators`), given
 * what each of Python's two `zip(denominators, weights)` passes takes from the weights.
 */
export function weightedLcm(denominators: any[], weights: any[], weights_again: any[]): any[];

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
    readonly memory: WebAssembly.Memory;
    readonly __wbg_deckbuilder_free: (a: number, b: number) => void;
    readonly __wbg_diceargs_free: (a: number, b: number) => void;
    readonly __wbg_diebuilder_free: (a: number, b: number) => void;
    readonly __wbg_expressionbuilder_free: (a: number, b: number) => void;
    readonly __wbg_poolbuilder_free: (a: number, b: number) => void;
    readonly __wbg_wasmdeck_free: (a: number, b: number) => void;
    readonly __wbg_wasmdie_free: (a: number, b: number) => void;
    readonly __wbg_wasmgenerator_free: (a: number, b: number) => void;
    readonly __wbg_wasmmultideal_free: (a: number, b: number) => void;
    readonly absorbingMarkovChain: (a: any, b: number, c: number, d: number) => [number, number, number, number];
    readonly againStepOutcomes: (a: number, b: number, c: any) => [number, number, number, number];
    readonly calculate: (a: any) => [number, number, number];
    readonly coinData: (a: any, b: any) => [number, number, number, number];
    readonly consecutive: (a: number, b: number, c: number, d: number) => [number, number, number];
    readonly deckbuilder_build: (a: number) => [number, number, number];
    readonly deckbuilder_deck: (a: number, b: number, c: any) => [number, number];
    readonly deckbuilder_die: (a: number, b: number, c: any) => [number, number];
    readonly deckbuilder_new: () => number;
    readonly deckbuilder_outcome: (a: number, b: any, c: any) => [number, number];
    readonly deckbuilder_reroll: (a: number, b: any) => [number, number];
    readonly deckbuilder_rerollTuple: (a: number, b: any) => [number, number];
    readonly diceargs_die: (a: number, b: number) => void;
    readonly diceargs_new: () => number;
    readonly diceargs_outcome: (a: number, b: any) => [number, number];
    readonly diceargs_pointwise: (a: number, b: number) => [number, number, number];
    readonly diceargs_tupleize: (a: number) => [number, number, number];
    readonly diceargs_vectorize: (a: number) => [number, number, number];
    readonly dictKeys: (a: number, b: number) => [number, number, number, number];
    readonly dictLookup: (a: number, b: number, c: number, d: number) => [number, number, number, number];
    readonly diebuilder_build: (a: number) => [number, number, number];
    readonly diebuilder_die: (a: number, b: number, c: any) => [number, number];
    readonly diebuilder_new: () => number;
    readonly diebuilder_outcome: (a: number, b: any, c: any) => [number, number];
    readonly diebuilder_reroll: (a: number, b: any) => [number, number];
    readonly evaluateAgainsUsingDepth: (a: number, b: number, c: number, d: number, e: number, f: any, g: number, h: any) => [number, number, number];
    readonly explodeCounts: (a: number, b: number, c: number, d: any, e: any) => [number, number, number];
    readonly expressionbuilder_binary: (a: number, b: number, c: number, d: number) => [number, number];
    readonly expressionbuilder_evaluate: (a: number, b: number, c: number, d: number, e: number, f: number) => [number, number, number];
    readonly expressionbuilder_evaluateFunction: (a: number, b: any, c: number, d: any) => [number, number, number];
    readonly expressionbuilder_evaluateHost: (a: number, b: any, c: number) => [number, number, number];
    readonly expressionbuilder_filterBinary: (a: number, b: number) => [number, number];
    readonly expressionbuilder_filterFunction: (a: number, b: number, c: any) => [number, number];
    readonly expressionbuilder_filterSet: (a: number, b: number, c: number, d: number) => [number, number];
    readonly expressionbuilder_floordivCounts: (a: number, b: any) => [number, number];
    readonly expressionbuilder_forceOrder: (a: number, b: number) => [number, number];
    readonly expressionbuilder_generator: (a: number, b: number) => [number, number];
    readonly expressionbuilder_keepCounts: (a: number, b: number, c: number, d: any) => [number, number];
    readonly expressionbuilder_keepInvalid: (a: number, b: number, c: number) => [number, number];
    readonly expressionbuilder_keepSequence: (a: number, b: number, c: number) => [number, number];
    readonly expressionbuilder_keepSlice: (a: number, b: any, c: any, d: number) => [number, number];
    readonly expressionbuilder_mapCounts: (a: number, b: any, c: number) => [number, number];
    readonly expressionbuilder_maxPair: (a: number, b: number, c: number, d: number, e: number) => [number, number];
    readonly expressionbuilder_mixture: (a: number, b: number, c: number) => [number, number];
    readonly expressionbuilder_moduloCounts: (a: number, b: any) => [number, number];
    readonly expressionbuilder_multiDeal: (a: number, b: number) => void;
    readonly expressionbuilder_multiplyCounts: (a: number, b: any) => [number, number];
    readonly expressionbuilder_new: () => number;
    readonly expressionbuilder_parameter: (a: number, b: number, c: number) => void;
    readonly expressionbuilder_rawBuiltin: (a: number, b: number, c: number, d: number, e: number, f: number) => [number, number];
    readonly expressionbuilder_rawConstant: (a: number, b: any, c: number) => void;
    readonly expressionbuilder_rawFunction: (a: number, b: any, c: number, d: any) => [number, number];
    readonly expressionbuilder_rawHost: (a: number, b: any, c: number) => [number, number];
    readonly expressionbuilder_sortPair: (a: number, b: number, c: number, d: number, e: number, f: number) => [number, number];
    readonly expressionbuilder_sortPairWhile: (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => [number, number];
    readonly expressionbuilder_tupleIndex: (a: number, b: any) => [number, number];
    readonly expressionbuilder_tupleParameter: (a: number, b: number, c: number) => void;
    readonly expressionbuilder_tupleSlice: (a: number, b: any, c: any, d: any) => [number, number];
    readonly expressionbuilder_unique: (a: number, b: any) => [number, number];
    readonly expressionbuilder_versus: (a: number, b: number, c: number, d: number) => [number, number];
    readonly expressionbuilder_weightless: (a: number) => [number, number];
    readonly formatProbabilityInverse: (a: any, b: any) => [number, number, number, number];
    readonly fractionParts: (a: any, b: any) => [number, number, number, number];
    readonly itemizeTimes: (a: number, b: number, c: number, d: number) => [number, number, number, number];
    readonly keepDropSlice: (a: number, b: any, c: any) => [number, number, number, number];
    readonly keepSingleOf: (a: number, b: number, c: number) => [number, number, number];
    readonly lexiTuple: (a: number, b: number, c: number) => [number, number, number, number];
    readonly lexiTupleZeroRightFirst: (a: number, b: number) => [number, number, number, number];
    readonly liveDice: () => number;
    readonly mapAndTime: (a: any, b: number, c: number, d: number, e: number) => [number, number, number];
    readonly mapRepeat: (a: any, b: number, c: number, d: number, e: number) => [number, number, number];
    readonly middleSlice: (a: any, b: any, c: any) => [number, number, number, number];
    readonly minMax: (a: number, b: number, c: number) => [number, number, number];
    readonly oneHot: (a: any) => [number, number, number];
    readonly poolbuilder_add: (a: number, b: number, c: any) => [number, number];
    readonly poolbuilder_build: (a: number) => [number, number, number];
    readonly poolbuilder_new: () => number;
    readonly pySorted: (a: number, b: number) => [number, number, number];
    readonly recover: () => [number, number];
    readonly rerollComposition: (a: number, b: number, c: any, d: any, e: any) => [number, number, number];
    readonly sliceLength: (a: number, b: any, c: any, d: any) => [number, number, number];
    readonly sortedUnion: (a: number, b: number) => [number, number, number];
    readonly stack_pointer: () => any;
    readonly standardPoolLength: (a: number, b: any) => [number, number, number];
    readonly start: () => void;
    readonly symbolsFrom: (a: any, b: number) => [number, number, number];
    readonly symbolsMethod: (a: any, b: number, c: number, d: any) => [number, number, number];
    readonly valueBinary: (a: number, b: any, c: any) => [number, number, number];
    readonly valueRepr: (a: any) => [number, number, number, number];
    readonly valueRound: (a: any, b: any) => [number, number, number];
    readonly valueStr: (a: any) => [number, number, number, number];
    readonly valueTruth: (a: any) => [number, number, number];
    readonly valueUnary: (a: number, b: any) => [number, number, number];
    readonly vectorMethod: (a: any, b: number, c: number, d: any) => [number, number, number];
    readonly wasmdeck_append: (a: number, b: any, c: any) => [number, number, number];
    readonly wasmdeck_copy: (a: number) => number;
    readonly wasmdeck_counterElements: (a: number, b: number, c: number, d: number, e: number) => [number, number, number];
    readonly wasmdeck_counterMapping: (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => [number, number, number];
    readonly wasmdeck_counterPopulation: (a: number, b: number, c: number, d: number) => [number, number, number];
    readonly wasmdeck_deal: (a: number, b: any) => [number, number, number];
    readonly wasmdeck_equals: (a: number, b: number) => number;
    readonly wasmdeck_format: (a: number, b: number, c: number) => [number, number, number, number];
    readonly wasmdeck_multiDeal: (a: number, b: number, c: number) => [number, number, number];
    readonly wasmdeck_padToDenominator: (a: number, b: any, c: any) => [number, number, number];
    readonly wasmdeck_population: (a: number) => number;
    readonly wasmdeck_quantities: (a: number, b: number, c: number, d: any) => [number, number, number];
    readonly wasmdeck_remove: (a: number, b: any, c: any) => [number, number, number];
    readonly wasmdeck_repr: (a: number) => [number, number, number, number];
    readonly wasmdeck_sequence: (a: number, b: number) => [number, number, number];
    readonly wasmdeck_split: (a: number, b: number, c: number) => [number, number, number, number];
    readonly wasmdeck_zero: (a: number) => [number, number, number];
    readonly wasmdie_append: (a: number, b: any, c: any) => [number, number, number];
    readonly wasmdie_binary: (a: number, b: number, c: number) => [number, number, number];
    readonly wasmdie_clip: (a: number, b: any, c: any) => [number, number, number];
    readonly wasmdie_cmp: (a: number, b: number) => [number, number, number];
    readonly wasmdie_commonOutcomeLength: (a: number) => [number, number, number];
    readonly wasmdie_copy: (a: number) => number;
    readonly wasmdie_correlation: (a: number, b: any, c: any) => [number, number, number];
    readonly wasmdie_covariance: (a: number, b: any, c: any) => [number, number, number];
    readonly wasmdie_cramerVonMises: (a: number, b: number) => [number, number, number];
    readonly wasmdie_d: (a: any) => [number, number, number];
    readonly wasmdie_denominator: (a: number) => any;
    readonly wasmdie_divideQuantities: (a: number, b: any) => [number, number, number];
    readonly wasmdie_empty: () => [number, number, number];
    readonly wasmdie_entropy: (a: number, b: any) => [number, number, number];
    readonly wasmdie_equals: (a: number, b: number, c: number) => [number, number, number];
    readonly wasmdie_evaluateAgainsUsingCount: (a: number, b: number, c: any, d: number, e: number, f: number) => [number, number, number];
    readonly wasmdie_excessKurtosis: (a: number) => [number, number, number];
    readonly wasmdie_format: (a: number, b: number, c: number, d: number, e: number) => [number, number, number, number];
    readonly wasmdie_get: (a: number, b: any) => [number, number, number];
    readonly wasmdie_getitems: (a: number, b: any) => [number, number, number, number];
    readonly wasmdie_groupBy: (a: number, b: number, c: number) => [number, number, number, number];
    readonly wasmdie_has: (a: number, b: any) => [number, number, number];
    readonly wasmdie_items: (a: number) => [number, number, number, number];
    readonly wasmdie_keepSingle: (a: number, b: any, c: number) => [number, number, number];
    readonly wasmdie_kolmogorovSmirnov: (a: number, b: number) => [number, number, number];
    readonly wasmdie_marginal: (a: number, b: any) => [number, number, number];
    readonly wasmdie_marginalSlice: (a: number, b: any, c: any, d: any) => [number, number, number];
    readonly wasmdie_marginalsLength: (a: number) => [number, number, number];
    readonly wasmdie_matmul: (a: number, b: number) => [number, number, number];
    readonly wasmdie_maxOutcome: (a: number) => [number, number, number];
    readonly wasmdie_mean: (a: number) => [number, number, number];
    readonly wasmdie_meanTimeToSum: (a: number, b: any) => [number, number, number];
    readonly wasmdie_memberships: (a: number, b: number, c: number) => [number, number, number, number];
    readonly wasmdie_minOutcome: (a: number) => [number, number, number];
    readonly wasmdie_modalQuantity: (a: number) => [number, number, number];
    readonly wasmdie_mode: (a: number) => [number, number, number];
    readonly wasmdie_moduloQuantities: (a: number, b: any) => [number, number, number];
    readonly wasmdie_multiplyQuantities: (a: number, b: any) => [number, number, number];
    readonly wasmdie_multiplyToDenominator: (a: number, b: any) => [number, number, number];
    readonly wasmdie_nearest: (a: number, b: number, c: number, d: any) => [number, number, number];
    readonly wasmdie_outcomes: (a: number) => [number, number, number, number];
    readonly wasmdie_padToDenominator: (a: number, b: any, c: any) => [number, number, number];
    readonly wasmdie_probabilities: (a: number, b: number, c: number, d: number) => [number, number, number];
    readonly wasmdie_probability: (a: number, b: number, c: number, d: any, e: number) => [number, number, number];
    readonly wasmdie_probabilityWhere: (a: number, b: number, c: number, d: number) => [number, number, number];
    readonly wasmdie_quantile: (a: number, b: any, c: any) => [number, number, number];
    readonly wasmdie_quantileHigh: (a: number, b: any, c: any) => [number, number, number];
    readonly wasmdie_quantileLow: (a: number, b: any, c: any) => [number, number, number];
    readonly wasmdie_quantities: (a: number, b: number, c: number) => [number, number, number, number];
    readonly wasmdie_quantity: (a: number, b: number, c: number, d: any) => [number, number, number];
    readonly wasmdie_quantityWhere: (a: number, b: number, c: number) => any;
    readonly wasmdie_remove: (a: number, b: any, c: any) => [number, number, number];
    readonly wasmdie_repr: (a: number, b: number, c: number) => [number, number, number, number];
    readonly wasmdie_reroll: (a: number, b: number, c: number, d: number) => [number, number, number];
    readonly wasmdie_round: (a: number, b: any) => [number, number, number];
    readonly wasmdie_sample: (a: number, b: any, c: number) => [number, number, number, number];
    readonly wasmdie_sequence: (a: number, b: any) => [number, number, number];
    readonly wasmdie_sign: (a: number) => [number, number, number];
    readonly wasmdie_simplify: (a: number) => [number, number, number];
    readonly wasmdie_single: (a: any) => [number, number, number];
    readonly wasmdie_size: (a: number) => number;
    readonly wasmdie_skewness: (a: number) => [number, number, number];
    readonly wasmdie_split: (a: number, b: number, c: number) => [number, number, number, number];
    readonly wasmdie_standardDeviation: (a: number) => [number, number, number];
    readonly wasmdie_standardizedMoment: (a: number, b: any) => [number, number, number];
    readonly wasmdie_toOneHot: (a: number, b: number, c: number, d: number) => [number, number, number];
    readonly wasmdie_truncate: (a: number, b: any, c: any) => [number, number, number];
    readonly wasmdie_unary: (a: number, b: number) => [number, number, number];
    readonly wasmdie_variance: (a: number) => [number, number, number];
    readonly wasmdie_z: (a: any) => [number, number, number];
    readonly wasmdie_zero: (a: number) => [number, number, number];
    readonly wasmdie_zeroOutcome: (a: number) => [number, number, number];
    readonly wasmgenerator_compound: (a: number, b: number) => [number, number, number];
    readonly wasmgenerator_copy: (a: number) => number;
    readonly wasmgenerator_dealStrs: (a: number) => [number, number, number, number];
    readonly wasmgenerator_deck: (a: number) => [number, number, number];
    readonly wasmgenerator_denominator: (a: number) => [number, number, number];
    readonly wasmgenerator_dice: (a: number) => [number, number, number, number];
    readonly wasmgenerator_handSize: (a: number) => [number, number, number];
    readonly wasmgenerator_hasNegativeKeeps: (a: number) => number;
    readonly wasmgenerator_isDeal: (a: number) => number;
    readonly wasmgenerator_isPool: (a: number) => number;
    readonly wasmgenerator_keepIndex: (a: number, b: any) => [number, number, number];
    readonly wasmgenerator_keepSequence: (a: number, b: number, c: number) => [number, number, number];
    readonly wasmgenerator_keepSize: (a: number) => any;
    readonly wasmgenerator_keepSlice: (a: number, b: any, c: any, d: number) => [number, number, number];
    readonly wasmgenerator_keepTuple: (a: number) => [number, number];
    readonly wasmgenerator_mergePools: (a: number, b: number) => [number, number, number];
    readonly wasmgenerator_multiplyCounts: (a: number, b: any) => [number, number, number];
    readonly wasmgenerator_outcomes: (a: number) => [number, number, number];
    readonly wasmgenerator_rawSize: (a: number) => [number, number, number];
    readonly wasmgenerator_sameKey: (a: number, b: number) => number;
    readonly wasmgenerator_toString: (a: number) => [number, number, number, number];
    readonly wasmmultideal_deck: (a: number) => number;
    readonly wasmmultideal_denominator: (a: number) => any;
    readonly wasmmultideal_handSizes: (a: number) => [number, number];
    readonly wasmmultideal_length: (a: number) => number;
    readonly wasmmultideal_sameKey: (a: number, b: number) => number;
    readonly wasmmultideal_strs: (a: number) => [number, number, number, number];
    readonly wasmmultideal_totalCardsDealt: (a: number) => number;
    readonly weightedLcm: (a: number, b: number, c: number, d: number, e: number, f: number) => [number, number, number, number];
    readonly __wbindgen_malloc: (a: number, b: number) => number;
    readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
    readonly __wbindgen_externrefs: WebAssembly.Table;
    readonly __externref_drop_slice: (a: number, b: number) => void;
    readonly __wbindgen_free: (a: number, b: number, c: number) => void;
    readonly __externref_table_alloc: () => number;
    readonly __wbindgen_exn_store: (a: number) => void;
    readonly __externref_table_dealloc: (a: number) => void;
    readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;

/**
 * Instantiates the given `module`, which can either be bytes or
 * a precompiled `WebAssembly.Module`.
 *
 * @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
 *
 * @returns {InitOutput}
 */
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
 * If `module_or_path` is {RequestInfo} or {URL}, makes a request and
 * for everything else, calls `WebAssembly.instantiate` directly.
 *
 * @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
 *
 * @returns {Promise<InitOutput>}
 */
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
