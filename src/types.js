// The shapes that cross module boundaries, written down once so editors show
// them (docs/plans/ui-pass.md, step 5) and `yarn typecheck` holds the code
// to them (step 9: tsc, strict, over the JSDoc). JSDoc only: nothing here
// runs, and the code is the truth: when a producer and a typedef disagree,
// fix the typedef. A producer keeps its "why" and points here with
// `@returns`; the fields and their one-line comments live here. The shapes
// that come in from outside (a share link, localStorage, ?card=) are valibot
// schemas instead (step 10: engine/params.js, state/schema.js,
// share/card.js), both parser and type; their typedefs here are inferred
// from them, and their field comments sit on the schema. Army rows
// (units, profiles, loadouts, traits) are army.json's own form
// (src/army/normalize.js): the fields the code reads are written down below.

// ---- The army data (src/army/army.json, as scripts/fetch-army.mjs writes it) ----

/**
 * A skill, equipment or weapon as a profile or loadout lists it: the Army id,
 * its name in the army's language and the bracketed extras ("+1B", "Shock").
 * @typedef {{id: number, name: string, extra?: string[], foxhole?: true, supportware?: 'assistedFire'}} TraitRef
 * `foxhole`: the Mimetism (-3) a Foxhole adds (rules/trooper.js foxholeTraits), so the ledger can say why.
 * `supportware`: the Marksmanship Assisted Fire adds (rules/supportware.js), the same.
 */

/** Skills and equipment of a trooper: the profile's plus the loadout's (army/traits.js).
 * @typedef {{skills: TraitRef[], equip: TraitRef[]}} Traits */

/** The Attributes a profile row has as numbers (ProfileRow).
 * @typedef {'cc' | 'bs' | 'ph' | 'wip' | 'arm' | 'bts' | 'w' | 's' | 'ava'} StatKey */

/**
 * One profile of a unit group: the trooper's stats and traits.
 * @typedef {object} ProfileRow
 * @property {number} id
 * @property {string} name
 * @property {string} type Troop Type: LI, MI, HI, TAG, REM, SK, WB, VH
 * @property {number[]} move
 * @property {number} cc
 * @property {number} bs
 * @property {number} ph
 * @property {number} wip
 * @property {number} arm
 * @property {number} bts
 * @property {number} w
 * @property {boolean} str the W above is STR
 * @property {number} s
 * @property {number} ava
 * @property {TraitRef[]} skills
 * @property {TraitRef[]} equip
 * @property {TraitRef[]} weapons
 * @property {string} [crest] its own crest where it differs from the unit's
 */

/**
 * One loadout of a unit group.
 * @typedef {object} OptionRow
 * @property {number} id
 * @property {string} name
 * @property {number} points
 * @property {string} swc
 * @property {TraitRef[]} weapons
 * @property {TraitRef[]} skills
 * @property {TraitRef[]} equip
 * @property {boolean} [fto]
 * @property {Partial<Record<StatKey, number>>} [statOverrides] "BS=12": replaces the profile's stat (normalize.js statOverrides)
 */

/**
 * A group of profiles and loadouts (a TAG and its pilot are two groups).
 * @typedef {object} GroupRow
 * @property {number} id
 * @property {string | null} isc
 * @property {string | null} category
 * @property {ProfileRow[]} profiles
 * @property {OptionRow[]} options
 */

/** A unit's groups as one faction lists them (unit.byFaction[factionId]).
 * @typedef {{groups: GroupRow[]}} FactionEntry */

/**
 * One line of a Team-Ops upgrade (unit.upgrades): a stat delta, or a skill,
 * equipment or weapon added.
 * @typedef {{type: 'stat', stat: string, q: number, id?: undefined, name?: undefined, extra?: undefined} | {type: 'skill' | 'equip' | 'weapon', id: number, name: string, extra?: string[], stat?: undefined, q?: undefined}} UpgradeAttr
 */

/** One pick of a Team-Ops chart, with its label as the Army shows it.
 * @typedef {{label: string, attrs: UpgradeAttr[]}} UpgradeItem */

