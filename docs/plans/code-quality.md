# Code quality plan (October 2026 review)

Five refactors from the code review of 2026-10-23, in the order they build on
each other. Each is one commit on one branch; `yarn test:js` and `yarn build`
pass after every step, and the app's behaviour and output don't change (the
numbers, the ledger lines, the notes and the UI stay the same unless a step
says otherwise). AGENTS.md rules apply throughout: keep the short "why"
comments, rules stay pure, no new dependencies, delete dead code together
with its last caller.

## Why

The review found the code sound at the core (pure rules, one state document,
a clean engine boundary) and flagged five structural problems:

1. the ledger walks the rules a second time to explain the numbers
   `deriveInputs` already computed, reconciled with an "other rules" line;
2. the "weapon" object is an untyped union (BS, template, CC, program, Dodge,
   Reset, No ARO) that every layer probes with `pseudo ===`, `.cc`,
   `isHackingProgram(row)` and `isTemplate(row)`;
3. `deriveInputs` has its per-side logic written twice, once for A and once
   for B;
4. pure presentation logic (`ui/results.js`, `ui/headline.js`) lives in
   `ui/` and is imported by the Worker, and `state/` reaches into `search/`
   for `rootFaction`;
5. the rules return translated text, so the rules depend on i18n and the
   whole derivation re-runs on a language change.

Order: the weapon kind first (it simplifies everything after it), then
merging the two side blocks (it shrinks the file the ledger refactor rewrites),
then the ledger from the input lines, then the module moves, then i18n.

## Verification technique shared by steps 1-3 and 5: the ledger snapshot

Before changing anything in a step, write a script in the scratchpad that
builds `matchupView` for a corpus of matchups and dumps `{params, ledger,
notes, warnings}` per matchup to JSON. The corpus: every matchup the tests
already set up (`src/rules/*.test.mjs`, `src/state/matchupView.test.mjs`,
`src/rules/ledger.test.mjs`; grep for `resolveSelection(` and `matchupView(`)
plus a sweep: for ~40 units spread over factions (hackers, TAGs, Sapper,
Mimetism, MSV, Fireteam-capable, CC specialists, template carriers), every
weapon on each side against each other at two ranges, both in cover and not,
with Dodge, Reset and No ARO. Run it on the commit before the step and after;
`diff` must be empty except for what the step says changes. Keep the script
in the scratchpad (not the repo).

---

## Step 1 — one `kind` per weapon

### Goal

Every weapon entry (the objects in `trooperWeapons`, `trooperCcWeapons`,
`trooperPrograms`, `pseudoWeapons`, and `resolved.weapon`) carries
`kind: 'bs' | 'template' | 'cc' | 'program' | 'dodge' | 'reset' | 'none'`,
set once where the entry is built. Callers switch on `kind` instead of
re-deriving it.

### Where the entries are built

- `src/army/weapons.js` `loadoutWeapons`: `kind: cc ? 'cc' : isTemplate(row) ? 'template' : 'bs'`.
  (Impact Templates are `'bs'`: they roll. Only Direct Templates are `'template'`.)
- `src/army/hacking.js` `trooperPrograms`: `kind: 'program'` (replaces `hacking: true`).
- `src/rules/trooper.js` `pseudoWeapons`: `kind` = the current `pseudo` value.
- `src/rules/trooper.js` `trooperWeapons` / `trooperCcWeapons` spread `...w`, so
  the kind survives their row rewrites. Check nothing else rebuilds entries
  (`src/state/matchupView.js` `weaponGroups` keeps `w` whole; share/saved
  rolls store `weaponKey`, not the entry).

### Then replace the probes

- `w.pseudo === 'dodge'` → `w.kind === 'dodge'` etc.; `w.pseudo` as a truthy
  test → `isPseudo(w)` or an explicit kind check. Add to `src/army/weapons.js`
  (next to the data it describes): `WEAPON_KINDS`, `isPseudo = (w) => w.kind === 'dodge' || w.kind === 'reset' || w.kind === 'none'`,
  `rolls = (w) =>` the kinds that roll dice (`bs`, `cc`, `program`, `dodge`, `reset`).
