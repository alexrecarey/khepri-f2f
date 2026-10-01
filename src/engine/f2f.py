"""Face to Face dice engine: d20 rolls in, wound probabilities out.

Plain Python on top of icepool. The browser runs this exact file: src/engine/worker.js receives it as text and
calls calculate() with an engine input built by src/engine/calculate.js. Tests import it directly:

    uv run --python 3.12 --with icepool==2.2.2 --with pytest pytest src/engine/test_f2f.py

Only the core dice rules live here. Everything the game rules decide happens before this point, in JavaScript:
MODs, range, ARM and BTS, cover, AP halving, Immunities, what each ammunition does, Shock, and splitting a Direct
Template against an attack into two rolls. What arrives is final numbers for each side's attack:

    successValue{S}   the roll's final success value (0 = always fails, over 20 = more Criticals)
    burst{S}          dice rolled (0 = no roll: the other side makes a Normal Roll)
    bonusBurst{S}     Special Dice: rolled too, but only the best `burst` count
    template{S}       hits automatically, `burst` hits, no roll. The other side, if it rolls, is a Dodge: any success
                      cancels every hit.
    saveValue{S}      a Saving Roll against this attack passes on d20 <= saveValue (PS plus ARM or BTS, MODs included)
    saves{S}          Saving Rolls each hit causes (N 1, DA 2, EXP 3; 0 for a roll that causes none, e.g. a Dodge)
    critSave{S}       a Critical causes one more Saving Roll, at saveValue, never with Continuous Damage or extra wounds
    woundsPerFailure{S}   wounds each failed Saving Roll causes (2 for T2)
    cont{S}           Continuous Damage: a failed Saving Roll is rolled again, up to MAX_CONTINUOUS more times
    secondarySave{S}  None, or the save value of a second Saving Roll every one of the `saves` also needs (Plasma's BTS)

for S = A (active) and B (reactive), plus fixedFaceToFace: the reactive side's dice always roll successValueB.
"""
from functools import cache
from fractions import Fraction

from icepool import d20, Die, Pool, MultisetEvaluator, Order, UnsupportedOrder

# Continuous Damage: rolls again after a failed Saving Roll at most this many times.
MAX_CONTINUOUS = 5


# --- To hit ------------------------------------------------------------------------------------------------------

def read_roll(roll, success_value):
    """One d20 read against a success value: 0 = miss, 1-19 = success (higher beats lower), 20 = Critical.

    Over 20, the excess is added to the roll: those that reach 20 or more become Criticals.
    """
    if success_value > 20:
        roll += success_value - 20
        success_value = 20
    if roll == success_value or roll > 20:
        return 20
    return roll if roll < success_value else 0


def infinity_die(success_value):
    """A d20 rolled against this success value, read as above."""
    return d20.map(read_roll, success_value)


class FaceToFace(MultisetEvaluator):
    """Both sides' dice -> (a_crit, a_hit, b_crit, b_hit) left after cancelling.

    Seen from the lowest result up: a result cancels every lower success of the other side, a tie cancels both, and
    a Critical cancels all of the other side's successes and Criticals.
    """

    def initial_state(self, order, outcomes, *sizes):
        if order != Order.Ascending:
            raise UnsupportedOrder()
        return 0, 0, 0, 0

    def next_state(self, state, order, outcome, a_count, b_count):
        a_crit, a_hit, b_crit, b_hit = state
        if outcome == 0:
            return state
        if outcome < 20:
            a_hit += a_count
            b_hit += b_count
        else:
            a_crit += a_count
            b_crit += b_count
            if a_count:
                b_crit = 0
            if b_count:
                a_crit = 0
        if a_count:
            b_hit = 0
        if b_count:
            a_hit = 0
        return a_crit, a_hit, b_crit, b_hit


def dice(p, s):
    """Side s's dice: burst plus Special Dice rolled, the best `burst` kept."""
    burst = p[f'burst{s}']
    return Pool([infinity_die(p[f'successValue{s}'])], burst + p[f'bonusBurst{s}']).highest(burst)


def template_roll(hits, p, dodger):
    """A Direct Template's automatic hits, as (crit, hit), cancelled by any success of the other side."""
    if p[f'burst{dodger}'] == 0:
        return Die([(0, hits)])
    # One success is enough: every die rolled counts, Special Dice included.
    dodge = Pool([infinity_die(p[f'successValue{dodger}'])], p[f'burst{dodger}'] + p[f'bonusBurst{dodger}'])
    return dodge.highest(1).sum().map(lambda best: (0, 0) if best else (0, hits))


def roll(p):
    """The roll: a Die of (a_crit, a_hit, b_crit, b_hit)."""
    if p['templateA'] and p['templateB']:
        raise ValueError('two Direct Templates are two separate rolls')
    if p['templateA']:
        return template_roll(p['burstA'], p, 'B').map(lambda o: (*o, 0, 0))
    if p['templateB']:
        return template_roll(p['burstB'], p, 'A').map(lambda o: (0, 0, *o))
    if p['fixedFaceToFace']:
        # The fixed result stays a success: 19 at most, as 20 would be a Critical.
        fixed = Die([min(p['successValueB'], 19)]).pool(p['burstB'])
        return FaceToFace().evaluate(dice(p, 'A'), fixed)
    return FaceToFace().evaluate(dice(p, 'A'), dice(p, 'B'))


# --- Saving Rolls ------------------------------------------------------------------------------------------------

def wounds(crits, hits, attack):
    """Die of wounds caused by `crits` + `hits` successes of this attack."""
    save = attack['saveValue']
    saves = (crits + hits) * attack['saves']
    crit_saves = crits if attack['critSave'] else 0
    failed = (d20 > save) * attack['woundsPerFailure']
    if attack['cont']:
        failed = failed.explode([attack['woundsPerFailure']], depth=MAX_CONTINUOUS, end=0)
    total = saves @ failed + crit_saves @ (d20 > save)
    if attack['secondarySave'] is not None:
        total += saves @ (d20 > attack['secondarySave'])
    return total


def attack(p, s):
    keys = ['saveValue', 'saves', 'critSave', 'woundsPerFailure', 'cont', 'secondarySave']
    return {k: p[f'{k}{s}'] for k in keys}


def outcomes(p, rolled):
    """Die of (winner, wounds) after the roll `rolled`: 'active' / 'reactive' won it and caused that many wounds,
    or 'fail'."""
    by_side = {'active': attack(p, 'A'), 'reactive': attack(p, 'B')}

    @cache
    def caused(winner, crits, hits):
        return wounds(crits, hits, by_side[winner]).map(lambda w: (winner, w))

    def result(a_crit, a_hit, b_crit, b_hit):
        if a_crit + a_hit:
            return caused('active', a_crit, a_hit)
        if b_crit + b_hit:
            return caused('reactive', b_crit, b_hit)
        return 'fail', 0

    return rolled.map(result, star=True)


# --- Entry point -------------------------------------------------------------------------------------------------

def calculate(p):
    """One calculation. `p` is the engine input (see the top of this file).

    Returns {'rolls': number of distinct rolls, 'outcomes': [{'player', 'wounds', 'chance'}, ...]}.
    """
    rolled = roll(p)
    result = outcomes(p, rolled)
    denominator = result.denominator()
    return {
        'rolls': rolled.denominator(),
        'outcomes': [{'player': player, 'wounds': w, 'chance': float(Fraction(q, denominator))}
                     for (player, w), q in result.items()],
    }