/**
 * A unit as army.json lists it.
 * @typedef {object} UnitRow
 * @property {number} id
 * @property {string} isc
 * @property {string} name
 * @property {string} slug
 * @property {string} [code] the English ISC, kept in other languages for search
 * @property {number[]} inFactions
 * @property {Record<string, FactionEntry>} byFaction by faction id
 * @property {string} [crest] crest slug (army/crests.js)
 * @property {{all: number, fto: number}} [fireteam] the largest Fireteam its bonuses reach (army/fireteams.js)
 * @property {{chart: UpgradeItem[], ball: UpgradeItem[]}} [upgrades] Team-Ops picks
 */

/**
 * @typedef {object} Faction
 * @property {number} id
 * @property {string} name
 * @property {string} slug
 * @property {number} parent the vanilla army it belongs to (itself for one)
 * @property {string} logo
 * @property {string} version
 */

/**
 * The army's own display terms for the English tokens the rules read
 * (names.<lang>.json): `extras`, `types` and `stats` map a token to its text;
 * `modes` maps a weapon id to its modes' texts.
 * @typedef {Record<string, Record<string, string | Record<string, string>>>} Terms
 */

/**
 * The army data as every module reads it: army.json, or the loaded core with
 * a language's names put back on it (army/localize.js withNames).
 * @typedef {object} Army
 * @property {string} generatedAt
 * @property {string} source
 * @property {Record<string, Faction>} factions by id
 * @property {UnitRow[]} units
 * @property {Record<string, WeaponRow[]>} weapons by id, one row per firing mode
 * @property {string} [lang] the names' language (withNames)
 * @property {Terms | null} [terms] its display terms, null in English
 */

/**
 * A names file (names.<lang>.json, src/army/localize.js): every name of
 * army.json keyed by id, plus the display terms (Terms) in every language
 * but English, whose tokens are the terms.
 * @typedef {object} NamesBase
 * @property {Record<string, string>} factions
 * @property {Record<string, string>} skills
 * @property {Record<string, string>} equip
 * @property {Record<string, string>} weapons
 * @property {Record<string, UnitNames>} units
 */
/** @typedef {NamesBase & ({extras: Record<string, string>, modes: Record<string, Record<string, string>>, types: Record<string, string>, stats: Record<string, string>} | {extras?: undefined, modes?: undefined, types?: undefined, stats?: undefined})} NamesFile */

/**
 * @typedef {object} UnitNames
 * @property {string} isc
 * @property {string} name
 * @property {string} [code]
 * @property {Record<string, {isc: string | null, profiles: Record<string, string>, options: Record<string, string>}>} groups
 * @property {{chart: string[], ball: string[]}} [upgrades]
 */

/** The core the app ships: army.json with its names stripped out (army/localize.js splitNames); only withNames reads it.
 * @typedef {Army} ArmyCore */

/** A side of the matchup: A the active trooper, B the reactive one (lib/side.js).
 * @typedef {'A' | 'B'} Side */

// ---- The translator (i18n/index.js) ----

/**
 * The player's translator: t(key, params) is the copy in their language,
 * with the army's own display terms and distance unit on it.
 * @typedef {((key: string, params?: Record<string, unknown>) => string) & {
 *   lang: string,
 *   has: (key: string) => boolean,
 *   term: (table: string, token: string, scope?: string | number) => string,
 *   withTerms: (terms: Terms | null | undefined) => Translator,
 *   distance: (cm: number) => number,
 *   inchText: (text: string) => string,
 * }} Translator
 */

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
 * @property {[string, string, (string | number)?]} term
 * @property {RegExp} [strip] taken off the term's text
 */

/** `inch(text)`: Army text in inches, in t's unit (t.inchText).
 * @typedef {{inch: string}} MessageInch */
/** `distance(cm)`: a distance in t's unit (t.distance).
 * @typedef {{distance: number}} MessageDistance */