- `x.weapon.cc` / `isCcAttack(x)` → keep `isCcAttack(x)` in `closeCombat.js` as
  `x?.weapon?.kind === 'cc'`.
- `isHackingProgram(x.weapon.row)` where the argument is a weapon entry's row
  → `x.weapon.kind === 'program'`. Keep `isHackingProgram(row)` for callers
  that only hold a row (`bandMod`, ledger `saveLines`), or change them to take
  the entry when the entry is at hand.
- `isTemplate(w.row)` on an entry → `w.kind === 'template'`. Keep
  `isTemplate(row)` for row-only callers (`ignoresCoverOnSaves`,
  `cancelsBangbomb`, the army validator).
- `rollsDice`, `evades`, `fireteamHelps`, `targetedHelps`, `attackBonuses`,
  `keepsAroBurst`, `reaches` in `modifiers.js`; `pseudoName` in `trooper.js`;
  `sideLedger` in `ledger.js`; `matchupView.js` (`bandMod`, the chip
  booleans, `shown`); `rolls.js`, `RangeSelector.jsx`, `WeaponButtons.jsx`,
  `Ledger.jsx`, `defaultWeapon.js`, `weaponModes.js`: rewrite each as a kind
  check. `grep -rn "pseudo\|\.cc\b\|hacking: true\|\.hacking" src worker` must
  come back with only `pickWeapon`'s action field (rename it to `kind` too)
  and the i18n keys `pseudo.*` (leave the copy alone).
- Remove the `pseudo`, `cc` and `hacking` fields from the entries once nothing
  reads them. The state document is untouched (`weaponKey` strings stay as
  they are: `dodge`, `bangbomb`, `reset`, `zeroPain`, `none`, `id:mode`,
  `hack:id`).

### Tests

- Existing tests pass unchanged, except where they build weapon entries by
  hand with `pseudo:` or `cc:` (update those to `kind:`).
- Add to `src/army/weapons.test.mjs` (or the nearest existing test): every
  entry from `bsWeapons`, `ccWeapons`, `trooperPrograms`, `pseudoWeapons` over
  the whole army has a `kind` in `WEAPON_KINDS`, and `'template'` iff the row
  is a Direct Template.
- Ledger snapshot: no diff.

---

## Step 2 — one side block in `deriveInputs`

### Goal

`src/rules/matchup.js` `deriveInputs` has the A and B branches written out
twice (the `if (a) {…}` / `if (b) {…}` blocks). Collapse them into one
`sideInputs(x, y, side, ctx)` called for `['A', 'B']`, with the real
differences as explicit branches:

- No ARO (`kind === 'none'`) exists only on B: zero burst, no template.
- A pseudo weapon that is not Dodge/Reset on A means "incomplete" (a No ARO
  carried over by a swap; `swapSides` already drops it, so this is a guard).
- Error keys: `error.noBsAttack` / `error.noCcAttack` on A, `…Aro` on B.
- The attack's range: `rangeCm` for A, `rangeCmB ?? rangeCm` for B.
- The Direct Template note (`note.directTemplate`) is said once, after both
  sides, when either side uses a template and neither is blocked (today it
  fires from B's branch only when B attacks; keep that condition exactly:
  emit it after the loop under the same guard, and confirm with the snapshot
  that no matchup gains or loses the note).
- `opposing` MOD and `visMod` for the side (`onA`/`vis.A.mod` vs `onB`/`vis.B.mod`).

Put the per-call context (`say`, `errors`, `vis`, `t`, the ranges) in one
`ctx` object instead of threading seven positional arguments.

### Also

- Delete `IGNORED`, `unsupportedTraits` and the `warning.unsupported` emission
  (the list has been empty since every trait it listed was modelled; AGENTS.md
  says no "maybe later" paths). Remove the `warning.unsupported` key from
  `src/i18n/en.js` and `es.js` only if nothing else reads it.
