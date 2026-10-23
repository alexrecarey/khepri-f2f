// The shapes that cross module boundaries, written down once so editors show
// them (docs/plans/ui-pass.md, step 5). JSDoc only: nothing here runs, the
// repo has no type-check step, and the code is the truth: when a producer
// and a typedef disagree, fix the typedef. A producer keeps its "why" and
// points here with `@returns`; the fields and their one-line comments live
// here. Army rows (units, profiles, loadouts, traits) are army.json's own
// form (src/army/normalize.js) and are left as plain objects.

// ---- Text before it is in a language (i18n/message.js) ----

/**
 * What the rules say, before it is said in a language: plain data the view
 * renders with the player's translator (i18n/message.js render). Built by
 * `msg`, `term`, `inch`, `distance` and `list` there; a string is already
 * text, so a caller can mix the army's own names (a weapon's) with descriptors.
 * @typedef {MessageKey | MessageTerm | MessageInch | MessageDistance | MessageList | string} Message
 */

/**
 * `msg(key, params)`: t(key, params), each param itself a value or a Message.
 * @typedef {object} MessageKey
 * @property {string} key
 * @property {Record<string, unknown>} [params]
 * @property {string} [fallback] shown when the key has no message (an ammo name the copy doesn't translate)
 */

/**
 * `term(table, token, scope?)`: an army term (t.term).
 * @typedef {object} MessageTerm
 * @property {[string, string] | [string, string, string]} term
 * @property {RegExp} [strip] taken off the term's text
 */

/** `inch(text)`: Army text in inches, in t's unit (t.inchText).
 * @typedef {{inch: string}} MessageInch */
/** `distance(cm)`: a distance in t's unit (t.distance).
 * @typedef {{distance: number}} MessageDistance */
/** `list(items, sep)`: descriptors joined by `sep`.
 * @typedef {{list: Message[], sep: string}} MessageList */

// ---- What a trooper rolls with (army/weapons.js, army/hacking.js, rules/trooper.js) ----

/**
 * What a weapon entry is, as army/weapons.js WEAPON_KINDS explains it:
 * 'bs' a rolled BS Attack, 'template' a Direct Template (no roll), 'cc' a
 * CC Attack, 'program' a Hacking Program, 'dodge' / 'reset' / 'none' the
 * choices that are not weapons.
 * @typedef {'bs' | 'template' | 'cc' | 'program' | 'dodge' | 'reset' | 'none'} WeaponKind
 */

/**
 * One weapon row as army.json lists it, one per firing mode
 * (army/normalize.js); a Hacking Program's is built by army/hacking.js
 * programRow. Read only through army/weapons.js' helpers.
 * @typedef {object} WeaponRow
 * @property {string} name the army's own name (in its language)
 * @property {string} [en] the English name, when `name` isn't
 * @property {string | null} mode the firing mode, null for a single-mode weapon
 * @property {number} [burst]
 * @property {number} [dmg] the chart's PS (PARA has none)
 * @property {object | null} [ranges] range bands, null for a weapon without them
 * @property {string[] | null} ammo the chart's ammunition, null for a weapon without (Sepsitor)
 * @property {{attr: 'ARM' | 'BTS' | 'PH', mod?: number, halved?: boolean, alsoBts?: boolean}} [save] the Saving Roll
 * @property {number} [saveRolls] Saving Rolls per hit
 * @property {string[]} [props] the Army's weapon properties, as strings
 * @property {{id: string, attack: number, opponent: number, state: string | null, targets: string[] | null}} [hack] a program's own (hacking.js)
 */

