const urls = [process.env.GATEWAY_A ?? "http://localhost:3009", process.env.GATEWAY_B ?? "http://localhost:3010"];
const key = `shared-${Date.now()}`;
const statuses = await Promise.all(Array.from({ length: 30 }, (_, i) => fetch(`${urls[i % 2]}/posts/1`, { headers: { "x-api-key": key, "x-request-id": `shared-${i}` } }).then(r => r.status)));
console.log(JSON.stringify({ key, requests: statuses.length, succeeded: statuses.filter(s => s < 400).length, rateLimited: statuses.filter(s => s === 429).length, statuses }, null, 2));
