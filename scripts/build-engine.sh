#!/usr/bin/env bash
# Builds the dice engine (engine-rs/, Rust on icepool-rs) to WebAssembly in src/engine/wasm/, the files the worker,
# the link preview and the tests import. The output is committed: run this after changing engine-rs/ (or bumping
# its icepool-rs rev), then `yarn test` and commit src/engine/wasm/ with the change.
#   yarn build:engine
# Needs rustup (engine-rs/rust-toolchain.toml installs the pinned Rust) and wasm-pack (brew install wasm-pack).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CRATE="$ROOT/engine-rs"
OUT="$ROOT/src/engine/wasm"

# rustup's cargo, not a plain one, so rust-toolchain.toml applies (Homebrew's rustup is keg-only).
for bin in "$HOME/.cargo/bin" "$(brew --prefix rustup 2>/dev/null)/bin"; do
  if [ -x "$bin/rustup" ]; then PATH="$bin:$PATH"; break; fi
done
command -v rustup >/dev/null || { echo "build-engine: needs rustup (https://rustup.rs or brew install rustup)" >&2; exit 1; }
command -v wasm-pack >/dev/null || { echo "build-engine: needs wasm-pack (brew install wasm-pack)" >&2; exit 1; }

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
(cd "$CRATE" && wasm-pack --quiet build --release --target web --no-pack --out-dir "$TMP" --out-name khepri_engine)

rm -rf "$OUT"
mkdir -p "$OUT"
cp "$TMP"/khepri_engine.js "$TMP"/khepri_engine.d.ts "$TMP"/khepri_engine_bg.wasm "$TMP"/khepri_engine_bg.wasm.d.ts "$OUT"/
icepool_rs="$(sed -n 's/^icepool-core = .*rev = "\([0-9a-f]*\)".*/\1/p' "$CRATE/Cargo.toml")"
node "$ROOT/scripts/engine-stamp.mjs" "$OUT/BUILD.json" \
  "icepoolRs=$icepool_rs" \
  "rustc=$(cd "$CRATE" && rustc --version)" \
  "wasmPack=$(wasm-pack --version)"
echo "src/engine/wasm: $(wc -c < "$OUT/khepri_engine_bg.wasm" | tr -d ' ') bytes wasm, $(gzip -9c "$OUT/khepri_engine_bg.wasm" | wc -c | tr -d ' ') gzipped"
