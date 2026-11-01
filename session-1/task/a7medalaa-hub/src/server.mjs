// Session 1 - Event Loop Lab: the server for Task 1 and Task 2.
//
// One endpoint only: GET /api
//
// Two modes (same schedule, same 20-second CPU job):
//   --mode=blocking  BEFORE the fix: the job runs on the main thread and
//                    freezes the whole server.
//   --mode=worker    AFTER the fix: the job runs in a worker thread and the
//                    server stays responsive. (default)
//
// Task 2: in both modes the server prints the maximum event-loop delay every
// second using monitorEventLoopDelay.
import http from "node:http";
import { parseArgs } from "node:util";
import { Worker } from "node:worker_threads";
import { monitorEventLoopDelay } from "node:perf_hooks";
import { busyLoop } from "./busy-loop.mjs";

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------
// The defaults are the official timings from the assignment. The environment
// variables exist only so you can use shorter values while developing.
const PORT = Number(process.env.PORT ?? 3000);
const FIRST_DELAY_MS = Number(process.env.FIRST_DELAY_MS ?? 10_000); // first job: 10 s after startup
const JOB_DURATION_MS = Number(process.env.BLOCK_MS ?? 20_000); // each job lasts 20 s
const INTERVAL_MS = Number(process.env.INTERVAL_MS ?? 40_000); // start-to-start: every 40 s

const { values } = parseArgs({
  options: { mode: { type: "string", default: process.env.MODE ?? "worker" } },
});
const MODE = values.mode;
if (MODE !== "blocking" && MODE !== "worker") {
  console.error(`Unknown mode "${MODE}". Use --mode=blocking or --mode=worker.`);
  process.exit(1);
}

function log(message) {
  console.log(`${new Date().toISOString()} ${message}`);
}

// ---------------------------------------------------------------------------
// Job state (what GET /api reports)
// ---------------------------------------------------------------------------
const state = {
  running: false,
  lastStart: null, // ISO string
  lastEnd: null, // ISO string (only set when a job completes)
  lastResult: null, // { iterations, elapsedMs } of the last completed job
  lastError: null, // message of the last failed job (worker mode)
};

let shuttingDown = false;
let scheduleTimer = null;

// ---------------------------------------------------------------------------
// Scheduling: first job after 10 s, then one job every 40 s (start-to-start).
// ---------------------------------------------------------------------------
// We use a chain of setTimeout calls instead of setInterval. After each job
// starts we compute how long to wait so the NEXT start is exactly INTERVAL_MS
// after THIS start. In blocking mode the job itself takes 20 s, so the wait is
// the remaining ~20 s - and two blocks can never overlap.
function scheduleJobs(runJob) {
  const scheduleNext = (delayMs) => {
    scheduleTimer = setTimeout(() => {
      const startedAt = Date.now();
      runJob(); // blocking mode: returns after 20 s; worker mode: returns at once
      const nextStartAt = startedAt + INTERVAL_MS;
      scheduleNext(Math.max(0, nextStartAt - Date.now()));
    }, delayMs);
  };
  scheduleNext(FIRST_DELAY_MS);
}

// ---------------------------------------------------------------------------
// BEFORE the fix: run the CPU job on the main thread
// ---------------------------------------------------------------------------
function runBlockingJob() {
  state.running = true;
  state.lastStart = new Date().toISOString();
  log("block:start");

  // Nothing else can run on the main thread until this returns: no HTTP
  // handler, no timer, no promise continuation.
  const result = busyLoop(JOB_DURATION_MS);

  state.running = false;
  state.lastEnd = new Date().toISOString();
  state.lastResult = result;
  log(`block:end iterations=${result.iterations} elapsedMs=${result.elapsedMs}`);
}

// ---------------------------------------------------------------------------
// AFTER the fix: run the CPU job in ONE long-lived worker thread
// ---------------------------------------------------------------------------
let worker = null;

