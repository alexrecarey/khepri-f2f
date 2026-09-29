// Promise wrapper around the icepool worker for side calculations (weapon
// previews). Requests carry a requestId that the worker echoes back; messages
// without one (the main calculation) are left for the caller to handle.
export function createF2fClient(worker) {
  let nextId = 1;
  const pending = new Map();

  return {
    calculate(params, {quiet = false} = {}) {
      return new Promise((resolve, reject) => {
        const requestId = nextId++;
        pending.set(requestId, {resolve, reject});
        worker.postMessage({command: 'calculate', data: params, requestId, quiet});
      });
    },

    // Returns true when the message belonged to one of our requests.
    handleMessage(msg) {
      const {command, requestId, value} = msg.data ?? {};
      if (!requestId || !pending.has(requestId)) return false;
      const {resolve, reject} = pending.get(requestId);
      pending.delete(requestId);
      if (command === 'result') resolve(value);
      else reject(new Error(`worker replied ${command}:${value}`));
      return true;
    },

    rejectAll(error) {
      for (const {reject} of pending.values()) reject(error);
      pending.clear();
    },
  };
}
