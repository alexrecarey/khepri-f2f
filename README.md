# Infinity Face Off
### an Infinity the Game N4 expected wounds calculator

[Infinity Face Off](https://infinitythecalculator.com) is small web app that allows
players of Infinity the Game to quickly calculate the expected outcome
of a face to face roll. It is intended to be used to evaluate profiles
and for new players to get of feel of the often unintuitive face 2 face
roll probabilities. 

It's a static, single page application written in Javascript using react. 
The site does not require any backend other than a webserver to serve the files.
The actual die probability rolls are done using the incredible
[icepool](https://github.com/HighDiceRoller/icepool) library: in the browser,
through [icepool-rs](https://github.com/alexrecarey/icepool-rs), its Rust port
compiled to WebAssembly, which gives exactly the same results as Python
icepool.

# Installing

I use [volta](https://volta.sh/) to sync versions of node and yarn. Once
that is installed, a simple `yarn` command should get you running.

# How it's put together

```
src/army/      Army data (army.json) and how to read it: ids, traits, weapon rows, loadouts
src/rules/     N5 rules: ranges, MODs, saves and Immunity, default weapon;
               deriveInputs (matchup.js: a matchup -> calculator params, each
               number as the lines it adds up to: attack.js, evade.js, hit.js,
               lines.js) and the ledger that lays those lines out ("How the
               dice were built", ledger.js)
src/engine/    the dice: params.js (the calculator params every mode builds),
               calculate.js (calculator params -> engine input -> result rows),
               the WASM engine (wasm/, built from engine-rs/) and the worker that
               runs it; engine.golden.json, the reference results it must match
               (from the Python engine it replaced)
engine-rs/     the engine's Rust source (on icepool-rs) and its tests (`cargo
               test`); `yarn build:engine` builds it into src/engine/wasm/
               (engine-rs/README.md)
src/state/     the state document: schema, pure reducer, store, URL / history /
               storage sync, and the views: matchupView (what the Matchup
               screen shows), pickerView (what the picker shows of a unit)
src/results/   the engine's result as the card shows it: summary.js (wounds per
               order, the bars, the wound shades), headline.js (the big number);
               pure, read by the UI and by the Worker's share card
src/matchup/   share-link params for a matchup (matchupParams.js)
src/share/     the share card a matchup link unfurls into (card.js): worked out by
               the Worker from the app's address (worker/setupCard.js, the same
               view, engine and headline as the app) and drawn by worker/card.js;
               a zone rule (scripts/cloudflare/) sends only link-preview bots there
src/search/    trooper search: build-time index (index.json) and the typo-tolerant
               matcher; `yarn search-eval` scores it (docs/plans/search.md)
src/i18n/      the app's copy per language (en.js, es.js) and t(); the rules
               word their notes and ledger lines as message descriptors
               (message.js) that the view renders with it (docs/i18n.md)
src/data/      loads the army data chunk (useLazy: once per language, retried
               after a failure); src/lib/ small shared helpers (clamp,
               the other side) that more than one layer needs
src/ui/        the app's screens: shell, Matchup, Classic, trooper picker,
               results card and sheet (design: docs/design-canvas/mobile-ux-redesign);
               styles in src/ui/styles, design tokens in tokens.css
```

Dependencies point one way: `ui -> state -> rules -> army`, and everything that
builds calculator params uses `engine/params.js`. Nothing outside `src/ui/`
imports from it (`src/layering.test.mjs` checks). Game rules live in
`src/rules/` and `src/engine/calculate.js`; the engine only rolls dice: it gets
final success values, bursts, save values and Saving Rolls per hit (see the top
of engine-rs/src/engine.rs) and returns the chance of each (winner, wounds).

`yarn test` runs the JS tests (`node --test`) and the engine tests (`cargo test`
in engine-rs/, which needs [rustup](https://rustup.rs)). CI runs both on every PR.

# Updating the Army data

`src/army/army.json` is generated; never edit it by hand. When Corvus Belli
publishes a new Army release:

```
yarn fetch-army
```

The script downloads every army, fixes the data's known quirks (misspelt
names, joined ammo, the Saving Roll columns, "BS=12" loadout skills; see
`src/army/normalize.js`) and checks that every value the rules read is one they
understand (`scripts/army-validate.mjs`). Anything new stops the script with a
list to look at: teach the rules about it, or mark it as known. Raw downloads
are kept in `.cache/army`, so `yarn fetch-army --offline` rebuilds after a
code change without hitting the API.

It also downloads the Spanish files and writes `src/army/names.es.json`: the
same ids with Spanish names (`scripts/army-names.mjs`). The rules only ever
read the English data; names are display. The app ships the army as a
language-neutral core plus the names of the player's language
(`src/army/localize.js`; the English names are split out of army.json at
build time), and one search index per language (`src/search/index*.json`).
The language follows the browser unless picked in Settings, and so does the
rest of the copy (`src/i18n`, docs/i18n.md).

# Contributing

Pull requests and contributions are welcome, but I do have a vision for this
project and I suggest you write in first.


# Contact

My OTM is khepri and I can be found in the IGL Discord or the Infinity forums.
You can also write to me at `<my github account>@gmail.com`.
