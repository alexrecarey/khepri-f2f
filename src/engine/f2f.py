"""Face to Face dice engine.

Plain Python on top of icepool. The browser runs this exact file: src/engine/worker.js receives it as text and
calls calculate() with the calculator params (src/engine/params.js). Tests import it directly:

    uv run --python 3.10 --with icepool==1.0.0 --with pytest pytest src/engine/test_f2f.py

Everything the game rules decide (range, MODs, Immunity, AP halving, ...) happens before this point, in
src/rules/. What is left here is dice: success values, bursts, and Saving Rolls per ammunition.
"""
from dataclasses import dataclass
from functools import reduce

from icepool import d20, lowest, Again, Die, Pool
from icepool import MultisetEvaluator


# --- Ammunition: how many Saving Rolls each hit causes, and what a failed one costs -------------------------------

@dataclass(frozen=True)
class Ammo:
    saves: int          # Saving Rolls per hit. A Critical adds one more, which never has T2 or Continuous Damage.
    damage: int = 1     # Wounds per failed Saving Roll (T2 = 2).
    bts_save: bool = False  # Every ARM Saving Roll also needs a BTS one (Plasma).


AMMO = {
    'N': Ammo(saves=1),
    'DA': Ammo(saves=2),
    'EXP': Ammo(saves=3),
    'T2': Ammo(saves=1, damage=2),
    'PLASMA': Ammo(saves=1, bts_save=True),
    # A Dodge wins the Face to Face Roll but causes no Saving Rolls.
    'DODGE': Ammo(saves=0),
    # An attack whose hits do nothing to the target (e.g. E/M against Immunity
    # (BTS)): still rolled and opposed, but causes no Saving Rolls.
    'NONE': Ammo(saves=0),
}


# --- Face to Face Roll -------------------------------------------------------------------------------------------

class InfinityFace2FaceEvaluator(MultisetEvaluator):
    """Outcome of a Face to Face Roll as (a_crit, a_hit, b_crit, b_hit) after cancellation."""

    # Note that outcomes are seen in ascending order by default.
    def next_state(self, state, outcome, a_count, b_count):
        # Initial state is all zeros.
        a_crit, a_success, b_crit, b_success = state or (0, 0, 0, 0)

        if outcome == 0:
            # miss
            pass
        elif outcome < 20:
            # hit
            a_success += a_count
            b_success += b_count
            if a_count > 0:
                b_success = 0
            if b_count > 0:
                a_success = 0
        else:
            # crit
            a_crit += a_count
            b_crit += b_count
            if a_count > 0:
                b_success = 0
                b_crit = 0
            if b_count > 0:
                a_success = 0
                a_crit = 0
        return a_crit, a_success, b_crit, b_success


def infinity_die(roll, sv):
    """Maps a raw d20 roll to an Infinity outcome.

    The resulting die will use 0 for misses (values over success value) and 20 for crits (values equal to the success
    value). The resulting die will have values like:

    0 = miss
    1-19 = hit
    20 = crit
    """
    if sv > 20:
        roll += sv - 20
        sv = 20
    if roll == sv or roll > 20:
        return 20
    elif roll < sv:
        return roll
    else:
        return 0


def face_to_face(
        a_success_value,
        a_burst,
        b_success_value,
        b_burst,
        a_bonus_burst=0,
        b_bonus_burst=0
):
    a_die = d20.map(infinity_die, a_success_value)
    b_die = d20.map(infinity_die, b_success_value)

    return (
        InfinityFace2FaceEvaluator()
        .evaluate(
            Pool([a_die], a_burst + a_bonus_burst).highest(keep=a_burst),
            Pool([b_die], b_burst + b_bonus_burst).highest(keep=b_burst)
        )
    )


def dtw_vs_dodge(dtw_burst, dodge_sv, dodge_burst):
    """Direct Template Weapon against Dodge: every hit lands unless a Dodge succeeds. Returns a Die.

    The Dodge is a Normal Roll: one passing die is enough, so Special Dice are simply more dice (pass burst + bonus).
    """
    if dodge_burst == 0:
        return Die([(0, dtw_burst, 0, 0)])  # Nobody dodges: the template always hits
    hit_die = ((d20 > dodge_sv) * dtw_burst)   # returns hits. Successful dodges are 0 hits,
    result_die = lowest([hit_die] * dodge_burst)
    return result_die.map(lambda x: (0, x, 0, 0))  # Convert into (crit, hit, crit, hit) format


