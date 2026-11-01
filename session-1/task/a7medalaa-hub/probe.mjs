// Probe: a small client that measures how long GET /api takes to answer.
//
// It sends one request every 250 ms for 90 seconds. It does NOT wait for a
// response before sending the next request, so requests keep being sent while
// the server is blocked. The latency is measured on the CLIENT side, which is
// the real proof (the server's own "now" is only when its handler finally ran).
//
// Usage:  node probe.mjs
// Optional environment variables (defaults are the assignment values):
//   PROBE_URL=http://localhost:3000/api  PROBE_DURATION_MS=90000
//   PROBE_INTERVAL_MS=250                PROBE_GRACE_MS=30000
import http from "node:http";
import { performance } from "node:perf_hooks";

const URL_TO_PROBE = process.env.PROBE_URL ?? "http://localhost:3000/api";
const DURATION_MS = Number(process.env.PROBE_DURATION_MS ?? 90_000);
const INTERVAL_MS = Number(process.env.PROBE_INTERVAL_MS ?? 250);
// After the last request is sent, wait this long for slow responses.
const GRACE_MS = Number(process.env.PROBE_GRACE_MS ?? 30_000);

// One new connection per request, so a stuck request can never delay another.
const agent = new http.Agent({ keepAlive: false });

const probeStart = performance.now();
const results = []; // one entry per COMPLETED request
let sent = 0;
let pending = 0;
let failed = 0;

function sendRequest() {
  const id = ++sent;
  const sentAt = performance.now(); // client-side start time
  pending++;

  const req = http.get(URL_TO_PROBE, { agent }, (res) => {
    res.resume(); // read and discard the body
    res.on("end", () => {
      const latencyMs = performance.now() - sentAt;
      pending--;
      results.push({ id, latencyMs });
      const sentOffset = ((sentAt - probeStart) / 1000).toFixed(2);
      console.log(
        `#${String(id).padStart(3, "0")} status=${res.statusCode} ` +
          `sent=+${sentOffset}s latency=${latencyMs.toFixed(1)} ms`,
      );
    });
  });

  req.on("error", (err) => {
    pending--;
    failed++;
    console.log(`#${String(id).padStart(3, "0")} ERROR ${err.message}`);
  });
}

function printSummary() {
  console.log("\n--- Summary ---");
  console.log(`Requests sent:      ${sent}`);
  console.log(`Responses received: ${results.length}`);
  console.log(`Failed / no answer: ${failed + pending}`);

  if (results.length > 0) {
    const latencies = results.map((r) => r.latencyMs);
    const fastest = Math.min(...latencies);
    const slowest = Math.max(...latencies);
    const average = latencies.reduce((sum, v) => sum + v, 0) / latencies.length;
    const over200 = latencies.filter((v) => v > 200).length;

    console.log(`Fastest:            ${fastest.toFixed(1)} ms`);
    console.log(`Slowest:            ${slowest.toFixed(1)} ms`);
    console.log(`Average:            ${average.toFixed(1)} ms`);
    console.log(`Requests > 200 ms:  ${over200}`);
  }
}

console.log(
  `Probe: GET ${URL_TO_PROBE} every ${INTERVAL_MS} ms for ${DURATION_MS / 1000} s ` +
    `(node ${process.version})`,
);

// Sending timer: fires every 250 ms and never waits for earlier responses.
const sendTimer = setInterval(sendRequest, INTERVAL_MS);

setTimeout(() => {
  clearInterval(sendTimer);
  console.log(`\nStopped sending after ${sent} requests. Waiting for slow responses...`);

  // Wait until every request is answered, or until the grace period ends.
  const graceStart = performance.now();
  const waitTimer = setInterval(() => {
    const graceOver = performance.now() - graceStart > GRACE_MS;
    if (pending === 0 || graceOver) {
      clearInterval(waitTimer);
      if (pending > 0) console.log(`Grace period over: ${pending} request(s) never answered.`);
      printSummary();
      agent.destroy(); // closes any request that never got an answer
    }
  }, 100);
}, DURATION_MS);
