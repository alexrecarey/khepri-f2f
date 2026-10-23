// Runs the dice engine off the main thread: khepri's Face to Face engine
// compiled to WebAssembly (src/engine/wasm/, built from engine-rs/). A module
// worker: calculate.js turns the calculator params into engine input and the
// engine's output into result rows.
//
// Messages in:
//   {command: 'init'}
//   {command: 'calculate', data, requestId}     data = calculator params (src/engine/params.js)
// Messages out:
//   {command: 'status', value: 'loading' | 'ready' | 'error', description}
//   {command: 'result', value, requestId, elapsed, totalRolls}
//   {command: 'error', value, requestId}       the calculation raised
// requestId is echoed back so the app can drop replies to older requests.
// Only the newest calculation runs: one that arrives while another is running
// (or while the engine loads) replaces any still waiting, so tapping a stepper
// five times runs the first and the last, not all five.
import init, {calculate as runEngine} from './wasm/khepri_engine.js';
import wasmUrl from './wasm/khepri_engine_bg.wasm?url';
import {calculate} from './calculate.js';
import {latestOnly} from './latestOnly.js';

// Any valid engine input: run once at start-up so the first real calculation
// doesn't pay for compiling the hot code.
const WARM_UP = {
  successValueA: 13, burstA: 2, bonusBurstA: 0, templateA: false, saveValueA: 10, savesA: 1, critSaveA: true,
  woundsPerFailureA: 1, contA: false, secondarySaveA: null,
  successValueB: 12, burstB: 1, bonusBurstB: 0, templateB: false, saveValueB: 10, savesB: 1, critSaveB: true,
  woundsPerFailureB: 1, contB: false, secondarySaveB: null,
  fixedFaceToFace: false,
};

let ready = false;
let starting = null;  // init() promise, once 'init' arrives

async function start() {
  self.postMessage({command: 'status', value: 'loading', description: 'Loading the dice engine'})
  await init({module_or_path: wasmUrl})
  runEngine(WARM_UP)
  ready = true
  self.postMessage({command: 'status', value: 'ready', description: 'Dice engine ready'})
}

function run({data, requestId}) {
  if (!ready) {
    self.postMessage({command: 'error', requestId, value: 'dice engine not loaded'})
    return
  }
  const startTime = Date.now();
  let results;
  try {
    results = calculate(data, runEngine)
  } catch (e) {
    console.error('Face to Face calculation failed', data, e)
    self.postMessage({command: 'error', requestId, value: String(e.message ?? e)})
    return
  }
  results['parameters'] = data;
  const elapsed = Date.now() - startTime;
  self.postMessage({command: 'result', requestId, value: results, elapsed, totalRolls: results.totalRolls})
}

// Only the newest calculation waits; see latestOnly.js.
const enqueue = latestOnly(run, {before: () => starting?.catch(() => {})});

self.onmessage = async (msg) => {
  if (msg.data.command === 'calculate') {
    enqueue(msg.data);
  } else if (msg.data.command === 'init') {
    try {
      starting = start()
      await starting
    } catch (e) {
      console.error('Could not start the dice engine', e)
      self.postMessage({command: 'status', value: 'error', description: String(e.message ?? e)})
    }
  }
}