/**
 * Loadout-level extras on a weapon (army/weapons.js parseWeaponMods), a
 * program's upgrades (army/hacking.js) and the trooper's BS / CC Attack skill
 * (rules/trooper.js), folded into one object.
 * @typedef {object} WeaponMods
 * @property {number} burst +B
 * @property {number} sd +SD
 * @property {number | null} ps "PS=6": replaces the chart's PS
 * @property {number} psMod MOD to the target's Saving Rolls, as a change to PS (SR-1)
 * @property {boolean} forceAP AP Ammunition added
 * @property {boolean} cont Continuous Damage added
 * @property {number} sv BS MOD for this weapon ("+3", "+3 BS")
 * @property {string | null} ammo an ammo extra that swaps the Ammunition: 'T2', 'Shock', 'Viral'
 * @property {number} [opponent] MOD to the opponent's Face to Face Roll (CC weapons, programs)
 */

/**
 * A weapon a trooper can roll with, one entry per firing mode: BS and CC
 * weapons (army/weapons.js bsWeapons / ccWeapons, with the trooper's skills
 * applied by rules/trooper.js) and Hacking Programs (army/hacking.js
 * trooperPrograms).
 * @typedef {object} WeaponEntry
 * @property {string} key `${id}:${mode}`; a program's is `hack:${id}`
 * @property {'bs' | 'template' | 'cc' | 'program'} kind
 * @property {string} id the Army's weapon id (a program's: its key)
 * @property {string} name the weapon's name, as `row.name`
 * @property {string | null} mode the firing mode
 * @property {WeaponRow} row as fired: the loadout's ammo extra applied
 * @property {WeaponMods} mods
 * @property {string} label "Combi Rifle · B3 · PS13 · N", English, for tests and rolls
 * @property {true} [zoc] reaches the Zone of Control instead of range bands
 */

/**
 * A choice that is not a weapon (rules/trooper.js pseudoWeapons): Dodge,
 * Bangbomb (a second Dodge), Reset, Zero Pain (a better Reset), No ARO.
 * @typedef {object} PseudoEntry
 * @property {'dodge' | 'bangbomb' | 'reset' | 'zeroPain' | 'none'} key
 * @property {'dodge' | 'reset' | 'none'} kind
 * @property {true} [bangbomb]
 * @property {true} [zeroPain]
 */

/** Anything a side can pick: a weapon or a pseudo-weapon (army/weapons.js isPseudo tells them apart).
 * @typedef {WeaponEntry | PseudoEntry} Choice */

/**
 * One side of a matchup resolved against the army data (rules/trooper.js
 * resolveSelection): the trooper that rolls, what it can roll with, and the
 * situation chips.
 * @typedef {object} ResolvedSide
 * @property {object} unit the Army unit
 * @property {string | null} factionId the faction the unit is taken in
 * @property {object[] | null} groups the unit's groups in that faction
 * @property {object | null} group
 * @property {object | null} profile with the loadout's stat overrides and any Team-Ops upgrades applied
 * @property {object | null} option the loadout, upgrade weapons included
 * @property {{skills: object[], equip: object[]} | null} traits the profile's plus the loadout's (army/traits.js); a Foxhole adds Mimetism (-3)
 * @property {Choice | null} weapon the pick, looked up in the lists below (No ARO whichever the side)
 * @property {WeaponEntry[]} weapons BS Attack weapons, the trooper's BS Attack skill applied
 * @property {WeaponEntry[]} ccWeapons CC weapons, its CC Attack skill applied
 * @property {WeaponEntry[]} programs Hacking Programs it can run
 * @property {PseudoEntry[]} pseudo Dodge, Reset..., for the side's role (No ARO on the reactive side only)
 * @property {boolean} teamOps a Team-Ops trooper with upgrades to pick from
 * @property {object[]} upgrades the picked Team-Ops upgrades
 * @property {string[]} unsupportedUpgradeWeapons upgrade weapons the calculator can't roll, for a warning
 * @property {boolean} inCover Partial Cover (a Foxhole counts)
 * @property {boolean} targeted the Targeted chip
 * @property {number} hackedReset the Hacked chip's MOD to a Reset (0 for none)
 * @property {boolean} immA the Immobilized-A chip
 * @property {number} firewall its Firewall against a Comms Attack: -3, -6 or 0
 * @property {boolean} canSapper has Sapper, so may sit in a Foxhole
 * @property {boolean} sapper in a Foxhole
 * @property {boolean} surpriseAttack uses Surprise Attack (active side)
 * @property {boolean} berserk declared Berserk (active side)
 * @property {number} ftMax the largest Fireteam it can join
 * @property {number} ftSize the Fireteam size in use (1 = none)
 * @property {number} ccAllies allies in contact with the target (CC Attack +1 B each)
 */

