importScripts("https://cdn.jsdelivr.net/pyodide/v0.22.1/full/pyodide.js");

const PYTHON_CODE = `import micropip
await micropip.install('icepool==0.20.1')
import js
from pyodide.ffi import to_js
import icepool
from icepool import d20, lowest, Again, Die, Pool
from math import comb
from functools import reduce


class InfinityFace2FaceEvaluator(icepool.OutcomeCountEvaluator):
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
    return [i for i in result.items()]


def dtw_vs_dodge(dtw_burst, dodge_sv, dodge_burst):
    """Results should be in format:

    (a_crit, a_hit, b_crit, b_hit), rolls"""
    result = []
    if dodge_burst == 0:
        result.append(((0, dtw_burst, 0, 0), 1))
    else:
        dDodge = Die([(1 if x <= dodge_sv else 0) for x in range(20)])
        for outcome, amount in (dodge_burst @ dDodge).items():
            if outcome >= 1:
                result.append(((0, 0, 0, 0), amount))
            elif outcome == 0:
                result.append(((0, dtw_burst, 0, 0), amount))
    return result


def face_to_face_result(outcomes):
    result = {'active': 0,
              'fail': 0,
              'reactive': 0,
              'total_rolls': 0}
    for outcome, amount in outcomes:
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


def binomial_success(successes: int, trials: int, probability: float):
    """Binomial theory success probability"""
    return comb(trials, successes) * pow(probability, successes) * pow(1 - probability, trials - successes)


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
        player_a_dam, player_a_arm, player_a_ammo, player_b_dam, player_b_arm, player_b_ammo,
        player_a_cont=False, player_a_bts=0, player_a_crit_immune=False,
        player_b_cont=False, player_b_bts=0, player_b_crit_immune=False):
    """Calculates the wounds expected from a face to face encounter

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
    for (a_crit, a_hit, b_crit, b_hit), rolls in outcomes:
        wounds['total_rolls'] += rolls
        if a_crit + a_hit > 0:
            winner = 'active'
            counterpart = 'reactive'
            armor_save = player_a_dam - player_b_arm
            damage = 2 if player_a_ammo == 'T2' else 1
            cont = player_a_cont
            crit_immune = player_b_crit_immune
            plasma = True if player_a_ammo == 'PLASMA' else False
            bts_save = player_a_dam - player_b_bts
        elif b_crit + b_hit > 0:
            winner = 'reactive'
            counterpart = 'active'
            armor_save = player_b_dam - player_a_arm
            damage = 2 if player_b_ammo == 'T2' else 1
            cont = player_b_cont
            crit_immune = player_a_crit_immune
            plasma = True if player_b_ammo == 'PLASMA' else False
            bts_save = player_b_dam - player_a_bts
        else:
            winner = 'fail'
            counterpart = 'missed'
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
        crit_saves = 0 if crit_immune else min(a_crit, AMMO[player_a_ammo] * a_crit) + min(b_crit, AMMO[player_b_ammo] * b_crit)
        saves = ((a_crit + a_hit) * AMMO[player_a_ammo]) + ((b_crit + b_hit) * AMMO[player_b_ammo])
        plasma_saves = ((a_crit + a_hit) * AMMO[player_a_ammo]) + ((b_crit + b_hit) * AMMO[player_b_ammo]) if plasma else 0

        # Generate die with 1's for wounds and 0's for successful armor saves
        if cont:
            dSave = Die([(damage + Again() if x < armor_save else 0) for x in range(20)], again_depth=5)
        else:
            dSave = Die([(damage if x < armor_save else 0) for x in range(20)])
        dCrit = Die([(1 if x < armor_save else 0) for x in range(20)])
        dPlasma = Die([(1 if x < bts_save else 0) for x in range(20)])

        r = Pool(
            [dSave for x in range(saves)] + [dCrit for x in range(crit_saves)] + [dPlasma for x in range(plasma_saves)]
        ).sum()
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


def roll_and_bridge_results(
        player_a_sv, player_a_burst, player_a_dam, player_a_arm, player_a_bts, player_a_ammo, player_a_cont, player_a_crit_immune,
        player_b_sv, player_b_burst, player_b_dam, player_b_arm, player_b_bts, player_b_ammo, player_b_cont, player_b_crit_immune,
        dtw):
    if dtw:
        outcomes = dtw_vs_dodge(player_a_burst, player_b_sv, player_b_burst)  # dtw_burst, dodge_sv, dodge_burst
    else:
        outcomes = face_to_face(player_a_sv, player_a_burst, player_b_sv, player_b_burst)
    results = face_to_face_result(outcomes)
    formatted_results = format_face_to_face(results)
    expected_wounds = face_to_face_expected_wounds(
        outcomes,
        player_a_dam, player_a_arm, player_a_ammo, player_b_dam, player_b_arm, player_b_ammo,
        player_a_cont=player_a_cont, player_a_bts=player_a_bts, player_a_crit_immune=player_a_crit_immune,
        player_b_cont=player_b_cont, player_b_bts=player_b_bts, player_b_crit_immune=player_b_crit_immune)
    formatted_expected_wounds = format_expected_wounds(expected_wounds)
    return_object = {
        'face_to_face': formatted_results,
        'expected_wounds': formatted_expected_wounds,
        'total_rolls': expected_wounds['total_rolls']
    }
    return to_js(return_object, dict_converter=js.Object.fromEntries)
    # return return_object

# Return value for Javascript
to_js(roll_and_bridge_results)`;

let pyodide;


async function initPyodide() {
  self.postMessage({command: 'status', value: 'loading', description: 'Initializing icepool worker'})
  self.pyodide = await self.loadPyodide({
    indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.22.1/full/'
  }) // eslint-disable-line no-restricted-globals
  await self.pyodide.loadPackage(['micropip']) // eslint-disable-line no-restricted-globals
  self.postMessage({command: 'status', value: 'ready', description: 'Icepool worker ready'})
}


async function calculateProbability(p) {
  let pythonFunction = await self.pyodide.runPythonAsync(PYTHON_CODE) // eslint-disable-line no-restricted-globals
  return pythonFunction(
    p['successValueA'], p['burstA'], p['damageA'], p['armA'], p['btsA'], p['ammoA'],
    p['contA'], p['critImmuneA'],
    p['successValueB'], p['burstB'], p['damageB'], p['armB'], p['btsB'], p['ammoB'],
    p['contB'], p['critImmuneB'],
    p['dtwVsDodge'])
}


self.onmessage = async (msg) => {
  if(msg.data.command === 'calculate') {
    if(self.pyodide === undefined) {
      self.postMessage({command: 'status', value: 'notready', description: 'Pyodide not ready yet'})
      return
    }
    let startTime = Date.now();
    let results = await calculateProbability(msg.data.data)
    results['parameters'] = msg.data.data;
    results['id'] = Date.now();
    let elapsed = Date.now() - startTime;
    console.log('Returning results from Face 2 Face calculations:')
    console.log(results)
    self.postMessage({command: 'result', value: results, description: 'testing', elapsed: elapsed, totalRolls: results['total_rolls']})
  } else if (msg.data.command === 'init') {
    await initPyodide()
  }
}
