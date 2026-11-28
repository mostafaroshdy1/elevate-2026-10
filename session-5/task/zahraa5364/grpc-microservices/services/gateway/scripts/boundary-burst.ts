const base = process.env.BASE_URL ?? "http://localhost:3009";
const limit = Number(process.env.RL_LIMIT ?? 20);
const windowMs = Number(process.env.RL_WINDOW_MS ?? 10000);
const key = `boundary-${Date.now()}`;
const wait = windowMs - (Date.now() % windowMs) - 500;
console.log(`waiting ${wait}ms; key=${key}; limit=${limit}; window=${windowMs}ms`);
await new Promise(resolve => setTimeout(resolve, Math.max(0, wait)));
async function burst(label: string) {
  const results = await Promise.all(Array.from({ length: limit }, (_, i) => fetch(`${base}/posts/1`, { headers: { "x-api-key": key, "x-request-id": `${label}-${i}` } }).then(r => r.status)));
  console.log(label, { succeeded: results.filter(s => s < 400).length, blocked: results.filter(s => s === 429).length });
}
await burst("before-boundary");
await new Promise(resolve => setTimeout(resolve, 550));
await burst("after-boundary");
