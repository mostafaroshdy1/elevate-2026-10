import { pbkdf2 } from "node:crypto";
import { performance } from "node:perf_hooks";
import { promisify } from "node:util";

const pbkdf2Async = promisify(pbkdf2);
const OPERATIONS = 8;
const ITERATIONS = 200_000;
const KEY_LENGTH = 32;
const startedAt = performance.now();

const heartbeat = setInterval(() => {
  console.log(`heartbeat ${Math.round(performance.now() - startedAt)} ms`);
}, 100);

const jobs = Array.from({ length: OPERATIONS }, (_, index) => {
  const operationStarted = performance.now();
  return pbkdf2Async(`password-${index}`, "event-loop-lab-salt", ITERATIONS, KEY_LENGTH, "sha256")
    .then(() => ({
      operation: index + 1,
      durationMs: Number((performance.now() - operationStarted).toFixed(4))
    }));
});

try {
  const results = await Promise.all(jobs);
  clearInterval(heartbeat);
  const totalMs = performance.now() - startedAt;
  console.log(JSON.stringify({
    threadPoolSize: process.env.UV_THREADPOOL_SIZE ?? "default (4)",
    operations: OPERATIONS,
    iterations: ITERATIONS,
    keyLength: KEY_LENGTH,
    algorithm: "sha256",
    totalMs: Number(totalMs.toFixed(4)),
    averageMs: Number((totalMs / OPERATIONS).toFixed(4)),
    results
  }, null, 2));
} catch (error) {
  clearInterval(heartbeat);
  console.error(error);
  process.exitCode = 1;
}
