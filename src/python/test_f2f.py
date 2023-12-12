import f2f
from f2f import face_to_face_wounds, face_to_face, dtw_vs_dodge
import re
from icepool import lowest
from math import isclose
from unittest import TestCase


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


def khepri_result_to_percentage(active_wounds, reactive_wounds, max_wounds_shown=100):
    # Yeah, I could nest list comprehensions, but I'd like to be able to read this code
    # As I've changed my return format, we now have to exclude 0 wounds from active and reactive successes
    # we also have to add 0 wounds active and 0 wounds reactive to failure case
    active_wounds = lowest(active_wounds, max_wounds_shown)
    reactive_wounds = lowest(reactive_wounds, max_wounds_shown)
    wounds = {
        'active': {w: float(p) for w, p in zip(active_wounds.outcomes(), active_wounds.probabilities()) if w > 0},
        'reactive': {w: float(p) for w, p in zip(reactive_wounds.outcomes(), reactive_wounds.probabilities()) if w > 0},
        'fail': {0: 1.0 - float((active_wounds > 0).mean()) - float((reactive_wounds > 0).mean()) }
    }
    return wounds


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


class TestAgainstGhostlordsCalculator(TestCase):

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
        
        player_a_cont_ = False
        player_a_bts_ = 0
        player_a_crit_immune_ = False
        player_b_cont_ = False
        player_b_bts_ = 0
        player_b_crit_immune_ = False
        
        raw = face_to_face(player_a_sv_, player_a_burst_, player_b_sv_, player_b_burst_)
        active_wounds = face_to_face_wounds(
                raw.marginals[:2],
                player_a_dam_, player_a_ammo_, player_a_cont_,
                player_b_arm_, player_b_bts_, player_b_crit_immune_)
        reactive_wounds = face_to_face_wounds(
                raw.marginals[2:],
                player_b_dam_, player_b_ammo_, player_b_cont_,
                player_a_arm_, player_a_bts_, player_a_crit_immune_)
        gl_dict = ghostlords_raw_to_dict(gl_result)
        kp_dict = khepri_result_to_percentage(active_wounds, reactive_wounds)
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
        
        player_a_cont_ = False
        player_a_bts_ = 0
        player_a_crit_immune_ = False
        player_b_cont_ = False
        player_b_bts_ = 0
        player_b_crit_immune_ = False
        
        raw = face_to_face(player_a_sv_, player_a_burst_, player_b_sv_, player_b_burst_)
        active_wounds = face_to_face_wounds(
                raw.marginals[:2],
                player_a_dam_, player_a_ammo_, player_a_cont_,
                player_b_arm_, player_b_bts_, player_b_crit_immune_)
        reactive_wounds = face_to_face_wounds(
                raw.marginals[2:],
                player_b_dam_, player_b_ammo_, player_b_cont_,
                player_a_arm_, player_a_bts_, player_a_crit_immune_)
        gl_dict = ghostlords_raw_to_dict(gl_result)
        kp_dict = khepri_result_to_percentage(active_wounds, reactive_wounds)
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
        
        player_a_cont_ = False
        player_a_bts_ = 0
        player_a_crit_immune_ = False
        player_b_cont_ = False
        player_b_bts_ = 0
        player_b_crit_immune_ = False
        
        raw = face_to_face(player_a_sv_, player_a_burst_, player_b_sv_, player_b_burst_)
        active_wounds = face_to_face_wounds(
                raw.marginals[:2],
                player_a_dam_, player_a_ammo_, player_a_cont_,
                player_b_arm_, player_b_bts_, player_b_crit_immune_)
        reactive_wounds = face_to_face_wounds(
                raw.marginals[2:],
                player_b_dam_, player_b_ammo_, player_b_cont_,
                player_a_arm_, player_a_bts_, player_a_crit_immune_)
        gl_dict = ghostlords_raw_to_dict(gl_result)
        kp_dict = khepri_result_to_percentage(active_wounds, reactive_wounds)
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
        
        player_a_cont_ = False
        player_a_bts_ = 0
        player_a_crit_immune_ = False
        player_b_cont_ = False
        player_b_bts_ = 0
        player_b_crit_immune_ = False
        
        raw = face_to_face(player_a_sv_, player_a_burst_, player_b_sv_, player_b_burst_)
        active_wounds = face_to_face_wounds(
                raw.marginals[:2],
                player_a_dam_, player_a_ammo_, player_a_cont_,
                player_b_arm_, player_b_bts_, player_b_crit_immune_)
        reactive_wounds = face_to_face_wounds(
                raw.marginals[2:],
                player_b_dam_, player_b_ammo_, player_b_cont_,
                player_a_arm_, player_a_bts_, player_a_crit_immune_)
        gl_dict = ghostlords_raw_to_dict(gl_result)
        kp_dict = khepri_result_to_percentage(active_wounds, reactive_wounds)
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
        
        player_a_cont_ = False
        player_a_bts_ = 0
        player_a_crit_immune_ = False
        player_b_cont_ = False
        player_b_bts_ = 0
        player_b_crit_immune_ = False
        
        raw = face_to_face(player_a_sv_, player_a_burst_, player_b_sv_, player_b_burst_)
        active_wounds = face_to_face_wounds(
                raw.marginals[:2],
                player_a_dam_, player_a_ammo_, player_a_cont_,
                player_b_arm_, player_b_bts_, player_b_crit_immune_)
        reactive_wounds = face_to_face_wounds(
                raw.marginals[2:],
                player_b_dam_, player_b_ammo_, player_b_cont_,
                player_a_arm_, player_a_bts_, player_a_crit_immune_)
        gl_dict = ghostlords_raw_to_dict(gl_result)
        kp_dict = khepri_result_to_percentage(active_wounds, reactive_wounds)
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
        player_a_bts_ = 0
        player_a_crit_immune_ = False
        player_b_cont_ = False
        player_b_bts_ = 0
        player_b_crit_immune_ = False
        
        raw = face_to_face(player_a_sv_, player_a_burst_, player_b_sv_, player_b_burst_)
        active_wounds = face_to_face_wounds(
                raw.marginals[:2],
                player_a_dam_, player_a_ammo_, player_a_cont_,
                player_b_arm_, player_b_bts_, player_b_crit_immune_)
        reactive_wounds = face_to_face_wounds(
                raw.marginals[2:],
                player_b_dam_, player_b_ammo_, player_b_cont_,
                player_a_arm_, player_a_bts_, player_a_crit_immune_)
        gl_dict = ghostlords_minimal_to_dict(active_str=active_str, reactive_str=reactive_str, fail_str=failure_str)
        kp_dict = khepri_result_to_percentage(active_wounds, reactive_wounds, max_wounds_shown=3)
        assert is_ghostlords_equal(gl_dict, kp_dict)


    def test_T2_ammo(self):
        """This is actually a self test, GL is not calculating T2 correctly at this time"""
        print("Testing T2 ammo")
        active_str = """28.543125% Custom Unit inflicts 1 or more wounds
27.4625% Custom Unit inflicts 2 or more wounds
2.006875% Custom Unit inflicts 3 or more wounds"""
        failure_str = """42.90% Neither player succeeds"""
        reactive_str = """28.543125% Custom Unit inflicts 1 or more wounds
2.006875% Custom Unit inflicts 2 or more wounds"""
        player_a_sv_ = 13
        player_a_burst_ = 1
        player_a_dam_ = 13
        player_a_arm_ = 0
        player_a_ammo_ = 'T2'
        player_b_sv_ = 13
        player_b_burst_ = 1
        player_b_dam_ = 13
        player_b_arm_ = 0
        player_b_ammo_ = 'N'
        
        player_a_cont_ = False
        player_a_bts_ = 0
        player_a_crit_immune_ = False
        player_b_cont_ = False
        player_b_bts_ = 0
        player_b_crit_immune_ = False
        
        raw = face_to_face(player_a_sv_, player_a_burst_, player_b_sv_, player_b_burst_)
        active_wounds = face_to_face_wounds(
                raw.marginals[:2],
                player_a_dam_, player_a_ammo_, player_a_cont_,
                player_b_arm_, player_b_bts_, player_b_crit_immune_)
        reactive_wounds = face_to_face_wounds(
                raw.marginals[2:],
                player_b_dam_, player_b_ammo_, player_b_cont_,
                player_a_arm_, player_a_bts_, player_a_crit_immune_)
        gl_dict = ghostlords_minimal_to_dict(active_str=active_str, reactive_str=reactive_str, fail_str=failure_str)
        kp_dict = khepri_result_to_percentage(active_wounds, reactive_wounds, max_wounds_shown=3)
        assert is_ghostlords_equal(gl_dict, kp_dict)


