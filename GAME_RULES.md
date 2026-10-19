# Game rules (Infinity N5) — what the calculator relies on

Short notes; keep them current as rules come up. Code lives in `src/rules/`
(fireteam charts: `src/army/fireteams.js`). Checked against
[infinitythewiki.com](https://infinitythewiki.com/), which tracks N5.3.

## Rolls
- d20 against a Success Value (SV). Roll ≤ SV succeeds; roll = SV is a critical. SV above 20 crits from 1 up.
- MODs total at most ±12. Fireteam +1 BS is a MOD and counts; Dodge PH=14 replaces the Attribute and doesn't.
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
- Smoke and White Noise between the troopers (Alex, 2026-10-13; chips in the range selector):
  - Smoke is a Zero Visibility Zone for troopers without MSV: they can't shoot through it, unless the other trooper attacks them through it (a template counts; a Dodge doesn't); then they shoot back at −6 (Poor Visibility Zone). If neither can see, nobody shoots.
  - MSV1 shoots through Smoke at −3 when it is attacked, −6 (Zero Visibility Zone) when the other trooper Dodges or does nothing. MSV2 and MSV3 ignore Smoke.
  - White Noise does the same to troopers WITH MSV (any level) or Marksmanship, always at −6; everyone else ignores it.
  - Sixth Sense (or a Fireteam of 5) cancels the Poor Visibility MOD of a trooper being attacked, not the Zero Visibility −6.
  - White Noise and Albedo stack. With Smoke and White Noise both up, every trooper is blocked by one of them, so nobody shoots.
  - A trooper with no LoF rolls nothing ("No LoF" in How the dice were built). A Direct Template needs LoF too: blocked unless attacked through the zone; once it can fire it rolls nothing, so no visibility MOD touches it (Alex, 2026-10-14). Dodging is unaffected.
- Dodge: PH (or PH=14), plus its bracketed MODs (+3 to itself, −3 to the opponent, +1SD, ARM +3 while Dodging).
  - A weapon's ARM = 0 wins over the Dodge's ARM +3.
- Bangbomb (+X): +X to Dodge Rolls, except against Template Weapons (Direct or Impact). It only counts against attackers in the user's LoF or ZoC (not a shot in the back), so it is a separate choice next to Dodge.
- BS Attack (−X): the opponent takes −X whatever it does, while the attack is rolled. Warhorse ignores it.
- Surprise Attack (−X): the opponent takes −X on its Face to Face Roll in ARO. A player's choice (chip), active side only.
  - Combat Instinct ignores it (N5; in N4 this was part of Sixth Sense).
  - Multispectral Visor L3 ignores it (with LoF to the attacker).
  - Biometric Visor ignores it only against Impersonation / Holoecho attackers: not modelled.
- Sixth Sense (the skill, or a Fireteam of 5): in N5 it does **not** ignore Surprise Attack, but a trooper with it who Dodges takes no negative MODs at all, so a Surprise Attack or BS Attack against its Dodge does nothing. The struck MOD reads "Sixth Sense". (Its 360° LoF and Zero Visibility parts don't change a single roll.)
- Sapper: the trooper may be in a Foxhole (chip): Partial Cover (−3 / +3 like cover) and Mimetism (−3), which doesn't stack with its own Mimetism. One or the other: Foxhole or cover.
- A trooper starts in cover when picked, unless cover can't help it (No Cover); a Sapper starts in its Foxhole.

## Close combat
Checked against the wiki (Close Combat, CC Attack, Martial Arts, Natural Born Warrior, Weapon Chart). Code: `src/rules/closeCombat.js`.
- Picking a CC weapon (in the weapon list with the others; a CC Mode is a mode of its weapon: Vorpal, Kobra Pistol) makes that side a CC Attack: it rolls CC against the other side's Face to Face Roll. The other side may answer in CC, Dodge, or shoot (it isn't Engaged yet when the attacker charges in; Alex, 2026-10-19).
- A CC Attack has no range band: the side's range does nothing to it, the other side's still works. Both in CC: the range plays no part.
- None of the shooting MODs touch a CC Attack: no range, cover (−3 or the +3 save), Nanoscreen, Mimetism, Albedo, Smoke or White Noise, no Fireteam bonus. A shot at a trooper who is CC attacking still takes all of them.
- CC weapons are B1 with the loadout's PS (`CC Weapon (PS=6)`). PARA CC Weapon: the target rolls PH−6 (no PS). D-Charges (CC Mode) are Improvised: −6 to the user. Chest Mine (CC Mode): +3.
- A CC weapon's bracketed negative MOD (PARA CC Weapon (−6), Monofilament CC Weapon (−3)) goes on the opponent's Face to Face Roll.
- Burst: in ARO a CC Attack is one die; loadout and CC Attack (+1B) count only in the Active Turn.
- Allies in contact (chip): +1 B per ally (trooper or Peripheral) in Silhouette contact with the target, in both turns. At most 4 models touch a 25 mm base and 6 a 40 mm or larger one, the attacker included, so 3 or 5 allies. No base sizes in the Army data: S1–S2 count as 25 mm, S3+ as 40 mm or larger. B caps at 6.
- Picking a CC weapon moves the range to 0–8": a shot at a trooper charging into CC almost always comes from there (Alex, 2026-10-19).
- A shot with BS Attack (−X) at a trooper charging in: the −X applies to its CC roll (it's a Face to Face Roll). Natural Born Warrior doesn't stop it: it needs the user to be the target of a CC Attack (Alex, 2026-10-19).
- Martial Arts (not cumulative; both turns; the opponent's −3 applies to whatever it rolls, a Dodge or a shot included):
  L1 −3 to the opponent · L2 +3 / −3 · L3 +3 / −3, +1 SD · L4 +3 / −3, +1 B · L5 +3 / −3, +1 B, +1 SD.
- CC Attack (+X / −X / +1B / AP / Shock / Continuous Damage): like BS Attack, for CC Attacks. Antimaterial only matters against scenery.
- BS Attack (−X) is for shots only; it does nothing while the trooper CC attacks.
- Surprise Attack applies to a CC Attack too.
- Berserk (chip, active side, troopers with the skill): a Long Skill, Move (both MOV values) + CC Attack, so Active Turn only. Berserk (+X) adds +X to the CC Attack; +1 SD still applies. Plain Berserk changes nothing on the roll. The chip shows only while a CC weapon is picked; picking a gun or Dodge drops it. N5 has no "opponent makes a Normal Roll" rule.
- Natural Born Warrior: the target of a CC Attack that answers with a CC Attack ignores every negative MOD the attacker imposes (Martial Arts, Surprise Attack, CC Attack (−X), the weapon's (−X)). Not when it Dodges or shoots.
- Sixth Sense's Dodge ignores the Martial Arts −3 like any other negative MOD.

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
- ⋯ More situations: Low Visibility Zone, other Poor Visibility Zones (not Smoke / White Noise), Saturation Zone, Engaged (need rulings). Prone changes nothing to the roll.
- Biometric Visor (ignores Surprise Attack from Impersonation / Holoecho attackers).
- IMM-B, Isolated and Possession immunities change nothing here (States only).
- Spec-Ops upgrades and SpecBall.
- Close combat: Guard, Protheion, Coup de Grâce, a Chest Mine hitting every enemy in contact.