/** `list(items, sep)`: descriptors joined by `sep`; a number (SR-1's -1) is its digits.
 * @typedef {{list: (Message | number)[], sep: string}} MessageList */

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
 * @property {number | null} [dmg] the chart's PS (PARA has none)
 * @property {{to: number, mod: number}[] | null} [ranges] range bands (upper bound in cm, BS MOD), null for a weapon without them
 * @property {string[] | null} ammo the chart's ammunition, null for a weapon without (Sepsitor)
 * @property {{attr: 'ARM' | 'BTS' | 'PH', mod?: number, halved?: boolean, armZero?: boolean, alsoBts?: boolean}} [save] the Saving Roll
 * @property {number} [saveRolls] Saving Rolls per hit
 * @property {string[]} props the Army's weapon properties, as strings
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
 * @property {number | string} id the Army's weapon id, a number (a program's: its key)
 * @property {string} name the weapon's name, as `row.name`
 * @property {string | null} mode the firing mode
 * @property {WeaponRow} row as fired: the loadout's ammo extra applied
 * @property {WeaponMods} mods
 * @property {Message} label "Combi Rifle · B3 · PS13 · N" once rendered (army/weapons.js weaponLabel); read by tests
 * @property {true} [zoc] reaches the Zone of Control instead of range bands
 * @property {undefined} [bangbomb] a PseudoEntry's: never set, so `w.bangbomb` tells the two apart
 * @property {undefined} [zeroPain]
 */

/**
 * A choice that is not a weapon (rules/trooper.js pseudoWeapons): Dodge,
 * Bangbomb (a second Dodge), Reset, Zero Pain (a better Reset), No ARO. One
 * variant per kind, so `w.kind` narrows (tsc only drops a variant whose
 * discriminant is one literal); `row`, `mods`... are never set, so `w.row`
 * tells a weapon apart from one of these.
 * @typedef {{kind: 'dodge', key: 'dodge' | 'bangbomb', bangbomb?: true, zeroPain?: undefined}
 *   | {kind: 'reset', key: 'reset' | 'zeroPain', zeroPain?: true, bangbomb?: undefined}
 *   | {kind: 'none', key: 'none', bangbomb?: undefined, zeroPain?: undefined}} PseudoKind
 * @typedef {PseudoKind & {row?: undefined, mods?: undefined, name?: undefined, id?: undefined, mode?: undefined, zoc?: undefined}} PseudoEntry
 */

/** Anything a side can pick: a weapon or a pseudo-weapon (army/weapons.js isPseudo tells them apart).
 * @typedef {WeaponEntry | PseudoEntry} Choice */

/**
 * One side of a matchup resolved against the army data (rules/trooper.js
 * resolveSelection): the trooper that rolls, what it can roll with, and the
 * situation chips.
 * @typedef {object} ResolvedSide
 * @property {UnitRow} unit the Army unit
 * @property {number | null} factionId the faction the unit is taken in
 * @property {GroupRow[] | null} groups the unit's groups in that faction
 * @property {GroupRow | null} group
 * @property {ProfileRow | null} profile with the loadout's stat overrides and any Team-Ops upgrades applied
 * @property {OptionRow | null} option the loadout, upgrade weapons included
 * @property {Traits | null} traits the profile's plus the loadout's (army/traits.js); a Foxhole adds Mimetism (-3)
 * @property {Choice | null} weapon the pick, looked up in the lists below (No ARO whichever the side)
 * @property {WeaponEntry[]} weapons BS Attack weapons, the trooper's BS Attack skill applied
 * @property {WeaponEntry[]} ccWeapons CC weapons, its CC Attack skill applied
 * @property {WeaponEntry[]} programs Hacking Programs it can run
 * @property {PseudoEntry[]} pseudo Dodge, Reset..., for the side's role (No ARO on the reactive side only)
 * @property {boolean} teamOps a Team-Ops trooper with upgrades to pick from
 * @property {UpgradeItem[]} upgrades the picked Team-Ops upgrades
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
 * @property {boolean} [canSupportware] a REM of an army list with an EVO hacker (rules/supportware.js)
 * @property {import('./rules/supportware.js').Supportware | null} [supportware] the Supportware it runs; null when it can't take any
 * @property {number} ftMax the largest Fireteam it can join
 * @property {number} ftSize the Fireteam size in use (1 = none)
 * @property {number} ccAllies allies in contact with the target (CC Attack +1 B each)
 */

