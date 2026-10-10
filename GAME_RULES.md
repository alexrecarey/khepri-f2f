# Game rules (Infinity N5) — what the calculator relies on

Short notes; keep them current as rules come up. Code lives in `src/rules/`
(fireteam charts: `src/army/fireteams.js`). Checked against
[infinitythewiki.com](https://infinitythewiki.com/), which tracks N5.3.

## Rolls
- d20 against a Success Value (SV). Roll ≤ SV succeeds; roll = SV is a critical. SV above 20 crits from 1 up.
- MODs total at most ±12. Attribute changes (Fireteam +1 BS, Dodge PH=14) are not MODs.
- SV below 1 is an automatic failure (clamp to 0, never 1). Out of range = 0.
- Face to Face: a success cancels the opponent's successes with a lower roll; a critical cancels all their non-critical successes.
- Direct Template: no roll, so nothing is opposed; each side's attack resolves on its own.
- ARO: Burst 1. Only Total Reaction and Neurocinetics keep their full Burst in ARO.
- Neurocinetics: Burst 1 in the Active Turn, Burst MODs included.
- BS Weapon (PH) / (WIP) (Grenades, Flash Pulse…) roll against PH / WIP; BS MODs still apply.
- X Visor: a −3 Range MOD becomes 0, a −6 becomes −3.

## Weapons the app picks for you
- Default weapon. Active: highest Burst, then Impact Template (Circular), then ammo. Reactive: a +SD weapon, then the farthest best range band, then Impact Template, then ammo. Changing the range never swaps the weapon.
- Ammo precedence: Plasma > EXP > DA > Viral > T2 > AP > Shock > N > E/M > Stun. Combined ammo ranks as its best part.
- Fire modes: Burst matters more than ammo; an Impact Template ("Blast") mode comes before Hit; DA over AP, AP over Shock; Boarding Pistol starts on its Direct Template.

## Saves
- The target saves on d20 ≤ weapon PS + its ARM (BTS for some ammo). Each failed save is a wound.
- Plasma: one save with ARM and one with BTS.
- Cover: −3 to the attacker's SV, +3 to the target's saves. Direct and Blast templates ignore the +3.
- Nanoscreen = cover's MOD (doesn't stack with it). Limited Cover keeps only the +3 save. No Cover gets nothing.
- Marksmanship ignores the −3 from cover/Nanoscreen, not the +3 save.
- Immunity (ARM) / (BTS): on a save with that Attribute the hit is Normal Ammunition (one save, one wound, no halving, no ARM=0 or Continuous Damage). Immunity (Enhanced) = both. A hit it fully negates is still rolled and opposed, it just causes no saves; State: Stunned still applies.
- Vulnerability (X): no Immunity against that weapon.

## Skills and MODs
- Mimetism −3 / −6: MSV1 cancels 3, MSV2 and MSV3 cancel all.
- Albedo −3 / −6: only against attackers with MSV or Marksmanship, BS Attacks needing LoF.
- Dodge: PH (or PH=14), plus its bracketed MODs (+3 to itself, −3 to the opponent, +1SD, ARM +3 while Dodging).
- BS Attack (−X): the opponent takes −X whatever it does, while the attack is rolled. Warhorse ignores it.
- Surprise Attack (−X): the opponent takes −X on its Face to Face Roll in ARO. A player's choice (chip), active side only.
  - Combat Instinct ignores it (N5; in N4 this was part of Sixth Sense).
  - Multispectral Visor L3 ignores it (with LoF to the attacker).
  - Biometric Visor ignores it only against Impersonation / Holoecho attackers: not modelled.
- Sixth Sense (the skill, or a Fireteam of 5): in N5 it does **not** ignore Surprise Attack, but a trooper with it who Dodges takes no negative MODs at all, so a Surprise Attack or BS Attack against its Dodge does nothing. The struck MOD reads "Sixth Sense". (Its 360° LoF and Zero Visibility parts don't change a single roll.)
- Sapper: the trooper may be in a Foxhole (chip): Partial Cover (−3 / +3 like cover) and Mimetism (−3), which doesn't stack with its own Mimetism. One or the other: Foxhole or cover.
- A trooper starts in cover when picked, unless cover can't help it (No Cover); a Sapper starts in its Foxhole.

## Fireteams
- Bonuses (cumulative, by purity): 2 = BS Attack +1 SD, 3 = +1 Dodge MOD, 4 = +1 BS, 5 = Sixth Sense.
- Who can join, from every army's fireteam chart (vanilla and sectorial; the picker's vanilla grouping is only for browsing, not a restriction). Each unit gets the most generous team it reaches anywhere.
- Team sizes: Core 5 (or the army's own cap, e.g. "Core have a maximum of 4 members"), Haris 3, Duo 2. A type only counts if the army may field it (vanilla armies have no Core).
- Purity: the largest group of one unit in the team. Members that count as that unit join it: a counts-as comment names another entry ("(Orc, Helot)") or a label several entries share ("(Steel Phalanx)", "(Undertow)"). A trooper that isn't the team's unit fills a slot without adding to it: 4 Fusiliers + 1 Bolt is purity 4. Below 2 there is no bonus, so no fireteam.
- Two differently named entries of one Army unit (Scarface, Cordelia Turner) are different units for purity.
- FTO entries ("BLADE FTO", comment "FTO …") apply only to the unit's FTO loadouts: Yan Huo FTO can join, plain Yan Huo can't.
- Wildcards join their army's other teams as an extra member, counting only as what their comment names.
- The app shows the Fireteam chip only when the limit is 2+, with sizes up to it. A kept size above a new trooper's limit drops to it.

## Wounds and states
- VITA or STR *n*: wounds 1 … n−1, then Unconscious, then Dead.
- Remote Presence adds a second Unconscious (Unconscious ×2) before Dead.
- NWI and Dogged rename the Unconscious step; those troopers keep fighting.
- Only Unconscious (first) and Dead take a trooper out of the fight.
- Shock: a 1 VITA target goes straight to Dead (no Unconscious, NWI or Dogged). STR, VITA 2+ and Shock-immune troopers are immune.

## Not modelled yet
- ⋯ More situations: Low / Poor Visibility Zone, Saturation Zone, Prone, Engaged (need rulings).
- IMM-B, Isolated and Possession immunities change nothing here (States only).
- Spec-Ops upgrades and SpecBall.
