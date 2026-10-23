# UI pass (October 2026 review, second tier)

The second half of the code review of 2026-10-23. The first half
(docs/plans/code-quality.md, PR #79) put the rules, state and layering in
order; this one is about the view: deriving each side once, components under
~200 lines, styles in CSS, the engine result's names, and the shapes written
down. Same ground rules: one commit per step on one branch, `yarn test:js` and
`yarn build` green after each, no visible or numeric change unless a step says
so, AGENTS.md throughout (keep the "why" comments, no `style={{}}` for static
values, components under ~200 lines, delete dead code with its feature).

## Verification

Two snapshots, both kept in the scratchpad, never in the repo:

- **Ledger snapshot** (from the first pass:
  `/tmp/claude-0/-home-user-khepri-f2f/99747842-2e7f-5bc2-9439-2935f017d9ff/scratchpad/snapshot/snapshot.mjs`,
  README alongside): `matchupView` output over ~65k matchups. Steps 1 and 2
  must leave it byte-identical.
- **Style snapshot** (new, written in step 3 and reused by step 4): a
  Playwright script (Chromium is preinstalled; `PLAYWRIGHT_BROWSERS_PATH` is
  set, don't run `playwright install`) that starts `yarn dev`, opens each
  fixture in `src/ui/fixtures/` (`?fixture=<name>`, dev-only) at phone (390
  px) and desktop (1440 px) widths, waits for the engine result, and for every
  element in `document.body` writes one line: a path of tag + class names, the
  element's text (first 40 chars) and the computed values of a fixed property
  list (display, position, flex-direction, flex-grow, gap, margin*, padding*,
  width, height, min-width, max-height, opacity, color, background-color,
  border*, border-radius, font-size, font-weight, line-height, left, top,
  z-index). It also saves a full-page screenshot per fixture × width. Run
  before and after a step; `diff` of the text dumps must be empty (a moved
  style that computes to the same value leaves no trace) and the screenshots
  must be pixel-identical (`cmp`, or Playwright's `toHaveScreenshot` with
  threshold 0). Where a step must change a value, the diff names exactly
  that. Animations: set `prefers-reduced-motion: reduce` and
  `animations: 'disabled'` so timing doesn't leak in.

---

## Step 1 — each side derived once

### Goal

`state/matchupView.js` resolves a side twice (`effectiveWeaponKey` calls
`resolveSelection`, then `sideView` calls it again) and `resolveSelection`
builds all three weapon lists to find one key, which `sideView` builds again.
`matchupCore` then patches each side after the fact (`x.cc = …`,
`x.pseudo = x.pseudo.filter(…)`), and `EMPTY_VIEW_SIDE` is a hand-kept copy
of `sideView`'s shape.

### Design

- `rules/trooper.js`: `resolveSelection(army, sel)` returns, next to what it
  returns now, the lists it built: `weapons`, `ccWeapons`, `programs`,
  `pseudo` (for the side's role; today `pseudoWeapons(traits, 'B')` is used
  for the lookup regardless of side, keep that for the lookup and expose the
  role-specific list separately, or pass the role in). Build each list once.
  Callers that only need the resolution are unaffected; `sideView` reads the
  lists instead of rebuilding them.
- `effectiveWeaponKey(army, sel, side)` becomes a step inside one resolution:
  resolve once without a weapon key, pick the default from the lists already
  built, then select the weapon entry from those lists (no second
  `resolveSelection`). Keep an exported `effectiveWeaponKey` only if something
  outside `matchupView` uses it (grep `actions.js`, `rolls.js`, tests).
- `sideView(army, sel, side, y?)`: returns the complete side view in one
  object literal, including what the post-loop sets today (`cc`,
  `targetedChip`, `ccAlliesMax`, `hacked`, the filtered `pseudo`/`groups`).
  The cross-side fields need the other side's resolution: resolve both sides
  first (cheap, no lists needed beyond what step above builds), then build the
  two views from `(resolvedA, resolvedB)`. No mutation after construction.
- `EMPTY_VIEW_SIDE`: derive it from the same function (`sideView` with no
  army returns the empty shape), or make `sideView` the only place that lists
  the keys and have the empty case call it with `resolved = null`. One shape,
  one place.
- Keep the view's field names (`pseudo`, `cc`, `groups`, …): the UI reads
  them. Renaming the view's `pseudo` list is out of scope.

### Tests

- `state/matchupView.test.mjs` and `rules/*.test.mjs` pass; add a test that
  `resolveSelection` is called once per side per `matchupCore` (wrap or count
  via a spy on a module-level hook, or assert `sideView` returns the same
  `resolved` object identity that `derived` was built from).
- Ledger snapshot byte-identical (it records chips, groups, pseudo lists).

---

## Step 2 — the engine result in camelCase

### Goal

`engine/calculate.js` `formatResult` still emits the Python-era names
(`face_to_face`, `expected_wounds`, `total_rolls`, `raw_chance`,
`cumulative_chance`, `player`, `id`). It already reshapes the engine output,
so it is the one place to rename.

### Design

- `formatResult` → `{faceToFace, expectedWounds, totalRolls}`, rows with
  `{id, player, wounds, rawChance, chance, cumulativeChance}`. `calculate`'s
  unopposed branch follows.
- Readers: `engine/calculate.js`, `engine/worker.js` (`totalRolls` in the
  status message), `results/summary.js`, `engine/calculate.test.mjs`,
  `worker/setupCard.js` / `worker/card.js` if they read rows, `ui/*` (grep
  `face_to_face|expected_wounds|total_rolls|raw_chance|cumulative_chance`
  over `src worker scripts`). `f2f.py` / `test_f2f.py` / the golden file are
  the engine's own `{rolls, outcomes}` contract and don't change; if the grep
  hits `test_f2f.py` it is a comment or a reference test of the Python
  formatter — read it and leave the Python side alone unless it tests the JS
  names.
- **Persistence check first:** saved rolls (`state/rolls.js`, `storage.js`)
  and share cards must not store engine rows. If anything persisted carries
  the old names, stop and report: that needs a migration decision, not a
  rename.

### Tests

- `calculate.test.mjs`, `summary.test.mjs`, `setupCard.test.mjs` updated to
  the new names; `engine.test.mjs` (golden) untouched and green.
- Ledger snapshot byte-identical (it doesn't include engine results); a
  before/after dump of `summarize(calculate(params))` over `calculate.test.mjs`'s
  params and 200 random `DEFAULT_PARAMS` variations, compared by value.

---

## Step 3 — static styles out of JSX

### Goal

AGENTS.md: `style={{}}` only for values computed at runtime. About 40 uses
are static (`{display: 'flex', flexDirection: 'column', gap: 6}`,
`{background: 'var(--none)'}`, `{padding: 0}`, `{height: 40}`, …). They move
to classes in the right file under `src/ui/styles/`. The computed ones stay:
segment widths from chances, `bandColor(...)`, `--crest`, `--cols`,
`left: calc(...)`, `maxHeight: open ? 48 : 0` (toggle-driven; may become a
class toggle if the CSS already has the open state, otherwise leave it).

### Design

- `grep -rn "style={{" src/ui` is the list. For each static one: a class
  named for what the element is (`.rs-skeleton-bar`, `.menu-section-label`,
  …), in the styles file of that area (`chrome.css`, `results.css`,
  `classic.css`, `picker.css`…; create one only if the area has none and say
  why). Values that must agree with others become tokens in `tokens.css`
  (a gap of 6 used in three places is `--gap-tight`, say). Hex never.
- Where two components repeat the same static style (`display:flex;
  flex-direction:column; gap:6` in `ClassicScreen` and `ResultsDetail`) they
  share one class.
- `SavedRolls` `{fontWeight: 600}`, `Chrome` menu rows, `DeskDetail`
  `{padding: 0}` (three times): the same treatment.
- Leave the `style` attribute entirely when nothing runtime remains on the
  element.

### Tests

- Style snapshot (write it first, run on the pre-step tree): the computed
  dump must be identical before and after; screenshots pixel-identical.
- `yarn build`; the CSS chunk may grow by a few hundred bytes, the JS chunk
  should shrink a little.

---

## Step 4 — results and picker components under ~200 lines

### Goal

`ui/ResultsCard.jsx` (293 lines) holds the phone sheet, the tablet/desktop
panel, the waiting states, the loading state and the shared body;
`ResultsCard` and `ResultsPanel` each compute `choice`, `headline`, the
breakdown and the wait state separately. `ui/picker/TrooperPicker.jsx` (293)
holds three row components and the whole picker.

### Design

- `ui/useResultsView.js`: one hook returning `{choice, h, b, wait, swipe}`
  (headline choice, the headline, the breakdown, the waiting-for state, the
  headline swipe) from `(s, ledger, params)`; both `ResultsCard` and
  `ResultsPanel` call it. `useBreakdown`, `waitingFor`, `waitMessage` move in.
- Files: `ResultsCard.jsx` (the phone sheet only), `ResultsPanel.jsx`
  (tablet/desktop), `ResultsWait.jsx` (`SideWait`, `WaitRow`, `WaitPanel`,
  `EngineLoading`), `ResultsBody.jsx` (`ResultsBody`, `SheetTop` if it is
  shared; if `SheetTop` is sheet-only it stays with the sheet),
  `SheetActions` wherever it is used by both. Each file under ~200 lines.
  `MatchupScreen.jsx` / `ClassicScreen.jsx` imports follow.
- `picker/TrooperPicker.jsx`: `ProfileRow`, `LoadoutRow`, `UnitRow` →
  `picker/Rows.jsx`; the faction / type / unit screens, if they are
  distinguishable blocks in the render, → `picker/PickerScreens.jsx`; the
  default export stays `TrooperPicker`. Hooks already exist
  (`useRecentIds`, `useTrooperSearch`); behaviour goes in them, not in new
  JSX.
- No behaviour, prop or class-name change: this is a move. PropTypes move
  with their components.

### Tests

- Style snapshot identical (dump and screenshots) on every fixture, both
  widths; the fixtures cover the sheet closed (`FinalPeek`), open
  (`FinalResults`), the picker (`FinalPicker`), classic (`FinalClassic*`),
  unopposed, menu.
- `wc -l` on every file under `src/ui` ≤ ~200 except the ones that were
  already over and are not in this step (`Chrome.jsx` 203, `useSheetGestures.js`
  218: leave, note in the report).

---

## Step 5 — the shapes written down

### Goal

The shapes that cross module boundaries exist only in comments and
`PropTypes.object`. Write them once as JSDoc typedefs so editors show them
and the next refactor has something to diff against. No TypeScript, no
`tsc` in CI (the repo has no type-check step; adding one is a separate
decision).

### Design

- `src/types.js`: `@typedef` for `WeaponEntry` (`key, kind, id, name, mode,
  row, mods, label, zoc?, bangbomb?, zeroPain?`), `ResolvedSide`
  (`resolveSelection`'s return), `Line`, `Section`, `SideLines`, `Derived`
  (`deriveInputs`'s return), `Summary` (`summarize`'s return), `LedgerSide`
  (`buildLedger`'s per-side return), `MatchupCore` / `MatchupView`,
  `EngineResult` (post step 2 names), `Params` (from `PARAMS`). Field
  comments are the existing header comments, moved or referenced, not
  duplicated: where a function's header already lists the fields, replace
  the list with `@returns {import('../types.js').Derived}` and keep the
  "why" sentences.
- Producers get `@returns`, the main consumers `@param`. Only the public
  functions of each module; no annotation sweep of internals.
- The file is documentation that the editor reads; it ships nothing (it has
  no runtime exports, or one empty `export {}`).

### Tests

- None needed beyond `yarn test:js` / `yarn build` passing (a `types.js` with
  only comments must not break the layering test's parser or the build).

---

## Parked (needs a ruling from Alex, not code)

- `note.directTemplate` is said only when the reactive side shoots; not when
  it Dodges, Resets or has No ARO against a template.
- A Direct Template in a Fireteam ≥ 2 shows `−1 loadout / BS Attack` and
  `+1 Fireteam` SD lines that sum to 0.
- The MOD-cap note isn't said for a Dodge or Reset that hits ±12.
