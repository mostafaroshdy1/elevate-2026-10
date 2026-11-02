import { parentPort } from "node:worker_threads";
import { performance } from "node:perf_hooks";


const start = performance.now();
let iterations = 0;

while (performance.now() - start < 20_000) {
    iterations++;
}

const elapsedMs = performance.now() - start;

parentPort?.postMessage({
    iterations,
    elapsedMs: elapsedMs.toFixed(2)
});