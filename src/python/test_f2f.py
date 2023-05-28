from functools import reduce

import f2f
from f2f import face_to_face_expected_wounds, face_to_face, consolidate_wounds_over_maximum
import re
from math import isclose


def ghostlords_raw_to_dict(string):
    regex = r'(P\d) Scores\s+(\d\d*)\s*Success\(es\):\s*(\d*\.?\d+)%$'
    fail_regex = r'No Successes:\s+(\d*\.?\d+)%'
    go = {
        'active': {},
        'reactive': {},
        'fail': {},
    }
    for m in re.finditer(regex, string, re.MULTILINE):
        member = None
        if m[1] == 'P1':
            member = 'active'
        elif m[1] == 'P2':
            member = 'reactive'
        go[member][int(m[2])] = float(m[3]) / 100

    for m in re.findall(fail_regex, string, re.MULTILINE):
        go['fail'][0] = float(m) / 100
    return go


def ghostlords_minimal_to_dict(active_str, reactive_str, fail_str):
    """Example minimal result

    Active Player

29.33% Custom Unit inflicts 1 or more wounds on Custom Unit (1 W)
10.11% Custom Unit inflicts 2 or more wounds on Custom Unit (Unconscious)
3.08% Custom Unit inflicts 3 or more wounds on Custom Unit (Dead)

Failures

49.46% Neither player succeeds
Reactive Player

21.20% Custom Unit inflicts 1 or more wounds on Custom Unit (1 W)
10.10% Custom Unit inflicts 2 or more wounds on Custom Unit (Unconscious)
2.19% Custom Unit inflicts 3 or more wounds on Custom Unit (Dead)"""

    regex = r'(\d*\.?\d+)% Custom Unit inflicts (\d) or more'
    fail_regex = r'(\d*\.?\d+)% Neither player succeeds'
    active = {}
    reactive = {}
    fail = {}

    for m in re.finditer(regex, active_str, re.MULTILINE):
        active[int(m[2])] = float(m[1]) / 100

    for m in re.finditer(regex, reactive_str, re.MULTILINE):
        reactive[int(m[2])] = float(m[1]) / 100

    for m in re.findall(fail_regex, fail_str, re.MULTILINE):
        fail[0] = float(m) / 100

    # find the values not the cummulative ones.
    return {
        'active': {k: (v - active.get(k+1, 0)) for k, v in active.items()},
        'reactive': {k: (v - reactive.get(k+1, 0)) for k, v in reactive.items()},
        'fail': {0: fail[0]}
    }


def khepri_result_to_percentage(khepri_dict, max_wounds_shown=100):
    # Yeah, I could nest list comprehensions, but I'd like to be able to read this code
    # As I've changed my return format, we now have to exclude 0 wounds from active and reactive successes
    # we also have to add 0 wounds active and 0 wounds reactive to failure case
    failure_rolls = khepri_dict['active'].get(0, 0) + khepri_dict['reactive'].get(0,0) + khepri_dict['fail'].get(0,0)
    wounds = {
        'active': {k: v/khepri_dict['total_rolls'] for k, v in khepri_dict['active'].items() if k > 0},
        'reactive': {k: v/khepri_dict['total_rolls'] for k, v in khepri_dict['reactive'].items() if k > 0},
        'fail': {0: failure_rolls/khepri_dict['total_rolls']}
    }
    return f2f.consolidate_wounds_over_maximum(wounds, max_wounds_shown=max_wounds_shown)


def is_ghostlords_equal(gl_dict, kp_dict):
    equals_flag = True
    for player in ['active', 'reactive', 'fail']:
        # First compare lengths
        if len(gl_dict[player]) != len(kp_dict[player]):
            print('Length of dictionaries is not equal')
            equals_flag = False
        # Then compare content
        for outcome in gl_dict[player]:
            if not isclose(gl_dict[player][outcome], kp_dict[player][outcome], abs_tol=0.0005):
                print(f'For {player}[{outcome}] GL({gl_dict[player][outcome]}) not close to KP({kp_dict[player][outcome]})')
                equals_flag = False
    return equals_flag