// ---- How the dice were built (rules/lines.js, rules/matchup.js, rules/ledger.js) ----

/**
 * One line a calculator input adds up to (rules/lines.js). Only a live line
 * counts: not struck, and its value a number (a display-only line has a
 * string: '—', '+', ''). After rules/ledger.js renderDerived, every Message
 * here is a string.
 * @typedef {object} Line
 * @property {number | string} value
 * @property {Message} label
 * @property {'A' | 'B' | null} by whose skill, weapon or position caused it (the colour)
 * @property {Message} [struck] why it was cancelled
 * @property {Message} [source] where an ammunition part comes from (the loadout)
 * @property {true} [plain] the N ammunition line: counts only when it's all there is
 * @property {true} [cont] a Continuous Damage line, for Immunity to strike
 */

/**
 * A section of the ledger: its lines and what they add up to (rules/lines.js
 * section). The ammunition section's total is text ("AP+CONT").
 * @typedef {object} Section
 * @property {Line[]} lines
 * @property {number | Message} total
 * @property {Message} [note] said under the Success Value (out of range)
 */

/**
 * What one side's roll is built from, for "How the dice were built"
 * (rules/matchup.js deriveInputs). Which sections a side has follows its
 * kind: an attack or a template has burst, sd, save and ammo (a template
 * no sv: it doesn't roll); a Dodge sv and sd; a Reset sv; 'none' only its
 * reason or blocked zone.
 * @typedef {object} SideLines
 * @property {'attack' | 'template' | 'dodge' | 'reset' | 'none'} kind
 * @property {Section} [sv] the Success Value
 * @property {Section} [burst] Burst
 * @property {Section} [sd] Special Dice
 * @property {Section} [save] the Saving Roll the other side makes against this side's hits: weapon PS + target ARM
 * @property {Section} [ammo] the ammunition and where each part comes from
 * @property {Message} [reason] kind 'none': why a Dodge, Reset or program isn't rolled
 * @property {'smoke' | 'whiteNoise'} [blockedZone] kind 'none': the Smoke / White Noise it can't see through
 */

/**
 * The calculator input a matchup derives, with what to show next to it
 * (rules/matchup.js deriveInputs). Notes, warnings and errors are Messages
 * until rules/ledger.js renderDerived puts them in the player's language.
 * @typedef {object} Derived
 * @property {Partial<Params>} inputs the params the two sides set (engine/params.js fullParams fills the rest)
 * @property {boolean} ok no error, both sides complete, at least one trooper
 * @property {Message[]} errors what stops the calculation
 * @property {Message[]} warnings things the result may get wrong
 * @property {Message[]} notes what the rules did
 * @property {{A: SideLines | null, B: SideLines | null}} lines null while a side has nothing to roll with
 */

/**
 * One side of "How the dice were built" as the card shows it
 * (rules/ledger.js buildLedger), lines already in the player's language.
 * Which sections it has follows its kind, as SideLines.
 * @typedef {object} LedgerSide
 * @property {'attack' | 'template' | 'dodge' | 'reset' | 'none'} kind
 * @property {string} dice 'B4 SV14 PS9': burst (+special dice), Success Value, save value; or why nothing is rolled
 * @property {Section} [sv]
 * @property {Section} [burst]
 * @property {Section} [sd]
 * @property {Section} [save] the Saving Roll the other side makes against this side's hits
 * @property {Section} [ammo]
 * @property {string | null} [note] what the ammunition does (saves per hit, Continuous Damage...)
 * @property {string} [reason] kind 'none': why nothing is rolled
 */

