import { parentPort } from 'node:worker_threads';
import { performance } from 'node:perf_hooks';

const start = performance.now();
let iterations = 0;

while (performance.now() - start < 20_000) {
  iterations++;
}

parentPort.postMessage({
  iterations,
  elapsedMs: performance.now() - start
});
