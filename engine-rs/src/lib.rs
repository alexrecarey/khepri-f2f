//! khepri's dice engine for the browser: [`engine`] is f2f.py on icepool-rs (the icepool-core crate), [`wasm`]
//! its one export to JavaScript. scripts/build-engine.sh builds it into src/engine/wasm/.

pub mod engine;
pub mod wasm;