/** Both sides' ledgers; null for a side with nothing picked or nothing to show.
 * @typedef {{A: LedgerSide | null, B: LedgerSide | null}} Ledger */

// ---- The dice (engine/params.js, engine/calculate.js) ----

/** Ammunition the calculator knows (engine/params.js AMMO_KEYS).
 * @typedef {'N' | 'DA' | 'EXP' | 'T2' | 'PLASMA' | 'DODGE' | 'NONE'} Ammo */

/**
 * One side's calculator params (engine/params.js PARAMS, per side).
 * @typedef {object} SideParams
 * @property {number} burst 0 = not rolled: the other side makes a Normal Roll
 * @property {number} bonusBurst Special Dice
 * @property {number} successValue 0 = always fails, no crit
 * @property {number} damage weapon PS
 * @property {number} arm ARM (or BTS for BTS weapons) as a target, MODs included
 * @property {number} bts BTS as a target of Plasma
 * @property {Ammo} ammo
 * @property {boolean} cont Continuous Damage
 * @property {boolean} shock Shock takes effect (VITA 1, no immunity)
 * @property {boolean} critImmune Immunity (Critical) as a target
 * @property {boolean} template a Direct Template: burst hits land automatically, no roll
 */

/**
 * The calculator's input: one flat object, the same in Basic mode, Matchup
 * mode, share links, saved results and the CSV export. Each SideParams key
 * ends in A (active) or B (reactive).
 * @typedef {object} Params
 * @property {number} burstA
 * @property {number} bonusBurstA
 * @property {number} successValueA
 * @property {number} damageA
 * @property {number} armA
 * @property {number} btsA
 * @property {Ammo} ammoA
 * @property {boolean} contA
 * @property {boolean} shockA
 * @property {boolean} critImmuneA
 * @property {boolean} templateA
 * @property {number} burstB
 * @property {number} bonusBurstB
 * @property {number} successValueB
 * @property {number} damageB
 * @property {number} armB
 * @property {number} btsB
 * @property {Ammo} ammoB
 * @property {boolean} contB
 * @property {boolean} shockB
 * @property {boolean} critImmuneB
 * @property {boolean} templateB
 * @property {boolean} fixedFaceToFace the reactive rolls a fixed value (e.g. AC2)
 */

/** Whose outcome a result row is; 'fail' is nobody's (both fail, or a tie).
 * @typedef {'active' | 'reactive' | 'fail'} Player */

/**
 * The chance each player wins the Face to Face Roll (engine/calculate.js
 * formatResult). rawChance is the chance counted in rolls (chance * totalRolls).
 * @typedef {object} FaceToFaceRow
 * @property {number} id
 * @property {Player} player
 * @property {number} rawChance
 * @property {number} chance
 */

/**
 * The chance of a player causing this many wounds (MAX_WOUNDS and more count
 * as MAX_WOUNDS). Rows go active, then fail, then reactive, by wounds.
 * @typedef {object} WoundRow
 * @property {number} id
 * @property {Player} player
 * @property {number} wounds
 * @property {number} rawChance
 * @property {number} chance
 * @property {number} cumulativeChance that player's chance of this many wounds or more
 */

/**
 * What the dice say (engine/calculate.js calculate), as the display reads it.
 * @typedef {object} EngineResult
 * @property {FaceToFaceRow[]} faceToFace active, reactive, fail (unopposed: each side's own row only)
 * @property {WoundRow[]} expectedWounds (unopposed: each side's own rows only, no 'fail')
 * @property {number} totalRolls
 * @property {{active: EngineResult, reactive: EngineResult}} [unopposed] a Direct Template against an attack: one run per side, each without the other's rows
 */

