import http from "node:http";
import { Worker } from "node:worker_threads";
import { monitorEventLoopDelay } from "node:perf_hooks";

const PORT = Number(process.env.PORT ?? 3000);
const MODE = process.env.BLOCKING_MODE ?? "main";
const BLOCK_DURATION_MS = 20_000;
const FIRST_BLOCK_DELAY_MS = 10_000;
const START_TO_START_MS = 40_000;

const histogram = monitorEventLoopDelay({ resolution: 20 });
histogram.enable();

setInterval(() => {
  console.log(`event_loop_delay_max_ms=${(histogram.max / 1e6).toFixed(2)}`);
  histogram.reset();
}, 1_000).unref();

const server = http.createServer((req, res) => {
  if (req.method === "GET" && req.url === "/api") {
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify({ message: "API is responsive", mode: MODE }));
    return;
  }
  res.writeHead(404, { "content-type": "application/json" });
  res.end(JSON.stringify({ message: "Not found" }));
});

server.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
  console.log(`Blocking mode: ${MODE}`);
  setTimeout(runScheduledBlock, FIRST_BLOCK_DELAY_MS);
});

function runScheduledBlock() {
  console.log(`block:start ${new Date().toISOString()}`);
  if (MODE === "worker") {
    const worker = new Worker(new URL("./worker.mjs", import.meta.url), {
      workerData: { durationMs: BLOCK_DURATION_MS }
    });
    worker.once("message", () => {
      console.log(`block:end ${new Date().toISOString()}`);
      setTimeout(runScheduledBlock, START_TO_START_MS - BLOCK_DURATION_MS);
    });
    worker.once("error", error => console.error("Worker error:", error));
    worker.once("exit", code => {
      if (code !== 0) console.error(`Worker stopped with exit code ${code}`);
    });
    return;
  }

  const endAt = performance.now() + BLOCK_DURATION_MS;
  while (performance.now() < endAt) {
    // Intentional synchronous CPU work for the Event Loop experiment.
  }
  console.log(`block:end ${new Date().toISOString()}`);
  setTimeout(runScheduledBlock, START_TO_START_MS - BLOCK_DURATION_MS);
}