/**
 * A resolved side with a profile: what rules/matchup.js deriveInputs works
 * on (a side without one has nothing to roll with).
 * @typedef {ResolvedSide & {profile: ProfileRow}} Trooper
 */
/** A trooper rolling (or firing) a weapon: a shot, a template, a program or a CC Attack.
 * @typedef {Trooper & {weapon: WeaponEntry}} Attacker */
/** A trooper Dodging or Resetting.
 * @typedef {Trooper & {weapon: PseudoEntry}} Evader */

/**
 * One MOD as the rules list it, before it is a Line (rules/closeCombat.js,
 * rules/modifiers.js): its value and what caused it.
 * @typedef {{value: number, label: Message}} Mod
 */
/** A MOD x puts on y's roll, with what of y's cancels it (modifiers.js opposingMods).
 * @typedef {Mod & {ignoredBy: Message | null}} OpposingMod */

/** A zone between the troopers (rules/visibility.js ZONES).
 * @typedef {'smoke' | 'whiteNoise'} Zone */
/**
 * What the zones do to one side's attack (rules/visibility.js visibility).
 * @typedef {object} VisSide
 * @property {Zone | null} blocked the zone that stops it attacking
 * @property {{zone: Zone, value: number, label: Message, ignoredBy: Message | null}[]} lines the MOD each zone puts on its roll; a struck one doesn't count
 * @property {number} mod the MOD that counts, 0 without one
 */
/** @typedef {{A: VisSide, B: VisSide}} Visibility */

/**
 * What one deriveInputs call shares with its helpers (attack.js, evade.js):
 * read-only. What a helper has to say comes back in its Roll's notes.
 * @typedef {object} Ctx
 * @property {Visibility} vis
 * @property {number} rangeCm
 * @property {number | null | undefined} rangeCmB
 * @property {{A: Line[], B: Line[]}} opposing the lines the other side puts on each side's roll
 */

/**
 * One side's roll as calculator inputs (attack.js, evade.js): the params it
 * sets, the lines they were built from, for a hit the PS lines that start
 * the save section, and the notes the rules made on the way ("Active: ...",
 * lines.js note), for deriveInputs to collect.
 * @typedef {{inputs: Partial<Params>, lines: SideLines, ps?: Line[], notes?: Message[]}} Roll
 */

// ---- How the dice were built (rules/lines.js, rules/matchup.js, rules/ledger.js) ----

/**
 * One line a calculator input adds up to (rules/lines.js). Only a live line
 * counts: not struck, with a number for its value. A display-only line
 * (lines.js mark) has value null and a `text` for the value column. After
 * rules/ledger.js renderDerived, every Message here is a string.
 * @typedef {object} Line
 * @property {number | null} value what it adds; null: it doesn't add up
 * @property {'—' | '+' | ''} [text] what the value column shows instead (out of range, an ammunition part, the weapon's own)
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

/** The derivation in the player's language (rules/ledger.js renderDerived): every note a string.
 * @typedef {Omit<Derived, 'errors' | 'warnings' | 'notes'> & {errors: string[], warnings: string[], notes: string[]}} RenderedDerived */

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
 * ends in A (active) or B (reactive), plus fixedFaceToFace (the reactive
 * rolls a fixed value, e.g. AC2). As engine/params.js ParamsSchema reads it,
 * built from the PARAMS table.
 * @typedef {import('valibot').InferOutput<typeof import('./engine/params.js').ParamsSchema>} Params
 */

/** Whose outcome a result row is; 'fail' is nobody's (both fail, or a tie).
 * @typedef {'active' | 'reactive' | 'fail'} Player */

