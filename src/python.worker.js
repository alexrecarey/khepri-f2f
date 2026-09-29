// Runs the icepool dice engine (src/python/f2f.py) in Pyodide, off the main thread.
//
// Messages in:
//   {command: 'init', source}                   source = text of f2f.py
//   {command: 'calculate', data, requestId?, quiet?}   data = calculator params (src/calculator/params.js)
// Messages out:
//   {command: 'status', value: 'loading' | 'ready' | 'notready' | 'error', description}
//   {command: 'result', value, requestId, elapsed, totalRolls}
//   {command: 'error', value, requestId}       the calculation raised
// requestId (optional) is echoed back so callers can match replies to requests.
// Calculations sent while the engine is still loading wait for it; 'notready'
// only answers requests sent before 'init'.
importScripts("https://cdn.jsdelivr.net/pyodide/v0.26.3/full/pyodide.js");

const ICEPOOL = 'icepool==1.0.0';

let calculateFn;
let starting = null;  // init() promise, once 'init' arrives

async function init(source) {
  self.postMessage({command: 'status', value: 'loading', description: 'Initializing icepool worker'})
  const pyodide = await self.loadPyodide({
    indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.26.3/full/'
  })
  await pyodide.loadPackage(['micropip'])
  await pyodide.pyimport('micropip').install(ICEPOOL)
  const namespace = pyodide.globals.get('dict')()
  pyodide.runPython(source, {globals: namespace})
  calculateFn = namespace.get('calculate')
  self.pyodide = pyodide
  self.postMessage({command: 'status', value: 'ready', description: 'Icepool worker ready'})
}

function calculate(params) {
  const pyParams = self.pyodide.toPy(new Map(Object.entries(params)))
  const pyResult = calculateFn(pyParams)
  try {
    return pyResult.toJs({dict_converter: Object.fromEntries})
  } finally {
    pyParams.destroy()
    pyResult.destroy()
  }
}

self.onmessage = async (msg) => {
  if (msg.data.command === 'calculate') {
    const requestId = msg.data.requestId;
    if (starting) await starting.catch(() => {});
    if (calculateFn === undefined) {
      self.postMessage({command: 'status', value: 'notready', description: 'Pyodide not ready yet', requestId})
      return
    }
    const startTime = Date.now();
    let results;
    try {
      results = calculate(msg.data.data)
    } catch (e) {
      console.error('Face to Face calculation failed', msg.data.data, e)
      self.postMessage({command: 'error', requestId, value: String(e.message ?? e)})
      return
    }
    results['parameters'] = msg.data.data;
    results['id'] = Date.now();
    const elapsed = Date.now() - startTime;
    if (!msg.data.quiet) {
      console.log('Returning results from Face 2 Face calculations:')
      console.log(results)
    }
    self.postMessage({command: 'result', requestId, value: results, elapsed, totalRolls: results['total_rolls']})
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
