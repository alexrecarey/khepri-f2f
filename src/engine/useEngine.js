import {useEffect, useMemo, useRef, useState} from 'react';
import engineSource from './f2f.py?raw';
import {paramsKey} from './params.js';

// The dice engine, running in a Web Worker. Recalculates `params` whenever
// they change; null params (a matchup without both troopers) calculate
// nothing. The worker holds calculations until the engine has loaded.
//
// Each request carries an id and only the reply to the newest one counts:
// an older reply arriving late would show (and let you save) the odds of a
// setup that is no longer on screen.
export default function useEngine(params) {
  const [result, setResult] = useState(null);
  const [status, setStatus] = useState('Loading icepool engine');
  // A calculation is on its way: the old numbers stay up, shimmering.
  const [pending, setPending] = useState(params != null);
  const workerRef = useRef(null);
  const latest = useRef(0);

  useEffect(() => {
    const worker = new Worker(new URL('./worker.js', import.meta.url), {type: 'module'});
    worker.onmessage = (msg) => {
      const {command, value, requestId} = msg.data;
      if (command === 'status') {
        if (value === 'error') {
          setPending(false);
          setStatus(`Could not start the dice engine: ${msg.data.description}`);
        }
        return;
      }
      if (requestId !== latest.current) return;
      setPending(false);
      if (command === 'result') {
        setResult(value);
        setStatus(`Done! Took ${msg.data.elapsed}ms to calculate all ${msg.data.totalRolls.toLocaleString()} possible rolls.`);
      } else if (command === 'error') {
        setStatus(`Calculation failed: ${value}`);
      }
    };
    worker.onerror = (error) => {
      setPending(false);
      setStatus(`Worker error: ${error.message}`);
    };
    worker.postMessage({command: 'init', source: engineSource});
    workerRef.current = worker;
    return () => worker.terminate();
  }, []);

  const key = params == null ? null : paramsKey(params);
  useEffect(() => {
    if (key == null) {
      latest.current += 1;   // whatever is in flight no longer counts
      setPending(false);
      return;
    }
    latest.current += 1;
    setPending(true);
    workerRef.current?.postMessage({command: 'calculate', data: params, requestId: latest.current});
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps

  return useMemo(() => ({result, status, pending}), [result, status, pending]);
}