/**
 * One side of the dice engine's own input (engine/calculate.js
 * ENGINE_SIDE_KEYS, f2f.py's calculate): the roll and what a hit does, PS +
 * ARM already summed into saveValue.
 * @typedef {object} EngineSide
 * @property {number} successValue
 * @property {number} burst
 * @property {number} bonusBurst
 * @property {boolean} template
 * @property {number} saveValue a Saving Roll passes on d20 <= this
 * @property {number} saves Saving Rolls per hit
 * @property {boolean} critSave a Critical adds a Saving Roll
 * @property {number} woundsPerFailure
 * @property {boolean} cont Continuous Damage
 * @property {number | null} secondarySave Plasma's BTS save value, else null
 */
/**
 * The dice engine's input: each EngineSide key with an A or B suffix.
 * @typedef {{[K in keyof EngineSide as `${K}A` | `${K}B`]: EngineSide[K]} & {fixedFaceToFace: boolean}} EngineInput
 */
/**
 * What the engine returns (wasm/khepri_engine.js calculate): the number of
 * equally likely rolls (a BigInt past 2**53) and each outcome's share.
 * @typedef {{rolls: number | bigint, outcomes: {player: Player, wounds: number, chance: number}[]}} EngineOutput
 */
/** The engine as a function: engine input in, engine output out (the WASM's calculate).
 * @typedef {(input: EngineInput) => EngineOutput} RunEngine */

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
 * @property {Params} [parameters] the params it was run for (engine/worker.js adds them to the reply)
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

/** A wound state as the rules list it (rules/woundStates.js), before results/summary.js adds its share of the rolls.
 * @typedef {Pick<WoundState, 'key' | 'label' | 'wounds' | 'glyph' | 'outOfFight' | 'shock' | 'state'>} WoundStep */

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

// ---- The trooper search (search/buildIndex.js, search/search.js) ----

/**
 * One loadout in the search index, with the words it can be found by.
 * @typedef {object} IndexRow
 * @property {number} id its position in the index: a recent pick stores the real ids instead
 * @property {number} unitId
 * @property {number} groupId
 * @property {number | null} profileId
 * @property {number} optionId
 * @property {Record<string, number>} factions vanilla faction id -> the real faction to load it from
 * @property {string} unit the short unit name
 * @property {string} loadout the loadout's name
 * @property {number[]} weapons weapon ids (index.weapons)
 * @property {string | null} type Troop Type
 * @property {number | null} bs
 * @property {number} points
 * @property {string} swc
 * @property {string[]} loadoutWords words the loadout adds to the unit's
 * @property {number[]} skills positions in index.skills
 */
/**
 * One unit in the search index.
 * @typedef {{id: number, name: string, short: string, type: string | null, factions: number[], words: [string, number][]}} IndexUnit
 */
/**
 * The search index, built from army.json (search/buildIndex.js) at build time
 * and shipped per language (search/index.json).
 * @typedef {object} SearchIndex
 * @property {number} version
 * @property {{id: number, name: string}[]} factions the vanilla factions
 * @property {IndexUnit[]} units
 * @property {Record<string, {name: string, words: [string, number][]}>} weapons by id
 * @property {{id: number, name: string, words: string[]}[]} skills
 * @property {IndexRow[]} rows
 */
/**
 * A loadout as the picker lists it (search/search.js profileHit): the ids a
 * selection needs, its names, and how well it matched.
 * @typedef {object} ProfileHit
 * @property {number} rowId
 * @property {number} unitId
 * @property {number} factionId the vanilla faction it is listed under
 * @property {number} armyFactionId the real faction the selection loads it from
 * @property {number} groupId
 * @property {number | null} profileId
 * @property {number} optionId
 * @property {string} unit the short unit name
 * @property {string} loadout
 * @property {string | null} weapon the weapon the query matched, else the first
 * @property {number | null} weaponId the matched weapon's id, null when none matched
 * @property {string[]} weapons
 * @property {number[]} weaponIds
 * @property {string | null} type
 * @property {number | null} bs
 * @property {number} points
 * @property {string} swc
 * @property {number} tier search/search.js TIER
 * @property {boolean} loose matched with a typo or by sound
 * @property {string[]} matched the index words each typed word matched
 */
