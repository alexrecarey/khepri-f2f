# The dice engine, in Rust

khepri's Face to Face engine, a port of `../src/engine/f2f.py`, on [icepool-rs](https://github.com/alexrecarey/icepool-rs)
(the Rust port of icepool; only its `icepool-core` crate). Built to WebAssembly with one export, `calculate(engineInput)`,
the drop-in for f2f.py's `calculate` that the worker (`src/engine/worker.js`) and the link preview (`worker/preview.js`) call.

- `src/engine.rs`: the engine. `src/wasm.rs`: the `calculate` export.
- `tests/`: `cargo test` checks `calculate_json` natively against 40 f2f.py results.

The built WASM is committed in `../src/engine/wasm/`, so the app, CI and deploys need no Rust. Rebuild only when this
folder changes:

```
yarn build:engine   # scripts/build-engine.sh: needs rustup and wasm-pack (brew install wasm-pack)
yarn test           # engine.test.mjs runs the new WASM over engine.golden.json (from f2f.py)
```

and commit `src/engine/wasm/` with the change. `wasm/BUILD.json` records what it was built from: a hash of this folder's
sources (`scripts/engine-stamp.mjs`), the icepool-rs commit and the tool versions. `engineBuild.test.mjs` fails when the
hash no longer matches, i.e. the Rust changed and the WASM wasn't rebuilt.

Versions are pinned so a rebuild only changes when the source does: icepool-core by `rev` in `Cargo.toml` (bump it to take
library fixes), the Rust compiler in `rust-toolchain.toml`, every crate in `Cargo.lock`.