class TestAgainstGhostlordsCalculator:

    def test_regular_roll(self):
        # URL: http://inf-dice.ghostlords.com/n4/?p1.faction=Aleph&p1.unit=Custom+Unit&p1.w_type=W&p1.type=LI&p1.cc=10&p1.bs=16&p1.ph=10&p1.wip=10&p1.arm=2&p1.bts=0&p1.w=3&p1.w_taken=0&p1.transmutation_w=0&p1.operator=0&p1.immunity=&p1.hyperdynamics=0&p1.ikohl=0&p1.ch=0&p1.msv=0&p1.marksmanship=0&p1.xvisor=0&p1.fatality=0&p1.full_auto=0&p1.surprise=0&p1.action=bs&p1.weapon=Custom+Weapon&p1.stat=BS&p1.ammo=N&p1.b=3&p1.save=ARM&p1.dam=13&p1.range=0&p1.link=0&p1.viz=0&p1.ma=0&p1.guard=0&p1.protheion=0&p1.nbw=0&p1.gang_up=0&p1.coordinated=0&p1.misc_mod=0&p2.faction=Aleph&p2.unit=Custom+Unit&p2.w_type=W&p2.type=LI&p2.cc=10&p2.bs=13&p2.ph=10&p2.wip=10&p2.arm=5&p2.bts=0&p2.w=3&p2.w_taken=0&p2.transmutation_w=0&p2.operator=0&p2.immunity=&p2.hyperdynamics=0&p2.ikohl=0&p2.ch=0&p2.msv=0&p2.marksmanship=0&p2.xvisor=0&p2.fatality=0&p2.full_auto=0&p2.surprise=0&p2.action=bs&p2.weapon=Custom+Weapon&p2.stat=BS&p2.ammo=N&p2.b=1&p2.save=ARM&p2.dam=14&p2.range=0&p2.link=0&p2.viz=0&p2.ma=0&p2.guard=0&p2.protheion=0&p2.nbw=0&p2.gang_up=0&p2.coordinated=0&p2.misc_mod=0
        print("Testing regular roll")
        gl_result = """
P1 Scores  6 Success(es):  0.000% NONE
P1 Scores  6 Success(es):  0.000%
P1 Scores  5 Success(es):  0.004% NONE
P1 Scores  5 Success(es):  0.004%
P1 Scores  4 Success(es):  0.163% NONE
P1 Scores  4 Success(es):  0.163%
P1 Scores  3 Success(es):  2.591% NONE
P1 Scores  3 Success(es):  2.591%
P1 Scores  2 Success(es): 14.420% NONE
P1 Scores  2 Success(es): 14.420%
P1 Scores  1 Success(es): 36.215% NONE
P1 Scores  1 Success(es): 36.215%
P1 Scores  6+ Successes:   0.000% NONE
P1 Scores  5+ Successes:   0.004% NONE
P1 Scores  4+ Successes:   0.167% NONE
P1 Scores  3+ Successes:   2.758% NONE
P1 Scores  2+ Successes:  17.178% NONE
P1 Scores  1+ Successes:  53.392% NONE
P1 Scores  6+ Successes:   0.000%
P1 Scores  5+ Successes:   0.004%
P1 Scores  4+ Successes:   0.167%
P1 Scores  3+ Successes:   2.758%
P1 Scores  2+ Successes:  17.178%
P1 Scores  1+ Successes:  53.392%

No Successes: 37.620%

P2 Scores  2 Success(es):  1.543% NONE
P2 Scores  2 Success(es):  1.543%
P2 Scores  1 Success(es):  7.444% NONE
P2 Scores  1 Success(es):  7.444%
P2 Scores  2+ Successes:   1.543% NONE
P2 Scores  1+ Successes:   8.987% NONE
P2 Scores  2+ Successes:   1.543%
P2 Scores  1+ Successes:   8.987%"""
        player_a_sv_ = 16
        player_a_burst_ = 3
        player_a_dam_ = 13
        player_a_arm_ = 2
        player_a_ammo_ = 'N'
        player_b_sv_ = 13
        player_b_burst_ = 1
        player_b_dam_ = 14
        player_b_arm_ = 5
        player_b_ammo_ = 'N'
        outcomes = face_to_face(player_a_sv_, player_a_burst_, player_b_sv_, player_b_burst_)
        kp_result = face_to_face_expected_wounds(
            outcomes,
            player_a_dam_, player_a_arm_, player_a_ammo_,
            player_b_dam_, player_b_arm_, player_b_ammo_)
        gl_dict = ghostlords_raw_to_dict(gl_result)
        kp_dict = khepri_result_to_percentage(kp_result)
        is_ghostlords_equal(gl_dict, kp_dict)
        assert is_ghostlords_equal(gl_dict, kp_dict)


    def test_sv_over_20_da(self):
        print("Testing success values over 20")
        gl_result = """P1 Scores  3 Success(es):  7.182% NONE
P1 Scores  3 Success(es):  7.182%
P1 Scores  2 Success(es): 34.704% NONE
P1 Scores  2 Success(es): 34.704%
P1 Scores  1 Success(es): 36.696% NONE
P1 Scores  1 Success(es): 36.696%
P1 Scores  3+ Successes:   7.182% NONE
P1 Scores  2+ Successes:  41.886% NONE
P1 Scores  1+ Successes:  78.582% NONE
P1 Scores  3+ Successes:   7.182%
P1 Scores  2+ Successes:  41.886%
P1 Scores  1+ Successes:  78.582%

No Successes: 16.764%

P2 Scores  2 Success(es):  0.983% NONE
P2 Scores  2 Success(es):  0.983%
P2 Scores  1 Success(es):  3.671% NONE
P2 Scores  1 Success(es):  3.671%
P2 Scores  2+ Successes:   0.983% NONE
P2 Scores  1+ Successes:   4.654% NONE
P2 Scores  2+ Successes:   0.983%
P2 Scores  1+ Successes:   4.654%"""
        player_a_sv_ = 26
        player_a_burst_ = 1
        player_a_dam_ = 16
        player_a_arm_ = 1
        player_a_ammo_ = 'DA'
        player_b_sv_ = 13
        player_b_burst_ = 1
        player_b_dam_ = 12
        player_b_arm_ = 4
        player_b_ammo_ = 'N'
        outcomes = face_to_face(player_a_sv_, player_a_burst_, player_b_sv_, player_b_burst_)
        kp_result = face_to_face_expected_wounds(
            outcomes,
            player_a_dam_, player_a_arm_, player_a_ammo_,
            player_b_dam_, player_b_arm_, player_b_ammo_)
        gl_dict = ghostlords_raw_to_dict(gl_result)
        kp_dict = khepri_result_to_percentage(kp_result)
        is_ghostlords_equal(gl_dict, kp_dict)
        assert is_ghostlords_equal(gl_dict, kp_dict)


    def test_high_burst_exp(self):
        print("Testing high burst + Explosive")
        gl_result = """P1 Scores 20 Success(es):  0.000% NONE
P1 Scores 20 Success(es):  0.000%
P1 Scores 19 Success(es):  0.000% NONE
P1 Scores 19 Success(es):  0.000%
P1 Scores 18 Success(es):  0.000% NONE
P1 Scores 18 Success(es):  0.000%
P1 Scores 17 Success(es):  0.000% NONE
P1 Scores 17 Success(es):  0.000%
P1 Scores 16 Success(es):  0.000% NONE
P1 Scores 16 Success(es):  0.000%
P1 Scores 15 Success(es):  0.001% NONE
P1 Scores 15 Success(es):  0.001%
P1 Scores 14 Success(es):  0.004% NONE
P1 Scores 14 Success(es):  0.004%
P1 Scores 13 Success(es):  0.020% NONE
P1 Scores 13 Success(es):  0.020%
P1 Scores 12 Success(es):  0.078% NONE
P1 Scores 12 Success(es):  0.078%
P1 Scores 11 Success(es):  0.238% NONE
P1 Scores 11 Success(es):  0.238%
P1 Scores 10 Success(es):  0.607% NONE
P1 Scores 10 Success(es):  0.607%
P1 Scores  9 Success(es):  1.319% NONE
P1 Scores  9 Success(es):  1.319%
P1 Scores  8 Success(es):  2.498% NONE
P1 Scores  8 Success(es):  2.498%
P1 Scores  7 Success(es):  4.166% NONE
P1 Scores  7 Success(es):  4.166%
P1 Scores  6 Success(es):  6.234% NONE
P1 Scores  6 Success(es):  6.234%
P1 Scores  5 Success(es):  8.526% NONE
P1 Scores  5 Success(es):  8.526%
P1 Scores  4 Success(es): 10.410% NONE
P1 Scores  4 Success(es): 10.410%
P1 Scores  3 Success(es): 12.588% NONE
P1 Scores  3 Success(es): 12.588%
P1 Scores  2 Success(es): 13.996% NONE
P1 Scores  2 Success(es): 13.996%
P1 Scores  1 Success(es):  9.763% NONE
P1 Scores  1 Success(es):  9.763%
P1 Scores 20+ Successes:   0.000% NONE
P1 Scores 19+ Successes:   0.000% NONE
P1 Scores 18+ Successes:   0.000% NONE
P1 Scores 17+ Successes:   0.000% NONE
P1 Scores 16+ Successes:   0.000% NONE
P1 Scores 15+ Successes:   0.001% NONE
P1 Scores 14+ Successes:   0.005% NONE
P1 Scores 13+ Successes:   0.025% NONE
P1 Scores 12+ Successes:   0.102% NONE
P1 Scores 11+ Successes:   0.340% NONE
P1 Scores 10+ Successes:   0.947% NONE
P1 Scores  9+ Successes:   2.265% NONE
P1 Scores  8+ Successes:   4.764% NONE
P1 Scores  7+ Successes:   8.930% NONE
P1 Scores  6+ Successes:  15.164% NONE
P1 Scores  5+ Successes:  23.691% NONE
P1 Scores  4+ Successes:  34.100% NONE
P1 Scores  3+ Successes:  46.689% NONE
P1 Scores  2+ Successes:  60.685% NONE
P1 Scores  1+ Successes:  70.448% NONE
P1 Scores 20+ Successes:   0.000%
P1 Scores 19+ Successes:   0.000%
P1 Scores 18+ Successes:   0.000%
P1 Scores 17+ Successes:   0.000%
P1 Scores 16+ Successes:   0.000%
P1 Scores 15+ Successes:   0.001%
P1 Scores 14+ Successes:   0.005%
P1 Scores 13+ Successes:   0.025%
P1 Scores 12+ Successes:   0.102%
P1 Scores 11+ Successes:   0.340%
P1 Scores 10+ Successes:   0.947%
P1 Scores  9+ Successes:   2.265%
P1 Scores  8+ Successes:   4.764%
P1 Scores  7+ Successes:   8.930%
P1 Scores  6+ Successes:  15.164%
P1 Scores  5+ Successes:  23.691%
P1 Scores  4+ Successes:  34.100%
P1 Scores  3+ Successes:  46.689%
P1 Scores  2+ Successes:  60.685%
P1 Scores  1+ Successes:  70.448%

No Successes: 15.307%

P2 Scores  4 Success(es):  0.025% NONE
P2 Scores  4 Success(es):  0.025%
P2 Scores  3 Success(es):  0.228% NONE
P2 Scores  3 Success(es):  0.228%
P2 Scores  2 Success(es):  3.441% NONE
P2 Scores  2 Success(es):  3.441%
P2 Scores  1 Success(es): 10.552% NONE
P2 Scores  1 Success(es): 10.552%
P2 Scores  4+ Successes:   0.025% NONE
P2 Scores  3+ Successes:   0.253% NONE
P2 Scores  2+ Successes:   3.693% NONE
P2 Scores  1+ Successes:  14.245% NONE
P2 Scores  4+ Successes:   0.025%
P2 Scores  3+ Successes:   0.253%
P2 Scores  2+ Successes:   3.693%
P2 Scores  1+ Successes:  14.245%"""
        player_a_sv_ = 14
        player_a_burst_ = 5
        player_a_dam_ = 13
        player_a_arm_ = 0
        player_a_ammo_ = 'EXP'
        player_b_sv_ = 13
        player_b_burst_ = 2
        player_b_dam_ = 12
        player_b_arm_ = 3
        player_b_ammo_ = 'N'
        outcomes = face_to_face(player_a_sv_, player_a_burst_, player_b_sv_, player_b_burst_)
        kp_result = face_to_face_expected_wounds(
            outcomes,
            player_a_dam_, player_a_arm_, player_a_ammo_,
            player_b_dam_, player_b_arm_, player_b_ammo_)
        gl_dict = ghostlords_raw_to_dict(gl_result)
        kp_dict = khepri_result_to_percentage(kp_result)
        assert is_ghostlords_equal(gl_dict, kp_dict)


    def test_hmg_vs_tr(self):
        print("Testing HMG vs TR bot")
        gl_result = """P1 Scores 10 Success(es):  0.000% NONE
P1 Scores 10 Success(es):  0.000%
P1 Scores  9 Success(es):  0.000% NONE
P1 Scores  9 Success(es):  0.000%
P1 Scores  8 Success(es):  0.000% NONE
P1 Scores  8 Success(es):  0.000%
P1 Scores  7 Success(es):  0.003% NONE
P1 Scores  7 Success(es):  0.003%
P1 Scores  6 Success(es):  0.029% NONE
P1 Scores  6 Success(es):  0.029%
P1 Scores  5 Success(es):  0.220% NONE
P1 Scores  5 Success(es):  0.220%
P1 Scores  4 Success(es):  1.231% NONE
P1 Scores  4 Success(es):  1.231%
P1 Scores  3 Success(es):  4.785% NONE
P1 Scores  3 Success(es):  4.785%
P1 Scores  2 Success(es): 13.810% NONE
P1 Scores  2 Success(es): 13.810%
P1 Scores  1 Success(es): 25.249% NONE
P1 Scores  1 Success(es): 25.249%
P1 Scores 10+ Successes:   0.000% NONE
P1 Scores  9+ Successes:   0.000% NONE
P1 Scores  8+ Successes:   0.000% NONE
P1 Scores  7+ Successes:   0.003% NONE
P1 Scores  6+ Successes:   0.031% NONE
P1 Scores  5+ Successes:   0.251% NONE
P1 Scores  4+ Successes:   1.482% NONE
P1 Scores  3+ Successes:   6.267% NONE
P1 Scores  2+ Successes:  20.077% NONE
P1 Scores  1+ Successes:  45.326% NONE
P1 Scores 10+ Successes:   0.000%
P1 Scores  9+ Successes:   0.000%
P1 Scores  8+ Successes:   0.000%
P1 Scores  7+ Successes:   0.003%
P1 Scores  6+ Successes:   0.031%
P1 Scores  5+ Successes:   0.251%
P1 Scores  4+ Successes:   1.482%
P1 Scores  3+ Successes:   6.267%
P1 Scores  2+ Successes:  20.077%
P1 Scores  1+ Successes:  45.326%

No Successes: 34.585%

P2 Scores  8 Success(es):  0.000% NONE
P2 Scores  8 Success(es):  0.000%
P2 Scores  7 Success(es):  0.000% NONE
P2 Scores  7 Success(es):  0.000%
P2 Scores  6 Success(es):  0.001% NONE
P2 Scores  6 Success(es):  0.001%
P2 Scores  5 Success(es):  0.008% NONE
P2 Scores  5 Success(es):  0.008%
P2 Scores  4 Success(es):  0.106% NONE
P2 Scores  4 Success(es):  0.106%
P2 Scores  3 Success(es):  0.725% NONE
P2 Scores  3 Success(es):  0.725%
P2 Scores  2 Success(es):  4.824% NONE
P2 Scores  2 Success(es):  4.824%
P2 Scores  1 Success(es): 14.425% NONE
P2 Scores  1 Success(es): 14.425%
P2 Scores  8+ Successes:   0.000% NONE
P2 Scores  7+ Successes:   0.000% NONE
P2 Scores  6+ Successes:   0.001% NONE
P2 Scores  5+ Successes:   0.009% NONE
P2 Scores  4+ Successes:   0.115% NONE
P2 Scores  3+ Successes:   0.840% NONE
P2 Scores  2+ Successes:   5.663% NONE
P2 Scores  1+ Successes:  20.088% NONE
P2 Scores  8+ Successes:   0.000%
P2 Scores  7+ Successes:   0.000%
P2 Scores  6+ Successes:   0.001%
P2 Scores  5+ Successes:   0.009%
P2 Scores  4+ Successes:   0.115%
P2 Scores  3+ Successes:   0.840%
P2 Scores  2+ Successes:   5.663%
P2 Scores  1+ Successes:  20.088%"""
        player_a_sv_ = 9
        player_a_burst_ = 5
        player_a_dam_ = 15
        player_a_arm_ = 6
        player_a_ammo_ = 'N'
        player_b_sv_ = 8
        player_b_burst_ = 4
        player_b_dam_ = 15
        player_b_arm_ = 3
        player_b_ammo_ = 'N'
        outcomes = face_to_face(player_a_sv_, player_a_burst_, player_b_sv_, player_b_burst_)
        kp_result = face_to_face_expected_wounds(
            outcomes,
            player_a_dam_, player_a_arm_, player_a_ammo_,
            player_b_dam_, player_b_arm_, player_b_ammo_)
        gl_dict = ghostlords_raw_to_dict(gl_result)
        kp_dict = khepri_result_to_percentage(kp_result)
        assert is_ghostlords_equal(gl_dict, kp_dict)


    def test_spitfire_vs_tag(self):
        print("Testing spitfire vs TAG")
        gl_result = """P1 Scores  8 Success(es):  0.000% NONE
P1 Scores  8 Success(es):  0.000%
P1 Scores  7 Success(es):  0.000% NONE
P1 Scores  7 Success(es):  0.000%
P1 Scores  6 Success(es):  0.000% NONE
P1 Scores  6 Success(es):  0.000%
P1 Scores  5 Success(es):  0.000% NONE
P1 Scores  5 Success(es):  0.000%
P1 Scores  4 Success(es):  0.011% NONE
P1 Scores  4 Success(es):  0.011%
P1 Scores  3 Success(es):  0.224% NONE
P1 Scores  3 Success(es):  0.224%
P1 Scores  2 Success(es):  2.738% NONE
P1 Scores  2 Success(es):  2.738%
P1 Scores  1 Success(es): 18.409% NONE
P1 Scores  1 Success(es): 18.409%
P1 Scores  8+ Successes:   0.000% NONE
P1 Scores  7+ Successes:   0.000% NONE
P1 Scores  6+ Successes:   0.000% NONE
P1 Scores  5+ Successes:   0.000% NONE
P1 Scores  4+ Successes:   0.011% NONE
P1 Scores  3+ Successes:   0.234% NONE
P1 Scores  2+ Successes:   2.972% NONE
P1 Scores  1+ Successes:  21.382% NONE
P1 Scores  8+ Successes:   0.000%
P1 Scores  7+ Successes:   0.000%
P1 Scores  6+ Successes:   0.000%
P1 Scores  5+ Successes:   0.000%
P1 Scores  4+ Successes:   0.011%
P1 Scores  3+ Successes:   0.234%
P1 Scores  2+ Successes:   2.972%
P1 Scores  1+ Successes:  21.382%

No Successes: 55.913%

P2 Scores  4 Success(es):  0.255% NONE
P2 Scores  4 Success(es):  0.255%
P2 Scores  3 Success(es):  3.716% NONE
P2 Scores  3 Success(es):  3.716%
P2 Scores  2 Success(es):  9.621% NONE
P2 Scores  2 Success(es):  9.621%
P2 Scores  1 Success(es):  9.112% NONE
P2 Scores  1 Success(es):  9.112%
P2 Scores  4+ Successes:   0.255% NONE
P2 Scores  3+ Successes:   3.971% NONE
P2 Scores  2+ Successes:  13.592% NONE
P2 Scores  1+ Successes:  22.705% NONE
P2 Scores  4+ Successes:   0.255%
P2 Scores  3+ Successes:   3.971%
P2 Scores  2+ Successes:  13.592%
P2 Scores  1+ Successes:  22.705%"""
        player_a_sv_ = 13
        player_a_burst_ = 4
        player_a_dam_ = 14
        player_a_arm_ = 6
        player_a_ammo_ = 'N'
        player_b_sv_ = 15
        player_b_burst_ = 1
        player_b_dam_ = 16
        player_b_arm_ = 11
        player_b_ammo_ = 'EXP'
        outcomes = face_to_face(player_a_sv_, player_a_burst_, player_b_sv_, player_b_burst_)
        kp_result = face_to_face_expected_wounds(
            outcomes,
            player_a_dam_, player_a_arm_, player_a_ammo_,
            player_b_dam_, player_b_arm_, player_b_ammo_)
        gl_dict = ghostlords_raw_to_dict(gl_result)
        kp_dict = khepri_result_to_percentage(kp_result)
        assert is_ghostlords_equal(gl_dict, kp_dict)


    def test_continuous_damage_azrail_vs_tag(self):
        print("Testing Azra'il HMG vs TAG")
        active_str = """29.33% Custom Unit inflicts 1 or more wounds on Custom Unit (1 W)
10.11% Custom Unit inflicts 2 or more wounds on Custom Unit (Unconscious)
3.08% Custom Unit inflicts 3 or more wounds on Custom Unit (Dead)"""
        failure_str = """49.46% Neither player succeeds"""
        reactive_str = """21.20% Custom Unit inflicts 1 or more wounds on Custom Unit (1 W)
10.10% Custom Unit inflicts 2 or more wounds on Custom Unit (Unconscious)
2.19% Custom Unit inflicts 3 or more wounds on Custom Unit (Dead)"""
        gl_dict = {
            'active': {1: 0.2933, 2: 0.1011, 3: 0.0308},
            'reactive': {1: 0.2120, 2: 0.1010, 3: 0.0219},
            'fail': {0: 0.4946}
        }
        player_a_sv_ = 13
        player_a_burst_ = 3
        player_a_dam_ = 14
        player_a_arm_ = 8
        player_a_ammo_ = 'DA'
        player_b_sv_ = 14
        player_b_burst_ = 1
        player_b_dam_ = 16
        player_b_arm_ = 11
        player_b_ammo_ = 'EXP'
        player_a_cont_ = True
        player_b_cont_ = False
        outcomes = face_to_face(player_a_sv_, player_a_burst_, player_b_sv_, player_b_burst_)
        kp_result = face_to_face_expected_wounds(
            outcomes,
            player_a_dam_, player_a_arm_, player_a_ammo_,
            player_b_dam_, player_b_arm_, player_b_ammo_, player_a_cont=player_a_cont_)
        gl_dict = ghostlords_minimal_to_dict(active_str=active_str, reactive_str=reactive_str, fail_str=failure_str)
        kp_dict = khepri_result_to_percentage(kp_result, max_wounds_shown=3)
        assert is_ghostlords_equal(gl_dict, kp_dict)