/**
 * A unit as the picker lists it (search/search.js unitHit).
 * @typedef {{unitId: number, name: string, short: string, type: string | null, factionIds: number[], profileCount: number, tier?: number, best?: ProfileHit}} UnitHit
 */
/**
 * What a query finds (search/search.js search).
 * @typedef {{recent: ProfileHit[], profiles: ProfileHit[], units: UnitHit[], elsewhere: {factionId: number, name: string | undefined, count: number}[], total: number}} SearchResult
 */
/**
 * The search over one index (search/search.js createSearch).
 * @typedef {object} Searcher
 * @property {(q?: {query?: string, factionId?: number | null, recentIds?: number[]}) => SearchResult} search
 * @property {(q?: {factionId?: number | null, recentIds?: number[]}) => {recent: ProfileHit[], types: {type: string, count: number}[], units: UnitHit[]}} browse the empty-box view
 * @property {(unitId: number, factionId?: number | null) => ProfileHit[]} unitRows every loadout of one unit in scope
 * @property {(type: string, factionId?: number | null) => UnitHit[]} unitsOfType
 * @property {(pick: {unitId: number, groupId: number, optionId: number, armyFactionId: number}) => number | null} findRow a saved pick's row id today
 * @property {(factionId: number) => number} unitCount units per vanilla faction
 * @property {{id: number, name: string}[]} factions
 */

// ---- The matchup screens (state/schema.js, state/matchupView.js) ----

/**
 * One side of a matchup as the player chose it, as state/schema.js
 * SelectionSchema reads it (EMPTY_SIDE is its fallback): ids into the army
 * data plus the situation chips. What can be derived (the default weapon)
 * is not stored.
 * @typedef {import('valibot').InferOutput<typeof import('./state/schema.js').SelectionSchema>} Selection
 */

/** Smoke / White Noise between the troopers (rules/visibility.js).
 * @typedef {{smoke: boolean, whiteNoise: boolean}} Zones */

/**
 * The matchup slice of the state document: both sides, the distance and the
 * table's zones, as state/schema.js MatchupSchema reads it.
 * @typedef {import('valibot').InferOutput<typeof import('./state/schema.js').MatchupSchema>} Matchup
 */

/** A screen pushed inside the picker (state/reduce.js pickerPush).
 * @typedef {{view: 'factions'} | {view: 'type', type: string} | {view: 'unit', unitId: number, name: string}} PickerView */

/**
 * The open picker (state/reduce.js openPicker): whose side it picks for, the
 * query, the faction it is scoped to, the screens pushed; and, for the
 * desktop picker, the highlighted list row and loadout, which pane has the
 * arrow keys and the profile tab (pickerCursor).
 * @typedef {object} PickerState
 * @property {Side} side
 * @property {string} query
 * @property {number | null} scope a vanilla faction id, null for All
 * @property {PickerView[]} stack
 * @property {number | null} [cursor] the highlighted list row
 * @property {'list' | 'loadouts'} [pane]
 * @property {number} [lcursor] the highlighted loadout
 * @property {number | null} [profileId]
 */

/**
 * The ephemeral slice: overlays, open selectors, the picker stack
 * (state/schema.js EMPTY_UI).
 * @typedef {object} UiState
 * @property {null | 'menu' | 'results' | 'picker' | 'saved' | 'settings' | 'about'} overlay
 * @property {PickerState | null} picker while overlay is 'picker'
 * @property {boolean} rangeOpen
 * @property {{side: 'A' | 'B', chip: 'ftSize' | 'ccAllies' | 'upgrade' | 'ball'} | null} edit while a chip shows its inline editor
 * @property {'matchup' | 'basic' | null} savedTab which list Saved rolls shows
 * @property {string | null} swiped id of the saved roll swiped open to show its Delete button
 * @property {{text: string} | null} toast for a moment after Save, Share or Delete
 */

