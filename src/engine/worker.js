// Runs the icepool dice engine (src/engine/f2f.py) in Pyodide, off the main
// thread. A module worker: calculate.js turns the calculator params into
// engine input and the engine's output into result rows.
//
// Messages in:
//   {command: 'init', source}                   source = text of f2f.py
//   {command: 'calculate', data, requestId}     data = calculator params (src/engine/params.js)
// Messages out:
//   {command: 'status', value: 'loading' | 'ready' | 'error', description}
//   {command: 'result', value, requestId, elapsed, totalRolls}
//   {command: 'error', value, requestId}       the calculation raised
// requestId is echoed back so the app can drop replies to older requests.
// Only the newest calculation runs: one that arrives while another is running
// (or while the engine loads) replaces any still waiting, so tapping a stepper
// five times runs the first and the last, not all five.
import {calculate} from './calculate.js';
import {latestOnly} from './latestOnly.js';

const PYODIDE = 'https://cdn.jsdelivr.net/pyodide/v0.26.3/full/';
const ICEPOOL = 'icepool==2.2.2';

let engineFn;
let starting = null;  // init() promise, once 'init' arrives

async function init(source) {
  self.postMessage({command: 'status', value: 'loading', description: 'Initializing icepool worker'})
  const {loadPyodide} = await import(/* @vite-ignore */ `${PYODIDE}pyodide.mjs`)
  const pyodide = await loadPyodide({indexURL: PYODIDE})
  await pyodide.loadPackage(['micropip'])
  await pyodide.pyimport('micropip').install(ICEPOOL)
  const namespace = pyodide.globals.get('dict')()
  pyodide.runPython(source, {globals: namespace})
  engineFn = namespace.get('calculate')
  self.pyodide = pyodide
  self.postMessage({command: 'status', value: 'ready', description: 'Icepool worker ready'})
}

// One engine run: engine input (calculate.js engineInput) -> engine output.
function runEngine(input) {
  const pyInput = self.pyodide.toPy(new Map(Object.entries(input)))
  const pyResult = engineFn(pyInput)
  try {
    return pyResult.toJs({dict_converter: Object.fromEntries})
  } finally {
    pyInput.destroy()
    pyResult.destroy()
  }
}

function run({data, requestId}) {
  if (engineFn === undefined) {
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
  results['id'] = Date.now();
  const elapsed = Date.now() - startTime;
  self.postMessage({command: 'result', requestId, value: results, elapsed, totalRolls: results['total_rolls']})
}

// Only the newest calculation waits; see latestOnly.js.
const enqueue = latestOnly(run, {before: () => starting?.catch(() => {})});

self.onmessage = async (msg) => {
  if (msg.data.command === 'calculate') {
    enqueue(msg.data);
  } else if (msg.data.command === 'init') {
    try {
      starting = init(msg.data.source)
      await starting
    } catch (e) {
      console.error('Could not start the icepool engine', e)
      self.postMessage({command: 'status', value: 'error', description: String(e.message ?? e)})
    }
  }
}