# TODO: Crit immune tests. Note: GL does not have a crit immune toggle
# TODO: Dodge vs template weapon test
# TODO: plasma tests
# TODO: Extreme values tests: Reactive 0 burst
# TODO: Extreme values tests: Minimum 5+ wounds
# TODO: Extreme values tests: Active and reactive both cause 0 wounds


# class SelfTests:
    # def test_simple_continuous_damage(self):
    #     player_a_sv_ = 20
    #     player_a_burst_ = 1
    #     player_a_dam_ = 10
    #     player_a_arm_ = 0
    #     player_a_ammo_ = 'N'
    #     player_b_sv_ = 0
    #     player_b_burst_ = 1
    #     player_b_dam_ = 10
    #     player_b_arm_ = 0
    #     player_b_ammo_ = 'N'
    #     result = face_to_face_expected_wounds(
    #         player_a_sv_, player_a_burst_, player_a_dam_, player_a_arm_, player_a_ammo_,
    #         player_b_sv_, player_b_burst_, player_b_dam_, player_b_arm_, player_b_ammo_, player_a_cont=True)
        # Ghostlords calculator result
        # P1 Scores 20+ Successes:   0.000%
        # P1 Scores 19+ Successes:   0.000%
        # P1 Scores 18+ Successes:   0.000%
        # P1 Scores 17+ Successes:   0.001%
        # P1 Scores 16+ Successes:   0.002%
        # P1 Scores 15+ Successes:   0.003%
        # P1 Scores 14+ Successes:   0.006%
        # P1 Scores 13+ Successes:   0.013%
        # P1 Scores 12+ Successes:   0.025%
        # P1 Scores 11+ Successes:   0.050%
        # P1 Scores 10+ Successes:   0.100%
        # P1 Scores  9+ Successes:   0.200%
        # P1 Scores  8+ Successes:   0.400%
        # P1 Scores  7+ Successes:   0.801%
        # P1 Scores  6+ Successes:   1.602%
        # P1 Scores  5+ Successes:   3.203%
        # P1 Scores  4+ Successes:   6.406%
        # P1 Scores  3+ Successes:  12.812%
        # P1 Scores  2+ Successes:  25.625%
        # P1 Scores  1+ Successes:  51.250%
    #     assert result == {'active': {1: 132982387311.80006, 2: 120001405942.39105, 3: 65727164981.19168, 4: 22266942310.045437,
    #                                  5: 4287388973.3965435, 6: 358155514.2130559},
    #                       'reactive': {1: 41592289828.72894, 2: 16712956943.140924, 3: 857520144.1465032, 4: 36956664.07491093,
    #                                    5: 1074799.1400103127}, 'fail': {0: 107175756587.7309}, 'total_rolls': 512000000000}
