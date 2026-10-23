# The dice engine, in Rust

khepri's Face to Face engine on [icepool-rs](https://github.com/alexrecarey/icepool-rs) (the Rust port of icepool; only
its `icepool-core` crate). Built to WebAssembly with one export, `calculate(engineInput)`, that the worker
(`src/engine/worker.js`) and the link preview (`worker/preview.js`) call. It is a port of the Python engine it replaced
(`f2f.py`, removed; it is in git history), whose results are kept as the reference: `../src/engine/engine.golden.json`
and `tests/khepri_calculate.json`.

- `src/engine.rs`: the engine. `src/wasm.rs`: the `calculate` export.
- `tests/`: `cargo test` (or `yarn test:engine`): `engine.rs` checks the dice rules one at a time, against the Ghostlords
  calculator and the engine's earlier numbers; `khepri_calculate.rs` checks `calculate_json` against 40 of the Python
  engine's results, bit for bit.

The built WASM is committed in `../src/engine/wasm/`, so the app and deploys need no Rust (CI's `engine` job runs
`cargo test`). Rebuild only when this folder changes:

```
yarn build:engine   # scripts/build-engine.sh: needs rustup and wasm-pack (brew install wasm-pack)
yarn test           # cargo test, and engine.test.mjs runs the new WASM over engine.golden.json
```

and commit `src/engine/wasm/` with the change. `wasm/BUILD.json` records what it was built from: a hash of this folder's
sources (`scripts/engine-stamp.mjs`), the icepool-rs commit and the tool versions. `engineBuild.test.mjs` fails when the
hash no longer matches, i.e. the Rust changed and the WASM wasn't rebuilt.

Versions are pinned so a rebuild only changes when the source does: icepool-core by `rev` in `Cargo.toml` (bump it to take
library fixes), the Rust compiler in `rust-toolchain.toml`, every crate in `Cargo.lock`.
