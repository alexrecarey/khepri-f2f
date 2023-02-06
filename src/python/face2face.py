import icepool
from icepool import d20, lowest


class InfinityUniverseEvaluator(icepool.OutcomeCountEvaluator):
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


# Set each players SV and burst
player_a_sv = 20
player_a_burst = 4
player_b_sv = 21
player_b_burst = 1

# Handle cases where SV > 20
a_sv = player_a_sv if player_a_sv <= 20 else 20
a_bonus = 0 if player_a_sv <= 20 else player_a_sv - 20
b_sv = a_sv if player_b_sv <= 20 else 20
b_bonus = 0 if player_b_sv <= 20 else player_b_sv - 20

# Evaluate
print(InfinityUniverseEvaluator(a_sv=a_sv, b_sv=b_sv)
      .evaluate(lowest(d20+a_bonus, 20).pool(player_a_burst),
                lowest(d20+b_bonus, 20).pool(player_b_burst)))

print("trying 2")
evaluator = InfinityUniverseEvaluator(a_sv=a_sv, b_sv=b_sv)\
      .evaluate(lowest(d20+a_bonus, 20).pool(player_a_burst),
                lowest(d20+b_bonus, 20).pool(player_b_burst))
print(evaluator.probabilities())
print(evaluator.outcomes())  # results for each outcome
print(evaluator.denominator())   # number of combinations
