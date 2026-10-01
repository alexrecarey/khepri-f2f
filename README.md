# Infinity Face Off
### an Infinity the Game N4 expected wounds calculator

[Infinity Face Off](https://khepri.netlify.app) is small web app that allows
players of Infinity the Game to quickly calculate the expected outcome
of a face to face roll. It is intended to be used to evaluate profiles
and for new players to get of feel of the often unintuitive face 2 face
roll probabilities. 

It's a static, single page application written in Javascript using react. 
The site does not require any backend other than a webserver to serve the files.
The actual die probability rolls are done using the incredible 
[icepool](https://github.com/HighDiceRoller/icepool) library. 
To run python on the client side web browser, we use WASM and the Pyodide
library.

# Installing

I use [volta](https://volta.sh/) to sync versions of node and yarn. Once
that is installed, a simple `yarn` command should get you running.

# How it's put together

```
src/army/      Army data (army.json) and how to read it: ids, traits, weapon rows, loadouts
src/rules/     N5 rules: ranges, MODs, saves and Immunity, default weapon,
               and deriveInputs (a matchup -> calculator params)
src/engine/    the dice: params.js (the calculator params every mode builds),
               calculate.js (calculator params -> engine input -> result rows),
               f2f.py (icepool) and the Pyodide worker that runs it
src/matchup/   Matchup mode UI
src/inputs/, src/display/, src/components/   Basic mode inputs and the results
```

Dependencies point one way: `matchup -> rules -> army`, and everything that
builds calculator params uses `engine/params.js`. Game rules live in
`src/rules/` and `src/engine/calculate.js`; `f2f.py` only rolls dice: it gets
final success values, bursts, save values and Saving Rolls per hit (see the top
of the file) and returns the chance of each (winner, wounds).

`yarn test` runs the JS tests (`node --test`) and the engine tests (pytest via
[uv](https://docs.astral.sh/uv/)). CI runs both on every PR.

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

# Contributing

Pull requests and contributions are welcome, but I do have a vision for this
project and I suggest you write in first.


# Contact

My OTM is khepri and I can be found in the IGL Discord or the Infinity forums.
You can also write to me at `<my github account>@gmail.com`.
