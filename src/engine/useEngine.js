import {useEffect, useMemo, useRef, useState} from 'react';
import {paramsKey} from './params.js';

// The dice engine, running in a Web Worker. Recalculates `params` whenever
// they change; null params (a matchup without both troopers) calculate
// nothing. The worker holds calculations until the engine has loaded.
//
// Each request carries an id and only the reply to the newest one counts:
// an older reply arriving late would show (and let you save) the odds of a
// setup that is no longer on screen.
//
// `status` is a message for the screen, as a src/i18n key and its params.
export default function useEngine(params) {
  const [result, setResult] = useState(null);
  const [status, setStatus] = useState({key: 'engine.loading'});
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
          setStatus({key: 'engine.startFailed', params: {error: msg.data.description}});
        }
        return;
      }
      if (requestId !== latest.current) return;
      setPending(false);
      if (command === 'result') {
        setResult(value);
        setStatus({key: 'engine.done', params: {ms: msg.data.elapsed, rolls: msg.data.totalRolls}});
      } else if (command === 'error') {
        setStatus({key: 'engine.failed', params: {error: value}});
      }
    };
    worker.onerror = (error) => {
      setPending(false);
      setStatus({key: 'engine.workerError', params: {error: error.message}});
    };
    worker.postMessage({command: 'init'});
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
