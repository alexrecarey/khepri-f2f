# import micropip
# await micropip.install('icepool==1.1.2')
# import js
# from pyodide.ffi import to_js
from icepool import d20, lowest, Die, tupleize
from icepool import MultisetEvaluator
from math import comb
from functools import reduce


class InfinityFace2FaceEvaluator(MultisetEvaluator):
    def __init__(self, a_sv, b_sv):
        self.a_sv = a_sv
        self.b_sv = b_sv

    # Note that outcomes are seen in ascending order by default.
    def next_state(self, state, outcome, a_count, b_count):
        # Initial state is all zeros.
        a_crit, a_success, b_crit, b_success = state or (0, 0, 0, 0)

        # First, accumulate scores.
        if outcome < self.a_sv:
            a_success += a_count
        elif outcome == self.a_sv:
            a_crit += a_count
        if outcome < self.b_sv:
            b_success += b_count
        elif outcome == self.b_sv:
            b_crit += b_count

        # Then, cancel the other side's current and previous successes,
        # which must all have been equal or less than the current outcome.
        # Crits continue to cancel future (higher) successes as well.
        if a_crit or (a_count > 0 and outcome <= self.a_sv):
            b_success = 0
        if b_crit or (b_count > 0 and outcome <= self.b_sv):
            a_success = 0

        # Finally, cancel all crits if both sides scored any crit.
        if a_crit > 0 and b_crit > 0:
            # Note that successes were already cancelled above.
            # Also, no more outcomes will matter since
            # all remaining outcomes are above SV.
            a_crit = 0
            b_crit = 0
        return a_crit, a_success, b_crit, b_success


def face_to_face(player_a_sv, player_a_burst, player_b_sv, player_b_burst):
    # Handle cases where SV > 20
    a_sv = player_a_sv if player_a_sv <= 20 else 20
    a_bonus = 0 if player_a_sv <= 20 else player_a_sv - 20
    b_sv = player_b_sv if player_b_sv <= 20 else 20
    b_bonus = 0 if player_b_sv <= 20 else player_b_sv - 20

    result = InfinityFace2FaceEvaluator(a_sv=a_sv, b_sv=b_sv).evaluate(
        lowest(d20+a_bonus, 20).pool(player_a_burst),
        lowest(d20+b_bonus, 20).pool(player_b_burst))
    return result


def dtw_vs_dodge(dtw_burst, dodge_sv, dodge_burst):
    """Results should be in format:

    (a_crit, a_hit, b_crit, b_hit), rolls"""
    dodged = (dodge_burst @ (d20 <= dodge_sv)) >= 1
    result = tupleize(0, dodged.if_else(0, dtw_burst), 0, 0)
    return result


def fixed_face_to_face(player_a_sv, player_a_burst, player_b_sv, player_b_burst):
    # Handle cases where SV > 20
    a_sv = player_a_sv if player_a_sv <= 20 else 20
    a_bonus = 0 if player_a_sv <= 20 else player_a_sv - 20
    b_sv = 21  # make success value 21 to avoid crits
    b_die_face = player_b_sv if player_b_sv <= 20 else 20  # don't let fixed die be over 20
    b_die = Die([b_die_face])  # Create a special die that always rolls the same number

    result = InfinityFace2FaceEvaluator(a_sv=a_sv, b_sv=b_sv).evaluate(
        lowest(d20+a_bonus, 20).pool(player_a_burst),
        b_die.pool(player_b_burst))
    return result


def face_to_face_result(raw):
    def winner(a_crit, a_success, b_crit, b_success):
        squash = a_crit + a_success - b_crit - b_success
        if squash > 0:
            return 'active'
        elif squash < 0:
            return 'reactive'
        else:
            return 'fail'
    # star unpacks each outcome before feeding it to winner()
    return raw.map(winner, star=True)


AMMO = {
    'N': 1,
    'DA': 2,
    'EXP': 3,
    'DODGE': 0,
    'T2': 1,
    'PLASMA': 1,
}

