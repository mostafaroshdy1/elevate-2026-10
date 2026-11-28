import { performance } from 'node:perf_hooks';

const url = 'http://127.0.0.1:3000/api';
const durationMs = 90_000;
const intervalMs = 250;
const times = [];
const pending = new Set();
let sent = 0;
let failed = 0;

async function sendRequest(id) {
  const start = performance.now();

  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(35_000) });
    await response.text();

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const elapsed = performance.now() - start;
    times.push(elapsed);
    console.log(`Request ${id}: ${elapsed.toFixed(2)} ms`);
  } catch (error) {
    failed++;
    console.log(`Request ${id} failed: ${error.message}`);
  }
}

console.log(`Probe started: ${new Date().toISOString()}`);
console.log(`URL: ${url}`);
console.log(`Send every ${intervalMs} ms for ${durationMs / 1000} seconds`);

const start = performance.now();
await new Promise((resolve) => {
  const timer = setInterval(() => {
    if (performance.now() - start >= durationMs) {
      clearInterval(timer);
      resolve();
      return;
    }

    sent++;
    const request = sendRequest(sent);
    pending.add(request);
    request.finally(() => pending.delete(request));
  }, intervalMs);
});

await Promise.all(pending);

console.log('\nSummary');
console.log(`Requests sent: ${sent}`);
console.log(`Successful: ${times.length}`);
console.log(`Failed: ${failed}`);

if (times.length > 0) {
  const total = times.reduce((sum, time) => sum + time, 0);
  console.log(`Fastest: ${Math.min(...times).toFixed(2)} ms`);
  console.log(`Slowest: ${Math.max(...times).toFixed(2)} ms`);
  console.log(`Average: ${(total / times.length).toFixed(2)} ms`);
}
