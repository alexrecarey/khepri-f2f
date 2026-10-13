// A loader that runs once and shares its promise, but forgets a failure so
// the next call tries again (a chunk that failed on a flaky connection, or
// after a deploy renamed it, would otherwise fail until reload).
export function lazyOnce(load) {
  let promise = null;
  return () => {
    promise ??= load().catch((error) => {
      promise = null;
      throw error;
    });
    return promise;
  };
}