def fixed_face_to_face(a_success_value, a_burst, a_bonus_burst, b_success_value, b_burst):
    a_die = d20.map(infinity_die, a_success_value)
    b_die_face = b_success_value if b_success_value <= 19 else 19  # don't let fixed die be over 19. Fix later to
                                                                   # allow 20, but at the moment 20 is critical hit.
    b_die = Die([b_die_face])  # Create a special die that always rolls the same number

    return InfinityFace2FaceEvaluator().evaluate(
        Pool([a_die], a_burst + a_bonus_burst).highest(keep=a_burst),
        b_die.pool(b_burst))


def face_to_face_result(outcomes):
    result = {
        'active': 0,
        'fail': 0,
        'reactive': 0,
        'total_rolls': 0
    }
    for outcome, amount in outcomes.items():
        result['total_rolls'] += amount
        squash = outcome[0] + outcome[1] - outcome[2] - outcome[3]
        # check if failure result
        if squash == 0:
            result['fail'] += amount
        # Player A wins F2F
        elif squash > 0:
            result['active'] += amount
        # Player B wins F2F
        elif squash < 0:
            result['reactive'] += amount
    return result


# --- Saving Rolls ------------------------------------------------------------------------------------------------

def wounds_die(crits, hits, ammo, armor_save, bts_save=0, cont=False, crit_immune=False, shock=False):
    """Die of wounds caused by `crits` + `hits` successes with this ammunition.

    armor_save / bts_save: highest d20 roll that saves (PS + ARM or BTS). A save fails on d20 > save.
    cont: Continuous Damage, a failed save means rolling again (up to 5 times).
    crit_immune: target ignores the extra Saving Roll of a Critical.
    shock: target has VITA 1 and no immunity, so any failed save sends it straight to Dead, skipping Unconscious.
    That is counted as one extra wound.
    """
    rule = AMMO[ammo]
    # Each hit, Critical or not, causes rule.saves Saving Rolls. Each Critical adds one more, which never gets the
    # ammunition's damage or Continuous Damage. Ammunition without Saving Rolls (Dodge) has no Critical ones either.
    saves = (crits + hits) * rule.saves
    crit_saves = 0 if crit_immune else min(crits, rule.saves * crits)
    plasma_saves = saves if rule.bts_save else 0

    if cont:
        d_save = Die([(rule.damage + Again if x > armor_save else 0) for x in range(1, 21)], again_depth=5)
    else:
        d_save = (d20 > armor_save) * rule.damage
    d_crit = d20 > armor_save  # Crits are always 1 damage
    d_plasma = d20 > bts_save  # Plasma BTS hits are always 1 damage (so far)

    # Thank you HighDiceRoller for this beautiful line of code!
    r = saves @ d_save + crit_saves @ d_crit + plasma_saves @ d_plasma
    if shock:
        r = r.map(lambda w: w + 1 if w > 0 else w)  # Straight to Dead: one extra wound, once
    return r


def face_to_face_expected_wounds(
        outcomes,
        a_opponent_save, a_arm, a_ammo, b_opponent_save, b_arm, b_ammo,
        a_cont=False, a_bts=0, a_crit_immune=False,
        b_cont=False, b_bts=0, b_crit_immune=False,
        a_shock=False, b_shock=False
):
    """Calculates the wounds expected from a face to face encounter.

    a_opponent_save is player A's weapon PS, the save the opponent adds their ARM (or BTS) to. a_arm / a_bts /
    a_crit_immune describe player A as a target. a_cont / a_shock describe player A's attack.

    Return format is {
        'active': {1: 11111, 2: 222222, 3: 33333},
        'reactive': {},
        'fail': {0: 122},
        'total_rolls': 0
    }
    """
    wounds = {
        'active': {},
        'reactive': {},
        'fail': {},
        'total_rolls': 0
    }
    for (a_crit, a_hit, b_crit, b_hit), rolls in outcomes.items():
        wounds['total_rolls'] += rolls
        if a_crit + a_hit > 0:
            winner = 'active'
            r = wounds_die(a_crit, a_hit, a_ammo, a_opponent_save + b_arm, bts_save=a_opponent_save + b_bts,
                           cont=a_cont, crit_immune=b_crit_immune, shock=a_shock)
        elif b_crit + b_hit > 0:
            winner = 'reactive'
            r = wounds_die(b_crit, b_hit, b_ammo, b_opponent_save + a_arm, bts_save=b_opponent_save + a_bts,
                           cont=b_cont, crit_immune=a_crit_immune, shock=b_shock)
        else:
            winner = 'fail'
            r = wounds_die(0, 0, 'N', 0)
        denominator = r.denominator()
        for w, occurrences in r.items():
            wounds[winner][w] = wounds[winner].get(w, 0) + (occurrences/denominator) * rolls
    return wounds


