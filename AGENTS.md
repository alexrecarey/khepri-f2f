# Code quality rules (khepri-f2f)

Rules for anyone (human or agent) changing this repo. They come from the
calculator-redesign review (PR #42); each one guards against a bug or a cost
that review found. Layout and commands: README.md and CLAUDE.md.

## Layering
- Dependencies point one way: `ui -> state -> rules -> army`, with
  `engine/params.js` as the contract for calculator params. `rules/`, `army/`,
  `search/` and `engine/` never import from `ui/` or `state/`; `state/` never
  imports from `ui/`.
- Rules logic is pure and lives in `src/rules/` (or `state/matchupView.js` /
  `state/classicView.js` for what a screen shows). Components render; they
  don't decide which MODs apply, which inputs show, or which weapon is default.
- Small shared helpers (short unit name, Lieutenant, non-lethal weapon...) are
  written once, next to the data they read (`src/army/`), and imported.

## One source of truth
- Each game rule is one function or constant in `src/rules/`. The engine input
  (`deriveInputs`) and the "How the dice were built" ledger both call it; the
  ledger never re-implements a rule. A new rule = a helper + both call sites.
- Numbers from the rules or the engine are named constants (`MOD_CAP`,
  `LIMITS`, `COVER_BS_MOD`...), never typed again elsewhere.
- Never classify things by their display label (`label.startsWith(...)`).
- State stores what the player chose, not what can be derived (default
  weapons, summaries, results).
- Write the rule in GAME_RULES.md when Alex rules on it.

## Async and data loading
- A cached lazy promise (`x ??= import(...)`) resets on rejection so the next
  use retries, and the UI shows an error instead of loading forever.
- Engine replies are matched to the latest request before they touch state;
  older replies are dropped. Don't run the engine for an incomplete setup.
- Code that needs the army data handles it not being loaded yet.

## Performance
- Selectors return slices or primitives; derive with `useMemo` on slices.
- Derive once per screen and pass the result down; keep hover/drag state in
  the smallest component that needs it.
- No linear `find` over all units/rows per rendered row: build a Map once.
- Long lists are capped (or virtualised).
- Watch the main chunk (`yarn build`): don't ship disabled SDKs, whole icon
  packs, or dependencies nothing imports. Big data stays in lazy chunks and
  under the PWA precache limit.

## Components and CSS
- Components stay under ~200 lines; behaviour goes in hooks, repeated JSX in
  small shared components.
- Colours, sizes that must agree, and z-layers are CSS custom properties in
  src/ui/styles/tokens.css; no hex values in JSX or rules. Styles live in
  one file per area under src/ui/styles, imported by app.css in cascade
  order. Styles go in CSS, not `style={{}}`
  (only for values computed at runtime).
- Interactive things are `<button>`s (or have role + keyboard handlers);
  dialogs move focus in and give it back; lists driven by the keyboard scroll
  the active row into view.
- Gesture code handles cancel and multi-touch and clears its timers.

## Dead code and dev tools
- Delete code, files, tests and dependencies together with the feature that
  used them. Don't keep "maybe later" code paths.
- Dev and preview-only tools (fixtures, debug overlays) are gated on
  `import.meta.env.DEV || __PREVIEW__` and never write to the user's storage.

## Tests
- Pure logic gets `node --test` tests next to it. Property tests are good, but
  every rule interaction that matters (ARM=0 x Dodge, MOD cap, immunities...)
  also gets a deterministic case.
- Bug fixes come with a test that fails without the fix.
- Generated files (`src/search/index.json`, `src/army/army.json`) are checked
  in CI against their sources.
- `yarn test:js` and `yarn build` pass before every commit.

## Comments
- Short files, short "why" comments. Keep them when refactoring; adapt the
  wording, don't drop the reason.
