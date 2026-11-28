import Redis from "ioredis";
const redis = new Redis(process.env.REDIS_URL ?? "redis://127.0.0.1:6379");
const base = process.env.BASE_URL ?? "http://localhost:3009";
await redis.del("post:1:full");
const started = Date.now();
const results = await Promise.all(Array.from({ length: 200 }, (_, i) => fetch(`${base}/posts/1`, { headers: { "x-request-id": `stampede-${i}`, "x-api-key": `stampede-${i}` } }).then(r => r.status).catch(() => 0)));
console.log(JSON.stringify({ requests: results.length, statuses: results.reduce((a, s) => (a[s] = (a[s] ?? 0) + 1, a), {} as Record<number, number>), durationMs: Date.now() - started }));
await redis.quit();
