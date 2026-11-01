// Worker thread: runs the 20-second CPU job away from the main thread.
//
// The main thread (server.mjs) creates this worker ONCE and sends it a message
// each time a scheduled job should run. While this loop spins, the main
// thread's event loop is free to answer HTTP requests.
import { parentPort } from "node:worker_threads";
import { busyLoop } from "./busy-loop.mjs";

parentPort.on("message", ({ durationMs }) => {
  const result = busyLoop(durationMs); // blocks THIS thread only
  parentPort.postMessage(result); // { iterations, elapsedMs }
});
