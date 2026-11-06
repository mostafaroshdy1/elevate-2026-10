import { parentPort } from "node:worker_threads";

interface WorkerTask {
  id: string;
  sharedBuffer: SharedArrayBuffer;
  count: number;
}

if (!parentPort) {
  throw new Error("Worker must be started from a parent thread");
}

parentPort.on("message", (task: WorkerTask) => {
  try {
    const { id, sharedBuffer, count } = task;

    const temperatures = new Float64Array(
      sharedBuffer,
      0,
      count,
    );

    let sum = 0;

    for (let i = 0; i < temperatures.length; i++) {
      sum += temperatures[i]!;
    }

    const mean = sum / count;

    parentPort!.postMessage({
      id,
      mean,
    });
  } catch (error) {
    parentPort!.postMessage({
      id: task.id,
      error:
        error instanceof Error
          ? error.message
          : "Unknown worker error",
    });
  }
});