- `say` is a function with `.t` attached; make `ctx.t` explicit and pass
  `ctx` where `say` was passed.
- Keep `deriveInputs`'s signature and return shape: `{inputs, ok, errors, warnings, notes}`.

### Tests

- Existing `rules.test.mjs`, `matchupView.test.mjs`, `ledger.test.mjs` pass.
- Add one deterministic case to `rules.test.mjs` for each asymmetry listed
  above if one isn't there already (No ARO on B; `…Aro` error key for a B
  trooper with CC 0 picking a CC weapon; split range uses `rangeCmB` for B).
- Ledger snapshot: no diff in `params`, `notes`, `warnings`, `ledger`
  (note order within a side may not change either).

---

## Step 3 — the ledger is built from the input lines

### Goal

`deriveInputs` is the one place that applies the rules. It returns, next to
`inputs`, the lines that add up to each number; `buildLedger` lays those lines
out and adds only display (the dice string, the ammo lines, the ammo note).
`reconcile()` and the `ledger.otherRules` line go away: there is nothing to
reconcile when the total *is* the sum of the lines.

### Design

- A line is what the ledger already uses: `{value, label, by: 'A'|'B'|null, struck?: reason, source?}`.
  `value` is a number for lines that add up, a string (`'—'`, `'+'`, `''`)
  for display-only lines. `live(lines)` / `sum(lines)` move to a small shared
  module `src/rules/lines.js` with `line()`, `live()`, `sum()`, and the
  cap/clamp helpers (`capLine`, `clampSv`) rewritten to return the extra line
  instead of pushing onto an array.
- In `matchup.js`, each number is computed as lines and then summed:
  - `attackInputs` → `successValue` lines (Attribute, Fireteam +1 BS, range,
    loadout, program/ECM, Targeted, Mimetism (struck or reduced by MSV),
    Albedo (struck with the reason), cover / Nanoscreen (struck with the
    reason), Firewall, visibility lines, opposing lines, MOD cap line, clamp
    line), `burst` lines, `bonusBurst` (SD) lines. The total of the live
    numeric lines, clamped by `LIMITS`, is the input. Out of range stays a
    `'—'` line with `successValue` 0 (as today).
  - `ccAttackInputs` → the same three, from `ccAttackMods`/`ccBurst`/`ccSd`.
  - `dodgeInputs` / `resetInputs` → `successValue` lines (`dodgeSv` /
    `resetSv` in today's ledger), SD lines.
  - `defenseInputs` + the attacker's PS → the save lines (today's `saveLines`:
    PS, SR, the Attribute or PH, ARM=0 struck/applied, Dodge ARM, halving,
    Firewall, cover / Nanoscreen struck with the reason). Note the save total
    is `damage + arm`, two params from two sides: build the lines where both
    are known (after both sides' inputs), or build PS lines in the attacker's
    pass and ARM lines in the defender's and concatenate.
  - The `note.modCap` note is still said when the cap line is non-zero.
- `deriveInputs` returns `{inputs, ok, errors, warnings, notes, lines: {A, B}}`
  where `lines[s] = {sv, burst, sd, save}`, each `{lines, total}` (`total`
  = the input it explains), plus `kind` and anything else `sideLedger` needs
  that isn't display (`reason` for a not-rolled Dodge/Reset/program,
  `blockedZone`).
- `buildLedger({active, reactive, rangeCm, rangeCmB, inputs, zones, t})`
  keeps its signature for callers (`matchupView.js`), but takes `derived`
  (the whole `deriveInputs` result) in place of `inputs`, or `matchupView`
  passes both: pick whichever keeps `matchupView` from calling
  `deriveInputs` twice. It no longer imports `rangeModFor`, `mimetismMod`,
  `coverBsMod`, `opposingMods`, `ccAttackMods`, `saveHalving`, … — only what
  `ammoLines`, `ammoTag`, `ammoNote` and the dice string need. If an import
  from `modifiers.js`/`saves.js`/`closeCombat.js` survives in `ledger.js`
  other than for display, it means a rule is still applied twice; move it.
