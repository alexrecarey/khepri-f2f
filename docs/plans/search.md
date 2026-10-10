---
title: Trooper search for the calculator redesign
date: 2026-10-05
status: in progress — matcher and scoreboard done
---

# Trooper search

The redesigned picker (canvas: `docs/design-canvas/mobile-ux-redesign`, board *FinalPicker*) is one
search box that finds a **profile** ("Fennec Fusiliers · Missile Launcher") from a few letters of the
unit and the weapon (`fus ml`). It must answer on every keystroke with no visible delay.

## Size of the problem

`src/army/army.json` is 7.5 MB: 738 units, 46 factions, 135 weapons. Collapsed to what the picker
lists — one row per (unit, vanilla faction, group, loadout) — that is about **3,800 rows**.

Matching 3,800 pre-tokenised rows is well under a millisecond in plain JS, so the search itself needs
no library, worker or fuzzy engine. The real latency risk is getting the data: parsing 7.5 MB of JSON
on a phone costs far more than any query. So the plan is a small index built ahead of time, and a
linear scan over it.

## 1. Build a search index at build time

A script (`scripts/build-search-index.mjs`, run with the army pipeline) writes
`src/search/index.json`, a few hundred KB, that the picker loads instead of the full army file:

- `factions`: the 10 vanilla factions (`parent === id`), id → name.
- `units`: id, display name, unit type (LI, MI, HI, TAG, REM, SK, WB, VH), the vanilla factions it
  appears in, and its profile count.
- `rows`: one per loadout, flattened. Each row carries what the result list shows (unit, loadout
  name, main weapon, BS, points, SWC, vanilla faction) plus **search tokens**: unit ISC and name
  words, loadout name words, weapon names, weapon aliases.

Vanilla mapping: a sectorial is folded into its `parent`. 251 units only appear in sectorials, so
they are listed under their parent vanilla. The same loadout reached through several sectorials of one
vanilla becomes a single row.

The full army data is still loaded when a profile is picked (to build the trooper), but that can
happen in the background while the user is typing.

## 2. Matching, with typo tolerance

Infinity names are hard to spell (Zhanshi, Ghulam, Asawira, Nøkken, Hac Tao,
PSI-Cops, RacerBots), so fuzzy matching is part of the first version, not an
add-on. Our own matcher, no library: the index's words come to under 4,000
distinct words, so every typed word is compared against that word list (not the
rows) in well under a millisecond, and matched words point to their rows.

Layers, strongest first. A row matches when **every** typed word matches one of
its words; it ranks by its weakest typed word.

1. **Normalised words** (built into the index): accents folded (`Índigo`,
   `Tian Gǒu`), split on hyphens and CamelCase (`PSI-Cops`, `RacerBots`), plus
   the joined forms players type (`psicops`, `racerbots`, neighbour pairs like
   `hactao`). The short name before the comma (`Hexas`, `Hellblazers`) is
   indexed as the strongest field.
2. **Exact, then prefix** of a word: `fus ml` while still typing.
3. **One typo** (insert, delete, substitute, swap neighbours) against the
   start of a word, for typed words of 4+ letters. Typed words of 8+ letters
   may carry two typos. The first letter must match (or be swapped with the
   second): people rarely mistype it, and it keeps short words from matching
   everything. Words under 4 letters are prefix-only, so `ml` stays precise.
4. **Sounds-like key** for transliterations: kh/gh/zh/sh drop the h, q/c/ck
   become k, ph→f, y→i, w→v, doubled letters collapse (`gulam` → Ghulam,
   `asawirah` → Asawira). Ranked between one typo and two.
5. **Aliases** (`src/search/aliases.js`): weapon shorthands (ml, hmg, msr,
   bsg, spit…) and unit nicknames no rule can derive. Multi-word weapon
   initials are generated automatically.

6. **Skills** (2026-10-10): every skill of the profile and loadout
   (`mimetism`, `sixth sense`, `sapper`), stored once in `index.skills` and
   referenced by position from each row. The weakest field, and matched only
   exactly or by prefix: skills are shared by hundreds of troopers, so a typo
   there would bury a misspelt unit name. Total Reaction and Neurocinetics
   keep their stronger loadout-word ranking.

Every result carries its tier, so the UI can be more careful with loose
matches (`loose: true`), e.g. not auto-selecting them.

## 3. Ranking

Cost per typed word = tier × 10 + field × 6, where the field is short name (0),
full name or loadout (1), weapon or alias (2), skill (3). So a prefix of the unit name (10)
beats an exact weapon word (12): `mine` means Minescorp before every unit that
carries mines. A typo in the unit name (30) loses to an exact weapon word. A
query that spells the short name exactly gets an extra bonus. Ties break on
points, then name.

## 4. What `search()` returns

```js
search(index, {query, factionId, recentIds}) => {
  recent:   [ProfileHit],   // recent picks that match (empty query: all recents)
  profiles: [ProfileHit],   // capped at ~30, plus total count
  units:    [UnitHit],      // units with at least one matching row
  elsewhere:[{factionId, name, count}], // only when the scoped search finds nothing
  total:    number,
}

ProfileHit = {
  rowId, unitId, groupId, optionId, profileId,
  factionId,                // vanilla faction it is listed under
  armyFactionId,            // the real (possibly sectorial) faction to load it from
  unit, loadout, weapon,    // display strings
  weaponId,                 // weapon the query matched, to preselect it (null if none)
  bs, points, swc, type,
  tier, loose,              // how it matched; loose = typo or sounds-like
  matched,                  // the index words that matched, for bolding
}
UnitHit = {unitId, name, short, type, profileCount, factionIds}
```

For the empty query, a sibling call returns the browse view: recents, unit-type tiles with counts
for the scoped faction (types with 0 units hidden), and the units A–Z.

## 5. The scoreboard

`yarn search-eval` (`scripts/search-eval.mjs`) generates ~5,800 queries from
every unit's short name, mangled the way phone typing mangles names: dropped
letter, swapped neighbours, doubled letter, fat-finger neighbour key, wrong
vowel, dropped space, first word only, first four letters. Plus
`src/search/eval/hard-cases.json`, the hand-written cases players report. It
prints top-1 / top-5 / found per mutation and the timings; `--misses` lists
every query whose unit missed the top 5.

First version (2026-10-05): **95.4 % top-1, 99.2 % top-5, 100 % found**, all
hard cases in the top 5, p95 0.7 ms per query. The remaining top-5 misses are
genuinely ambiguous prefixes (`shas` lists all fifteen Shasvastii units).
`src/search/search.test.mjs` holds these as floors, so a change that makes
search worse fails the tests.

## Order of work

1. ~~Index builder + index file, with tests on row count and vanilla folding.~~ Done.
2. ~~`search()` and `browse()` in `src/search/`, with the scoreboard and timing tests.~~ Done.
3. Wire them into the new picker UI.
4. Keep growing `hard-cases.json` and `aliases.js` from what players actually type.
