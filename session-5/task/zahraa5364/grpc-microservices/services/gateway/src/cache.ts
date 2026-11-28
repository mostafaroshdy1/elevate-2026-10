import Redis from "ioredis";

export const redis = new Redis(process.env.REDIS_URL ?? "redis://127.0.0.1:6379", {
  lazyConnect: true, maxRetriesPerRequest: 1, retryStrategy: () => null,
});
let connecting: Promise<void> | undefined;
export async function ensureRedis(): Promise<void> {
  if (redis.status === "wait") { connecting ??= redis.connect().finally(() => { connecting = undefined; }); await connecting; }
}
redis.on("error", (error) => console.warn(JSON.stringify({ level: "warn", msg: "redis unavailable; bypassing cache", error: error.message })));

const localCache = new Map<string, { value: unknown; expiresAt: number }>();
export function memoryCacheGet<T>(key: string): T | null {
  const item = localCache.get(key);
  if (!item || item.expiresAt <= Date.now()) { localCache.delete(key); return null; }
  return item.value as T;
}
export function memoryCacheSet(key: string, value: unknown, ttl = 60): void {
  localCache.set(key, { value, expiresAt: Date.now() + ttl * 1000 });
}
export function memoryCacheDelete(key: string): void { localCache.delete(key); }

export async function cacheGet<T>(key: string): Promise<T | null> {
  try { await ensureRedis(); const raw = await redis.get(key); return raw ? JSON.parse(raw) as T : null; }
  catch (error) { console.warn("cache read failed", error); return null; }
}
export async function cacheSet(key: string, value: unknown, ttl = 60): Promise<void> {
  try { await ensureRedis(); await redis.set(key, JSON.stringify(value), "EX", ttl); }
  catch (error) { console.warn("cache write failed", error); }
}
export async function invalidatePost(id: number): Promise<void> {
  memoryCacheDelete(`post:${id}:full`);
  try { await ensureRedis(); await redis.del(`post:${id}:full`); }
  catch (error) { console.warn("cache invalidation failed", error); }
}
export function jitterTtl(base = 60): number { return base + Math.floor(Math.random() * 21) - 10; }

export async function cacheAside<T>(id: number, build: () => Promise<T>): Promise<{ value: T; hit: boolean }> {
  const key = `post:${id}:full`;
  const cached = await cacheGet<T>(key);
  if (cached !== null) return { value: cached, hit: true };
  const token = `${process.pid}:${Date.now()}:${Math.random()}`;
  let owner = false;
  try {
    await ensureRedis();
    owner = (await redis.set(`lock:${key}`, token, "PX", 5000, "NX")) === "OK";
  } catch { /* Redis is optional: fall through to the source of truth. */ }
  if (!owner) {
    for (let i = 0; i < 40; i++) {
      await new Promise(resolve => setTimeout(resolve, 35));
      const value = await cacheGet<T>(key);
      if (value !== null) return { value, hit: true };
    }
  }
  const value = await build();
  await cacheSet(key, value, jitterTtl());
  if (owner) {
    try { await redis.eval("if redis.call('get', KEYS[1]) == ARGV[1] then return redis.call('del', KEYS[1]) else return 0 end", 1, `lock:${key}`, token); }
    catch (error) { console.warn("cache lock release failed", error); }
  }
  return { value, hit: false };
}
