import { createServer } from "node:http";
import { Worker } from "node:worker_threads";
import { monitorEventLoopDelay, performance } from "node:perf_hooks";

const PORT = 3000;
const BLOCK_TIME = 20_000;
const EVERY = 40_000;
const FIRST_RUN = 10_000;
const mode = process.env.MODE || "before";

const delayMonitor = monitorEventLoopDelay({ resolution: 20 });
delayMonitor.enable();

let running = false;
let lastStart = null;
let lastEnd = null;
let lastResult = null;
let worker = null;
let nextTimer = null;
let stopping = false;

function now() {
  return new Date().toISOString();
}

setInterval(() => {
  console.log(
    `event-loop max delay: ${(delayMonitor.max / 1_000_000).toFixed(2)} ms`
  );
  delayMonitor.reset();
}, 1000);

function blockMainThread() {
  running = true;
  lastStart = now();
  console.log(`block:start ${lastStart}`);

  const start = performance.now();
  let iterations = 0;

  while (performance.now() - start < BLOCK_TIME) {
    iterations++;
  }

  const elapsedMs = Math.round(performance.now() - start);
  running = false;
  lastEnd = now();
  lastResult = { iterations, elapsedMs };
  console.log(`block:end ${lastEnd} iterations=${iterations} elapsedMs=${elapsedMs}`);
}

function startWorker() {
  if (stopping || running) return;

  running = true;
  lastStart = now();
  console.log(`job:start ${lastStart}`);

  worker = new Worker(new URL("./worker.mjs", import.meta.url), {
    workerData: BLOCK_TIME,
  });

  worker.on("message", (result) => {
    lastResult = result;
    lastEnd = now();
    running = false;
    console.log(`job:end ${lastEnd} iterations=${result.iterations} elapsedMs=${result.elapsedMs}`);
  });

  worker.on("error", (error) => {
    console.error("worker:error", error);
    lastEnd = now();
    running = false;
  });

  worker.on("exit", (code) => {
    if (code !== 0) {
      console.error(`worker exited with code ${code}`);
      running = false;
    }
    worker = null;
  });
}

function scheduleNext() {
  if (stopping) return;

  nextTimer = setTimeout(() => {
    if (mode === "before") {
      blockMainThread();
      
      scheduleNext();
    } else {
      startWorker();
      scheduleNext();
    }
  }, mode === "before" ? EVERY - BLOCK_TIME : EVERY);
}

const server = createServer((req, res) => {
  if (req.method !== "GET" || req.url !== "/api") {
    res.writeHead(404, { "content-type": "application/json" });
    res.end(JSON.stringify({ error: "Not found" }));
    return;
  }

  const status = mode === "before"
    ? { now: now(), block: { running, lastStart, lastEnd } }
    : { now: now(), job: { running, lastStart, lastEnd, lastResult } };

  res.writeHead(200, { "content-type": "application/json" });
  res.end(JSON.stringify(status));
});

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT} (MODE=${mode})`);

  nextTimer = setTimeout(() => {
    if (mode === "before") {
      blockMainThread();
      scheduleNext();
    } else {
      startWorker();
      scheduleNext();
    }
  }, FIRST_RUN);
});

function shutdown(signal) {
  if (stopping) return;
  stopping = true;
  console.log(`Received ${signal}; shutting down...`);
  clearTimeout(nextTimer);
  delayMonitor.disable();
  server.close();

  if (worker) {
    worker.terminate().finally(() => process.exit(0));
  } else {
    process.exit(0);
  }
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
