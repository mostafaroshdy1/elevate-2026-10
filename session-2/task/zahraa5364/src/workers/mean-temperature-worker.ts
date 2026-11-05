import { parentPort } from "node:worker_threads";
if (!parentPort) throw new Error("Must run in a worker thread");
parentPort.on("message", (message: { data: Float64Array<SharedArrayBuffer>; requestId: string }) => {
  const { data, requestId } = message;
  let sum = 0, count = 0;
  for (let i = 3; i < data.length; i += 4) { sum += data[i]!; count++; }
  parentPort!.postMessage({ requestId, meanTemperature: count ? sum / count : 0 });
});
