/* @ts-self-types="./icepool_wasm.d.ts" */

/**
 * Python's binary operators on dice (`Die.binary_operator` with `operator.add`, ...).
 * @enum {0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17}
 */
export const BinaryOp = Object.freeze({
    Add: 0, "0": "Add",
    Sub: 1, "1": "Sub",
    Mul: 2, "2": "Mul",
    TrueDiv: 3, "3": "TrueDiv",
    FloorDiv: 4, "4": "FloorDiv",
    Mod: 5, "5": "Mod",
    Pow: 6, "6": "Pow",
    LShift: 7, "7": "LShift",
    RShift: 8, "8": "RShift",
    And: 9, "9": "And",
    Or: 10, "10": "Or",
    Xor: 11, "11": "Xor",
    Lt: 12, "12": "Lt",
    Le: 13, "13": "Le",
    Gt: 14, "14": "Gt",
    Ge: 15, "15": "Ge",
    Eq: 16, "16": "Eq",
    Ne: 17, "17": "Ne",
});

/**
 * `Deck(outcomes, times)` once the TypeScript has itemized its arguments (creation_args.py `itemize`) and expanded
 * each (`expand_arg`: a die or deck stays a population, a tuple holding dice is their Cartesian product): each
 * argument with its time, a non-negative number. `build` merges them (`expand_args_for_deck`, `merge_duplicates`).
 */
