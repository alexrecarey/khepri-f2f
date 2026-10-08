import {useCallback, useEffect, useRef, useState} from 'react';
import {clone} from 'ramda';
import {createF2fClient} from './client.js';
import engineSource from './f2f.py?raw';
import {paramsKey} from './params.js';

// The dice engine, running in a Web Worker. Recalculates `params` whenever
// they change; the worker holds calculations until the engine has loaded.
// `calculate(params)` runs an extra calculation (weapon previews) and
// resolves with its result without touching `result`.
export default function useEngine(params) {
  const [result, setResult] = useState(null);
  const [status, setStatus] = useState('Loading icepool engine');
  // A calculation is on its way: the old numbers stay up, shimmering.
  const [pending, setPending] = useState(true);
  const workerRef = useRef(null);
  const clientRef = useRef(null);

  useEffect(() => {
    const worker = new Worker(new URL('./worker.js', import.meta.url), {type: 'module'});
    const client = createF2fClient(worker);
    worker.onmessage = (msg) => {
      // Preview replies carry a requestId and are resolved by the client.
      if (client.handleMessage(msg)) return;
      const {command, value} = msg.data;
      if (command === 'result') {
        setResult(clone(value));
        setPending(false);
        setStatus(`Done! Took ${msg.data.elapsed}ms to calculate all ${msg.data.totalRolls.toLocaleString()} possible rolls.`);
      } else if (command === 'status' && value === 'error') {
        setPending(false);
        setStatus(`Could not start the dice engine: ${msg.data.description}`);
      } else if (command === 'error') {
        setPending(false);
        setStatus(`Calculation failed: ${value}`);
      }
    };
    worker.onerror = (error) => {
      setStatus(`Worker error: ${error.message}`);
      client.rejectAll(error);
      throw error;
    };
    worker.postMessage({command: 'init', source: engineSource});
    workerRef.current = worker;
    clientRef.current = client;
    return () => {
      client.rejectAll(new Error('dice engine stopped'));
      worker.terminate();
    };
  }, []);

  const key = paramsKey(params);
  useEffect(() => {
    setPending(true);
    workerRef.current?.postMessage({command: 'calculate', data: params});
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps

  const calculate = useCallback((p) => {
    if (!clientRef.current) return Promise.reject(new Error('worker not ready'));
    return clientRef.current.calculate(p, {quiet: true});
  }, []);

  return {result, setResult, status, pending, calculate};
}