// ---- The result as the card shows it (results/summary.js, results/headline.js) ----

/** A number per side.
 * @typedef {{active: number, reactive: number}} PerSide */

/**
 * A state a side's target goes through as it takes wounds (rules/woundStates.js),
 * mildest first, with its share of the rolls (results/summary.js).
 * @typedef {object} WoundState
 * @property {string} key 'w1', 'unc', 'nwi', 'dogged', 'dead', or the State a weapon causes
 * @property {Message} label a Message until state/matchupView.js renderMatchup renders it
 * @property {number} wounds how many wounds reach it; the last state covers that many or more
 * @property {string | null} glyph
 * @property {boolean} outOfFight takes the trooper out of the fight: the results offer its chance over several orders
 * @property {true} [shock] Shock against VITA 1: straight to Dead
 * @property {true} [state] a State (Isolated, Stunned) in place of wounds
 * @property {number} index
 * @property {number} exactly its own share of the rolls
 * @property {number} atLeast that state or worse
 * @property {string} shade its colour (summary.js shade)
 */

/** One segment of the wound bar, left to right.
 * @typedef {{side: 'active' | 'none' | 'reactive', wounds: number, chance: number}} BarSegment */

/** One segment of the wound bar by state, left to right.
 * @typedef {{side: 'active' | 'none' | 'reactive', key: string, index: number, chance: number, shade: string | null}} StateBarSegment */

/**
 * One side's attack when nothing opposes it (results/summary.js attackOnItsOwn).
 * @typedef {object} AttackOnItsOwn
 * @property {number} wpo expected wounds per order
 * @property {[number, number, number]} wounds chance of exactly 1 / 2 / 3+ wounds
 * @property {number} wounded chance of any wound
 * @property {number} saved won the roll (or hit), but every hit was saved
 * @property {number} miss
 */

/**
 * The numbers the results card and sheet draw (results/summary.js summarize).
 * @typedef {object} Summary
 * @property {PerSide} wpo expected wounds per order
 * @property {{active: number, reactive: number, none: number}} win chance each side wins the Face to Face Roll (none = both fail, or a tie)
 * @property {BarSegment[]} bar 7 segments: active 3+ / 2 / 1, nobody wounded, reactive 1 / 2 / 3+
 * @property {{active: [number, number, number], reactive: [number, number, number]}} atLeast chance of 1+, 2+, 3+ wounds
 * @property {PerSide} saved won the roll, but every hit was saved
 * @property {boolean} unopposed each side rolled on its own (Direct Template vs attack)
 * @property {{active: AttackOnItsOwn, reactive: AttackOnItsOwn}} [attacks] unopposed only: each attack on its own
 * @property {{active: WoundState[], reactive: WoundState[]} | null} states with targets only: the target's wound states
 * @property {StateBarSegment[] | null} stateBar with targets only: the wound bar by state: active deepest first, nobody wounded, reactive mildest first
 * @property {{both: number, onlyActive: number, onlyReactive: number, neither: number}} [joint] unopposed only: the two independent attacks end the order one of four ways (onlyActive = only the active side causes wounds)
 */

/** The results card's big number (results/headline.js HEADLINES).
 * @typedef {'wpo' | 'win' | 'wound'} HeadlineChoice */

/**
 * What the card shows for a summary (results/headline.js headline).
 * @typedef {object} Headline
 * @property {HeadlineChoice} kind the choice shown ('wound' when 'win' falls back)
 * @property {boolean} fallback 'win' asked of a roll that is not face to face
 * @property {PerSide} value
 * @property {{active: string, reactive: string}} text the value as shown
 * @property {{active: string, reactive: string}} label under the value: wins / dodges / resets, or the State's name
 * @property {[string, string]} small the line under the bar: [left, right]
 */

// ---- The matchup screens (state/schema.js, state/matchupView.js) ----

