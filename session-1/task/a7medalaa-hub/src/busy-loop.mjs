// A synchronous, time-based busy loop (pure JavaScript CPU work).
//
// It keeps spinning until `durationMs` real milliseconds have passed, so the
// job lasts the same amount of time on every machine (unlike fib(45), whose
// duration depends on the CPU). A faster CPU simply counts more iterations.
//
// Used by BOTH src/server.mjs (before the fix, on the main thread) and
// src/worker.mjs (after the fix, on a worker thread), so the two versions do
// exactly the same work.
import { performance } from "node:perf_hooks";

export function busyLoop(durationMs) {
  const start = performance.now();
  let iterations = 0;

  while (performance.now() - start < durationMs) {
    iterations++;
  }

  return {
    iterations,
    elapsedMs: Math.round(performance.now() - start),
  };
}
