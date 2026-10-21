//! `calculate_json` (the WASM build's entry point) against f2f.py's `calculate` itself, natively (`cargo test`).
//!
//! khepri_calculate.json holds 40 engine inputs from icepool-rs's khepri sweep generator with what
//! `f2f.calculate` returned for each. ../../src/engine/engine.test.mjs runs the built WASM over the larger
//! engine.golden.json. The khepri sweep checks the exact die; this checks the
//! last step too: `rolls` exactly (it passes 2**53) and every `chance` to the bit.
use khepri_engine::engine::calculate_json;
use serde_json::Value;

#[test]
fn calculate_matches_f2f() {
    let cases: Vec<Value> =
        serde_json::from_str(include_str!("khepri_calculate.json")).expect("khepri_calculate.json");
    assert_eq!(cases.len(), 40);
    for case in &cases {
        let got = calculate_json(&case["input"]).expect("calculate");
        let expected = &case["expected"];
        assert_eq!(
            got["rolls"].to_string(),
            expected["rolls"].to_string(),
            "rolls for {}",
            case["input"]
        );
        let (got, expected) = (
            got["outcomes"].as_array().unwrap(),
            expected["outcomes"].as_array().unwrap(),
        );
        assert_eq!(got.len(), expected.len(), "outcomes for {}", case["input"]);
        for (g, e) in got.iter().zip(expected) {
            assert_eq!(g["player"], e["player"]);
            assert_eq!(g["wounds"], e["wounds"]);
            let (g, e) = (g["chance"].as_f64().unwrap(), e["chance"].as_f64().unwrap());
            assert_eq!(g.to_bits(), e.to_bits(), "chance for {}", case["input"]);
        }
    }
}