/**
 * One side of a matchup as the player chose it (state/schema.js EMPTY_SIDE):
 * ids into the army data plus the situation chips. What can be derived (the
 * default weapon) is not stored.
 * @typedef {object} Selection
 * @property {string | null} unitId
 * @property {string | null} factionId
 * @property {string | null} groupId
 * @property {string | null} profileId
 * @property {string | null} optionId
 * @property {string | null} weaponKey null = the default weapon for the side (rules/defaultWeapon.js)
 * @property {boolean} inCover
 * @property {number | null} firewall -3, -6, 0 for none, null for the trooper's own Firewall
 * @property {boolean} sapper in a Foxhole (units with Sapper)
 * @property {boolean} targeted
 * @property {number} hackedReset the Hacked chip's MOD to a Reset, 0 for none
 * @property {boolean} immA
 * @property {boolean} surpriseAttack
 * @property {boolean} berserk
 * @property {number | null} upgrade Team-Ops: index into unit.upgrades.chart
 * @property {number | null} ball Team-Ops: index into unit.upgrades.ball
 * @property {number} ftSize Fireteam size; 1 = not in a fireteam
 * @property {number} ccAllies allies in base contact with the target
 */

/** Smoke / White Noise between the troopers (rules/visibility.js).
 * @typedef {{smoke: boolean, whiteNoise: boolean}} Zones */

/**
 * The matchup slice of the state document: both sides, the distance and the
 * table's zones (state/schema.js).
 * @typedef {object} Matchup
 * @property {Selection} A the active trooper
 * @property {Selection} B the reactive trooper
 * @property {number} rangeCm the distance both share, as a range band's upper bound in cm
 * @property {number | null} rangeCmB the reactive's own distance when the range is split, else null
 * @property {boolean} smoke
 * @property {boolean} whiteNoise
 */

/**
 * The ephemeral slice: overlays, open selectors, the picker stack
 * (state/schema.js EMPTY_UI).
 * @typedef {object} UiState
 * @property {null | 'menu' | 'results' | 'picker' | 'saved' | 'settings' | 'about'} overlay
 * @property {{side: 'A' | 'B', query: string, scope: string | null, stack: object[]} | null} picker while overlay is 'picker'; a stack entry is {view: 'factions'} | {view: 'type', type} | {view: 'unit', unitId, name}
 * @property {boolean} rangeOpen
 * @property {{side: 'A' | 'B', chip: 'ftSize' | 'ccAllies' | 'upgrade' | 'ball'} | null} edit while a chip shows its inline editor
 * @property {'matchup' | 'basic' | null} savedTab which list Saved rolls shows
 * @property {string | null} swiped id of the saved roll swiped open to show its Delete button
 * @property {{text: string} | null} toast for a moment after Save, Share or Delete
 */

/**
 * The app's one state document (state/schema.js initialState): every screen
 * is a pure function of it plus the army data. Plain, JSON-serializable data.
 * @typedef {object} AppState
 * @property {number} v STATE_VERSION
 * @property {string} mode state/modes.js MODES
 * @property {Matchup} matchup shareable: mirrored into the URL
 * @property {Params} classic Basic mode's params, shareable too
 * @property {UiState} ui ephemeral
 * @property {object} prefs persisted on this device
 * @property {{A?: string | null, B?: string | null}} scopes the faction each side's picker is scoped to
 * @property {{recents: object[], recentFactions: string[], saved: object[]}} lists persisted on this device
 */

/**
 * A weapon button on a side card: a weapon's fire modes gathered into one
 * group (state/matchupView.js weaponGroups).
 * @typedef {object} WeaponGroup
 * @property {string} key
 * @property {string} [id] a pseudo-weapon has none
 * @property {string} [name] a pseudo-weapon has none
 * @property {Choice} w the first (or only) mode
 * @property {WeaponEntry[]} [modes] a weapon with several fire modes, in the role's order
 * @property {Map<string, Message>} [labels] the mode labels (rules/weaponModes.js modeLabels), by key
 */