def face_to_face_wounds(
        atk_raw,
        atk_dam, atk_ammo, atk_cont, def_arm, def_bts, def_crit_immune):
    """Computes the number of wounds dealt by one side.
    
    Args:
        atk_raw: A Die where the outcomes are (atk_crit, atk_hit).
    """
    armor_save = atk_dam - def_arm
    damage = 2 if atk_ammo == 'T2' else 1
    plasma = atk_ammo == 'PLASMA'
    bts_save = atk_dam - def_bts
    
    def compute_wounds(atk_crit, atk_hit):
        # Calculate total amount of saves that must be made.
        # Each crit deals AMMO saves plus one extra save per crit. The extra save per crit is in 'crit_saves', as
        # neither CONT damage nor T2 apply their special effects to crit saves
        # For DODGE AMMO we run "min" to keep 0 (for dodge) or original value of crit, as 3 crits = 3 crit saves
        # Each regular hit causes AMMO number of 'saves'. We also have to add the regular hit portion of a crit,
        # as 1 crit causes a AMMO saves for the regular portion, and 1 extra crit save that is not.
        crit_saves = 0 if def_crit_immune else min(atk_crit, AMMO[atk_ammo] * atk_crit)
        saves = (atk_crit + atk_hit) * AMMO[atk_ammo]
        plasma_saves = (atk_crit + atk_hit) * AMMO[atk_ammo] if plasma else 0
        if atk_cont:
            dSave = (d20 <= armor_save).explode(depth=5)
        else:
            dSave = (d20 <= armor_save) * damage  # T2 ammo increases damage by 1
        dCrit = d20 <= armor_save  # Crits are always 1 damage
        dPlasma = d20 <= bts_save  # Plasma BTS hits are always 1 damage (so far)
        # Thank you @HighDiceRoller for this beautiful line of code!
        r = saves @ dSave + crit_saves @ dCrit + plasma_saves @ dPlasma
        return r
    
    return atk_raw.map(compute_wounds, star=True)

def format_face_to_face(face_to_face):
    output = []
    for index, player in enumerate(['active', 'reactive', 'fail']):
        output.append({
            'id': index,
            'player': player,
            'raw_chance': face_to_face.quantity(player),
            'chance': float(face_to_face.probability(player)),
        })
    return output

def format_wounds(raw, active_wounds, reactive_wounds, max_wounds_shown=3):
    """Format wounds into a list of results

    Output format is {'player': 'active/reactive/fail', 'wounds': 3, 'chance': 0.2432, 'raw_chance' 1341234,
                      'cumulative_chance': 0.53234}
    """
    # Squash items that are > than max_wounds_shown
    active_wounds = lowest(active_wounds, max_wounds_shown)
    reactive_wounds = lowest(reactive_wounds, max_wounds_shown)
    result = []
    
    for wounds, raw_chance, chance, cumulative_chance in zip(
            active_wounds.outcomes(),
            active_wounds.quantities(),
            active_wounds.probabilities(),
            active_wounds.probabilities_ge()):
        result.append({
            'id': len(result),
            'player': 'active',
            'wounds': wounds,
            'raw_chance': raw_chance,
            'chance': float(chance),
            'cumulative_chance': float(cumulative_chance),
        })
    
    result.append({
        'id': len(result),
        'player': 'fail',
        'wounds': 0,
        'raw_chance': raw.quantity((0, 0, 0, 0)),
        'chance': float(raw.probability((0, 0, 0, 0))),
        'cumulative_chance': raw.probability((0, 0, 0, 0)),
    })
    
    for wounds, raw_chance, chance, cumulative_chance in zip(
            reactive_wounds.outcomes(),
            reactive_wounds.quantities(),
            reactive_wounds.probabilities(),
            reactive_wounds.probabilities_ge()):
        result.append({
            'id': len(result),
            'player': 'reactive',
            'wounds': wounds,
            'raw_chance': raw_chance,
            'chance': float(chance),
            'cumulative_chance': float(cumulative_chance),
        })
    return result


def roll_and_bridge_results(
        player_a_sv, player_a_burst, player_a_dam, player_a_arm, player_a_bts, player_a_ammo, player_a_cont, player_a_crit_immune,
        player_b_sv, player_b_burst, player_b_dam, player_b_arm, player_b_bts, player_b_ammo, player_b_cont, player_b_crit_immune,
        dtw, fixed):
    if dtw:
        raw = dtw_vs_dodge(player_a_burst, player_b_sv, player_b_burst)  # dtw_burst, dodge_sv, dodge_burst
    elif fixed:
        raw = fixed_face_to_face(player_a_sv, player_a_burst, player_b_sv, player_b_burst)
    else:
        raw = face_to_face(player_a_sv, player_a_burst, player_b_sv, player_b_burst)
    results = face_to_face_result(raw)
    formatted_results = format_face_to_face(results)
    active_wounds = face_to_face_wounds(
            raw.marginals[:2],  # extract the first two elements (a_crit, a_hit)
            player_a_dam, player_a_ammo, player_a_cont,
            player_b_arm, player_b_bts, player_b_crit_immune)
    reactive_wounds = face_to_face_wounds(
            raw.marginals[2:],  # extract the last two elements (b_crit, b_hit)
            player_b_dam, player_b_ammo, player_b_cont,
            player_a_arm, player_a_bts, player_a_crit_immune)
    formatted_wounds = format_wounds(raw, active_wounds, reactive_wounds)
    return_object = {
        'face_to_face': formatted_results,
        'expected_wounds': formatted_wounds,
        'total_rolls': raw.denominator(),
    }
    # return to_js(return_object, dict_converter=js.Object.fromEntries)
    return return_object

# Return value for Javascript
#to_js(roll_and_bridge_results)