function createWorker() {
  const w = new Worker(new URL("./worker.mjs", import.meta.url));

  w.on("message", (result) => {
    state.running = false;
    state.lastEnd = new Date().toISOString();
    state.lastResult = result;
    state.lastError = null;
    log(`job:end iterations=${result.iterations} elapsedMs=${result.elapsedMs}`);
  });

  // 'error' fires when the worker throws an uncaught exception.
  w.on("error", (err) => {
    log(`worker:error ${err.message}`);
    failCurrentJob(`worker error: ${err.message}`);
  });

  // 'exit' always fires when a worker stops (after an error, or terminate()).
  w.on("exit", (code) => {
    if (!shuttingDown) log(`worker:exit code=${code}`);
    if (worker === w) worker = null; // a new worker is created for the next job
    failCurrentJob(`worker exited with code ${code}`);
  });

  return w;
}

// Called from 'error' and 'exit'. Does nothing if no job is running, so it is
// safe to call twice for the same failure.
function failCurrentJob(reason) {
  if (!state.running) return;
  state.running = false;
  state.lastError = reason;
  if (!shuttingDown) log(`job:failed ${reason}`);
}

function runWorkerJob() {
  if (state.running) {
    log("job:skipped previous job is still running");
    return;
  }

  worker ??= createWorker(); // reuse the worker; re-create only if it died
  state.running = true;
  state.lastStart = new Date().toISOString();
  log("job:start");
  worker.postMessage({ durationMs: JOB_DURATION_MS });
}

// ---------------------------------------------------------------------------
// HTTP server: exactly one endpoint, GET /api
// ---------------------------------------------------------------------------
function sendJson(res, status, body) {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(body, null, 2));
}

const server = http.createServer((req, res) => {
  const { pathname } = new URL(req.url, "http://localhost");

  if (pathname !== "/api") {
    return sendJson(res, 404, { error: "Not found" });
  }
  if (req.method !== "GET") {
    return sendJson(res, 405, { error: "Method not allowed" });
  }

  const now = new Date().toISOString();

  if (MODE === "blocking") {
    // Note: this handler can never observe running=true, because while the
    // block runs, no handler runs at all.
    return sendJson(res, 200, {
      now,
      block: {
        running: state.running,
        lastStart: state.lastStart,
        lastEnd: state.lastEnd,
      },
    });
  }

  sendJson(res, 200, { now, job: { ...state } });
});

// ---------------------------------------------------------------------------
// Task 2: event-loop delay monitor
// ---------------------------------------------------------------------------
// monitorEventLoopDelay samples how late the event loop is. We read the
// maximum once per second and reset, so every line covers only the last
// second. The histogram values are in NANOSECONDS: / 1_000_000 gives ms.
// Note: with resolution=10 an idle loop reports ~10-12 ms, because the value
// includes the 10 ms sampling interval itself.
const histogram = monitorEventLoopDelay({ resolution: 10 });
histogram.enable();

const lagTimer = setInterval(() => {
  const maxMs = histogram.max / 1_000_000;
  log(`event-loop-delay max=${maxMs.toFixed(2)} ms`);
  histogram.reset();
}, 1000);

// ---------------------------------------------------------------------------
// Start and shut down
// ---------------------------------------------------------------------------
server.listen(PORT, () => {
  log(`Server listening on http://localhost:${PORT}/api`);
  log(
    `mode=${MODE} firstDelayMs=${FIRST_DELAY_MS} jobDurationMs=${JOB_DURATION_MS} ` +
      `intervalMs=${INTERVAL_MS} node=${process.version} pid=${process.pid}`,
  );
  scheduleJobs(MODE === "blocking" ? runBlockingJob : runWorkerJob);
});

function shutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;
  log(`${signal} received, shutting down`);

  clearTimeout(scheduleTimer);
  clearInterval(lagTimer);
  histogram.disable();

  // Stop the worker (if any). terminate() stops it even in the middle of the
  // busy loop. Without this the process would wait for the worker to finish.
  worker?.terminate();

  server.close(() => log("server closed"));
  server.closeAllConnections(); // do not wait for idle keep-alive sockets
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