/**
 * What a side card shows besides the selection (state/matchupView.js
 * sideView): weapon buttons, which chips apply, the trooper's names. With no
 * army it is the empty side. Language-free until renderMatchup.
 * @typedef {object} SideView
 * @property {Selection} sel the selection with the default weapon key filled in
 * @property {ResolvedSide | null} resolved
 * @property {WeaponEntry[]} weapons
 * @property {WeaponEntry[]} ccWeapons
 * @property {WeaponEntry[]} programs
 * @property {PseudoEntry[]} pseudo Reset and Zero Pain only against a Comms Attack (or once picked)
 * @property {WeaponGroup[]} groups BS weapons, then CC weapons, programs and pseudo-weapons
 * @property {boolean} cc the side CC attacks
 * @property {number} ccAlliesMax how many allies fit around the other side's base
 * @property {boolean} noCover No Cover: cover does nothing for it, so no Cover chip
 * @property {boolean} hacked the other side's pick is a Comms Attack
 * @property {boolean} fireteamChip the pick gets a bonus from a Fireteam
 * @property {boolean} targetedChip the other side's shot or program gains from Targeted, or this side Resets
 * @property {boolean} hackedChip the pick is a Reset
 * @property {boolean} immAChip the pick is a Dodge
 * @property {number} surprise Surprise Attack's MOD (active side), 0 without
 * @property {{mod: number} | null} berserk Berserk's MOD (active side, a CC weapon picked)
 * @property {{chart: string[], ball: string[]} | null} teamOps the Team-Ops options by label (the Army's, in inches until rendered)
 * @property {string | null} faction the vanilla faction's name
 * @property {string | null} vanilla the vanilla faction id (its crest stands in for a missing unit crest)
 * @property {string | null} crest the unit crest's slug (army/crests.js)
 * @property {string | null} short the short unit name
 * @property {string | null} loadout the loadout's extra name, if any
 */

/**
 * The rules applied to a matchup, with no language in it (state/matchupView.js
 * matchupCore). Without the army only the sides and the range are filled in.
 * @typedef {object} MatchupCore
 * @property {boolean} ready the army data is loaded
 * @property {boolean} [rangeUnused] both in close combat: the distance plays no part
 * @property {SideView} A
 * @property {SideView} B
 * @property {number} rangeCm
 * @property {number | null} rangeCmB
 * @property {Zones} zones
 * @property {{A: object, B: object}} [vis] what Smoke / White Noise do to each side (rules/visibility.js)
 * @property {Derived | null} derived
 * @property {Params | null} params the full calculator input, once derived.ok
 * @property {LedgerHeader | null} ledger the ledger's names and labels, once complete
 * @property {{to: number, A?: number | null, B?: number | null}[]} bands each range band's Range MOD per side (null out of range, undefined without bands)
 * @property {boolean} hasSelection either side has a unit
 * @property {boolean} complete both sides fully chosen and the matchup valid
 * @property {{active: WoundState[] | null, reactive: WoundState[] | null} | null} targets the states each side's hits push its target through
 */

/**
 * What the ledger says about the two troopers, besides the lines.
 * @typedef {object} LedgerHeader
 * @property {{A: string, B: string}} names short unit names
 * @property {{A: string, B: string}} tags unit tags (army/names.js unitTag)
 * @property {{A: string, B: string}} labels as the side cards name them: "Squalos Mk-II · CRABBOT"
 * @property {{A: string | undefined, B: string | undefined}} weapons the picked weapons' names
 */

/**
 * The core in the player's language (state/matchupView.js renderMatchup):
 * every Message rendered, and the ledger built with its notes. `derived` is
 * the core's own (descriptors): nothing on screen reads it directly.
 * @typedef {Omit<MatchupCore, 'ledger'> & {ledger: (LedgerHeader & {ledger: Ledger, notes: string[]}) | null}} MatchupView
 */

export {};