export class DeckBuilder {
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        DeckBuilderFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_deckbuilder_free(ptr, 0);
    }
    /**
     * @returns {WasmDeck}
     */
    build() {
        const ret = wasm.deckbuilder_build(this.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return WasmDeck.__wrap(ret[0]);
    }
    /**
     * A deck, flattened into the result (`time` duplicates the whole deck).
     * @param {WasmDeck} deck
     * @param {any} time
     */
    deck(deck, time) {
        _assertClass(deck, WasmDeck);
        const ret = wasm.deckbuilder_deck(this.__wbg_ptr, deck.__wbg_ptr, time);
        if (ret[1]) {
            throw takeFromExternrefTable0(ret[0]);
        }
    }
    /**
     * A die: its outcomes, each duplicated by its quantity times `time`.
     * @param {WasmDie} die
     * @param {any} time
     */
    die(die, time) {
        _assertClass(die, WasmDie);
        const ret = wasm.deckbuilder_die(this.__wbg_ptr, die.__wbg_ptr, time);
        if (ret[1]) {
            throw takeFromExternrefTable0(ret[0]);
        }
    }
    constructor() {
        const ret = wasm.deckbuilder_new();
        this.__wbg_ptr = ret;
        DeckBuilderFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * An outcome: one card, times `time`.
     * @param {any} outcome
     * @param {any} time
     */
    outcome(outcome, time) {
        const ret = wasm.deckbuilder_outcome(this.__wbg_ptr, outcome, time);
        if (ret[1]) {
            throw takeFromExternrefTable0(ret[0]);
        }
    }
    /**
     * A tuple holding `Reroll`: `cartesian_product` makes it `Reroll` itself, which `expand_arg` passes on as it
     * is (it is not in `REROLL_TYPES` by then: the check came first), so `merge_duplicates` asks it for `items()`
     * unless its time is zero.
     * @param {any} time
     */
    rerollTuple(time) {
        const ret = wasm.deckbuilder_rerollTuple(this.__wbg_ptr, time);
        if (ret[1]) {
            throw takeFromExternrefTable0(ret[0]);
        }
    }
    /**
     * `Reroll` (or `Restart`): `expand_arg` makes it `{}`, no cards.
     * @param {any} time
     */
    reroll(time) {
        const ret = wasm.deckbuilder_reroll(this.__wbg_ptr, time);
        if (ret[1]) {
            throw takeFromExternrefTable0(ret[0]);
        }
    }
}
if (Symbol.dispose) DeckBuilder.prototype[Symbol.dispose] = DeckBuilder.prototype.free;

/**
 * The arguments of a free function that takes dice and plain outcomes alike (`tupleize(d(6), 1)`), in order:
 * wasm-bindgen passes dice to Rust one by one, so the TypeScript adds each argument here.
 */
export class DiceArgs {
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        DiceArgsFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_diceargs_free(ptr, 0);
    }
    /**
     * A die.
     * @param {WasmDie} die
     */
    die(die) {
        _assertClass(die, WasmDie);
        wasm.diceargs_die(this.__wbg_ptr, die.__wbg_ptr);
    }
    constructor() {
        const ret = wasm.diceargs_new();
        this.__wbg_ptr = ret;
        DiceArgsFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * A plain outcome.
     * @param {any} outcome
     */
    outcome(outcome) {
        const ret = wasm.diceargs_outcome(this.__wbg_ptr, outcome);
        if (ret[1]) {
            throw takeFromExternrefTable0(ret[0]);
        }
    }
    /**
     * `pointwise_max` (`max`) / `pointwise_min` of dice whose denominators are already harmonized.
     * @param {boolean} max
     * @returns {WasmDie}
     */
    pointwise(max) {
        const ret = wasm.diceargs_pointwise(this.__wbg_ptr, max);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return WasmDie.__wrap(ret[0]);
    }
    /**
     * `cartesian_product(*args, outcome_type=tuple)` once the TypeScript has found a die among them: a die of
     * tuples.
     * @returns {WasmDie}
     */
    tupleize() {
        const ret = wasm.diceargs_tupleize(this.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return WasmDie.__wrap(ret[0]);
    }
    /**
     * `cartesian_product(*args, outcome_type=Vector)` (`vectorize`), as `tupleize`.
     * @returns {WasmDie}
     */
    vectorize() {
        const ret = wasm.diceargs_vectorize(this.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return WasmDie.__wrap(ret[0]);
    }
}
if (Symbol.dispose) DiceArgs.prototype[Symbol.dispose] = DiceArgs.prototype.free;

/**
 * `Die(outcomes, times)` once the TypeScript `Die` has itemized its arguments (creation_args.py `itemize`): each
 * element of `outcomes` with its weight (a time as `itemize` leaves it: a non-negative number, which must be an int
 * unless it is zero). `build` mixes them (`expand_args_for_die`).
 */
export class DieBuilder {
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        DieBuilderFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_diebuilder_free(ptr, 0);
    }
    /**
     * @returns {WasmDie}
     */
    build() {
        const ret = wasm.diebuilder_build(this.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return WasmDie.__wrap(ret[0]);
    }
    /**
     * A die, mixed in with its outcomes sharing the weight.
     * @param {WasmDie} die
     * @param {any} weight
     */
    die(die, weight) {
        _assertClass(die, WasmDie);
        const ret = wasm.diebuilder_die(this.__wbg_ptr, die.__wbg_ptr, weight);
        if (ret[1]) {
            throw takeFromExternrefTable0(ret[0]);
        }
    }
    constructor() {
        const ret = wasm.diebuilder_new();
        this.__wbg_ptr = ret;
        DieBuilderFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * An outcome.
     * @param {any} outcome
     * @param {any} weight
     */
    outcome(outcome, weight) {
        const ret = wasm.diebuilder_outcome(this.__wbg_ptr, outcome, weight);
        if (ret[1]) {
            throw takeFromExternrefTable0(ret[0]);
        }
    }
    /**
     * `Reroll` (or `Restart`): drops out.
     * @param {any} weight
     */
    reroll(weight) {
        const ret = wasm.diebuilder_reroll(this.__wbg_ptr, weight);
        if (ret[1]) {
            throw takeFromExternrefTable0(ret[0]);
        }
    }
}
if (Symbol.dispose) DieBuilder.prototype[Symbol.dispose] = DieBuilder.prototype.free;

/**
 * Builds the core's tree of one evaluation's inputs from the TypeScript's expressions, in postfix order (each node
 * after its children), then evaluates them. Tracing a multiset function's body fills one with what the body
 * returned: its raw results, each over nodes pushed before it (`multiset_function.rs`).
 */
export class ExpressionBuilder {
    static __unwrap(jsValue) {
        if (!(jsValue instanceof ExpressionBuilder)) {
            return 0;
        }
        return jsValue.__destroy_into_raw();
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        ExpressionBuilderFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_expressionbuilder_free(ptr, 0);
    }
    /**
     * A binary operator (operator/binary.py) over the last `arity` nodes, by its class's name.
     * @param {string} name
     * @param {number} arity
     */
    binary(name, arity) {
        const ptr0 = passStringToWasm0(name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.expressionbuilder_binary(this.__wbg_ptr, ptr0, len0, arity);
        if (ret[1]) {
            throw takeFromExternrefTable0(ret[0]);
        }
    }
    /**
     * `f.evaluate(*inputs, **kwargs)` of a multiset function over the last `inputs` nodes: its evaluations (see
     * `evaluator::evaluations_to_js`). All preparations are made before any is evaluated, as the program runner
     * does.
     * @param {any} _function
     * @param {number} inputs
     * @param {any} kwargs
     * @returns {any}
     */
    evaluateFunction(_function, inputs, kwargs) {
        const ret = wasm.expressionbuilder_evaluateFunction(this.__wbg_ptr, _function, inputs, kwargs);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * `evaluator.evaluate(*inputs)` of a JS evaluator over the last `inputs` nodes: its evaluations (see
     * [`evaluations_to_js`]).
     * @param {any} evaluator
     * @param {number} inputs
     * @returns {any}
     */
    evaluateHost(evaluator, inputs) {
        const ret = wasm.expressionbuilder_evaluateHost(this.__wbg_ptr, evaluator, inputs);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * `evaluator.evaluate(*inputs)` of the built-in evaluator `name` (with `params`, as for the Python facade's
     * `evaluate_builtin`) over the last `inputs` nodes: each prepared evaluation gives
     * `Die(final_outcomes, final_weights)`, and those are mixed by weight.
     * @param {string} name
     * @param {any[]} params
     * @param {number} inputs
     * @returns {WasmDie}
     */
    evaluate(name, params, inputs) {
        const ptr0 = passStringToWasm0(name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passArrayJsValueToWasm0(params, wasm.__wbindgen_malloc);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.expressionbuilder_evaluate(this.__wbg_ptr, ptr0, len0, ptr1, len1, inputs);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return WasmDie.__wrap(ret[0]);
    }
    /**
     * `MultisetFilterOutcomesBinary`: the first node's count where the second's is positive (`!= invert`).
     * @param {boolean} invert
     */
    filterBinary(invert) {
        const ret = wasm.expressionbuilder_filterBinary(this.__wbg_ptr, invert);
        if (ret[1]) {
            throw takeFromExternrefTable0(ret[0]);
        }
    }
    /**
     * `MultisetFilterOutcomes` with a JS callable.
     * @param {boolean} invert
     * @param {any} f
     */
    filterFunction(invert, f) {
        const ret = wasm.expressionbuilder_filterFunction(this.__wbg_ptr, invert, f);
        if (ret[1]) {
            throw takeFromExternrefTable0(ret[0]);
        }
    }
    /**
     * `MultisetFilterOutcomes` with a collection of outcomes (Python's `frozenset`).
     * @param {boolean} invert
     * @param {any[]} outcomes
     */
    filterSet(invert, outcomes) {
        const ptr0 = passArrayJsValueToWasm0(outcomes, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.expressionbuilder_filterSet(this.__wbg_ptr, invert, ptr0, len0);
        if (ret[1]) {
            throw takeFromExternrefTable0(ret[0]);
        }
    }
    /**
     * `MultisetFloordivCounts(constant)`.
     * @param {any} constant
     */
    floordivCounts(constant) {
        const ret = wasm.expressionbuilder_floordivCounts(this.__wbg_ptr, constant);
        if (ret[1]) {
            throw takeFromExternrefTable0(ret[0]);
        }
    }
    /**
     * `MultisetForceOrder(force_order)`.
     * @param {number} force_order
     */
    forceOrder(force_order) {
        const ret = wasm.expressionbuilder_forceOrder(this.__wbg_ptr, force_order);
        if (ret[1]) {
            throw takeFromExternrefTable0(ret[0]);
        }
    }
    /**
     * A keep generator (`_make_source`).
     * @param {WasmGenerator} g
     */
    generator(g) {
        _assertClass(g, WasmGenerator);
        const ret = wasm.expressionbuilder_generator(this.__wbg_ptr, g.__wbg_ptr);
        if (ret[1]) {
            throw takeFromExternrefTable0(ret[0]);
        }
    }
    /**
     * `MultisetKeepCounts(comparison, constant)` (the comparison already checked).
     * @param {string} comparison
     * @param {any} constant
     */
    keepCounts(comparison, constant) {
        const ptr0 = passStringToWasm0(comparison, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.expressionbuilder_keepCounts(this.__wbg_ptr, ptr0, len0, constant);
        if (ret[1]) {
            throw takeFromExternrefTable0(ret[0]);
        }
    }
    /**
     * `MultisetKeep` with an index of another type (by its Python type name): it raises when evaluated.
     * @param {string} type_name
     */
    keepInvalid(type_name) {
        const ptr0 = passStringToWasm0(type_name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.expressionbuilder_keepInvalid(this.__wbg_ptr, ptr0, len0);
        if (ret[1]) {
            throw takeFromExternrefTable0(ret[0]);
        }
    }
    /**
     * `MultisetKeep` with a sequence index: ints, null for `...`.
     * @param {any[]} counts
     */
    keepSequence(counts) {
        const ptr0 = passArrayJsValueToWasm0(counts, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.expressionbuilder_keepSequence(this.__wbg_ptr, ptr0, len0);
        if (ret[1]) {
            throw takeFromExternrefTable0(ret[0]);
        }
    }
    /**
     * `MultisetKeep` with a slice index (bounds ints or null; `step` whether one was given).
     * @param {any} start
     * @param {any} stop
     * @param {boolean} step
     */
    keepSlice(start, stop, step) {
        const ret = wasm.expressionbuilder_keepSlice(this.__wbg_ptr, start, stop, step);
        if (ret[1]) {
            throw takeFromExternrefTable0(ret[0]);
        }
    }
    /**
     * `MultisetMapCounts` over the last `arity` nodes, with this JS function.
     * @param {any} f
     * @param {number} arity
     */
    mapCounts(f, arity) {
        const ret = wasm.expressionbuilder_mapCounts(this.__wbg_ptr, f, arity);
        if (ret[1]) {
            throw takeFromExternrefTable0(ret[0]);
        }
    }
    /**
     * `MultisetMaxPairEarly` (`early`) or `MultisetMaxPairLate`.
     * @param {boolean} early
     * @param {number} max_order
     * @param {boolean} pair_equal
     * @param {boolean} keep
     */
    maxPair(early, max_order, pair_equal, keep) {
        const ret = wasm.expressionbuilder_maxPair(this.__wbg_ptr, early, max_order, pair_equal, keep);
        if (ret[1]) {
            throw takeFromExternrefTable0(ret[0]);
        }
    }
    /**
     * `MultisetMixture` of the last `weights.len()` nodes, with these weights.
     * @param {any[]} weights
     */
    mixture(weights) {
        const ptr0 = passArrayJsValueToWasm0(weights, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.expressionbuilder_mixture(this.__wbg_ptr, ptr0, len0);
        if (ret[1]) {
            throw takeFromExternrefTable0(ret[0]);
        }
    }
    /**
     * `MultisetModuloCounts(constant)`.
     * @param {any} constant
     */
    moduloCounts(constant) {
        const ret = wasm.expressionbuilder_moduloCounts(this.__wbg_ptr, constant);
        if (ret[1]) {
            throw takeFromExternrefTable0(ret[0]);
        }
    }
    /**
     * A `MultiDeal` (`_make_source`): a multiset tuple generator.
     * @param {WasmMultiDeal} md
     */
    multiDeal(md) {
        _assertClass(md, WasmMultiDeal);
        wasm.expressionbuilder_multiDeal(this.__wbg_ptr, md.__wbg_ptr);
    }
    /**
     * `MultisetMultiplyCounts(constant)`.
     * @param {any} constant
     */
    multiplyCounts(constant) {
        const ret = wasm.expressionbuilder_multiplyCounts(this.__wbg_ptr, constant);
        if (ret[1]) {
            throw takeFromExternrefTable0(ret[0]);
        }
    }
    constructor() {
        const ret = wasm.expressionbuilder_new();
        this.__wbg_ptr = ret;
        ExpressionBuilderFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * A `MultisetParameter` of the multiset function being traced: argument `arg_index` (its `star_index` element
     * if starred).
     * @param {number} arg_index
     * @param {number | null} [star_index]
     */
    parameter(arg_index, star_index) {
        wasm.expressionbuilder_parameter(this.__wbg_ptr, arg_index, isLikeNone(star_index) ? Number.MAX_SAFE_INTEGER : (star_index) >>> 0);
    }
    /**
     * A raw result of the built-in evaluator `name` (with `params`, as for `evaluate`) over the last `inputs`
     * nodes.
     * @param {string} name
     * @param {any[]} params
     * @param {number} inputs
     */
    rawBuiltin(name, params, inputs) {
        const ptr0 = passStringToWasm0(name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passArrayJsValueToWasm0(params, wasm.__wbindgen_malloc);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.expressionbuilder_rawBuiltin(this.__wbg_ptr, ptr0, len0, ptr1, len1, inputs);
        if (ret[1]) {
            throw takeFromExternrefTable0(ret[0]);
        }
    }
    /**
     * `convert_die_to_raw_result` of a result that is not an evaluation: a constant (`reroll` if it is a reroll
     * type).
     * @param {any} value
     * @param {boolean} reroll
     */
    rawConstant(value, reroll) {
        wasm.expressionbuilder_rawConstant(this.__wbg_ptr, value, reroll);
    }
    /**
     * A raw result of a multiset function called on the last `inputs` nodes with these keyword arguments.
     * @param {any} _function
     * @param {number} inputs
     * @param {any} kwargs
     */
    rawFunction(_function, inputs, kwargs) {
        const ret = wasm.expressionbuilder_rawFunction(this.__wbg_ptr, _function, inputs, kwargs);
        if (ret[1]) {
            throw takeFromExternrefTable0(ret[0]);
        }
    }
    /**
     * A raw result of a JS evaluator over the last `inputs` nodes.
     * @param {any} evaluator
     * @param {number} inputs
     */
    rawHost(evaluator, inputs) {
        const ret = wasm.expressionbuilder_rawHost(this.__wbg_ptr, evaluator, inputs);
        if (ret[1]) {
            throw takeFromExternrefTable0(ret[0]);
        }
    }
    /**
     * `MultisetSortPairWhile`.
     * @param {boolean} keep
     * @param {string} comparison
     * @param {number} sort_order
     * @param {string} extra
     */
    sortPairWhile(keep, comparison, sort_order, extra) {
        const ptr0 = passStringToWasm0(comparison, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(extra, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.expressionbuilder_sortPairWhile(this.__wbg_ptr, keep, ptr0, len0, sort_order, ptr1, len1);
        if (ret[1]) {
            throw takeFromExternrefTable0(ret[0]);
        }
    }
    /**
     * `MultisetSortPair` (`sort_order` already `Descending` if `Any` was given).
     * @param {string} comparison
     * @param {number} sort_order
     * @param {string} extra
     */
    sortPair(comparison, sort_order, extra) {
        const ptr0 = passStringToWasm0(comparison, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(extra, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.expressionbuilder_sortPair(this.__wbg_ptr, ptr0, len0, sort_order, ptr1, len1);
        if (ret[1]) {
            throw takeFromExternrefTable0(ret[0]);
        }
    }
    /**
     * `MultisetTupleIndex(child, index=index)` of the multiset tuple expression just pushed.
     * @param {any} index
     */
    tupleIndex(index) {
        const ret = wasm.expressionbuilder_tupleIndex(this.__wbg_ptr, index);
        if (ret[1]) {
            throw takeFromExternrefTable0(ret[0]);
        }
    }
    /**
     * A `MultisetTupleParameter`: argument `arg_index`, a multiset tuple expression of `len` multisets.
     * @param {number} arg_index
     * @param {number} len
     */
    tupleParameter(arg_index, len) {
        wasm.expressionbuilder_tupleParameter(this.__wbg_ptr, arg_index, len);
    }
    /**
     * `MultisetTupleSlice(child, index=slice(start, stop, step))` of the multiset tuple expression just pushed.
     * @param {any} start
     * @param {any} stop
     * @param {any} step
     */
    tupleSlice(start, stop, step) {
        const ret = wasm.expressionbuilder_tupleSlice(this.__wbg_ptr, start, stop, step);
        if (ret[1]) {
            throw takeFromExternrefTable0(ret[0]);
        }
    }
    /**
     * `MultisetUnique(constant)`.
     * @param {any} constant
     */
    unique(constant) {
        const ret = wasm.expressionbuilder_unique(this.__wbg_ptr, constant);
        if (ret[1]) {
            throw takeFromExternrefTable0(ret[0]);
        }
    }
    /**
     * `MultisetVersus(lexi_tuple, order)`.
     * @param {Int32Array} lexi_tuple
     * @param {number} versus_order
     */
    versus(lexi_tuple, versus_order) {
        const ptr0 = passArray32ToWasm0(lexi_tuple, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.expressionbuilder_versus(this.__wbg_ptr, ptr0, len0, versus_order);
        if (ret[1]) {
            throw takeFromExternrefTable0(ret[0]);
        }
    }
    /**
     * `WeightlessGenerator(generator)` of the generator just pushed.
     */
    weightless() {
        const ret = wasm.expressionbuilder_weightless(this.__wbg_ptr);
        if (ret[1]) {
            throw takeFromExternrefTable0(ret[0]);
        }
    }
}
if (Symbol.dispose) ExpressionBuilder.prototype[Symbol.dispose] = ExpressionBuilder.prototype.free;

/**
 * `Pool(dice, times)` once the TypeScript has itemized its arguments and converted each element to a die
 * (`implicit_convert_to_die`): each die with its count, in order. `build` makes the pool.
 */
export class PoolBuilder {
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        PoolBuilderFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_poolbuilder_free(ptr, 0);
    }
    /**
     * A die put in `count` times (a time of `itemize`, already checked to be a non-negative number).
     * @param {WasmDie} die
     * @param {any} count
     */
    add(die, count) {
        _assertClass(die, WasmDie);
        const ret = wasm.poolbuilder_add(this.__wbg_ptr, die.__wbg_ptr, count);
        if (ret[1]) {
            throw takeFromExternrefTable0(ret[0]);
        }
    }
    /**
     * @returns {WasmGenerator}
     */
    build() {
        const ret = wasm.poolbuilder_build(this.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return WasmGenerator.__wrap(ret[0]);
    }
    constructor() {
        const ret = wasm.poolbuilder_new();
        this.__wbg_ptr = ret;
        PoolBuilderFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
}
if (Symbol.dispose) PoolBuilder.prototype[Symbol.dispose] = PoolBuilder.prototype.free;

/**
 * Python's unary operators on dice (`Die.unary_operator` with `operator.neg`, `math.floor`, ...).
 * @enum {0 | 1 | 2 | 3 | 4 | 5 | 6}
 */
export const UnaryOp = Object.freeze({
    Neg: 0, "0": "Neg",
    Pos: 1, "1": "Pos",
    Invert: 2, "2": "Invert",
    Abs: 3, "3": "Abs",
    Trunc: 4, "4": "Trunc",
    Floor: 5, "5": "Floor",
    Ceil: 6, "6": "Ceil",
});

/**
 * A deck of the core.
 */
export class WasmDeck {
    static __wrap(ptr) {
        const obj = Object.create(WasmDeck.prototype);
        obj.__wbg_ptr = ptr;
        WasmDeckFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WasmDeckFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmdeck_free(ptr, 0);
    }
    /**
     * `deck.append(outcome, quantity)`.
     * @param {any} outcome
     * @param {any} quantity
     * @returns {WasmDeck}
     */
    append(outcome, quantity) {
        const ret = wasm.wasmdeck_append(this.__wbg_ptr, outcome, quantity);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return WasmDeck.__wrap(ret[0]);
    }
    /**
     * Another handle on the same deck.
     * @returns {WasmDeck}
     */
    copy() {
        const ret = wasm.wasmdeck_copy(this.__wbg_ptr);
        return WasmDeck.__wrap(ret);
    }
    /**
     * `deck <op> other` with `Counter(other)` of an iterable: its elements, counted.
     * @param {string} op
     * @param {any[]} elements
     * @returns {WasmDeck}
     */
    counterElements(op, elements) {
        const ptr0 = passStringToWasm0(op, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passArrayJsValueToWasm0(elements, wasm.__wbindgen_malloc);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.wasmdeck_counterElements(this.__wbg_ptr, ptr0, len0, ptr1, len1);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return WasmDeck.__wrap(ret[0]);
    }
    /**
     * `deck <op> other` with `Counter(other)` of a mapping: its keys with their int counts.
     * @param {string} op
     * @param {any[]} keys
     * @param {any[]} counts
     * @returns {WasmDeck}
     */
    counterMapping(op, keys, counts) {
        const ptr0 = passStringToWasm0(op, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passArrayJsValueToWasm0(keys, wasm.__wbindgen_malloc);
        const len1 = WASM_VECTOR_LEN;
        const ptr2 = passArrayJsValueToWasm0(counts, wasm.__wbindgen_malloc);
        const len2 = WASM_VECTOR_LEN;
        const ret = wasm.wasmdeck_counterMapping(this.__wbg_ptr, ptr0, len0, ptr1, len1, ptr2, len2);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return WasmDeck.__wrap(ret[0]);
    }
    /**
     * `deck <op> other` for another deck or a die (a mapping of its quantities).
     * @param {string} op
     * @param {WasmDie} other
     * @returns {WasmDeck}
     */
    counterPopulation(op, other) {
        const ptr0 = passStringToWasm0(op, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        _assertClass(other, WasmDie);
        const ret = wasm.wasmdeck_counterPopulation(this.__wbg_ptr, ptr0, len0, other.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return WasmDeck.__wrap(ret[0]);
    }
    /**
     * `Deal(deck, hand_size)` for an int (the TypeScript checks the type).
     * @param {any} hand_size
     * @returns {WasmGenerator}
     */
    deal(hand_size) {
        const ret = wasm.wasmdeck_deal(this.__wbg_ptr, hand_size);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return WasmGenerator.__wrap(ret[0]);
    }
    /**
     * `deck == other`: their `hash_key`s `(Deck, tuple(items))`.
     * @param {WasmDeck} other
     * @returns {boolean}
     */
    equals(other) {
        _assertClass(other, WasmDeck);
        const ret = wasm.wasmdeck_equals(this.__wbg_ptr, other.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * `format(deck, spec)` (`''` is `str(deck)`, its table).
     * @param {string} spec
     * @returns {string}
     */
    format(spec) {
        let deferred3_0;
        let deferred3_1;
        try {
            const ptr0 = passStringToWasm0(spec, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            const ret = wasm.wasmdeck_format(this.__wbg_ptr, ptr0, len0);
            var ptr2 = ret[0];
            var len2 = ret[1];
            if (ret[3]) {
                ptr2 = 0; len2 = 0;
                throw takeFromExternrefTable0(ret[2]);
            }
            deferred3_0 = ptr2;
            deferred3_1 = len2;
            return getStringFromWasm0(ptr2, len2);
        } finally {
            wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
        }
    }
    /**
     * `MultiDeal(deck, hand_groups)`: `[hand_size, group_size, ...]` flat, ints (the TypeScript checks).
     * @param {any[]} hand_groups
     * @returns {WasmMultiDeal}
     */
    multiDeal(hand_groups) {
        const ptr0 = passArrayJsValueToWasm0(hand_groups, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.wasmdeck_multiDeal(this.__wbg_ptr, ptr0, len0);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return WasmMultiDeal.__wrap(ret[0]);
    }
    /**
     * `deck.pad_to_denominator(denominator, outcome)`.
     * @param {any} denominator
     * @param {any} outcome
     * @returns {WasmDeck}
     */
    padToDenominator(denominator, outcome) {
        const ret = wasm.wasmdeck_padToDenominator(this.__wbg_ptr, denominator, outcome);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return WasmDeck.__wrap(ret[0]);
    }
    /**
     * The cards as a die, for the `Population` methods a deck shares with a die.
     * @returns {WasmDie}
     */
    population() {
        const ret = wasm.wasmdeck_population(this.__wbg_ptr);
        return WasmDie.__wrap(ret);
    }
    /**
     * `deck.multiply_quantities(n)` (`deck * n`), `divide_quantities` (`//`) or `modulo_quantities` (`%`) by
     * name, for an int `n`.
     * @param {string} op
     * @param {any} n
     * @returns {WasmDeck}
     */
    quantities(op, n) {
        const ptr0 = passStringToWasm0(op, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.wasmdeck_quantities(this.__wbg_ptr, ptr0, len0, n);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return WasmDeck.__wrap(ret[0]);
    }
    /**
     * `deck.remove(outcome, quantity)`: `null` removes all of it.
     * @param {any} outcome
     * @param {any} quantity
     * @returns {WasmDeck}
     */
    remove(outcome, quantity) {
        const ret = wasm.wasmdeck_remove(this.__wbg_ptr, outcome, quantity);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return WasmDeck.__wrap(ret[0]);
    }
    /**
     * `repr(deck)`: `Deck({outcome!r: quantity, ...})`.
     * @returns {string}
     */
    repr() {
        let deferred2_0;
        let deferred2_1;
        try {
            const ret = wasm.wasmdeck_repr(this.__wbg_ptr);
            var ptr1 = ret[0];
            var len1 = ret[1];
            if (ret[3]) {
                ptr1 = 0; len1 = 0;
                throw takeFromExternrefTable0(ret[2]);
            }
            deferred2_0 = ptr1;
            deferred2_1 = len1;
            return getStringFromWasm0(ptr1, len1);
        } finally {
            wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
        }
    }
    /**
     * `deck.sequence(deals)` for `deals >= 1` (the TypeScript checks the rest, and Python's cache): the sequences
     * of `deals` cards dealt one by one, as a die of tuples.
     *
     * Python builds them step by step from `Die([()])`: each step maps every sequence so far to the die of the
     * cards left (`Die(self - curr)`) appended to it.
     * @param {number} deals
     * @returns {WasmDie}
     */
    sequence(deals) {
        const ret = wasm.wasmdeck_sequence(this.__wbg_ptr, deals);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return WasmDie.__wrap(ret[0]);
    }
    /**
     * `deck.split(which)` once the TypeScript has selected the outcomes (one flag per outcome): `[selected,
     * rest]`.
     * @param {Uint8Array} mask
     * @returns {WasmDeck[]}
     */
    split(mask) {
        const ptr0 = passArray8ToWasm0(mask, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.wasmdeck_split(this.__wbg_ptr, ptr0, len0);
        if (ret[3]) {
            throw takeFromExternrefTable0(ret[2]);
        }
        var v2 = getArrayJsValueFromWasm0(ret[0], ret[1]);
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v2;
    }
    /**
     * `deck.zero()`.
     * @returns {WasmDeck}
     */
    zero() {
        const ret = wasm.wasmdeck_zero(this.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return WasmDeck.__wrap(ret[0]);
    }
}
if (Symbol.dispose) WasmDeck.prototype[Symbol.dispose] = WasmDeck.prototype.free;

/**
 * A die of the core. JS frees it with `free()` (the TypeScript `Die` does so on `dispose`, or when it is
 * garbage-collected).
 */
export class WasmDie {
    static __wrap(ptr) {
        const obj = Object.create(WasmDie.prototype);
        obj.__wbg_ptr = ptr;
        WasmDieFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    static __unwrap(jsValue) {
        if (!(jsValue instanceof WasmDie)) {
            return 0;
        }
        return jsValue.__destroy_into_raw();
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WasmDieFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmdie_free(ptr, 0);
    }
    /**
     * `die.append(outcome, quantity)`: that much more of the outcome (a negative quantity removes, down to zero).
     * @param {any} outcome
     * @param {any} quantity
     * @returns {WasmDie}
     */
    append(outcome, quantity) {
        const ret = wasm.wasmdie_append(this.__wbg_ptr, outcome, quantity);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return WasmDie.__wrap(ret[0]);
    }
    /**
     * `self <op> other` outcome by outcome (`Die.binary_operator`).
     * @param {BinaryOp} op
     * @param {WasmDie} other
     * @returns {WasmDie}
     */
    binary(op, other) {
        _assertClass(other, WasmDie);
        const ret = wasm.wasmdie_binary(this.__wbg_ptr, op, other.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return WasmDie.__wrap(ret[0]);
    }
    /**
     * `die.clip(min, max)` (`null` for no bound).
     * @param {any} min
     * @param {any} max
     * @returns {WasmDie}
     */
    clip(min, max) {
        const ret = wasm.wasmdie_clip(this.__wbg_ptr, min, max);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return WasmDie.__wrap(ret[0]);
    }
    /**
     * `die.cmp(other)`: 1, -1 or 0 per pair of outcomes.
     * @param {WasmDie} other
     * @returns {WasmDie}
     */
    cmp(other) {
        _assertClass(other, WasmDie);
        const ret = wasm.wasmdie_cmp(this.__wbg_ptr, other.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return WasmDie.__wrap(ret[0]);
    }
    /**
     * `die.common_outcome_length()`: a number, or `null`.
     * @returns {number | undefined}
     */
    commonOutcomeLength() {
        const ret = wasm.wasmdie_commonOutcomeLength(this.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return ret[0] === Number.MAX_SAFE_INTEGER ? undefined : ret[0];
    }
    /**
     * A new `WasmDie` of this die, for a JS callback's result the core takes over (taking it empties the JS
     * object, so the callback hands over a copy rather than a die of the API).
     * @returns {WasmDie}
     */
    copy() {
        const ret = wasm.wasmdie_copy(this.__wbg_ptr);
        return WasmDie.__wrap(ret);
    }
    /**
     * @param {any} i
     * @param {any} j
     * @returns {any}
     */
    correlation(i, j) {
        const ret = wasm.wasmdie_correlation(this.__wbg_ptr, i, j);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * `die.covariance(i, j)` of two elements of tuple outcomes.
     * @param {any} i
     * @param {any} j
     * @returns {any}
     */
    covariance(i, j) {
        const ret = wasm.wasmdie_covariance(this.__wbg_ptr, i, j);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * @param {WasmDie} other
     * @returns {any}
     */
    cramerVonMises(other) {
        _assertClass(other, WasmDie);
        const ret = wasm.wasmdie_cramerVonMises(this.__wbg_ptr, other.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * `icepool.d(sides)`.
     * @param {any} sides
     * @returns {WasmDie}
     */
    static d(sides) {
        const ret = wasm.wasmdie_d(sides);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return WasmDie.__wrap(ret[0]);
    }
    /**
     * @returns {any}
     */
    denominator() {
        const ret = wasm.wasmdie_denominator(this.__wbg_ptr);
        return ret;
    }
    /**
     * `die.divide_quantities(divisor)`.
     * @param {any} divisor
     * @returns {WasmDie}
     */
    divideQuantities(divisor) {
        const ret = wasm.wasmdie_divideQuantities(this.__wbg_ptr, divisor);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return WasmDie.__wrap(ret[0]);
    }
    /**
     * The die with no outcomes (`Die([])`, `Die([Reroll])`).
     * @returns {WasmDie}
     */
    static empty() {
        const ret = wasm.wasmdie_empty();
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return WasmDie.__wrap(ret[0]);
    }
    /**
     * @param {any} base
     * @returns {any}
     */
    entropy(base) {
        const ret = wasm.wasmdie_entropy(this.__wbg_ptr, base);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * `die.equals(other, simplify=simplify)` for another die.
     * @param {WasmDie} other
     * @param {boolean} simplify
     * @returns {boolean}
     */
    equals(other, simplify) {
        _assertClass(other, WasmDie);
        const ret = wasm.wasmdie_equals(this.__wbg_ptr, other.__wbg_ptr, simplify);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return ret[0] !== 0;
    }
    /**
     * population/again.py `evaluate_agains_using_count` once the TypeScript has checked `again_count`, built
     * `not_again_die` (the outcomes that are not `Again`), its `zero` outcome, `step_die` (one tupleized step
     * outcome per face) and `again_end_die` (ignored when `restart`, for `again_end=Restart`).
     * @param {WasmDie} step_die
     * @param {WasmDie} not_again_die
     * @param {any} zero
     * @param {number} again_count
     * @param {WasmDie} again_end_die
     * @param {boolean} restart
     * @returns {WasmDie}
     */
    static evaluateAgainsUsingCount(step_die, not_again_die, zero, again_count, again_end_die, restart) {
        _assertClass(step_die, WasmDie);
        _assertClass(not_again_die, WasmDie);
        _assertClass(again_end_die, WasmDie);
        const ret = wasm.wasmdie_evaluateAgainsUsingCount(step_die.__wbg_ptr, not_again_die.__wbg_ptr, zero, again_count, again_end_die.__wbg_ptr, restart);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return WasmDie.__wrap(ret[0]);
    }
    /**
     * @returns {any}
     */
    excessKurtosis() {
        const ret = wasm.wasmdie_excessKurtosis(this.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * `format(die, spec)` (`''` is `str(die)`); `type_name` is Python's `type(die).__name__` (`Die`, or
     * `DieWithTruth` for the result of `==` / `!=`).
     * @param {string} spec
     * @param {string} type_name
     * @returns {string}
     */
    format(spec, type_name) {
        let deferred4_0;
        let deferred4_1;
        try {
            const ptr0 = passStringToWasm0(spec, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(type_name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len1 = WASM_VECTOR_LEN;
            const ret = wasm.wasmdie_format(this.__wbg_ptr, ptr0, len0, ptr1, len1);
            var ptr3 = ret[0];
            var len3 = ret[1];
            if (ret[3]) {
                ptr3 = 0; len3 = 0;
                throw takeFromExternrefTable0(ret[2]);
            }
            deferred4_0 = ptr3;
            deferred4_1 = len3;
            return getStringFromWasm0(ptr3, len3);
        } finally {
            wasm.__wbindgen_free(deferred4_0, deferred4_1, 1);
        }
    }
    /**
     * The quantity of an outcome (a `KeyError` if it is not one). Python looks it up in a dict, which hashes
     * the key first.
     * @param {any} outcome
     * @returns {any}
     */
    get(outcome) {
        const ret = wasm.wasmdie_get(this.__wbg_ptr, outcome);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * `outcome[index]` for each outcome, in order (the keys of `die.group_by[index]`).
     * @param {any} index
     * @returns {any[]}
     */
    getitems(index) {
        const ret = wasm.wasmdie_getitems(this.__wbg_ptr, index);
        if (ret[3]) {
            throw takeFromExternrefTable0(ret[2]);
        }
        var v1 = getArrayJsValueFromWasm0(ret[0], ret[1]);
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
    /**
     * `die.group_by(...)` given each outcome's key (plain values): `[key, die]` pairs for each distinct key (by
     * Python's `==`), in order of first appearance.
     * @param {any[]} keys
     * @returns {any[]}
     */
    groupBy(keys) {
        const ptr0 = passArrayJsValueToWasm0(keys, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.wasmdie_groupBy(this.__wbg_ptr, ptr0, len0);
        if (ret[3]) {
            throw takeFromExternrefTable0(ret[2]);
        }
        var v2 = getArrayJsValueFromWasm0(ret[0], ret[1]);
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v2;
    }
    /**
     * `outcome in die`.
     * @param {any} outcome
     * @returns {boolean}
     */
    has(outcome) {
        const ret = wasm.wasmdie_has(this.__wbg_ptr, outcome);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return ret[0] !== 0;
    }
    /**
     * `[outcome, quantity]` pairs in sorted order, zero quantities included.
     * @returns {any[]}
     */
    items() {
        const ret = wasm.wasmdie_items(this.__wbg_ptr);
        if (ret[3]) {
            throw takeFromExternrefTable0(ret[2]);
        }
        var v1 = getArrayJsValueFromWasm0(ret[0], ret[1]);
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
    /**
     * `die._highest_single(rolls)` (`highest`) or `_lowest_single(rolls)` for an int `rolls > 0` (the TypeScript
     * makes `rolls == 0` `zero().simplify()`): `from_cumulative` over each cumulative quantity `** rolls`. The
     * core refuses results no memory holds (`MemoryError`), and a die whose quantities are all 0 or 1 answers for
     * any number of rolls, as Python does.
     * @param {any} rolls
     * @param {boolean} highest
     * @returns {WasmDie}
     */
    keepSingle(rolls, highest) {
        const ret = wasm.wasmdie_keepSingle(this.__wbg_ptr, rolls, highest);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return WasmDie.__wrap(ret[0]);
    }
    /**
     * @param {WasmDie} other
     * @returns {any}
     */
    kolmogorovSmirnov(other) {
        _assertClass(other, WasmDie);
        const ret = wasm.wasmdie_kolmogorovSmirnov(this.__wbg_ptr, other.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * `die.marginals[start:stop:step]`.
     * @param {any} start
     * @param {any} stop
     * @param {any} step
     * @returns {WasmDie}
     */
    marginalSlice(start, stop, step) {
        const ret = wasm.wasmdie_marginalSlice(this.__wbg_ptr, start, stop, step);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return WasmDie.__wrap(ret[0]);
    }
    /**
     * `die.marginals[index]`.
     * @param {any} index
     * @returns {WasmDie}
     */
    marginal(index) {
        const ret = wasm.wasmdie_marginal(this.__wbg_ptr, index);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return WasmDie.__wrap(ret[0]);
    }
    /**
     * `len(die.marginals)`.
     * @returns {number}
     */
    marginalsLength() {
        const ret = wasm.wasmdie_marginalsLength(this.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return ret[0] >>> 0;
    }
    /**
     * `self @ die`: roll this die, then roll `die` that many times and sum.
     * @param {WasmDie} die
     * @returns {WasmDie}
     */
    matmul(die) {
        _assertClass(die, WasmDie);
        const ret = wasm.wasmdie_matmul(this.__wbg_ptr, die.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return WasmDie.__wrap(ret[0]);
    }
    /**
     * @returns {any}
     */
    maxOutcome() {
        const ret = wasm.wasmdie_maxOutcome(this.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * `die.mean_time_to_sum(target)`, extending this die's cache as Python's loop does.
     * @param {any} target
     * @returns {any}
     */
    meanTimeToSum(target) {
        const ret = wasm.wasmdie_meanTimeToSum(this.__wbg_ptr, target);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * @returns {any}
     */
    mean() {
        const ret = wasm.wasmdie_mean(this.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * `outcome in collection` for each outcome (`_select_outcomes` given a collection): Python's `==` between the
     * collection's elements and the outcome, element by element.
     * @param {any[]} collection
     * @returns {Uint8Array}
     */
    memberships(collection) {
        const ptr0 = passArrayJsValueToWasm0(collection, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.wasmdie_memberships(this.__wbg_ptr, ptr0, len0);
        if (ret[3]) {
            throw takeFromExternrefTable0(ret[2]);
        }
        var v2 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v2;
    }
    /**
     * @returns {any}
     */
    minOutcome() {
        const ret = wasm.wasmdie_minOutcome(this.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * @returns {any}
     */
    modalQuantity() {
        const ret = wasm.wasmdie_modalQuantity(this.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * `die.mode()`: a tuple of the outcomes with the highest quantity.
     * @returns {any}
     */
    mode() {
        const ret = wasm.wasmdie_mode(this.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * `die.modulo_quantities(divisor)`.
     * @param {any} divisor
     * @returns {WasmDie}
     */
    moduloQuantities(divisor) {
        const ret = wasm.wasmdie_moduloQuantities(this.__wbg_ptr, divisor);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return WasmDie.__wrap(ret[0]);
    }
    /**
     * `die.multiply_quantities(scale)`.
     * @param {any} scale
     * @returns {WasmDie}
     */
    multiplyQuantities(scale) {
        const ret = wasm.wasmdie_multiplyQuantities(this.__wbg_ptr, scale);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return WasmDie.__wrap(ret[0]);
    }
    /**
     * `die.multiply_to_denominator(denominator)`.
     * @param {any} denominator
     * @returns {WasmDie}
     */
    multiplyToDenominator(denominator) {
        const ret = wasm.wasmdie_multiplyToDenominator(this.__wbg_ptr, denominator);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return WasmDie.__wrap(ret[0]);
    }
    /**
     * `die.nearest(comparison, outcome)`: `null` if no outcome fits.
     * @param {string} comparison_
     * @param {any} outcome
     * @returns {any}
     */
    nearest(comparison_, outcome) {
        const ptr0 = passStringToWasm0(comparison_, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.wasmdie_nearest(this.__wbg_ptr, ptr0, len0, outcome);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * The outcomes in sorted order.
     * @returns {any[]}
     */
    outcomes() {
        const ret = wasm.wasmdie_outcomes(this.__wbg_ptr);
        if (ret[3]) {
            throw takeFromExternrefTable0(ret[2]);
        }
        var v1 = getArrayJsValueFromWasm0(ret[0], ret[1]);
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
    /**
     * `die.pad_to_denominator(denominator, outcome)`.
     * @param {any} denominator
     * @param {any} outcome
     * @returns {WasmDie}
     */
    padToDenominator(denominator, outcome) {
        const ret = wasm.wasmdie_padToDenominator(this.__wbg_ptr, denominator, outcome);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return WasmDie.__wrap(ret[0]);
    }
    /**
     * `die.probabilities(comparison, percent=percent)`.
     * @param {string | null | undefined} comparison_
     * @param {boolean} percent
     * @returns {any}
     */
    probabilities(comparison_, percent) {
        var ptr0 = isLikeNone(comparison_) ? 0 : passStringToWasm0(comparison_, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        const ret = wasm.wasmdie_probabilities(this.__wbg_ptr, ptr0, len0, percent);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * `die.probability_where(..., percent=percent)` once the selection is known.
     * @param {Uint8Array} mask
     * @param {boolean} percent
     * @returns {any}
     */
    probabilityWhere(mask, percent) {
        const ptr0 = passArray8ToWasm0(mask, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.wasmdie_probabilityWhere(this.__wbg_ptr, ptr0, len0, percent);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * `die.probability(comparison, outcome, percent=percent)`.
     * @param {string | null | undefined} comparison_
     * @param {any} outcome
     * @param {boolean} percent
     * @returns {any}
     */
    probability(comparison_, outcome, percent) {
        var ptr0 = isLikeNone(comparison_) ? 0 : passStringToWasm0(comparison_, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        const ret = wasm.wasmdie_probability(this.__wbg_ptr, ptr0, len0, outcome, percent);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * @param {any} n
     * @param {any} d
     * @returns {any}
     */
    quantileHigh(n, d) {
        const ret = wasm.wasmdie_quantileHigh(this.__wbg_ptr, n, d);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * @param {any} n
     * @param {any} d
     * @returns {any}
     */
    quantileLow(n, d) {
        const ret = wasm.wasmdie_quantileLow(this.__wbg_ptr, n, d);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * `die.quantile(n, d)` (`median` is `quantile(1, 2)`).
     * @param {any} n
     * @param {any} d
     * @returns {any}
     */
    quantile(n, d) {
        const ret = wasm.wasmdie_quantile(this.__wbg_ptr, n, d);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * `tuple(die.quantities(comparison))`.
     * @param {string | null} [comparison_]
     * @returns {any[]}
     */
    quantities(comparison_) {
        var ptr0 = isLikeNone(comparison_) ? 0 : passStringToWasm0(comparison_, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        const ret = wasm.wasmdie_quantities(this.__wbg_ptr, ptr0, len0);
        if (ret[3]) {
            throw takeFromExternrefTable0(ret[2]);
        }
        var v2 = getArrayJsValueFromWasm0(ret[0], ret[1]);
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v2;
    }
    /**
     * `die.quantity_where(...)` once the selection is known.
     * @param {Uint8Array} mask
     * @returns {any}
     */
    quantityWhere(mask) {
        const ptr0 = passArray8ToWasm0(mask, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.wasmdie_quantityWhere(this.__wbg_ptr, ptr0, len0);
        return ret;
    }
    /**
     * `die.quantity(comparison, outcome)`.
     * @param {string | null | undefined} comparison_
     * @param {any} outcome
     * @returns {any}
     */
    quantity(comparison_, outcome) {
        var ptr0 = isLikeNone(comparison_) ? 0 : passStringToWasm0(comparison_, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        const ret = wasm.wasmdie_quantity(this.__wbg_ptr, ptr0, len0, outcome);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * `die.remove(outcome, quantity)`: that much less of the outcome; `null` removes all of it.
     * @param {any} outcome
     * @param {any} quantity
     * @returns {WasmDie}
     */
    remove(outcome, quantity) {
        const ret = wasm.wasmdie_remove(this.__wbg_ptr, outcome, quantity);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return WasmDie.__wrap(ret[0]);
    }
    /**
     * `repr(die)`: `Die({outcome!r: quantity, ...})`, or `DieWithTruth(...)`.
     * @param {string} type_name
     * @returns {string}
     */
    repr(type_name) {
        let deferred3_0;
        let deferred3_1;
        try {
            const ptr0 = passStringToWasm0(type_name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            const ret = wasm.wasmdie_repr(this.__wbg_ptr, ptr0, len0);
            var ptr2 = ret[0];
            var len2 = ret[1];
            if (ret[3]) {
                ptr2 = 0; len2 = 0;
                throw takeFromExternrefTable0(ret[2]);
            }
            deferred3_0 = ptr2;
            deferred3_1 = len2;
            return getStringFromWasm0(ptr2, len2);
        } finally {
            wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
        }
    }
    /**
     * `die.reroll(...)` once the selection is known: the selected outcomes are rerolled up to `depth` times
     * (`undefined`: until they stop coming up).
     * @param {Uint8Array} mask
     * @param {number | null} [depth]
     * @returns {WasmDie}
     */
    reroll(mask, depth) {
        const ptr0 = passArray8ToWasm0(mask, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.wasmdie_reroll(this.__wbg_ptr, ptr0, len0, isLikeNone(depth) ? Number.MAX_SAFE_INTEGER : (depth) >>> 0);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return WasmDie.__wrap(ret[0]);
    }
    /**
     * `round(die, ndigits)`: each outcome rounded (so a bad `ndigits` only raises if there is an outcome).
     * @param {any} ndigits
     * @returns {WasmDie}
     */
    round(ndigits) {
        const ret = wasm.wasmdie_round(this.__wbg_ptr, ndigits);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return WasmDie.__wrap(ret[0]);
    }
    /**
     * `[die.sample() for _ in range(n)]` after Python's `random.seed(seed)` (an int seed).
     * @param {any} seed
     * @param {number} n
     * @returns {any[]}
     */
    sample(seed, n) {
        const ret = wasm.wasmdie_sample(this.__wbg_ptr, seed, n);
        if (ret[3]) {
            throw takeFromExternrefTable0(ret[2]);
        }
        var v1 = getArrayJsValueFromWasm0(ret[0], ret[1]);
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
    /**
     * `die.sequence(rolls)` for `rolls >= 1`: the die of the tuples of `rolls` rolls in order (`MemoryError` past
     * what memory holds).
     * @param {any} rolls
     * @returns {WasmDie}
     */
    sequence(rolls) {
        const ret = wasm.wasmdie_sequence(this.__wbg_ptr, rolls);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return WasmDie.__wrap(ret[0]);
    }
    /**
     * `die.sign()`.
     * @returns {WasmDie}
     */
    sign() {
        const ret = wasm.wasmdie_sign(this.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return WasmDie.__wrap(ret[0]);
    }
    /**
     * `die.simplify()`.
     * @returns {WasmDie}
     */
    simplify() {
        const ret = wasm.wasmdie_simplify(this.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return WasmDie.__wrap(ret[0]);
    }
    /**
     * `Die([outcome])`.
     * @param {any} outcome
     * @returns {WasmDie}
     */
    static single(outcome) {
        const ret = wasm.wasmdie_single(outcome);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return WasmDie.__wrap(ret[0]);
    }
    /**
     * The number of outcomes.
     * @returns {number}
     */
    get size() {
        const ret = wasm.wasmdie_size(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @returns {any}
     */
    skewness() {
        const ret = wasm.wasmdie_skewness(this.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * `die.split(...)` once the selection is known: `[selected, rest]`.
     * @param {Uint8Array} mask
     * @returns {WasmDie[]}
     */
    split(mask) {
        const ptr0 = passArray8ToWasm0(mask, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.wasmdie_split(this.__wbg_ptr, ptr0, len0);
        if (ret[3]) {
            throw takeFromExternrefTable0(ret[2]);
        }
        var v2 = getArrayJsValueFromWasm0(ret[0], ret[1]);
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v2;
    }
    /**
     * @returns {any}
     */
    standardDeviation() {
        const ret = wasm.wasmdie_standardDeviation(this.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * @param {any} k
     * @returns {any}
     */
    standardizedMoment(k) {
        const ret = wasm.wasmdie_standardizedMoment(this.__wbg_ptr, k);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * `die.to_one_hot(outcomes)` once the TypeScript has looked each of this die's outcomes up in `outcomes`
     * (Python's `in` and `index`): `positions` holds the index of each, or -1 for one not there; `len` is
     * `len(outcomes)`.
     * @param {number} len
     * @param {Int32Array} positions
     * @returns {WasmDie}
     */
    toOneHot(len, positions) {
        const ptr0 = passArray32ToWasm0(positions, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.wasmdie_toOneHot(this.__wbg_ptr, len, ptr0, len0);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return WasmDie.__wrap(ret[0]);
    }
    /**
     * `die.truncate(min, max)` (`null` for no bound).
     * @param {any} min
     * @param {any} max
     * @returns {WasmDie}
     */
    truncate(min, max) {
        const ret = wasm.wasmdie_truncate(this.__wbg_ptr, min, max);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return WasmDie.__wrap(ret[0]);
    }
    /**
     * `<op> self` outcome by outcome (`Die.unary_operator`).
     * @param {UnaryOp} op
     * @returns {WasmDie}
     */
    unary(op) {
        const ret = wasm.wasmdie_unary(this.__wbg_ptr, op);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return WasmDie.__wrap(ret[0]);
    }
    /**
     * @returns {any}
     */
    variance() {
        const ret = wasm.wasmdie_variance(this.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * `icepool.z(sides)`.
     * @param {any} sides
     * @returns {WasmDie}
     */
    static z(sides) {
        const ret = wasm.wasmdie_z(sides);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return WasmDie.__wrap(ret[0]);
    }
    /**
     * `die.zero_outcome()`: `self.zero().outcomes()[0]`.
     * @returns {any}
     */
    zeroOutcome() {
        const ret = wasm.wasmdie_zeroOutcome(this.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * `die.zero()`.
     * @returns {WasmDie}
     */
    zero() {
        const ret = wasm.wasmdie_zero(this.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return WasmDie.__wrap(ret[0]);
    }
}
if (Symbol.dispose) WasmDie.prototype[Symbol.dispose] = WasmDie.prototype.free;

/**
 * A keep generator of the core, held by the TypeScript `Pool` (and the other keep generators it makes).
 */
export class WasmGenerator {
    static __wrap(ptr) {
        const obj = Object.create(WasmGenerator.prototype);
        obj.__wbg_ptr = ptr;
        WasmGeneratorFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    static __unwrap(jsValue) {
        if (!(jsValue instanceof WasmGenerator)) {
            return 0;
        }
        return jsValue.__destroy_into_raw();
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WasmGeneratorFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmgenerator_free(ptr, 0);
    }
    /**
     * `CompoundKeepGenerator(generators, (1, ) * sum(generator.keep_size() for generator in generators))`: the
     * additive union of keep generators without negative keeps.
     * @param {WasmGenerator[]} generators
     * @returns {WasmGenerator}
     */
    static compound(generators) {
        const ptr0 = passArrayJsValueToWasm0(generators, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.wasmgenerator_compound(ptr0, len0);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return WasmGenerator.__wrap(ret[0]);
    }
    /**
     * Another handle on the same generator, for a call that takes generators by value.
     * @returns {WasmGenerator}
     */
    copy() {
        const ret = wasm.wasmgenerator_copy(this.__wbg_ptr);
        return WasmGenerator.__wrap(ret);
    }
    /**
     * `[repr(deal), str(deal)]`.
     * @returns {string[]}
     */
    dealStrs() {
        const ret = wasm.wasmgenerator_dealStrs(this.__wbg_ptr);
        if (ret[3]) {
            throw takeFromExternrefTable0(ret[2]);
        }
        var v1 = getArrayJsValueFromWasm0(ret[0], ret[1]);
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
    /**
     * `deck()`.
     * @returns {WasmDeck}
     */
    deck() {
        const ret = wasm.wasmgenerator_deck(this.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return WasmDeck.__wrap(ret[0]);
    }
    /**
     * `denominator()` (also a deal's).
     * @returns {any}
     */
    denominator() {
        const ret = wasm.wasmgenerator_denominator(this.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * `_dice`: the `(die, count)` pairs (in `hash_key` order), as `[die, count, die, count, ...]`.
     * @returns {any[]}
     */
    dice() {
        const ret = wasm.wasmgenerator_dice(this.__wbg_ptr);
        if (ret[3]) {
            throw takeFromExternrefTable0(ret[2]);
        }
        var v1 = getArrayJsValueFromWasm0(ret[0], ret[1]);
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
    /**
     * `hand_size()`.
     * @returns {number}
     */
    handSize() {
        const ret = wasm.wasmgenerator_handSize(this.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return ret[0] >>> 0;
    }
    /**
     * `has_negative_keeps()`.
     * @returns {boolean}
     */
    hasNegativeKeeps() {
        const ret = wasm.wasmgenerator_hasNegativeKeeps(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * Whether this is a `Deal` (neither: a `CompoundKeepGenerator`).
     * @returns {boolean}
     */
    isDeal() {
        const ret = wasm.wasmgenerator_isDeal(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * Whether this is a `Pool`.
     * @returns {boolean}
     */
    isPool() {
        const ret = wasm.wasmgenerator_isPool(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * `keep(int)` up to the generator Python then evaluates into a die (the keep evaluator, `evaluate.rs`).
     * @param {any} index
     * @returns {WasmGenerator}
     */
    keepIndex(index) {
        const ret = wasm.wasmgenerator_keepIndex(this.__wbg_ptr, index);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return WasmGenerator.__wrap(ret[0]);
    }
    /**
     * `keep(sequence)`: one count per element, `null` for `...`.
     * @param {any[]} counts
     * @returns {WasmGenerator}
     */
    keepSequence(counts) {
        const ptr0 = passArrayJsValueToWasm0(counts, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.wasmgenerator_keepSequence(this.__wbg_ptr, ptr0, len0);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return WasmGenerator.__wrap(ret[0]);
    }
    /**
     * `keep_size()`.
     * @returns {any}
     */
    keepSize() {
        const ret = wasm.wasmgenerator_keepSize(this.__wbg_ptr);
        return ret;
    }
    /**
     * `keep(slice(start, stop, step))`: the bounds as ints (or null), `step` whether one was given (an
     * `IndexError`).
     * @param {any} start
     * @param {any} stop
     * @param {boolean} step
     * @returns {WasmGenerator}
     */
    keepSlice(start, stop, step) {
        const ret = wasm.wasmgenerator_keepSlice(this.__wbg_ptr, start, stop, step);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return WasmGenerator.__wrap(ret[0]);
    }
    /**
     * `keep_tuple()`.
     * @returns {any[]}
     */
    keepTuple() {
        const ret = wasm.wasmgenerator_keepTuple(this.__wbg_ptr);
        var v1 = getArrayJsValueFromWasm0(ret[0], ret[1]);
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
    /**
     * `Pool.additive_union` of pools: one pool if every sorted position counts the same, else `undefined` (the
     * TypeScript goes on to `KeepGenerator.additive_union`).
     * @param {WasmGenerator[]} generators
     * @returns {WasmGenerator | undefined}
     */
    static mergePools(generators) {
        const ptr0 = passArrayJsValueToWasm0(generators, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.wasmgenerator_mergePools(ptr0, len0);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return ret[0] === 0 ? undefined : WasmGenerator.__wrap(ret[0]);
    }
    /**
     * `multiply_counts(constant)` (also `generator * n` and `-generator`).
     * @param {any} constant
     * @returns {WasmGenerator}
     */
    multiplyCounts(constant) {
        const ret = wasm.wasmgenerator_multiplyCounts(this.__wbg_ptr, constant);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return WasmGenerator.__wrap(ret[0]);
    }
    /**
     * `outcomes()`: the union of the dice's outcomes, ascending (dice put in zero times included).
     * @returns {any}
     */
    outcomes() {
        const ret = wasm.wasmgenerator_outcomes(this.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * `raw_size()`: the number of dice before the keep tuple is applied.
     * @returns {number}
     */
    rawSize() {
        const ret = wasm.wasmgenerator_rawSize(this.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return ret[0] >>> 0;
    }
    /**
     * Whether the two have equal `hash_key`s (a `MultisetMixture` counts equal inners as one).
     * @param {WasmGenerator} other
     * @returns {boolean}
     */
    sameKey(other) {
        _assertClass(other, WasmGenerator);
        const ret = wasm.wasmgenerator_sameKey(this.__wbg_ptr, other.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * `str(generator)`: `Pool.__str__`, `Deal.__str__` or `CompoundKeepGenerator.__str__`.
     * @returns {string}
     */
    toString() {
        let deferred2_0;
        let deferred2_1;
        try {
            const ret = wasm.wasmgenerator_toString(this.__wbg_ptr);
            var ptr1 = ret[0];
            var len1 = ret[1];
            if (ret[3]) {
                ptr1 = 0; len1 = 0;
                throw takeFromExternrefTable0(ret[2]);
            }
            deferred2_0 = ptr1;
            deferred2_1 = len1;
            return getStringFromWasm0(ptr1, len1);
        } finally {
            wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
        }
    }
}
if (Symbol.dispose) WasmGenerator.prototype[Symbol.dispose] = WasmGenerator.prototype.free;

/**
 * A multi-deal of the core: a multiset tuple generator, under the TypeScript `MultiDeal`.
 */
export class WasmMultiDeal {
    static __wrap(ptr) {
        const obj = Object.create(WasmMultiDeal.prototype);
        obj.__wbg_ptr = ptr;
        WasmMultiDealFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WasmMultiDealFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmmultideal_free(ptr, 0);
    }
    /**
     * `deck()`.
     * @returns {WasmDeck}
     */
    deck() {
        const ret = wasm.wasmmultideal_deck(this.__wbg_ptr);
        return WasmDeck.__wrap(ret);
    }
    /**
     * `denominator()`.
     * @returns {any}
     */
    denominator() {
        const ret = wasm.wasmmultideal_denominator(this.__wbg_ptr);
        return ret;
    }
    /**
     * `hand_sizes()`.
     * @returns {Uint32Array}
     */
    handSizes() {
        const ret = wasm.wasmmultideal_handSizes(this.__wbg_ptr);
        var v1 = getArrayU32FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
    /**
     * `len(multi_deal)`: the number of hands.
     * @returns {number}
     */
    get length() {
        const ret = wasm.wasmmultideal_length(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * Whether the two have equal `hash_key`s `(MultiDeal, deck, hand_groups)`.
     * @param {WasmMultiDeal} other
     * @returns {boolean}
     */
    sameKey(other) {
        _assertClass(other, WasmMultiDeal);
        const ret = wasm.wasmmultideal_sameKey(this.__wbg_ptr, other.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * `[repr(multi_deal), str(multi_deal)]`.
     * @returns {string[]}
     */
    strs() {
        const ret = wasm.wasmmultideal_strs(this.__wbg_ptr);
        if (ret[3]) {
            throw takeFromExternrefTable0(ret[2]);
        }
        var v1 = getArrayJsValueFromWasm0(ret[0], ret[1]);
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
    /**
     * `total_cards_dealt()`.
     * @returns {number}
     */
    totalCardsDealt() {
        const ret = wasm.wasmmultideal_totalCardsDealt(this.__wbg_ptr);
        return ret >>> 0;
    }
}
if (Symbol.dispose) WasmMultiDeal.prototype[Symbol.dispose] = WasmMultiDeal.prototype.free;

/**
 * `absorbing_markov_chain_impl(transition_cache, initial_state)` once the TypeScript has made `initial_die =
 * Die([initial_state])`: `[absorption die, mean absorption time]`, the time a `Fraction`, or `null` if a `Restart`
 * was possible.
 * @param {any} transition
 * @param {any[]} extra_quantities
 * @param {WasmDie} initial_die
 * @returns {any[]}
 */
export function absorbingMarkovChain(transition, extra_quantities, initial_die) {
    const ptr0 = passArrayJsValueToWasm0(extra_quantities, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    _assertClass(initial_die, WasmDie);
    const ret = wasm.absorbingMarkovChain(transition, ptr0, len0, initial_die.__wbg_ptr);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v2 = getArrayJsValueFromWasm0(ret[0], ret[1]);
    wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
    return v2;
}

/**
 * `[make_step_outcome(outcome) for outcome in outcomes]` of `evaluate_agains_using_count`, before tupleizing:
 * `[zero, 1, -1]` for an outcome that is not an expression, `[outcome._evaluate(zero), 0, outcome._again_count()
 * - 1]` for an additive one (a `ValueError` for any other). `Die(...)` then tupleizes these arrays as Python's
 * `make_step_outcome` does.
 * @param {any[]} outcomes
 * @param {any} zero
 * @returns {any[]}
 */
export function againStepOutcomes(outcomes, zero) {
    const ptr0 = passArrayJsValueToWasm0(outcomes, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.againStepOutcomes(ptr0, len0, zero);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v2 = getArrayJsValueFromWasm0(ret[0], ret[1]);
    wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
    return v2;
}

/**
 * khepri's `f2f.calculate`: the engine input object in,
 * `{rolls, outcomes: [{player, wounds, chance}, ...]}` out. Throws an `Error` where Python raises.
 *
 * `rolls` is a Number when it is a safe integer and a BigInt beyond 2**53, as Pyodide's `to_js` converts a Python
 * int. `chance` is `float(Fraction(q, denominator))`, bit for bit.
 * @param {any} engine_input
 * @returns {any}
 */
export function calculate(engine_input) {
    const ret = wasm.calculate(engine_input);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * The `dict` items of `coin(n, d)` (ints, once a non-int numerator has become a Fraction's numerator and
 * denominator), as `[outcome, quantity]` pairs.
 * @param {any} n
 * @param {any} d
 * @returns {any[]}
 */
export function coinData(n, d) {
    const ret = wasm.coinData(n, d);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v1 = getArrayJsValueFromWasm0(ret[0], ret[1]);
    wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
    return v1;
}

/**
 * `consecutive(*args)` given what each of its two chains over the arguments yields.
 * @param {any[]} first
 * @param {any[]} second
 * @returns {any}
 */
export function consecutive(first, second) {
    const ptr0 = passArrayJsValueToWasm0(first, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passArrayJsValueToWasm0(second, wasm.__wbindgen_malloc);
    const len1 = WASM_VECTOR_LEN;
    const ret = wasm.consecutive(ptr0, len0, ptr1, len1);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * The keys of a Python dict literal `{k0: ..., k1: ..., ...}` with plain-value keys: for each key, the index of the
 * first key equal to it (itself if none is), as Python's dict keeps the first spelling of a key (and the last
 * value). Keys must be hashable; equal keys are those Python's `==` (and hash) find equal: `1`, `1.0` and `true`
 * are one key, as are two arrays with equal elements.
 * @param {any[]} keys
 * @returns {Uint32Array}
 */
export function dictKeys(keys) {
    const ptr0 = passArrayJsValueToWasm0(keys, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.dictKeys(ptr0, len0);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v2 = getArrayU32FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
    return v2;
}

/**
 * `mapping.get(x)` for each of `xs`, in a dict with these distinct plain keys: the index of the key equal to each
 * (Python's `==` and hash), or -1 for none. Each `x` must be hashable, as Python's lookup requires.
 * @param {any[]} keys
 * @param {any[]} xs
 * @returns {Int32Array}
 */
export function dictLookup(keys, xs) {
    const ptr0 = passArrayJsValueToWasm0(keys, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passArrayJsValueToWasm0(xs, wasm.__wbindgen_malloc);
    const len1 = WASM_VECTOR_LEN;
    const ret = wasm.dictLookup(ptr0, len0, ptr1, len1);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v3 = getArrayI32FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
    return v3;
}

/**
 * `evaluate_agains_using_depth(outcomes, times, again_depth, again_end)` after the TypeScript has checked
 * `again_depth`, replaced a `null` `again_end` with the zero outcome and rejected `Restart`: `end_is_reroll` for
 * `again_end=Reroll` (every expression at the innermost level becomes `reroll`, the JS `Reroll`). Returns the
 * TypeScript die.
 * @param {any[]} outcomes
 * @param {any[]} times
 * @param {number} again_depth
 * @param {any} again_end
 * @param {boolean} end_is_reroll
 * @param {any} reroll
 * @returns {any}
 */
export function evaluateAgainsUsingDepth(outcomes, times, again_depth, again_end, end_is_reroll, reroll) {
    const ptr0 = passArrayJsValueToWasm0(outcomes, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passArrayJsValueToWasm0(times, wasm.__wbindgen_malloc);
    const len1 = WASM_VECTOR_LEN;
    const ret = wasm.evaluateAgainsUsingDepth(ptr0, len0, ptr1, len1, again_depth, again_end, end_is_reroll, reroll);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * `explode_to_pool`'s `count_die = rolls @ Die(single_data)` once the TypeScript has split `die` into `explode` and
 * `not_explode` and checked `depth` (an int): a die of `Vector((exploded, not_exploded))` counts.
 * @param {WasmDie} die
 * @param {WasmDie} explode
 * @param {WasmDie} not_explode
 * @param {any} rolls
 * @param {any} depth
 * @returns {WasmDie}
 */
export function explodeCounts(die, explode, not_explode, rolls, depth) {
    _assertClass(die, WasmDie);
    _assertClass(explode, WasmDie);
    _assertClass(not_explode, WasmDie);
    const ret = wasm.explodeCounts(die.__wbg_ptr, explode.__wbg_ptr, not_explode.__wbg_ptr, rolls, depth);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return WasmDie.__wrap(ret[0]);
}

/**
 * `format_probability_inverse(probability, int_start)`.
 * @param {any} probability
 * @param {any} int_start
 * @returns {string}
 */
export function formatProbabilityInverse(probability, int_start) {
    let deferred2_0;
    let deferred2_1;
    try {
        const ret = wasm.formatProbabilityInverse(probability, int_start);
        var ptr1 = ret[0];
        var len1 = ret[1];
        if (ret[3]) {
            ptr1 = 0; len1 = 0;
            throw takeFromExternrefTable0(ret[2]);
        }
        deferred2_0 = ptr1;
        deferred2_1 = len1;
        return getStringFromWasm0(ptr1, len1);
    } finally {
        wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
    }
}

/**
 * `Fraction(x)`, limited to `max_denominator` unless that is `null` (`Fraction.limit_denominator`), as its
 * `[numerator, denominator]` (ints): what `coin` does with a non-int numerator.
 * @param {any} x
 * @param {any} max_denominator
 * @returns {any[]}
 */
export function fractionParts(x, max_denominator) {
    const ret = wasm.fractionParts(x, max_denominator);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v1 = getArrayJsValueFromWasm0(ret[0], ret[1]);
    wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
    return v1;
}

/**
 * The weights of creation_args.py `itemize(keys, times)` once the TypeScript has one time per key: each time,
 * multiplied by the mapping's value for that key when there is one (`base`: `v * x`), then checked as Python's
 * `any(x < 0 for x in times)` checks them (a `TypeError` for anything that is not a number, a `ValueError` for a
 * negative one).
 * @param {any[] | null | undefined} base
 * @param {any[]} times
 * @returns {any[]}
 */
export function itemizeTimes(base, times) {
    var ptr0 = isLikeNone(base) ? 0 : passArrayJsValueToWasm0(base, wasm.__wbindgen_malloc);
    var len0 = WASM_VECTOR_LEN;
    const ptr1 = passArrayJsValueToWasm0(times, wasm.__wbindgen_malloc);
    const len1 = WASM_VECTOR_LEN;
    const ret = wasm.itemizeTimes(ptr0, len0, ptr1, len1);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v3 = getArrayJsValueFromWasm0(ret[0], ret[1]);
    wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
    return v3;
}

/**
 * population/keep.py `highest_slice(keep, drop)` (`highest`) or `lowest_slice(keep, drop)`: `[start, stop]`,
 * null for no bound. `keep` and `drop` are ints or null.
 * @param {boolean} highest
 * @param {any} keep
 * @param {any} drop
 * @returns {any[]}
 */
export function keepDropSlice(highest, keep, drop) {
    const ret = wasm.keepDropSlice(highest, keep, drop);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v1 = getArrayJsValueFromWasm0(ret[0], ret[1]);
    wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
    return v1;
}

/**
 * keep.py `_highest_single(*dice)` (`highest`) or `_lowest_single(*dice)`: roll all the dice (at least one, none
 * empty) and take the highest (lowest) single one. wasm-bindgen takes the dice over, so the TypeScript passes
 * copies.
 * @param {WasmDie[]} dice
 * @param {boolean} highest
 * @returns {WasmDie}
 */
export function keepSingleOf(dice, highest) {
    const ptr0 = passArrayJsValueToWasm0(dice, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.keepSingleOf(ptr0, len0, highest);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return WasmDie.__wrap(ret[0]);
}

/**
 * lexi.py `compute_lexi_tuple(comparison, order)`, for `max_pair_keep` / `max_pair_drop`.
 * @param {string} comparison
 * @param {number} order
 * @returns {Int32Array}
 */
export function lexiTuple(comparison, order) {
    const ptr0 = passStringToWasm0(comparison, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.lexiTuple(ptr0, len0, order);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v2 = getArrayI32FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
    return v2;
}

/**
 * lexi.py `compute_lexi_tuple_with_zero_right_first(comparison)`, for `versus_all` / `versus_any`: the tuple,
 * then the order.
 * @param {string} comparison
 * @returns {Int32Array}
 */
export function lexiTupleZeroRightFirst(comparison) {
    const ptr0 = passStringToWasm0(comparison, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.lexiTupleZeroRightFirst(ptr0, len0);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v2 = getArrayI32FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
    return v2;
}

/**
 * How many dice JS holds (for leak checks).
 * @returns {number}
 */
export function liveDice() {
    const ret = wasm.liveDice();
    return ret >>> 0;
}

/**
 * `map_and_time(...)` from `initial_die = Die([initial_state])`: the die of `(state, time)`; `repeat` as for
 * `mapRepeat` (a negative one is 0: `range` is then empty).
 * @param {any} transition
 * @param {any[]} extra_quantities
 * @param {WasmDie} initial_die
 * @param {number | null} [repeat]
 * @returns {WasmDie}
 */
export function mapAndTime(transition, extra_quantities, initial_die, repeat) {
    const ptr0 = passArrayJsValueToWasm0(extra_quantities, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    _assertClass(initial_die, WasmDie);
    const ret = wasm.mapAndTime(transition, ptr0, len0, initial_die.__wbg_ptr, isLikeNone(repeat) ? Number.MAX_SAFE_INTEGER : (repeat) >>> 0);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return WasmDie.__wrap(ret[0]);
}

/**
 * The `else` branch of `map(repeat=repeat)` (a `repeat` that is not infinite, negative or zero), from
 * `initial_die = Die([first_arg])`; `repeat` is `undefined` where `range(repeat)` raises (a non-int).
 * @param {any} transition
 * @param {any[]} extra_quantities
 * @param {WasmDie} initial_die
 * @param {number | null} [repeat]
 * @returns {WasmDie}
 */
export function mapRepeat(transition, extra_quantities, initial_die, repeat) {
    const ptr0 = passArrayJsValueToWasm0(extra_quantities, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    _assertClass(initial_die, WasmDie);
    const ret = wasm.mapRepeat(transition, ptr0, len0, initial_die.__wbg_ptr, isLikeNone(repeat) ? Number.MAX_SAFE_INTEGER : (repeat) >>> 0);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return WasmDie.__wrap(ret[0]);
}

/**
 * `KeepGenerator.middle(keep, tie=tie)` up to the slice it keeps of `keep_size` elements: `[start, stop]`.
 * @param {any} keep_size
 * @param {any} keep
 * @param {any} tie
 * @returns {any[]}
 */
export function middleSlice(keep_size, keep, tie) {
    const ret = wasm.middleSlice(keep_size, keep, tie);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v1 = getArrayJsValueFromWasm0(ret[0], ret[1]);
    wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
    return v1;
}

/**
 * Python's `min(items)` (`max` false) or `max(items)` (`min_outcome` / `max_outcome`).
 * @param {any[]} items
 * @param {boolean} max
 * @returns {any}
 */
export function minMax(items, max) {
    const ptr0 = passArrayJsValueToWasm0(items, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.minMax(ptr0, len0, max);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * `one_hot(sides)`.
 * @param {any} sides
 * @returns {WasmDie}
 */
export function oneHot(sides) {
    const ret = wasm.oneHot(sides);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return WasmDie.__wrap(ret[0]);
}

/**
 * Python's `sorted(values)` (wallenius.py sorts the weights pulled).
 * @param {any[]} values
 * @returns {any}
 */
export function pySorted(values) {
    const ptr0 = passArrayJsValueToWasm0(values, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.pySorted(ptr0, len0);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * After a trap (a Rust panic: WASM has no unwinding), once JS has left every call into the instance: resets the
 * core's per-call state, which the trap skipped the destructors of, and returns the panic's message (empty if
 * none was recorded).
 * @returns {string}
 */
export function recover() {
    let deferred1_0;
    let deferred1_1;
    try {
        const ret = wasm.recover();
        deferred1_0 = ret[0];
        deferred1_1 = ret[1];
        return getStringFromWasm0(ret[0], ret[1]);
    } finally {
        wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
    }
}

/**
 * `reroll_to_pool`'s `pool_composition` for a finite `max_rerolls` (`depth` already resolved: `'inf'` is
 * `max_rerolls`): a die of `(rerollable, rerolled, rerolled_to_rerollable)` tuples. `rerollable` is the rerollable
 * half of `die` after `split`. The counts are Python values, so all arithmetic on them is `Value`'s.
 * @param {WasmDie} die
 * @param {WasmDie} rerollable
 * @param {any} rolls
 * @param {any} max_rerolls
 * @param {any} depth
 * @returns {WasmDie}
 */
export function rerollComposition(die, rerollable, rolls, max_rerolls, depth) {
    _assertClass(die, WasmDie);
    _assertClass(rerollable, WasmDie);
    const ret = wasm.rerollComposition(die.__wbg_ptr, rerollable.__wbg_ptr, rolls, max_rerolls, depth);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return WasmDie.__wrap(ret[0]);
}

/**
 * `len([None] * len[start:stop:step])`: the `len()` of a slice of a multiset tuple expression of `len` multisets
 * (`MultisetTupleSlice.__len__`); the bounds as Python takes them (ints, None, or anything else to raise).
 * @param {number} len
 * @param {any} start
 * @param {any} stop
 * @param {any} step
 * @returns {number}
 */
export function sliceLength(len, start, stop, step) {
    const ret = wasm.sliceLength(len, start, stop, step);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return ret[0] >>> 0;
}

/**
 * `sorted_union(*args)` given the elements of each argument (an array per argument).
 * @param {any[]} args
 * @returns {any}
 */
export function sortedUnion(args) {
    const ptr0 = passArrayJsValueToWasm0(args, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.sortedUnion(ptr0, len0);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * The instance's shadow stack pointer, the `WebAssembly.Global` `__stack_pointer` (exported by build.rs), or
 * `undefined`. Rust keeps its frames' locals on this stack in linear memory; a trap abandons them without
 * popping them, so the JS facade saves its value before each outermost call and puts it back after a trap.
 * @returns {any}
 */
export function stack_pointer() {
    const ret = wasm.stack_pointer();
    return ret;
}

/**
 * `d_pool` of a mapping builds `itertools.chain.from_iterable([k] * v for k, v in die_sizes.items())`: the
 * length of that list once `count` more copies of a size are added to the `len` it has (a negative count adds
 * none), or Python's `MemoryError` past what memory holds (as the program runner checks it).
 * @param {number} len
 * @param {any} count
 * @returns {number}
 */
export function standardPoolLength(len, count) {
    const ret = wasm.standardPoolLength(len, count);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return ret[0] >>> 0;
}

/**
 * Runs when the module is instantiated: panics record their message (the default hook would print it to a
 * console the caller may not see, and the trap itself only says "unreachable").
 */
export function start() {
    wasm.start();
}

/**
 * `Symbols(x)` for a string (parsed: the characters after a dash count negatively), an iterable of characters (`x`
 * an array), or a mapping (`mapping`: `x` its `[key, count]` pairs).
 * @param {any} x
 * @param {boolean} mapping
 * @returns {any}
 */
export function symbolsFrom(x, mapping) {
    const ret = wasm.symbolsFrom(x, mapping);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * A `Symbols`' method `name` (snake_case) or protocol (see `protocol`), with one argument (`count_subset`: the
 * array `[divisor, empty_divisor]`; `count_subset_mapping`: a mapping's `[key, count]` items; `getattr`:
 * `s.<arg>`, which is `s[arg]` for a public name).
 * @param {any} s
 * @param {string} name
 * @param {any} arg
 * @returns {any}
 */
export function symbolsMethod(s, name, arg) {
    const ptr0 = passStringToWasm0(name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.symbolsMethod(s, ptr0, len0, arg);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * `a <op> b` for two plain values.
 * @param {BinaryOp} op
 * @param {any} a
 * @param {any} b
 * @returns {any}
 */
export function valueBinary(op, a, b) {
    const ret = wasm.valueBinary(op, a, b);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * Python's `repr(a)` for a plain value.
 * @param {any} a
 * @returns {string}
 */
export function valueRepr(a) {
    let deferred2_0;
    let deferred2_1;
    try {
        const ret = wasm.valueRepr(a);
        var ptr1 = ret[0];
        var len1 = ret[1];
        if (ret[3]) {
            ptr1 = 0; len1 = 0;
            throw takeFromExternrefTable0(ret[2]);
        }
        deferred2_0 = ptr1;
        deferred2_1 = len1;
        return getStringFromWasm0(ptr1, len1);
    } finally {
        wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
    }
}

/**
 * `round(a, ndigits)` for a plain value.
 * @param {any} a
 * @param {any} ndigits
 * @returns {any}
 */
export function valueRound(a, ndigits) {
    const ret = wasm.valueRound(a, ndigits);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * Python's `str(a)` for a plain value.
 * @param {any} a
 * @returns {string}
 */
export function valueStr(a) {
    let deferred2_0;
    let deferred2_1;
    try {
        const ret = wasm.valueStr(a);
        var ptr1 = ret[0];
        var len1 = ret[1];
        if (ret[3]) {
            ptr1 = 0; len1 = 0;
            throw takeFromExternrefTable0(ret[2]);
        }
        deferred2_0 = ptr1;
        deferred2_1 = len1;
        return getStringFromWasm0(ptr1, len1);
    } finally {
        wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
    }
}

/**
 * Python's `bool(a)` for a plain value (a Vector from a comparison has its truth value; Symbols theirs).
 * @param {any} a
 * @returns {boolean}
 */
export function valueTruth(a) {
    const ret = wasm.valueTruth(a);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return ret[0] !== 0;
}

/**
 * `<op> a` for a plain value.
 * @param {UnaryOp} op
 * @param {any} a
 * @returns {any}
 */
export function valueUnary(op, a) {
    const ret = wasm.valueUnary(op, a);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * A `Vector`'s method `name` (`append`, `concatenate`) or protocol (see `protocol`), with one argument.
 * @param {any} v
 * @param {string} name
 * @param {any} arg
 * @returns {any}
 */
export function vectorMethod(v, name, arg) {
    const ptr0 = passStringToWasm0(name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.vectorMethod(v, ptr0, len0, arg);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * math.py `weighted_lcm(denominators, weights)`: the scale factor for each die (`harmonize_denominators`), given
 * what each of Python's two `zip(denominators, weights)` passes takes from the weights.
 * @param {any[]} denominators
 * @param {any[]} weights
 * @param {any[]} weights_again
 * @returns {any[]}
 */
export function weightedLcm(denominators, weights, weights_again) {
    const ptr0 = passArrayJsValueToWasm0(denominators, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passArrayJsValueToWasm0(weights, wasm.__wbindgen_malloc);
    const len1 = WASM_VECTOR_LEN;
    const ptr2 = passArrayJsValueToWasm0(weights_again, wasm.__wbindgen_malloc);
    const len2 = WASM_VECTOR_LEN;
    const ret = wasm.weightedLcm(ptr0, len0, ptr1, len1, ptr2, len2);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v4 = getArrayJsValueFromWasm0(ret[0], ret[1]);
    wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
    return v4;
}
function __wbg_get_imports() {
    const import0 = {
        __proto__: null,
        __wbg_BigInt_26047a9b1ef41b80: function(arg0, arg1) {
            const ret = BigInt(getStringFromWasm0(arg0, arg1));
            return ret;
        },
        __wbg_BigInt_474db89c4a23b7be: function(arg0, arg1) {
            const ret = BigInt(getStringFromWasm0(arg0, arg1));
            return ret;
        },
        __wbg_Error_30c8987f7c2ed4e2: function(arg0, arg1) {
            const ret = Error(getStringFromWasm0(arg0, arg1));
            return ret;
        },
        __wbg_String_cd9b6e5efe92688b: function(arg0, arg1) {
            const ret = String(arg1);
            const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len1 = WASM_VECTOR_LEN;
            getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
            getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
        },
        __wbg___wbindgen_boolean_get_5b446f51afd21013: function(arg0) {
            const v = arg0;
            const ret = typeof(v) === 'boolean' ? v : undefined;
            return isLikeNone(ret) ? 0xFFFFFF : ret ? 1 : 0;
        },
        __wbg___wbindgen_exports_2a21194318bb0cb2: function() {
            const ret = wasm;
            return ret;
        },
        __wbg___wbindgen_is_bigint_b123553bed3bb382: function(arg0) {
            const ret = typeof(arg0) === 'bigint';
            return ret;
        },
        __wbg___wbindgen_is_function_1f9d30630b8b1d3d: function(arg0) {
            const ret = typeof(arg0) === 'function';
            return ret;
        },
        __wbg___wbindgen_is_null_e343b7d08827ba72: function(arg0) {
            const ret = arg0 === null;
            return ret;
        },
        __wbg___wbindgen_is_null_or_undefined_f9435d56bdcc06df: function(arg0) {
            const ret = arg0 == null;
            return ret;
        },
        __wbg___wbindgen_is_undefined_8865fb403f8fe9d8: function(arg0) {
            const ret = arg0 === undefined;
            return ret;
        },
        __wbg___wbindgen_number_get_2e0e7dee9f701a71: function(arg0, arg1) {
            const obj = arg1;
            const ret = typeof(obj) === 'number' ? obj : undefined;
            getDataViewMemory0().setFloat64(arg0 + 8 * 1, isLikeNone(ret) ? 0 : ret, true);
            getDataViewMemory0().setInt32(arg0 + 4 * 0, !isLikeNone(ret), true);
        },
        __wbg___wbindgen_string_get_0380ccaa2f57f0d9: function(arg0, arg1) {
            const obj = arg1;
            const ret = typeof(obj) === 'string' ? obj : undefined;
            var ptr1 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            var len1 = WASM_VECTOR_LEN;
            getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
            getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
        },
        __wbg___wbindgen_throw_41e9ee4f547fc59a: function(arg0, arg1) {
            throw new Error(getStringFromWasm0(arg0, arg1));
        },
        __wbg_againApply_5d0b2a6c1ed3c2a4: function(arg0, arg1, arg2, arg3) {
            var v0 = getArrayJsValueFromWasm0(arg2, arg3);
            wasm.__wbindgen_free(arg2, arg3 * 4, 4);
            const ret = __icepool_wasm_host.againApply(arg1, v0);
            const ptr2 = passArrayJsValueToWasm0(ret, wasm.__wbindgen_malloc);
            const len2 = WASM_VECTOR_LEN;
            getDataViewMemory0().setInt32(arg0 + 4 * 1, len2, true);
            getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr2, true);
        },
        __wbg_againDie_67713f14228b3221: function(arg0, arg1, arg2, arg3) {
            var v0 = getArrayJsValueFromWasm0(arg1, arg2);
            wasm.__wbindgen_free(arg1, arg2 * 4, 4);
            const ret = __icepool_wasm_host.againDie(v0, arg3);
            const ptr2 = passArrayJsValueToWasm0(ret, wasm.__wbindgen_malloc);
            const len2 = WASM_VECTOR_LEN;
            getDataViewMemory0().setInt32(arg0 + 4 * 1, len2, true);
            getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr2, true);
        },
        __wbg_againParts_b643c9dc6542e5d6: function(arg0, arg1) {
            const ret = __icepool_wasm_host.againParts(arg1);
            const ptr1 = passArrayJsValueToWasm0(ret, wasm.__wbindgen_malloc);
            const len1 = WASM_VECTOR_LEN;
            getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
            getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
        },
        __wbg_callFunction_1b2f9e37d01c15f1: function(arg0, arg1, arg2, arg3) {
            var v0 = getArrayJsValueFromWasm0(arg2, arg3);
            wasm.__wbindgen_free(arg2, arg3 * 4, 4);
            const ret = __icepool_wasm_host.callFunction(arg1, v0);
            const ptr2 = passArrayJsValueToWasm0(ret, wasm.__wbindgen_malloc);
            const len2 = WASM_VECTOR_LEN;
            getDataViewMemory0().setInt32(arg0 + 4 * 1, len2, true);
            getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr2, true);
        },
        __wbg_countFunction_b767930f64832919: function(arg0, arg1, arg2, arg3, arg4) {
            var v0 = getArrayJsValueFromWasm0(arg3, arg4);
            wasm.__wbindgen_free(arg3, arg4 * 4, 4);
            const ret = __icepool_wasm_host.countFunction(arg1, arg2, v0);
            const ptr2 = passArrayJsValueToWasm0(ret, wasm.__wbindgen_malloc);
            const len2 = WASM_VECTOR_LEN;
            getDataViewMemory0().setInt32(arg0 + 4 * 1, len2, true);
            getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr2, true);
        },
        __wbg_describe_7edc2b73e54de355: function(arg0, arg1) {
            const ret = __icepool_wasm_host.describe(arg1);
            const ptr1 = passArrayJsValueToWasm0(ret, wasm.__wbindgen_malloc);
            const len1 = WASM_VECTOR_LEN;
            getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
            getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
        },
        __wbg_expressionbuilder_unwrap: function(arg0) {
            const ret = ExpressionBuilder.__unwrap(arg0);
            return ret;
        },
        __wbg_extraOutcomes_c77b917caecfb38e: function(arg0, arg1, arg2) {
            const ret = arg1.extraOutcomes(arg2);
            const ptr1 = passArrayJsValueToWasm0(ret, wasm.__wbindgen_malloc);
            const len1 = WASM_VECTOR_LEN;
            getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
            getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
        },
        __wbg_finalOutcome_c1178d18d869d11e: function(arg0, arg1, arg2, arg3, arg4, arg5, arg6) {
            var v0 = getArrayJsValueFromWasm0(arg5, arg6);
            wasm.__wbindgen_free(arg5, arg6 * 4, 4);
            const ret = arg1.finalOutcome(arg2, arg3, arg4, v0);
            const ptr2 = passArrayJsValueToWasm0(ret, wasm.__wbindgen_malloc);
            const len2 = WASM_VECTOR_LEN;
            getDataViewMemory0().setInt32(arg0 + 4 * 1, len2, true);
            getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr2, true);
        },
        __wbg_from_4a57847e61cb3dd0: function(arg0, arg1) {
            const ret = Array.from(arg1);
            const ptr1 = passArrayJsValueToWasm0(ret, wasm.__wbindgen_malloc);
            const len1 = WASM_VECTOR_LEN;
            getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
            getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
        },
        __wbg_get_486fb36a43127fe5: function(arg0, arg1) {
            const ret = Reflect.get(arg0, arg1);
            return ret;
        },
        __wbg_initialState_5e63673baf2d223b: function(arg0, arg1, arg2, arg3, arg4, arg5) {
            var v0 = getArrayJsValueFromWasm0(arg4, arg5);
            wasm.__wbindgen_free(arg4, arg5 * 4, 4);
            const ret = arg1.initialState(arg2, arg3, v0);
            const ptr2 = passArrayJsValueToWasm0(ret, wasm.__wbindgen_malloc);
            const len2 = WASM_VECTOR_LEN;
            getDataViewMemory0().setInt32(arg0 + 4 * 1, len2, true);
            getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr2, true);
        },
        __wbg_makeComplex_5176b2ff8b133b92: function(arg0, arg1) {
            const ret = __icepool_wasm_host.makeComplex(arg0, arg1);
            return ret;
        },
        __wbg_makeError_880ad29b0e4fcf98: function(arg0, arg1, arg2, arg3, arg4, arg5) {
            const ret = __icepool_wasm_host.makeError(getStringFromWasm0(arg0, arg1), getStringFromWasm0(arg2, arg3), getStringFromWasm0(arg4, arg5));
            return ret;
        },
        __wbg_makeFloat_6be5bca130725c68: function(arg0) {
            const ret = __icepool_wasm_host.makeFloat(arg0);
            return ret;
        },
        __wbg_makeFraction_c088c15a02dcad5a: function(arg0, arg1) {
            const ret = __icepool_wasm_host.makeFraction(arg0, arg1);
            return ret;
        },
        __wbg_makeOpaque_8ea85536c5c14c0e: function(arg0, arg1) {
            const ret = __icepool_wasm_host.makeOpaque(getStringFromWasm0(arg0, arg1));
            return ret;
        },
        __wbg_makeState_3d69d68deab625f8: function(arg0, arg1) {
            const ret = __icepool_wasm_host.makeState(getStringFromWasm0(arg0, arg1));
            return ret;
        },
        __wbg_makeSymbols_e88ec3df0bd1a505: function(arg0, arg1, arg2, arg3) {
            var v0 = getArrayJsValueFromWasm0(arg0, arg1);
            wasm.__wbindgen_free(arg0, arg1 * 4, 4);
            let v1;
            if (arg2 !== 0) {
                v1 = getStringFromWasm0(arg2, arg3);
                wasm.__wbindgen_free(arg2, arg3 * 1, 1);
            }
            const ret = __icepool_wasm_host.makeSymbols(v0, v1);
            return ret;
        },
        __wbg_makeVector_4745cfef2034b622: function(arg0, arg1, arg2) {
            const ret = __icepool_wasm_host.makeVector(arg0, arg1 !== 0, arg2);
            return ret;
        },
        __wbg_nextState_e7241f9e1c18d817: function(arg0, arg1, arg2, arg3, arg4, arg5, arg6) {
            var v0 = getArrayJsValueFromWasm0(arg5, arg6);
            wasm.__wbindgen_free(arg5, arg6 * 4, 4);
            const ret = arg1.nextState(arg2, arg3, arg4, v0);
            const ptr2 = passArrayJsValueToWasm0(ret, wasm.__wbindgen_malloc);
            const len2 = WASM_VECTOR_LEN;
            getDataViewMemory0().setInt32(arg0 + 4 * 1, len2, true);
            getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr2, true);
        },
        __wbg_outcomePredicate_ec77725b84f0acf0: function(arg0, arg1, arg2) {
            const ret = __icepool_wasm_host.outcomePredicate(arg1, arg2);
            const ptr1 = passArrayJsValueToWasm0(ret, wasm.__wbindgen_malloc);
            const len1 = WASM_VECTOR_LEN;
            getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
            getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
        },
        __wbg_parse_2c7b82b8abe49ba8: function() { return handleError(function (arg0, arg1) {
            const ret = JSON.parse(getStringFromWasm0(arg0, arg1));
            return ret;
        }, arguments); },
        __wbg_set_44c2cf43fe6389dc: function(arg0, arg1, arg2) {
            const ret = Reflect.set(arg0, arg1, arg2);
            return ret;
        },
        __wbg_step_b24e6ca2471edb02: function(arg0, arg1, arg2, arg3) {
            const ret = arg1.step(arg2, arg3 >>> 0);
            const ptr1 = passArrayJsValueToWasm0(ret, wasm.__wbindgen_malloc);
            const len1 = WASM_VECTOR_LEN;
            getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
            getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
        },
        __wbg_stringify_1303785a4a4babec: function() { return handleError(function (arg0) {
            const ret = JSON.stringify(arg0);
            return ret;
        }, arguments); },
        __wbg_traceFunction_f8ea490a89962b47: function(arg0, arg1, arg2, arg3, arg4) {
            var v0 = getArrayJsValueFromWasm0(arg2, arg3);
            wasm.__wbindgen_free(arg2, arg3 * 4, 4);
            const ret = __icepool_wasm_host.traceFunction(arg1, v0, arg4);
            const ptr2 = passArrayJsValueToWasm0(ret, wasm.__wbindgen_malloc);
            const len2 = WASM_VECTOR_LEN;
            getDataViewMemory0().setInt32(arg0 + 4 * 1, len2, true);
            getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr2, true);
        },
        __wbg_tupleize_db0209e8ee448526: function(arg0, arg1, arg2) {
            var v0 = getArrayJsValueFromWasm0(arg1, arg2);
            wasm.__wbindgen_free(arg1, arg2 * 4, 4);
            const ret = __icepool_wasm_host.tupleize(v0);
            const ptr2 = passArrayJsValueToWasm0(ret, wasm.__wbindgen_malloc);
            const len2 = WASM_VECTOR_LEN;
            getDataViewMemory0().setInt32(arg0 + 4 * 1, len2, true);
            getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr2, true);
        },
        __wbg_wasmdeck_new: function(arg0) {
            const ret = WasmDeck.__wrap(arg0);
            return ret;
        },
        __wbg_wasmdie_new: function(arg0) {
            const ret = WasmDie.__wrap(arg0);
            return ret;
        },
        __wbg_wasmdie_unwrap: function(arg0) {
            const ret = WasmDie.__unwrap(arg0);
            return ret;
        },
        __wbg_wasmgenerator_unwrap: function(arg0) {
            const ret = WasmGenerator.__unwrap(arg0);
            return ret;
        },
        __wbindgen_generic_0000000000000001: function(arg0) {
            // Cast intrinsic for `F64 -> Externref`.
            const ret = arg0;
            return ret;
        },
        __wbindgen_generic_0000000000000002: function(arg0, arg1) {
            // Cast intrinsic for `Ref(String) -> Externref`.
            const ret = getStringFromWasm0(arg0, arg1);
            return ret;
        },
        __wbindgen_generic_0000000000000003: function(arg0, arg1) {
            var v0 = getArrayJsValueFromWasm0(arg0, arg1);
            wasm.__wbindgen_free(arg0, arg1 * 4, 4);
            // Cast intrinsic for `Vector(Externref) -> Externref`.
            const ret = v0;
            return ret;
        },
        __wbindgen_init_externref_table: function() {
            const table = wasm.__wbindgen_externrefs;
            const offset = table.grow(4);
            table.set(0, undefined);
            table.set(offset + 0, undefined);
            table.set(offset + 1, null);
            table.set(offset + 2, true);
            table.set(offset + 3, false);
        },
    };
    return {
        __proto__: null,
        "./icepool_wasm_bg.js": import0,
    };
}

const DeckBuilderFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_deckbuilder_free(ptr, 1));
const DiceArgsFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_diceargs_free(ptr, 1));
const DieBuilderFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_diebuilder_free(ptr, 1));
const ExpressionBuilderFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_expressionbuilder_free(ptr, 1));
const PoolBuilderFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_poolbuilder_free(ptr, 1));
const WasmDeckFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wasmdeck_free(ptr, 1));
const WasmDieFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wasmdie_free(ptr, 1));
const WasmGeneratorFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wasmgenerator_free(ptr, 1));
const WasmMultiDealFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wasmmultideal_free(ptr, 1));

function addToExternrefTable0(obj) {
    const idx = wasm.__externref_table_alloc();
    wasm.__wbindgen_externrefs.set(idx, obj);
    return idx;
}

function _assertClass(instance, klass) {
    if (!(instance instanceof klass)) {
        throw new Error(`expected instance of ${klass.name}`);
    }
}

function getArrayI32FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getInt32ArrayMemory0().subarray(ptr / 4, ptr / 4 + len);
}

function getArrayJsValueFromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    const mem = getDataViewMemory0();
    const result = [];
    for (let i = ptr; i < ptr + 4 * len; i += 4) {
        result.push(wasm.__wbindgen_externrefs.get(mem.getUint32(i, true)));
    }
    wasm.__externref_drop_slice(ptr, len);
    return result;
}

function getArrayU32FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getUint32ArrayMemory0().subarray(ptr / 4, ptr / 4 + len);
}

function getArrayU8FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getUint8ArrayMemory0().subarray(ptr / 1, ptr / 1 + len);
}

let cachedDataViewMemory0 = null;
function getDataViewMemory0() {
    if (cachedDataViewMemory0 === null || cachedDataViewMemory0.buffer.detached === true || (cachedDataViewMemory0.buffer.detached === undefined && cachedDataViewMemory0.buffer !== wasm.memory.buffer)) {
        cachedDataViewMemory0 = new DataView(wasm.memory.buffer);
    }
    return cachedDataViewMemory0;
}

let cachedInt32ArrayMemory0 = null;
function getInt32ArrayMemory0() {
    if (cachedInt32ArrayMemory0 === null || cachedInt32ArrayMemory0.byteLength === 0) {
        cachedInt32ArrayMemory0 = new Int32Array(wasm.memory.buffer);
    }
    return cachedInt32ArrayMemory0;
}

function getStringFromWasm0(ptr, len) {
    return decodeText(ptr >>> 0, len);
}

let cachedUint32ArrayMemory0 = null;
function getUint32ArrayMemory0() {
    if (cachedUint32ArrayMemory0 === null || cachedUint32ArrayMemory0.byteLength === 0) {
        cachedUint32ArrayMemory0 = new Uint32Array(wasm.memory.buffer);
    }
    return cachedUint32ArrayMemory0;
}

let cachedUint8ArrayMemory0 = null;
function getUint8ArrayMemory0() {
    if (cachedUint8ArrayMemory0 === null || cachedUint8ArrayMemory0.byteLength === 0) {
        cachedUint8ArrayMemory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8ArrayMemory0;
}

function handleError(f, args) {
    try {
        return f.apply(this, args);
    } catch (e) {
        const idx = addToExternrefTable0(e);
        wasm.__wbindgen_exn_store(idx);
    }
}

function isLikeNone(x) {
    return x === undefined || x === null;
}

function passArray32ToWasm0(arg, malloc) {
    const ptr = malloc(arg.length * 4, 4) >>> 0;
    getUint32ArrayMemory0().set(arg, ptr / 4);
    WASM_VECTOR_LEN = arg.length;
    return ptr;
}

function passArray8ToWasm0(arg, malloc) {
    const ptr = malloc(arg.length * 1, 1) >>> 0;
    getUint8ArrayMemory0().set(arg, ptr / 1);
    WASM_VECTOR_LEN = arg.length;
    return ptr;
}

function passArrayJsValueToWasm0(array, malloc) {
    const ptr = malloc(array.length * 4, 4) >>> 0;
    for (let i = 0; i < array.length; i++) {
        const add = addToExternrefTable0(array[i]);
        getDataViewMemory0().setUint32(ptr + 4 * i, add, true);
    }
    WASM_VECTOR_LEN = array.length;
    return ptr;
}

function passStringToWasm0(arg, malloc, realloc) {
    if (realloc === undefined) {
        const buf = cachedTextEncoder.encode(arg);
        const ptr = malloc(buf.length, 1) >>> 0;
        getUint8ArrayMemory0().subarray(ptr, ptr + buf.length).set(buf);
        WASM_VECTOR_LEN = buf.length;
        return ptr;
    }

    let len = arg.length;
    let ptr = malloc(len, 1) >>> 0;

    const mem = getUint8ArrayMemory0();

    let offset = 0;

    for (; offset < len; offset++) {
        const code = arg.charCodeAt(offset);
        if (code > 0x7F) break;
        mem[ptr + offset] = code;
    }
    if (offset !== len) {
        if (offset !== 0) {
            arg = arg.slice(offset);
        }
        ptr = realloc(ptr, len, len = offset + arg.length * 3, 1) >>> 0;
        const view = getUint8ArrayMemory0().subarray(ptr + offset, ptr + len);
        const ret = cachedTextEncoder.encodeInto(arg, view);

        offset += ret.written;
        ptr = realloc(ptr, len, offset, 1) >>> 0;
    }

    WASM_VECTOR_LEN = offset;
    return ptr;
}

function takeFromExternrefTable0(idx) {
    const value = wasm.__wbindgen_externrefs.get(idx);
    wasm.__externref_table_dealloc(idx);
    return value;
}

let cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });
cachedTextDecoder.decode();
const MAX_SAFARI_DECODE_BYTES = 2146435072;
let numBytesDecoded = 0;
function decodeText(ptr, len) {
    numBytesDecoded += len;
    if (numBytesDecoded >= MAX_SAFARI_DECODE_BYTES) {
        cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });
        cachedTextDecoder.decode();
        numBytesDecoded = len;
    }
    return cachedTextDecoder.decode(getUint8ArrayMemory0().subarray(ptr, ptr + len));
}

const cachedTextEncoder = new TextEncoder();

if (!('encodeInto' in cachedTextEncoder)) {
    cachedTextEncoder.encodeInto = function (arg, view) {
        const buf = cachedTextEncoder.encode(arg);
        view.set(buf);
        return {
            read: arg.length,
            written: buf.length
        };
    };
}

let WASM_VECTOR_LEN = 0;

let wasmModule, wasmInstance, wasm;
function __wbg_finalize_init(instance, module) {
    wasmInstance = instance;
    wasm = instance.exports;
    wasmModule = module;
    cachedDataViewMemory0 = null;
    cachedInt32ArrayMemory0 = null;
    cachedUint32ArrayMemory0 = null;
    cachedUint8ArrayMemory0 = null;
    wasm.__wbindgen_start();
    return wasm;
}

async function __wbg_load(module, imports) {
    if (typeof Response === 'function' && module instanceof Response) {
        if (!module.ok) {
            throw new Error(`failed to fetch Wasm: ${module.status} ${module.statusText} fetching '${module.url}'`);
        }

        if (typeof WebAssembly.instantiateStreaming === 'function') {
            try {
                return await WebAssembly.instantiateStreaming(module, imports);
            } catch (e) {
                const validResponse = expectedResponseType(module.type);

                if (validResponse && module.headers.get('Content-Type') !== 'application/wasm') {
                    console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve Wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);

                } else { throw e; }
            }
        }

        const bytes = await module.arrayBuffer();
        return await WebAssembly.instantiate(bytes, imports);
    } else {
        const instance = await WebAssembly.instantiate(module, imports);

        if (instance instanceof WebAssembly.Instance) {
            return { instance, module };
        } else {
            return instance;
        }
    }

    function expectedResponseType(type) {
        switch (type) {
            case 'basic': case 'cors': case 'default': return true;
        }
        return false;
    }
}

function initSync(module) {
    if (wasm !== undefined) return wasm;


    if (module !== undefined) {
        if (Object.getPrototypeOf(module) === Object.prototype) {
            ({module} = module)
        } else {
            console.warn('using deprecated parameters for `initSync()`; pass a single object instead')
        }
    }

    const imports = __wbg_get_imports();
    if (!(module instanceof WebAssembly.Module)) {
        module = new WebAssembly.Module(module);
    }
    const instance = new WebAssembly.Instance(module, imports);
    return __wbg_finalize_init(instance, module);
}

async function __wbg_init(module_or_path) {
    if (wasm !== undefined) return wasm;


    if (module_or_path !== undefined) {
        if (Object.getPrototypeOf(module_or_path) === Object.prototype) {
            ({module_or_path} = module_or_path)
        } else {
            console.warn('using deprecated parameters for the initialization function; pass a single object instead')
        }
    }

    if (module_or_path === undefined) {
        module_or_path = new URL('icepool_wasm_bg.wasm', import.meta.url);
    }
    const imports = __wbg_get_imports();

    if (typeof module_or_path === 'string' || (typeof Request === 'function' && module_or_path instanceof Request) || (typeof URL === 'function' && module_or_path instanceof URL)) {
        module_or_path = fetch(module_or_path);
    }

    const { instance, module } = await __wbg_load(await module_or_path, imports);

    return __wbg_finalize_init(instance, module);
}

export { initSync, __wbg_init as default };
