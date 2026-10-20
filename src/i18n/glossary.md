# Spanish game terms

The terms `es.js` uses, from Corvus Belli's Spanish. **Source**: *Army* is the
Spanish Infinity Army data (`names.es.json`, or the Spanish metadata it is
built from); *wiki* is the Spanish Infinity wiki (infinitythewiki.com/es).
Rows marked **check** are my choice where neither source says; confirm or
correct them before merging.

| English | Spanish | Source |
|---|---|---|
| Face to Face Roll | Tirada Enfrentada | wiki |
| Normal Roll (unopposed) | Tirada Normal; "sin oposición" in notes | wiki |
| Success Value (SV) | Valor de Éxito (VE) | wiki |
| Burst (B) | Ráfaga (R) | wiki |
| Special Dice (SD) | Dado Especial (DE): +1SD → +1DE | Army |
| Saving Roll / SR-1 | Tirada de Salvación (TS) / TS-1 | wiki, Army |
| PS | PS (Posibilidad de Supervivencia) | wiki |
| ARO | ORA | wiki |
| No ARO | Sin ORA | **check** |
| Active / Reactive (side) | Activo / Reactivo; Turno Activo / Reactivo | wiki |
| Active trooper (picker title, aria) | Tropa (Activo); could be "Tropa activa / reactiva" (needs a key per side) | **check** |
| Critical | Crítico | wiki |
| MOD | MOD | wiki |
| Line of Fire (LoF) | LDT ("Sin LDT") | wiki |
| CC / BS / PH / WIP / ARM / BTS / VITA / MOV / S | CC / CD / FIS / VOL / BLI / PB / VITA / MOV / S | Army |
| STR | EST | **check** |
| SWC | CAP | **check** |
| Light / Medium / Heavy Infantry | Infantería Ligera / Media / Pesada (IL, IM, IP) | wiki, Army |
| REM / Skirmisher / Warband / Vehicle / TAG | Remotos / Batidores / Warbands / Vehículos / TAGs | wiki |
| Dodge | Esquivar | Army |
| Reset | Reset | **check** |
| Cover (Partial Cover) | Cobertura (Cobertura Parcial) | wiki |
| Limited Cover / No Cover | Cobertura Limitada / Sin Cobertura | Army |
| Foxhole | Pozo de Tirador | wiki |
| Sapper | Zapador | Army |
| Smoke | Humo | wiki |
| White Noise | Ruido Blanco | wiki |
| Zero Visibility / Poor Visibility | Visibilidad Nula / Mala Visibilidad | wiki |
| Multispectral Visor L1–L3 (MSV1) | Visor Multiespectral N1–N3; short "VMS1" | Army; **check** VMS |
| Marksmanship | Puntería | wiki |
| Mimetism | Mimetismo | Army |
| Sixth Sense | Sexto Sentido | Army |
| Natural Born Warrior | Guerrero Nato | Army |
| Warhorse | Fogueado | Army |
| Combat Instinct | Intuición de Combate | Army |
| Neurocinetics | Neurocinética | Army |
| Total Reaction | Reacción Total | Army |
| Martial Arts L3 | Artes Marciales N3 | Army |
| BS Attack / CC Attack / Surprise Attack | Ataque CD / Ataque CC / Ataque Sorpresa | Army |
| Comms Attack | Ataque de Comunicaciones | Army |
| Immunity / Vulnerability | Inmunidad / Vulnerabilidad | Army |
| Nanoscreen | Nanopantalla | Army |
| Albedo, Firewall, Bangbomb, Fireteam, Team-Ops, TacBall | unchanged | Army |
| Continuous Damage | Daño Continuo; the Army writes "Daño Contínuo", which shows where its own extras are used, so one note can have both | **check** spelling |
| Direct / Impact Template | Plantilla Directa / Plantilla Terminal | wiki |
| Blast / Hit Mode | Modo Expansivo / Modo Impacto; "Expansiva" after the ammo in a dice line | Army; **check** |
| Improvised | Improvisado | Army |
| Non-lethal | No Letal | Army |
| Stun ammunition | Aturdidora | Army |
| Unconscious / Dead | Inconsciente / Muerto | wiki |
| Isolated / Stunned | Aislado / Aturdido | wiki |
| NWI / Dogged | SIH (Sin Incapacidad por Herida) / Tenaz | Army |
| Wound(s) | herida(s) | **check** (N5 English says VITA wounds) |
| Order | orden | wiki |
| loadout | equipo | **check** (players also say "perfil") |
| Matchup (the calculator mode) | Enfrentamiento | **check** |
| Classic | Clásica | **check** |

## Short weapon names

Buttons shorten the Spanish names the way the Army does in its own extras
(`src/army/names.js`, `SHORT_WEAPON.es`): **check** each.

| Spanish name | Button |
|---|---|
| Fusil de Francotirador (MULTI, AP...) | F. Francotirador |
| Fusil de Precisión (MULTI, AP...) | F. Precisión |
| Cañón Magnético Hiperrápido | CMH |
| Cañón Portátil Automático | Autocañón |

The Spanish Army already calls the HMG "Ametralladora" and its launchers one
word ("Lanzamisiles", "Lanzagranadas"), so those stay as they are.

## Search

The "+DE" quick search types "+SD": "de" is in almost every Spanish name, so
the index marks Special Dice as "sd" in every language.

## Known gaps and open questions

- A loadout's Viral ammo builds the weapon name as "Viral <name>"
  (`withAmmoExtra`), so Spanish reads "Viral Fusil Combi"; the Army writes
  "Fusil Combi Viral".
- Weapon properties have no Spanish table yet, so a Spanish Immunity note
  can say "Bioweapon (DA+SHOCK)". `scripts/army-names.mjs` already pairs the
  weapon rows; adding a `props` map there would fix it.
- Numbers keep the decimal point (56.8%); only the roll count uses Spanish
  grouping (64.000.000). Decimal comma ("56,8 %") or not?
- The unit type abbreviations (`army.terms.types`: IL, IM, IP, BAT) come with
  the army, but no screen shows type abbreviations today.
- Attributes are in the copy (`stat.*`), not read from the army: the Classic
  screen has no army loaded. A test pins them to `names.es.json`.
