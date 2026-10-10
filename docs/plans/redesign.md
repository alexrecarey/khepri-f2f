---
title: Implementing the final redesign — one state document, every screen derived from it
date: 2026-10-07
status: phases 1-9 built on calculator-redesign (2026-10-08); open gaps in section 7
---

# Implementing the final redesign

Source: the **Final** page of the design canvas (Infinity the Calculator,
https://claude.ai/artifact/Ki3XWPgrkwNu9zARuS6YnY). Branch `calculator-redesign`, draft PR #42; every
phase below ends in something Alex can try on `deploy-preview-42--khepri.netlify.app`.

## 1. What the Final page specifies

### Mobile matchup (FinalPicker, FinalPeek, FinalPeekRange, FinalResults, FinalUnopposed)
- Header: wordmark + one `⋯` button. Nothing else.
- Two side cards, ACTIVE (green) above REACTIVE (pink). Each card: unit name + faction (tap → picker),
  **weapon buttons** (the selected one filled; reactive also gets Dodge / No ARO), **chips**:
  Cover toggle, Fireteam (tap → inline 2/3/4/5 picker with ×), Surprise attack (active only, only for
  units with the skill), and `⋯ More` which opens a list of rare situations (Low / Poor Visibility
  Zone, Saturation Zone, Prone, Engaged) that become removable chips.
- **Range strip** between the cards: 7 bands (8 16 24 32 40 48 96). Tapping a band picks it *and*
  opens the selector: header ("Range 24–32" ⌃"), Infinity-colour stripe above each band for the
  active weapon and below for the reactive one (+3 green, 0 blue, −3 yellow, −6 red, none = out of
  range / template / CC / Dodge), legend with both weapons' MOD. Tap outside (scrim) closes. `⇅` swaps
  the sides.
- **Results peek** pinned at the bottom: two wounds/order numbers, 6 px shaded wound bar, "x% at
  least one wound" each side. Swipe/tap up → **sheet**: big numbers, thin F2F bar, thick wound bar
  with 3+/2/1/0 labels, breakdown grouped "Active wins / Nobody wins / Reactive wins" with 1+/2+/3+
  wounds and "all saved", then **How the dice were built**: one card per side, SV / save / burst
  columns, each line coloured by the side that caused it, cancelled lines struck ("Mimetism −3,
  cancelled by MSV2").
- **Not face to face** (Direct Template vs a shot): same card shape; the sheet leads with the four
  outcomes (both wounded / only active / only reactive / nobody), then one section per attack.

### Mobile picker (FinalPicker, press Play) — a stack of screens inside one full-screen sheet
- **search**: input at the bottom (thumb), scope button (side's current faction ▾ / All factions),
  quick weapon chips (Missile L., HMG, Spitfire, Sniper). Empty query: Recent, Browse <faction> by
  type, All units A–Z. With a query: matching recents, Profiles · N (unit, weapon, tag, BS, pts,
  faction), Units. Zero hits in scope → "No PanOceania matches for 'x'" + "N in Yu Jing › / all
  factions ›".
- **factions**: recent factions, All, the 11 vanillas with counts.
- **type**: units of one type in the scope.
- **unit**: stat line, loadouts grouped Long range / Rifles / Close; tapping one picks and closes.

### Chrome (FinalMenu, FinalSaved, FinalSettings, FinalAbout)
- Menu sheet: Saved rolls (count), Calculator Matchup / Classic (remembered), Settings, About, data
  date + version.
- Saved rolls: Matchup | Classic tabs, card per roll (both troopers + weapons, dice lines, setup
  summary, both win %), tap loads the whole setup, swipe left deletes. Explicit save only.
- Settings: starting faction per side (Last used / a faction), language, clear recents, delete saved.

### Classic (FinalClassic, FinalClassicResults)
Burst 0–6 as dice (0 = unopposed, reactive only), special dice 0–3, steppers ±1/±3 for Success
Value and Opponent PS (two PS rows — ARM and BTS — when Plasma), ammo segmented (N DA EXP T2 PLASMA
Dodge CONT), toggles Immunity (Critical) / Direct Template / Fixed value die. Results sheet: F2F bar,
wound bar, per-side ladders, "nobody wounded" split.

### Tablet and desktop (DeskWorkbench, DeskWorkbenchWide, TabletPortrait, TabletLandscape, DeskClassicColumns, TabletClassic)
- Header gains a Matchup | Classic segmented control; `⋯` keeps the rest. Results header gets
  ☆ Save · ↗ Share.
- 1440: setup column | results column | mods column (active then reactive), each scrolls alone.
  1920: the two mods cards side by side. Tablet portrait: sides next to each other, results and mods
  below. Tablet landscape: mods under the results.
- Classic desktop: active | reactive | results rail.

### Desktop picker (DeskPickerEmpty, DeskPickerFaction, DeskPicker)
- An overlay over the dimmed workbench: ACTIVE/REACTIVE tabs (`Tab` switches side), search field
  ("Search troopers, weapons, skills…"), faction chips with hit counts, `esc`.
- Empty: Recent list (with BS/ARM/W) + Browse by faction grid with logos. Faction picked: recents in
  that faction + unit-type tiles with counts and sample names.
- Typing: left list grouped by faction with the matched letters bold and the reason shown ("typo:
  fus → fug", "sounds like"), "In other factions" after; `↑↓` move, `→` into profiles, `↵` pick.
  Right pane: unit, profile tabs, full stat row, skills line, **loadouts with a 7-band range stripe**,
  B / PS / ammo; "Set now" fireteam + cover; "Use · then pick Reactive ⇥".

## 2. The state model (the core of this plan)

**Invariant: the UI is a pure function of one serializable `AppState` document plus static data.**
Same document → same pixels on every width. Layout (mobile / tablet / desktop) is chosen by CSS and
viewport, never stored. Anything the screen shows that is not in the document is *derived*.

### 2.1 The document

```js
AppState = {
  v: 1,
  mode: 'matchup' | 'classic',
  matchup: {                       // == the share link, exactly
    A: Side, B: Side,              // A = active, B = reactive
    rangeBand: 0..6,
  },
  classic: ClassicParams,          // == today's engine params (engine/params.js)
  ui: {                            // ephemeral, never persisted, never shared
    overlay: null | 'picker' | 'menu' | 'saved' | 'settings' | 'about' | 'results',
    picker: { side: 'A'|'B', query, scope: factionId|null,
              stack: [{screen:'search'} | {screen:'factions'} | {screen:'type', type}
                      | {screen:'unit', unitId, profileId?}],
              cursor: rowIndex|null },          // desktop keyboard focus
    rangeOpen: bool,
    edit: null | {side, chip: 'fireteam'|'more'},
    savedTab: 'matchup' | 'classic',
  },
  prefs: { lang, startFaction: {A, B}, lastMode },  // persisted
  lists: { saved: SavedRoll[], recents: RecentPick[], recentFactions: id[] },  // persisted
}

Side = { unitId, factionId, groupId, profileId, optionId, weaponKey,
         cover, fireteam: 0|2..5, surpriseAttack, extras: ['lvz','pvz','sat','prone','engaged'],
         upgrade, ball }                         // today's EMPTY_SELECTION + fireteam + extras
SavedRoll = { id, mode, savedAt, setup: matchup|classic, summary: {dice, setup, pct} }
```

Every slice is tagged: `matchup` + `classic` + `mode` are **shareable** (URL), `prefs` + `lists` are
**persisted** (localStorage), `ui` is **ephemeral**. A saved roll stores its result summary because
the Saved list shows percentages without recomputing 13 rolls through Pyodide.

### 2.2 Changes go through named actions

`dispatch({type: 'pickTrooper', side, hit})`, `setWeapon`, `toggleCover`, `setFireteam`,
`addExtra`, `setRange`, `openRange`, `swapSides`, `openPicker`, `pickerQuery`, `pickerPush/Pop`,
`saveRoll`, `loadRoll`, `deleteRoll`, … One `reduce(state, action) → state`, pure, in plain JS so it
runs under `node --test` like the rest of `src/`. Rules that couple fields live here, once: picking a
trooper fills the default weapon (`defaultWeapon`), clears fireteam if the unit can't, drops Surprise
Attack if the unit lacks it; swapping clears Surprise Attack.

### 2.3 Derived, never stored

| Derived value | From | Notes |
|---|---|---|
| resolved troopers | `matchup` + army data | `resolveSelection` (rules/trooper.js) |
| engine params | resolved + range | `deriveInputs` (rules/matchup.js) |
| ledger | same | `buildLedger` (rules/ledger.js) — already has `by` and `struck` |
| band stripes | each side's weapon | `rangeModFor` per band |
| search results | `ui.picker` + index | `search()` is synchronous already |
| results | engine params | **async** (Pyodide worker): a cache keyed by `paramsKey`, not state |

Selectors are memoised on the slice they read, so typing in the picker never re-derives the matchup.

### 2.4 Edges of the document
- **URL**: `matchup` (+`mode`) ↔ query string through the existing `encodeMatchup` / `decodeMatchup`
  (encode is written and tested but never called — the Share button and replace-state use it). Today
  App.jsx strips the link after load; instead keep the URL in sync with `replaceState`.
- **History**: opening an overlay or pushing a picker screen does `pushState`; Back pops it. On a
  phone the back gesture must close the picker/sheet, not leave the app. History entries carry only
  `ui`, so Back never undoes a matchup change.
- **Storage**: `prefs` and `lists` written on change (debounced), read once at boot, versioned with
  `v` and a migration function. Replaces `atomWithStorage('calculatorMode')` and `recentTroopers`.

### 2.5 What this buys
- **Fixtures as tests**: each Final board becomes `src/ui/fixtures/<board>.json` (an `AppState`). A
  dev route `/?state=<fixture>` renders it; reviewing the build against the canvas is opening 20
  fixtures at three widths. Reducer tests are plain `node --test`.
- Saved rolls and share links are slices of the same document, so "load the whole setup" is one
  action.

## 3. TanStack DB — review and pushback

**The goal is right; the tool fits about a tenth of it.** I recommend *not* making TanStack DB the
state holder.

1. **Its model is collections of keyed rows plus live queries** (where / join / orderBy, differential
   updates). That pays off when many components query large, changing, often server-synced
   relational data. Ours is: two `Side` records and a handful of toggles; a static 7.5 MB catalogue
   that never changes at runtime; two small lists. Holding "one state document" in it means
   one-row collections (`ui`, `matchup`, `prefs`) and transactions across them — the opposite of a
   single file you can dump, load and diff.
2. **Search can't move into it.** The picker's ranking (exact → prefix → typo1 → sound → typo2,
   scored, with the "typo: fus → fug" reasons) is our own matcher over a prebuilt postings map. A
   live query's `where` can't express it, so search stays outside either way, and that's the
   app's heaviest query.
3. **The expensive derivation is async.** Results come from a Pyodide worker. TanStack DB doesn't
   model "compute this from state in a worker"; we'd still need our own cache keyed by `paramsKey`.
4. **Maturity.** `@tanstack/react-db` is **0.5.7** today (published 2026-10-07): pre-1.0, with API
   changes between minors. That's a real cost for a solo-maintained app, on top of the d2ts runtime
   in the bundle.
5. **Its strongest features aren't used here**: sync adapters (Electric, Query, PowerSync),
   optimistic mutations with server rollback. We have no server.

**Where it would fit**: `lists.saved` and `lists.recents` as `localStorageCollectionOptions`
collections give CRUD, persistence and cross-tab sync in a few lines. If we want it in the stack,
that is the scoped use — and it only makes sense if saved rolls later sync to an account.

**Decision (2026-10-07): `@tanstack/store`** (Alex meant TanStack Store, not DB) holds the one
`AppState` document. It is ~5 KB gzipped with `@tanstack/react-store`, built on alien-signals, has
`useSelector(store, selector, compare)` with `shallow`, and runs inside TanStack Form and Router, so
it is heavily exercised. It is still 0.x and 0.10/0.11 reshaped the API (`Derived` gone, `useStore`
deprecated for `useSelector`), so: pin the exact version, and touch it in two files only —
`src/state/store.js` (`createStore(initial)`, `dispatch = (a) => store.setState((s) => reduce(s, a))`)
and a `useAppState(selector)` hook. Components, reducer and selectors never import it, so an upgrade
or a swap to a 50-line own store stays local. We use `setState` + our own `reduce`, not the store's
actions map, so the reducer stays a plain function under `node --test`.

Either way persistence sits behind a `storage.js` adapter, so moving `lists` to a TanStack DB
collection later is a local change. Drop `jotai` (one atom left) and the MUI/emotion deps in the same
pass.

## 4. Phases — each one a deploy preview

1. **Store + document, no visual change.** `src/state/` (schema, `reduce`, selectors, `storage.js`,
   URL + history sync, migrations). Port App.jsx and useMatchup.js onto it; current components read
   through selectors. Reducer + URL round-trip tests. *Preview: app behaves as today, share links
   now survive reload, Back closes the picker.*
2. **Mobile matchup to Final.** Side cards (weapon buttons incl. Dodge / No ARO, chips, fireteam
   inline picker, ⋯ More), range strip with stripes + scrim + swap, results peek. Fixtures for
   FinalPeek / FinalPeekRange.
3. **Results sheet + not-F2F.** Sheet layout, breakdown groups, ledger cards from `buildLedger`,
   unopposed four-outcome grid. Fixtures FinalResults / FinalUnopposed.
4. **Mobile picker to Final.** Picker stack in `ui.picker`, scope + fallback-to-other-factions,
   type browse, unit page with grouped loadouts, weapon quick chips, recent factions.
5. **Chrome.** Menu, Saved rolls (save from results, Matchup | Classic tabs, load, swipe-delete),
   Settings (start faction, language, clear data), About. Share button (`encodeMatchup`).
6. **Classic to Final.** Dice burst/special inputs, steppers, Plasma double PS, toggles, results
   sheet.
7. **Tablet + desktop layouts.** Breakpoints only — same components, grid placement per
   DeskWorkbench / Wide / TabletPortrait / TabletLandscape / DeskClassicColumns / TabletClassic.
   Matchup | Classic segmented control in the header.
8. **Desktop picker.** Overlay, side tabs, faction chips with counts, keyboard (`Tab`, `↑↓`, `→`,
   `↵`, `esc` — scoped to the overlay, no global keydown), match-reason labels, unit pane with
   profile tabs and per-loadout band stripes, "Set now" + "Use, then pick Reactive".
9. **Motion polish** (MotionPolish board on Exploration) once the screens are stable.

## 5. Gaps the design assumes (rules / data work, not UI)

- `⋯ More` situations — Low / Poor Visibility Zone, Saturation Zone, Prone, Engaged — none are
  modelled in `deriveInputs` yet. Ship the chip list only for the ones that are.
- "Missile Launcher (Hit)" / "(Blast)" as separate weapon buttons (DeskWorkbench) — check whether
  `bsWeapons` splits multi-mode weapons today.
- **No ARO** as a reactive option (unopposed active roll).
- Fireteam chip for every unit (no can-fireteam data yet); the canvas hides it for units that can't.
- Search placeholder says "troopers, weapons, **skills**", and the desktop list explains matches —
  `buildIndex.js` indexes units and weapons only; skills and match reasons are search-index work
  (extend docs/plans/search.md).
- Desktop picker shows faction logos from assets.corvusbelli.net — decide whether to hotlink or
  bundle them.

## 6. Decisions for Alex

1. ~~State holder~~ — decided: `@tanstack/store`, wrapped (section 3).
2. Phase order: mobile first as above, or desktop picker earlier?
3. Keep evolving the PR #42 components (they already hold most of the Final mobile layout) — the plan
   assumes yes, rewriting their state plumbing rather than their markup.

## 7. Status (2026-10-08)

All nine phases are on `calculator-redesign` (PR #42), one commit each:
a245e0b state document, c2a1d07 mobile matchup + fixtures, f31d4bf results
sheet, c750538 mobile picker, 4b09122 chrome, 1f7dd49 classic, b9f566b tablet
and desktop, af6e42c desktop picker, a6fb32f motion.

Fixtures: `?fixture=<Board>` opens the build in the state of a Final board
(src/ui/fixtures: FinalPeek, FinalPeekRange, FinalResults, FinalUnopposed,
FinalPicker, FinalMenu, FinalClassic, FinalClassicResults).

Since then (2026-10-08 to 10-10): the results sheet is one element
(`.rsheet`) that follows the finger while dragged and settles open or closed
on release (useSheetGestures.js); the wounds/order numbers roll digit by
digit (RollingNumber.jsx); search covers skills (docs/plans/search.md);
fireteams, Sapper and Sixth Sense follow GAME_RULES.md.

Not built, and why:
- `⋯ More` situations (Low / Poor Visibility Zone, Saturation Zone, Prone,
  Engaged): no rules in `deriveInputs` yet; they need rulings first.
- The desktop list labels loose matches only as "close match" / "sounds
  like", not "fus → fug".
- Language: English only, the setting is a placeholder until translations land.
