import type { FastifyInstance } from "fastify";
import { ensureRedis, redis } from "./cache";

const FIXED = `local n=redis.call('INCR',KEYS[1]); if n==1 then redis.call('EXPIRE',KEYS[1],ARGV[1]) end; return n`;
const SLIDING = `local now=tonumber(ARGV[1]); local win=tonumber(ARGV[2]); redis.call('ZREMRANGEBYSCORE',KEYS[1],'-inf',now-win); local n=redis.call('ZCARD',KEYS[1]); if n>=tonumber(ARGV[3]) then return n end; redis.call('ZADD',KEYS[1],now,ARGV[4]); redis.call('PEXPIRE',KEYS[1],win); return n+1`;
const TOKEN = `local cap=tonumber(ARGV[1]); local rate=tonumber(ARGV[2]); local now=tonumber(ARGV[3]); local v=redis.call('HMGET',KEYS[1],'tokens','last'); local tokens=tonumber(v[1]) or cap; local last=tonumber(v[2]) or now; tokens=math.min(cap,tokens+math.max(0,now-last)*rate/1000); local allowed=0; if tokens>=1 then tokens=tokens-1; allowed=1 end; redis.call('HSET',KEYS[1],'tokens',tokens,'last',now); redis.call('PEXPIRE',KEYS[1],math.ceil(cap/rate*1000)); return {allowed,tokens}`;

export function registerRateLimit(app: FastifyInstance) {
  app.addHook("onRequest", async (req, reply) => {
    const algo = process.env.RL_ALGO ?? "fixed";
    if (algo === "off" || req.url.split("?")[0] === "/health") return;
    const limit = Number(process.env.RL_LIMIT ?? 20);
    const windowMs = Number(process.env.RL_WINDOW_MS ?? 10000);
    const client = String(req.headers["x-api-key"] ?? req.ip).replace(/[^a-zA-Z0-9:_-]/g, "_");
    const now = Date.now();
    let count = 0; let allowed = true; let reset = Math.ceil(now / windowMs) * windowMs;
    try {
      await ensureRedis();
      if (algo === "sliding") {
        const key = `rl:sliding:${client}`;
        count = Number(await redis.eval(SLIDING, 1, key, now, windowMs, limit, `${now}:${req.id}`));
        allowed = count <= limit; reset = now + windowMs;
      } else if (algo === "token") {
        const result = await redis.eval(TOKEN, 1, `rl:token:${client}`, limit, limit / (windowMs / 1000), now) as [number, number];
        allowed = Number(result[0]) === 1; count = limit - Number(result[1]); reset = now + windowMs;
      } else {
        const start = Math.floor(now / windowMs) * windowMs;
        const key = `rl:${client}:${start}`;
        count = Number(await redis.eval(FIXED, 1, key, Math.ceil(windowMs / 1000)));
        reset = start + windowMs; allowed = count <= limit;
      }
      reply.header("X-RateLimit-Limit", limit).header("X-RateLimit-Remaining", Math.max(0, limit - count)).header("X-RateLimit-Reset", Math.ceil(reset / 1000));
      if (!allowed) {
        reply.header("Retry-After", Math.max(1, Math.ceil((reset - now) / 1000)));
        return reply.code(429).send({ error: "Too Many Requests", limit, retryAfter: Math.max(1, Math.ceil((reset - now) / 1000)) });
      }
    } catch (error) {
      req.log.warn({ err: error }, "rate limiter unavailable; allowing request");
    }
  });
}