/**
 * The player's preferences, persisted on this device (state/storage.js), as
 * state/schema.js PrefsSchema reads them.
 * @typedef {import('valibot').InferOutput<typeof import('./state/schema.js').PrefsSchema>} Prefs
 */

/**
 * A trooper picked before, as stable army ids plus the side it was picked for
 * (state/schema.js lists.recents, RecentSchema).
 * @typedef {import('valibot').InferOutput<typeof import('./state/schema.js').RecentSchema>} Recent
 */

/**
 * What a saved roll's row shows (state/rolls.js): who rolls, their dice
 * lines, the situation and each side's chance. Matchup rolls add the crest
 * row (unit and weapon apart, crest slugs, vanilla factions). As
 * state/schema.js RollSummarySchema reads it.
 * @typedef {import('valibot').InferOutput<typeof import('./state/schema.js').RollSummarySchema>} RollSummary
 */
/**
 * A saved roll (state/schema.js lists.saved, SavedRollSchema): the setup to
 * load back (an object its mode's schema reads when loaded, state/rolls.js
 * normalizeSetup) and its summary.
 * @typedef {import('valibot').InferOutput<typeof import('./state/schema.js').SavedRollSchema>} SavedRoll
 */

/**
 * What a 'replace' action brings: a fixture or a saved roll's slices, any of
 * them partial; the reducer fills the rest from initialState.
 * @typedef {{v?: number, mode?: string, matchup?: Partial<Matchup>, classic?: Partial<Params>, ui?: Partial<UiState>, prefs?: Prefs, lists?: AppState['lists'], scopes?: AppState['scopes']}} ReplaceState
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
 * @property {Prefs} prefs persisted on this device
 * @property {{A?: number | null, B?: number | null}} scopes the vanilla faction each side's picker is scoped to (null: All)
 * @property {{recents: Recent[], recentFactions: number[], saved: SavedRoll[]}} lists persisted on this device
 */

/**
 * Every change to the state document (state/reduce.js reduce), by type.
 * @typedef {{type: 'replace', state: ReplaceState}
 *   | {type: 'setMode', mode: string}
 *   | {type: 'setSide', side: Side, sel: Partial<Selection>}
 *   | {type: 'patchSide', side: Side, patch: Partial<Selection>}
 *   | {type: 'setCover' | 'setSapper', side: Side, on: boolean}
 *   | {type: 'pickWeapon', side: Side, key: string, kind: WeaponKind, zoc?: boolean}
 *   | {type: 'setRange', side?: Side, rangeCm: number, open?: boolean}
 *   | {type: 'setRangeSplit', on: boolean}
 *   | {type: 'setZone', zone: Zone, on: boolean}
 *   | {type: 'setRangeOpen', open: boolean}
 *   | {type: 'swapSides' | 'clearSides' | 'back' | 'clearRecents' | 'clearSaved'}
 *   | {type: 'setEdit', edit: UiState['edit']}
 *   | {type: 'setClassic', key: keyof Params, value: Params[keyof Params]}
 *   | {type: 'openInClassic', params: Partial<Params>}
 *   | {type: 'setClassicSave', side: Side, which: 'arm' | 'bts', total: number}
 *   | {type: 'openOverlay', overlay: UiState['overlay']}
 *   | {type: 'backTo', depth: number}
 *   | {type: 'saveRoll', roll: SavedRoll}
 *   | {type: 'deleteRoll' | 'loadRoll', id: string}
 *   | {type: 'setSavedTab', tab: UiState['savedTab']}
 *   | {type: 'setSwiped', id: string | null}
 *   | {type: 'setPref', key: keyof Prefs, value: Prefs[keyof Prefs]}
 *   | {type: 'toast', text?: string | null}
 *   | {type: 'openPicker' | 'pickerSide', side: Side, scope: number | null}
 *   | {type: 'pickerQuery', query: string}
 *   | {type: 'pickerCursor', cursor: Partial<PickerState>}
 *   | {type: 'pickerScope', scope: number | null}
 *   | {type: 'pickerPush', view: PickerView}
 *   | {type: 'pickTrooper', side: Side, sel: Partial<Selection>, ftMax?: number, recent?: Omit<Recent, 'side'>, scope?: number | null, next?: true, nextScope?: number | null}
 * } Action
 */

