//! `calculate(engineInput)`: the WASM build's only export, which the worker (src/engine/worker.js) and the link
//! preview (worker/preview.js) call. Same input object and output shape as the Python engine it replaced.

use serde_json::Value as Json;
use wasm_bindgen::prelude::*;

// The JS globals `calculate` needs, declared directly so wasm-bindgen is the only binding dependency.
#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = JSON, js_name = parse, catch)]
    fn json_parse(s: &str) -> Result<JsValue, JsValue>;
    /// `undefined` (not a string) for values JSON cannot hold, such as `undefined` itself or a function.
    #[wasm_bindgen(js_namespace = JSON, js_name = stringify, catch)]
    fn json_stringify(v: &JsValue) -> Result<JsValue, JsValue>;
    #[wasm_bindgen(js_name = BigInt)]
    fn big_int(digits: &str) -> JsValue;
    #[wasm_bindgen(js_namespace = Reflect, js_name = set)]
    fn reflect_set(target: &JsValue, key: &JsValue, value: &JsValue) -> bool;
}

/// The engine input object in, `{rolls, outcomes: [{player, wounds, chance}, ...]}` out. Throws an `Error`
/// where the Python engine raised.
///
/// `rolls` is a Number when it is a safe integer and a BigInt beyond 2**53, as Pyodide's `to_js` converted the
/// Python engine's int. `chance` is `float(Fraction(q, denominator))`, bit for bit.
#[wasm_bindgen]
pub fn calculate(engine_input: &JsValue) -> Result<JsValue, JsError> {
    let text = json_stringify(engine_input)
        .ok()
        .and_then(|s| s.as_string())
        .ok_or_else(|| JsError::new("TypeError: the engine input is not a JSON object"))?;
    let input: Json = serde_json::from_str(&text).map_err(|e| JsError::new(&e.to_string()))?;
    let out =
        crate::engine::calculate_json(&input).map_err(|e| JsError::new(&e.to_string()))?;
    let js =
        json_parse(&out.to_string()).map_err(|_| JsError::new("calculate: result is not JSON"))?;
    let rolls = &out["rolls"];
    if !is_safe_integer(rolls) {
        // JSON.parse rounded it to the nearest double: replace it with the exact value.
        reflect_set(
            &js,
            &JsValue::from_str("rolls"),
            &big_int(&rolls.to_string()),
        );
    }
    Ok(js)
}

/// Does this JSON integer fit a JS Number exactly (`Number.isSafeInteger`, |n| < 2**53)?
fn is_safe_integer(n: &Json) -> bool {
    const MAX_SAFE: u64 = (1 << 53) - 1;
    n.as_u64().is_some_and(|n| n <= MAX_SAFE)
        || n.as_i64().is_some_and(|n| n.unsigned_abs() <= MAX_SAFE)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn safe_integer_bound() {
        let n = |s: &str| serde_json::from_str::<Json>(s).unwrap();
        assert!(is_safe_integer(&n("9007199254740991")));
        assert!(!is_safe_integer(&n("9007199254740992")));
        assert!(!is_safe_integer(&n("1267650600228229401496703205376")));
        assert!(is_safe_integer(&n("-9007199254740991")));
    }
}