class TestAgainstSelf:
    def test_simple_decent_arm_special_ammo(self):
        a_sv, a_burst, a_dam, a_arm, a_ammo = 13, 3, 14, 6, 'DA'
        b_sv, b_burst, b_dam, b_arm, b_ammo = 13, 1, 16, 6, 'EXP'
        outcomes = face_to_face(a_sv, a_burst, b_sv, b_burst)
        result = face_to_face_expected_wounds(outcomes, a_dam, a_arm, a_ammo, b_dam, b_arm, b_ammo, player_a_cont=True)
        assert result == {'active': {0: 22190.725799424, 1: 25253.871405465597, 2: 21241.052930211838,
                                     3: 15887.243378589697, 4: 11066.76271660401, 5: 7314.86697692332,
                                     6: 4796.023127937123, 7: 2887.195025879964, 8: 1673.2309999994693,
                                     9: 937.2007140389826, 10: 507.6054807974403, 11: 266.2674690989054,
                                     12: 135.9308052824171, 13: 66.75009802370272, 14: 31.870412939526794,
                                     15: 14.771972525056883, 16: 6.649379652325107, 17: 2.908023587154541,
                                     18: 1.2362697630172954, 19: 0.5087790039275358, 20: 0.20329098857578848,
                                     21: 0.0788320082840267, 22: 0.02963602138060582, 23: 0.010787087528762312,
                                     24: 0.0037958829632112716, 25: 0.001285435783532172, 26: 0.0004198373167651864,
                                     27: 0.00013182503337114547, 28: 3.9660600026129256e-05, 29: 1.13806030200333e-05,
                                     30: 3.0951470873026182e-06, 31: 7.883403569666869e-07, 32: 1.8874919209960912e-07,
                                     33: 4.203973322575997e-08, 34: 8.486696909845032e-09, 35: 1.4790708532189742e-09,
                                     36: 2.0035044038145404e-10, 37: 1.3254058223344986e-11, 38: 4.175327549494025e-13,
                                     39: 5.7423976431694885e-15},
                          'reactive': {0: 4028.6875, 1: 12514.75, 2: 13372.125, 3: 5314.75, 4: 428.6875},
                          'fail': {0: 10058.0}, 'guts': {'active': 0, 'reactive': 0, 'missed': 0},
                          'total_rolls': 160000}

    def test_crit_immune(self):
        a_sv, a_burst, a_dam, a_arm, a_ammo = 25, 2, 15, 6, 'N'
        b_sv, b_burst, b_dam, b_arm, b_ammo = 13, 1, 13, 6, 'N'
        outcomes = face_to_face(a_sv, a_burst, b_sv, b_burst)
        result = face_to_face_expected_wounds(outcomes, a_dam, a_arm, a_ammo, b_dam, b_arm, b_ammo, player_b_crit_immune=True)
        assert result == {'active': {0: 2464.5499999999997, 1: 3654.8999999999996, 2: 1340.55}, 'fail': {0: 253.0}, 'guts': {'active': 0, 'missed': 0, 'reactive': 0}, 'reactive': {0: 141.96, 1: 121.03, 2: 24.009999999999998}, 'total_rolls': 8000}

    def test_dodge_vs_template(self):
        a_sv, a_burst, a_dam, a_arm, a_ammo = 25, 2, 15, 6, 'N'
        b_sv, b_burst, b_dam, b_arm, b_ammo = 13, 1, 13, 6, 'N'
        outcomes = dtw_vs_dodge(a_burst, b_sv, b_burst)
        result = face_to_face_expected_wounds(outcomes, a_dam, a_arm, a_ammo, b_dam, b_arm, b_ammo)
        assert result == {'active': {0: 2.1174999999999997, 1: 3.465, 2: 1.4175},
                           'fail': {0: 13.0}, 'guts': {'active': 0, 'missed': 0, 'reactive': 0},
                           'reactive': {}, 'total_rolls': 20}

    def test_plasma(self):
        a_sv, a_burst, a_dam, a_arm, a_ammo = 13, 3, 14, 6, 'PLASMA'
        b_sv, b_burst, b_dam, b_arm, b_ammo = 13, 1, 13, 3, 'N'
        outcomes = face_to_face(a_sv, a_burst, b_sv, b_burst)
        result = face_to_face_expected_wounds(outcomes, a_dam, a_arm, a_ammo, b_dam, b_arm, b_ammo)
        assert result == {'active': {0: 6567.584857528641, 1: 27000.717685382388, 2: 35015.890689458254,
                                     3: 23489.99869272637, 4: 14627.696396870906, 5: 5665.637580835031,
                                     6: 1719.0338085648748, 7: 187.37418932925002, 8: 8.885704569328125,
                                     9: 0.180394734953125},
                          'reactive': {0: 21617.927499999998, 1: 13200.845000000001, 2: 840.2275},
                          'fail': {0: 10058.0}, 'guts': {'active': 0, 'reactive': 0, 'missed': 0},
                          'total_rolls': 160000}

    def test_reactive_0_burst(self):
        a_sv, a_burst, a_dam, a_arm, a_ammo = 13, 3, 14, 6, 'N'
        b_sv, b_burst, b_dam, b_arm, b_ammo = 13, 0, 13, 3, 'N'
        outcomes = face_to_face(a_sv, a_burst, b_sv, b_burst)
        result = face_to_face_expected_wounds(outcomes, a_dam, a_arm, a_ammo, b_dam, b_arm, b_ammo)
        assert result == {'active': {0: 1658.566936265625, 1: 3380.54768803125, 2: 2047.324565859375, 3: 519.4431309375001, 4: 49.14228773437499, 5: 1.94771053125, 6: 0.027680640625}, 'reactive': {}, 'fail': {0: 343.0}, 'guts': {'active': 0, 'reactive': 0, 'missed': 0}, 'total_rolls': 8000}

    def test_minimum_5_wounds(self):
        a_sv, a_burst, a_dam, a_arm, a_ammo = 25, 3, 20, 6, 'DA'
        b_sv, b_burst, b_dam, b_arm, b_ammo = 13, 0, 13, 0, 'N'
        outcomes = face_to_face(a_sv, a_burst, b_sv, b_burst)
        result = face_to_face_expected_wounds(outcomes, a_dam, a_arm, a_ammo, b_dam, b_arm, b_ammo)
        assert result == {'active': {6: 2744.0, 7: 3528.0, 8: 1512.0, 9: 216.0}, 'fail': {}, 'guts': {'active': 0, 'missed': 0, 'reactive': 0}, 'reactive': {}, 'total_rolls': 8000}

    def test_active_reactive_both_0_wounds(self):
        a_sv, a_burst, a_dam, a_arm, a_ammo = 1, 1, 1, 13, 'N'
        b_sv, b_burst, b_dam, b_arm, b_ammo = 1, 0, 1, 13, 'N'
        outcomes = face_to_face(a_sv, a_burst, b_sv, b_burst)
        result = face_to_face_expected_wounds(outcomes, a_dam, a_arm, a_ammo, b_dam, b_arm, b_ammo)
        assert result == {'active': {0: 1.0}, 'fail': {0: 19.0}, 'guts': {'active': 0, 'missed': 0, 'reactive': 0}, 'reactive': {}, 'total_rolls': 20}
