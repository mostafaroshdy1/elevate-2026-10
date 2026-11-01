import { parentPort, workerData } from "node:worker_threads";

const endAt = performance.now() + workerData.durationMs;
while (performance.now() < endAt) {
  // Intentional CPU work isolated from the main Event Loop.
}
parentPort.postMessage({ completed: true });