- Labels keep today's wording and `by` colours exactly; the snapshot proves it.
- `rules/ledger.test.mjs` currently asserts "no unexplained line": those
  assertions become trivially true; replace them with assertions on the
  specific lines (value, label, by, struck) for the cases they cover, and
  delete `reconcile`, `ledger.otherRules` (en, es) and `ledger.outOfRangeNote`
  if nothing else reads it.

### Order of work inside the step

1. Write the snapshot script, run it on the pre-step commit.
2. Create `lines.js`; move `line/live/sum/capLine/clampSv` there; ledger uses
   them (no behaviour change; snapshot clean).
3. Convert one number at a time, SV first (attack, CC, Dodge, Reset), then
   burst, SD, save; after each, snapshot clean and tests green.
4. Delete `reconcile` and the dead imports/keys. Snapshot clean.

### Tests

- `ledger.test.mjs` rewritten as above; all other tests unchanged.
- Snapshot: zero diff in `ledger`, `params`, `notes`, `warnings`.

---

## Step 4 — modules in the right layer, helpers written once

### Goal

Nothing outside `src/ui/` imports from `src/ui/`; `state/` doesn't import
from `search/`; the three duplicated helpers exist once.

### Moves

- `src/ui/results.js` → `src/results/summary.js` (`summarize`, `BAR_WOUNDS`,
  `pct`, `shade*`). It's a pure model of the engine result; the Worker
  (`worker/setupCard.js`) and the UI both read it.
- `src/ui/headline.js` → `src/results/headline.js`.
- The colour ramp `RAMP` in `results.js` is hex in JS. Move the four colours
  to `src/ui/styles/tokens.css` as custom properties
  (`--active-ramp-from/-to`, `--reactive-ramp-from/-to`) and have the
  component read them (`getComputedStyle` once, or pass the ramp in), unless
  the Worker's card (`worker/card.js`) also needs the hex: then keep one
  `RAMP` constant in `src/results/ramp.js` and generate the CSS properties
  from it isn't possible in static CSS, so document in tokens.css that the
  ramp lives in `ramp.js` and why (the Worker draws without CSS). Pick the
  option that leaves one definition.
- `rootFaction` → `src/army/factions.js` (with `vanillaOf`), imported by
  `search/buildIndex.js` and `state/matchupView.js`.
- `clamp` → one export in `src/lib/clamp.js` (`params.js` can't import from
  `rules/`, so `lib/` is the place); `params.js`, `modifiers.js`,
  `classicView.js`, `ClassicScreen.jsx` import it. `modifiers.js` may keep
  re-exporting it for its existing importers, or update them.
- `other(side)` → one export in `src/lib/side.js` (or next to `ROLE` if a
  `rules`-level home exists that `engine/` may import: it may not, so `lib/`).
  `calculate.js`, `ledger.js`, `schema.js` import it.
- Rename the two `AMMO` exports: `params.js` `AMMO` → `AMMO_KEYS` (it is the
  list of allowed values); `calculate.js` keeps `AMMO` (what each does).

### Layering test

Add `src/layering.test.mjs` (node --test): read every `.js/.jsx` under `src/`
and `worker/`, parse `import … from '…'` lines, and fail on: `rules/`,
`army/`, `search/`, `engine/`, `results/`, `lib/`, `i18n/` importing from
`ui/` or `state/`; `state/` importing from `ui/`; `engine/` importing from
`rules/`; anything outside `ui/` importing from `ui/`. Tests (`*.test.mjs`)
are exempt. Point the README layout block and AGENTS.md "Layering" at the new
`results/` directory.

### Tests

- `yarn test:js` (which runs the new layering test) and `yarn build`.
- `worker/setupCard.test.mjs` still passes (its imports move).
- No behaviour change: snapshot clean (the ramp move changes no colour value).

---

## Step 5 — rules return messages, the view translates

### Goal

