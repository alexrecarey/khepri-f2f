# The dice engine, compiled

khepri's Face to Face engine (a Rust port of `../f2f.py`) on icepool-rs, the Rust port of icepool, built to
WebAssembly for the browser. Copied in by hand from a build of icepool-rs; nothing here is edited.

- Source: https://github.com/alexrecarey/icepool-rs at `04b46a8`, crate `icepool-khepri` through `icepool-wasm`
- Built with `crates/icepool-wasm/build.sh` (wasm-pack, `--features khepri`, web target): this folder is its `web` output
- Export used: `calculate(engineInput)`, the drop-in for `f2f.calculate` (`../worker.js`)

To update: rebuild in icepool-rs, copy the `web` output over this folder (drop wasm-pack's `.gitignore`), and run
`yarn test`: `../engine.test.mjs` checks the engine against `../engine.golden.json`, which `../golden.py` writes from
f2f.py.
