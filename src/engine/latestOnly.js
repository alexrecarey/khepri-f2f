// A one-slot queue: run(job) for each job, one at a time, but a job that
// arrives while another runs replaces any job still waiting. So tapping a
// stepper five times calculates the first and the last setup, not all five.
//
// `before` (optional) is awaited before the first job runs (the engine
// loading). `yieldNext` lets queued messages in between jobs; the worker uses
// setTimeout, tests pass their own.
export function latestOnly(run, {before = () => null, yieldNext = () => new Promise((r) => setTimeout(r, 0))} = {}) {
  let waiting = null;
  let draining = false;

  async function drain() {
    if (draining) return;
    draining = true;
    try {
      await before();
      while (waiting) {
        const next = waiting;
        waiting = null;
        await run(next);
        await yieldNext();
      }
    } finally {
      draining = false;
    }
  }

  return (job) => {
    waiting = job;
    return drain();
  };
}