`deriveInputs` and the rule functions it calls no longer take `t`. Notes,
warnings, errors and line labels are language-neutral descriptors; the
view/ledger layer renders them with the player's `t`. The rules modules
(`src/rules/*.js` except `ledger.js`) stop importing `i18n`, and
`matchupView` can memoise `deriveInputs` on `(army, matchup)` and translate
on `t` separately (a language change no longer re-derives the params).

### Message descriptors

In `src/i18n/message.js`:

- `msg(key, params?)` → `{key, params}`; a param value may be a plain value,
  another `msg`, or `term(group, name)` → `{term: [group, name]}` (today's
  `t.term('extras', 'AP')`), or `{inch: text}` for `t.inchText`, or
  `{distance: cm}` for `t.distance`.
- `render(t, m)`: renders a descriptor (recursively rendering params); a
  string passes through unchanged, so callers can migrate one at a time.
- `side(s, m)` → `msg('note.side', {side: msg(s === 'A' ? 'side.active' : 'side.reactive'), text: m})`.

### Conversions

- `deriveInputs`: `say`/`warn`/errors push descriptors; drop the `t` option.
  `matchupView` renders them (`derived.notes.map((m) => render(t, m))`) where
  it builds `ledger.notes` and wherever `derived.errors/warnings` are read
  (grep `derived.` in `src/ui`, `src/state`, `worker`).
- Rule functions that currently take `t = tEn` to build a label:
  `opposingMods`, `programSvMods`, `msvName`, `noEffectBy`, `immunityNote`,
  `ccAttackMods`, `ccBurst`, `ccSd`, `visibility`/`zoneName`, `woundStates`,
  `rangeModFor`'s callers, `pseudoName`, `ammoName`, `modeLabels`: return
  `msg(...)` for `label`/`ignoredBy`/`name`, and drop the `t` parameter. The
  line labels produced in step 3 become descriptors too; `buildLedger`
  renders every `label`, `struck`, `source`, `reason`, `dice` and `note` with
  `t` at the end (one `renderLines` pass), so `Ledger.jsx` keeps receiving
  strings.
- Where a rule compares labels (there should be none after step 1; grep
  `label ===`, `label.startsWith`), fix it to compare kinds or keys.
- `army/weapons.js` `ammoName` and `army/traits.js` take `t` for display
  names: these are army-layer display helpers; move the `t`-taking versions to
  the renderer (`render` can map `{ammo: 'DA'}` to `t('ammo.DA')` or the raw
  name) and keep the army layer language-free. If this grows too far, stop at
  `rules/` being i18n-free and leave `army/` names for a follow-up; say so in
  the commit.
- `tEn` defaults disappear from `rules/` signatures; `ledger.js` keeps `t`
  (it is the renderer). `rolls.js` / `matchupShareCard` render with the `t`
  they already have.

### Tests

- Rules tests that assert on English strings (`rules.test.mjs`,
  `ledger.test.mjs`, `hacking.test.mjs`, `closeCombat.test.mjs`,
  `matchupLanguages.test.mjs`) either assert on descriptors (`{key: 'note.shock'}`)
  or render with `tEn` first; prefer descriptors for rules tests and rendered
  text for the ledger test.
- `matchupLanguages.test.mjs`: the Spanish and English derivations give the
  same `params` and the notes differ only in text — keep it, it now also
  guards that `deriveInputs` is `t`-free.
- Add `message.test.mjs`: `render` on nested descriptors, terms, strings.
- `useMatchupView`: `deriveInputs` memoised on `[army, matchup]`; a test or a
  comment-backed check that changing `t` alone doesn't call it again.
- Snapshot: zero diff (rendered with `tEn`, both languages).

---

## Not in this plan (later)

- Component size (`ResultsCard.jsx`, `TrooperPicker.jsx`), the static
  `style={{}}` uses, snake_case engine result keys, JSDoc typedefs, resolving
  each side once per render (`effectiveWeaponKey` + `sideView` both call
  `resolveSelection`). The last is cheap once step 1 is in: do it if a step
  touches `matchupView.js` anyway.