# --- Output formatting -------------------------------------------------------------------------------------------

def format_face_to_face(face_to_face):
    output = []
    for index, player in enumerate(['active', 'reactive', 'fail']):
        output.append({
            'id': index,
            'player': player,
            'raw_chance': face_to_face[player],
            'chance': face_to_face[player]/face_to_face['total_rolls'],
        })
    return output


def consolidate_wounds_over_maximum(wounds, max_wounds_shown=25):
    squashed = {'active': None, 'reactive': None, 'fail': wounds['fail']}
    for player in ['active', 'reactive']:
        over_max = {k: v for k, v in wounds[player].items() if k > max_wounds_shown}
        if len(over_max) > 0:
            additional_successes = reduce(lambda x, y: x+y, over_max.values(), 0)
            new_dict = {k: v for k, v in wounds[player].items() if k <= max_wounds_shown}
            new_dict[max_wounds_shown] = new_dict.get(max_wounds_shown, 0) + additional_successes
            squashed[player] = new_dict
        else:
            squashed[player] = wounds[player]
    return squashed


def format_expected_wounds(wounds, max_wounds_shown=25):
    """Format expected_wounds into a list of results

    Output format is {'player': 'active/reactive/fail', 'wounds': 3, 'chance': 0.2432, 'raw_chance' 1341234.23,
                      'cumulative_chance': 0.53234}
    """
    # Squash items that are > than max_wounds_shown
    total_rolls = wounds['total_rolls']
    squashed = consolidate_wounds_over_maximum(wounds, max_wounds_shown=max_wounds_shown)
    expected_wounds = []
    index = 0
    for player in ['active', 'fail', 'reactive']:
        keys = sorted(squashed[player].keys())
        for key in keys:
            expected_wounds.append({
                'id': index,
                'player': player,
                'wounds': key,
                'raw_chance': squashed[player][key],
                'chance': squashed[player][key]/total_rolls,
                'cumulative_chance': reduce(
                    lambda x, y: x+y,
                    [squashed[player][i] for i in squashed[player].keys() if i >= key], 0) / total_rolls,
            })
            index += 1
    return expected_wounds


# --- Entry point -------------------------------------------------------------------------------------------------

def calculate(p):
    """Runs one calculation. `p` holds the calculator params by name (see PARAMS in src/engine/params.js):
    successValueA, burstA, bonusBurstA, damageA, armA, btsA, ammoA, contA, critImmuneA, shockA, the same with a
    B suffix, and dtwVsDodge / fixedFaceToFace for the kind of roll.
    """
    if p['dtwVsDodge']:
        outcomes = dtw_vs_dodge(p['burstA'], p['successValueB'], p['burstB'] + p['bonusBurstB'])
    elif p['fixedFaceToFace']:
        outcomes = fixed_face_to_face(p['successValueA'], p['burstA'], p['bonusBurstA'], p['successValueB'], p['burstB'])
    else:
        outcomes = face_to_face(
            p['successValueA'], p['burstA'], p['successValueB'], p['burstB'],
            a_bonus_burst=p['bonusBurstA'], b_bonus_burst=p['bonusBurstB'],
        )
    expected_wounds = face_to_face_expected_wounds(
        outcomes,
        p['damageA'], p['armA'], p['ammoA'], p['damageB'], p['armB'], p['ammoB'],
        a_cont=p['contA'], a_bts=p['btsA'], a_crit_immune=p['critImmuneA'],
        b_cont=p['contB'], b_bts=p['btsB'], b_crit_immune=p['critImmuneB'],
        a_shock=p['shockA'], b_shock=p['shockB'],
    )
    return {
        'face_to_face': format_face_to_face(face_to_face_result(outcomes)),
        'expected_wounds': format_expected_wounds(expected_wounds),
        'total_rolls': expected_wounds['total_rolls']
    }