/**
 * A weapon button on a side card: a weapon's fire modes gathered into one
 * group (state/matchupView.js weaponGroups).
 * @typedef {object} WeaponGroup
 * @property {string} key
 * @property {number | string} [id] a pseudo-weapon has none
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
 * @property {number} ccAllies the allies in contact the CC Attack counts (closeCombat.js ccAllies), 0 without one
 * @property {boolean} noCover No Cover: cover does nothing for it, so no Cover chip
 * @property {boolean} coverOn the Cover chip is on (in cover, not in its Foxhole)
 * @property {boolean} hacked the other side's pick is a Comms Attack
 * @property {boolean} firewallRequired the trooper has its own Firewall, which can't be switched off
 * @property {boolean} fireteamChip the pick gets a bonus from a Fireteam
 * @property {boolean} targetedChip the other side's shot or program gains from Targeted, or this side Resets
 * @property {boolean} hackedChip the pick is a Reset
 * @property {boolean} immAChip the pick is a Dodge
 * @property {number} surprise Surprise Attack's MOD (active side), 0 without
 * @property {{mod: number} | null} berserk Berserk's MOD (active side, a CC weapon picked)
 * @property {import('./rules/supportware.js').Supportware[]} supportware the Supportware chips that can change the pick (rules/supportware.js)
 * @property {{chart: string[], ball: string[]} | null} teamOps the Team-Ops options by label (the Army's, in inches until rendered)
 * @property {string | null} faction the vanilla faction's name
 * @property {number | null} vanilla the vanilla faction id (its crest stands in for a missing unit crest)
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
 * @property {Visibility} [vis] what Smoke / White Noise do to each side (rules/visibility.js)
 * @property {Derived | null} derived
 * @property {Params | null} params the full calculator input, once derived.ok
 * @property {LedgerHeader | null} ledger the ledger's names and labels, once complete
 * @property {{to: number, A?: number | null, B?: number | null}[]} bands each range band's Range MOD per side (null out of range, undefined without bands)
 * @property {boolean} hasSelection either side has a unit
 * @property {boolean} complete both sides fully chosen and the matchup valid
 * @property {{active: WoundStep[] | null, reactive: WoundStep[] | null} | null} targets the states each side's hits push its target through
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

// ---- The screens (src/ui) ----

/** Which layout the viewport gets (ui/useLayout.js).
 * @typedef {'phone' | 'tablet' | 'landscape' | 'desktop' | 'wide'} Layout */

/** The Save button (ui/useSaveRoll.js): whether this setup is saved, whether a result is still on its way, and the toggle.
 * @typedef {{saved: boolean, pending: boolean, toggle: () => void}} SaveControl */

/** The engine as the screens see it (engine/useEngine.js).
 * @typedef {{result: EngineResult | null, status: {key: string, params?: Record<string, unknown>}, pending: boolean}} EngineHook */

/**
 * What both results views take (ui/ResultsCard.jsx, ui/ResultsPanel.jsx).
 * @typedef {object} ResultsProps
 * @property {Summary | null} s results/summary.js summarize() of the engine's result, or null before there is one
 * @property {string} [status]
 * @property {{active: string, reactive: string} | null} [diceLine] matchup only
 * @property {boolean} [classic]
 * @property {MatchupView['ledger']} [ledger] matchup only
 * @property {SaveControl | null} [save] null hides the Save button
 * @property {boolean} [pending] a new result is on its way
 * @property {{A: boolean, B: boolean} | null} [picked] which sides have a trooper; matchup only
 * @property {Params | null} [params] the engine params: who is dodging, for the headline's label
 */

export {};
