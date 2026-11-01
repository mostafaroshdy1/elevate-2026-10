const BASE_URL = process.env.BASE_URL ?? "http://localhost:3000/api";
const DURATION_MS = 90_000;
const INTERVAL_MS = 250;

const startedAt = Date.now();
const results = [];

console.log(`Duration: ${DURATION_MS / 1000} seconds`);
console.log(`Interval: ${INTERVAL_MS} ms`);
console.log(`URL: ${BASE_URL}`);

while (Date.now() - startedAt < DURATION_MS) {
  const requestStarted = performance.now();
  try {
    const response = await fetch(BASE_URL);
    await response.arrayBuffer();
    results.push({ latencyMs: Number((performance.now() - requestStarted).toFixed(2)), status: response.status });
  } catch (error) {
    results.push({ latencyMs: Number((performance.now() - requestStarted).toFixed(2)), error: error.message });
  }
  const elapsed = Date.now() - startedAt;
  if (elapsed < DURATION_MS) {
    await new Promise(resolve => setTimeout(resolve, Math.max(0, INTERVAL_MS - (performance.now() - requestStarted))));
  }
}

const latencies = results.map(item => item.latencyMs);
const total = latencies.reduce((sum, value) => sum + value, 0);
console.log(`Requests completed: ${results.length}`);
if (latencies.length) {
  console.log(`Fastest: ${Math.min(...latencies).toFixed(2)} ms`);
  console.log(`Slowest: ${Math.max(...latencies).toFixed(2)} ms`);
  console.log(`Average: ${(total / latencies.length).toFixed(2)} ms`);
}
console.log("Individual requests:");
results.forEach((result, index) => console.log(`${index + 1}. ${JSON.stringify(result)}`));
