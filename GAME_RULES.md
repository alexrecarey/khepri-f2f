# Game rules (Infinity N5) — what the calculator relies on

Short notes; keep them current as rules come up. Code lives in `src/rules/`.

## Rolls
- d20 against a Success Value (SV). Roll ≤ SV succeeds; roll = SV is a critical. SV above 20 crits from 1 up.
- MODs total at most ±12. Attribute changes (Fireteam +1 BS, Dodge PH=14) are not MODs.
- SV below 1 is an automatic failure (clamp to 0, never 1). Out of range = 0.
- Face to Face: a success cancels the opponent's successes with a lower roll; a critical cancels all their non-critical successes.
- Direct Template: no roll, so nothing is opposed; each side's attack resolves on its own.
- ARO: Burst 1.

## Saves
- The target saves on d20 ≤ weapon PS + its ARM (BTS for some ammo). Each failed save is a wound.
- Plasma: one save with ARM and one with BTS.
- Cover: −3 to the attacker's SV, +3 to the target's saves. Direct and Blast templates ignore the +3.
- Nanoscreen = cover's MOD (doesn't stack with it). Limited Cover keeps only the +3 save. No Cover gets nothing.
- Marksmanship ignores the −3 from cover/Nanoscreen, not the +3 save.

## Skills and MODs
- Mimetism −3 / −6: MSV1 cancels 3, MSV2 and MSV3 cancel all.
- Albedo −3 / −6: only against attackers with MSV or Marksmanship, BS Attacks needing LoF.
- Surprise Attack: −3 to the opponent's SV.
- Fireteam (cumulative, same unit): 2 = BS Attack +1 SD, 3 = +1 Dodge MOD, 4 = +1 BS, 5 = Sixth Sense.
- Dodge: PH (or PH=14), plus its bracketed MODs.

## Wounds and states
- VITA or STR *n*: wounds 1 … n−1, then Unconscious, then Dead.
- Remote Presence adds a second Unconscious (Unconscious ×2) before Dead.
- NWI and Dogged rename the Unconscious step; those troopers keep fighting.
- Only Unconscious (first) and Dead take a trooper out of the fight.
- Shock: a 1 VITA target goes straight to Dead (no Unconscious, NWI or Dogged). STR, VITA 2+ and Shock-immune troopers are immune.
