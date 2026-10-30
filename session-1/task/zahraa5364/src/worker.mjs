import { parentPort, workerData } from "node:worker_threads";
import { performance } from "node:perf_hooks";

const start = performance.now();
let iterations = 0;

while (performance.now() - start < workerData) {
  iterations++;
}

parentPort.postMessage({
  iterations,
  elapsedMs: Math.round(performance.now() - start),
});
