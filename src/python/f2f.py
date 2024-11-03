# import micropip
# await micropip.install('icepool==1.0.0')
# import js
# from pyodide.ffi import to_js
from icepool import d20, lowest, Again, Die, Pool
from icepool import MultisetEvaluator
from functools import reduce


class InfinityFace2FaceEvaluator(MultisetEvaluator):
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


f2f_evaluator = InfinityFace2FaceEvaluator()


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
    """Should return a Die"""
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
    #return to_js(result, dict_converter=js.Object.fromEntries)


AMMO = {
    'N': 1,
    'DA': 2,
    'EXP': 3,
    'DODGE': 0,
    'T2': 1,
    'PLASMA': 1,
}


def face_to_face_expected_wounds(
        outcomes,
        a_opponent_save, a_arm, a_ammo, b_opponent_save, b_arm, b_ammo,
        a_cont=False, a_bts=0, a_crit_immune=False,
        b_cont=False, b_bts=0, b_crit_immune=False,
        n5_beta_criticals=False
):
    """Calculates the wounds expected from a face to face encounter.

    Damage now is a save change. So the stronger the weapon the lower its "save chance".

    Return format is {
        'active': {1: 11111, 2: 222222, 3: 33333},
        'reactive': {},
        'fail': {0: 122, guts: {'active': 0, 'reactive': 0}},
        'total_rolls': 0
    }
    """
    wounds = {
        'active': {},
        'reactive': {},
        'fail': {},
        'guts': {
            'active': 0,
            'reactive': 0,
            'missed': 0
        },
        'total_rolls': 0
    }
    for (a_crit, a_hit, b_crit, b_hit), rolls in outcomes.items():
        wounds['total_rolls'] += rolls
        if a_crit + a_hit > 0:
            winner = 'active'
            armor_save = a_opponent_save + b_arm
            damage = 2 if a_ammo == 'T2' else 1
            cont = a_cont
            crit_immune = b_crit_immune
            plasma = True if a_ammo == 'PLASMA' else False
            bts_save = a_opponent_save + b_bts
        elif b_crit + b_hit > 0:
            winner = 'reactive'
            armor_save = b_opponent_save + a_arm
            damage = 2 if b_ammo == 'T2' else 1
            cont = b_cont
            crit_immune = a_crit_immune
            plasma = True if b_ammo == 'PLASMA' else False
            bts_save = b_opponent_save + a_bts
        else:
            winner = 'fail'
            armor_save = 0
            damage = 0
            cont = False
            crit_immune = False
            plasma = False
            bts_save = 0

        # Calculate total amount of saves that must be made.
        # Each crit deals AMMO saves plus one extra save per crit. The extra save per crit is in 'crit_saves', as
        # neither CONT damage nor T2 apply their special effects to crit saves
        # For DODGE AMMO we run "min" to keep 0 (for dodge) or original value of crit, as 3 crits = 3 crit saves
        # Each regular hit causes AMMO number of 'saves'. We also have to add the regular hit portion of a crit,
        # as 1 crit causes a AMMO saves for the regular portion, and 1 extra crit save that is not.
        crit_saves = 0 if crit_immune else min(a_crit, AMMO[a_ammo] * a_crit) + min(b_crit, AMMO[b_ammo] * b_crit)
        saves = ((a_crit + a_hit) * AMMO[a_ammo]) + ((b_crit + b_hit) * AMMO[b_ammo])
        plasma_saves = ((a_crit + a_hit) * AMMO[a_ammo]) + ((b_crit + b_hit) * AMMO[b_ammo]) if plasma else 0
        if n5_beta_criticals and plasma:
            plasma_crit_saves = 0 if crit_immune else min(a_crit, AMMO[a_ammo] * a_crit) + min(b_crit, AMMO[b_ammo] * b_crit)
        else:
            plasma_crit_saves = 0

        # Generate die with 1's for wounds and 0's for successful armor saves
        if cont:
            dSave = Die([(damage + Again if x > armor_save else 0) for x in range(1, 21)], again_depth=5)
        else:
            dSave = (d20 > armor_save) * damage  # T2 ammo increases damage by 1

        if n5_beta_criticals:
            dCrit = dSave  # Criticals can apply Cont and T2 damage, just like regular saves
        else:
            dCrit = d20 > armor_save  # Crits are always 1 damage
        dPlasma = d20 > bts_save  # Plasma BTS hits are always 1 damage (so far)

        # Thank you HighDiceRoller for this beautiful line of code!
        r = saves @ dSave + crit_saves @ dCrit + plasma_saves @ dPlasma + plasma_crit_saves @ dPlasma
        denominator = r.denominator()
        for w, occurrences in r.items():
            wounds[winner][w] = wounds[winner].get(w, 0) + (occurrences/denominator) * rolls
    return wounds


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


def consolidate_wounds_over_maximum(wounds, max_wounds_shown=3):
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


def format_expected_wounds(wounds, max_wounds_shown=3):
    """Format expected_wounds into a list of results

    Output format is {'player': 'active/reactive/fail', 'wounds': 3, 'chance': 0.2432, 'raw_chance' 1341234.23,
                      'cumulative_chance': 0.53234, 'raw_guts_chance': 0, 'guts_chance': 0.0234, 'cumulative_guts': 0.0723}
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


def reroll_value_to_list(reroll_value):
    if reroll_value.lower() == 'none':
        return ()
    elif reroll_value.lower() == 'misses':
        return (0,)
    else:
        return list(range(int(reroll_value) + 1))


def roll_and_bridge_results(
        a_success_value, a_burst, a_bonus_burst, a_save, a_arm, a_bts, a_ammo, a_cont, a_crit_immune,
        b_success_value, b_burst, b_bonus_burst, b_save, b_arm, b_bts, b_ammo, b_cont, b_crit_immune,
        dtw, fixed,
):
    if dtw:
        outcomes = dtw_vs_dodge(a_burst, b_success_value, b_burst)  # dtw_burst, dodge_sv, dodge_burst
    elif fixed:
        outcomes = fixed_face_to_face(a_success_value, a_burst, a_bonus_burst, b_success_value, b_burst)
    else:
        outcomes = face_to_face(
            a_success_value, a_burst, b_success_value, b_burst,
            a_bonus_burst=a_bonus_burst, b_bonus_burst=b_bonus_burst,
        )
    results = face_to_face_result(outcomes)
    formatted_results = format_face_to_face(results)
    expected_wounds = face_to_face_expected_wounds(
        outcomes,
        a_save, a_arm, a_ammo, b_save, b_arm, b_ammo,
        a_cont=a_cont, a_bts=a_bts, a_crit_immune=a_crit_immune,
        b_cont=b_cont, b_bts=b_bts, b_crit_immune=b_crit_immune,
    )
    formatted_expected_wounds = format_expected_wounds(expected_wounds)
    return_object = {
        'face_to_face': formatted_results,
        'expected_wounds': formatted_expected_wounds,
        'total_rolls': expected_wounds['total_rolls']
    }
    # return to_js(return_object, dict_converter=js.Object.fromEntries)
    return return_object

# Return value for Javascript
#to_js(roll_and_bridge_results)


