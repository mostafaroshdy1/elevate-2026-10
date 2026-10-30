import { pbkdf2 } from "node:crypto";
import { performance } from "node:perf_hooks";
import { promisify } from "node:util";

const pbkdf2Async = promisify(pbkdf2);
const HASH_COUNT = 8;
const PASSWORD = "course-password";
const SALT = "course-salt";
const ITERATIONS = 200_000;
const KEY_LENGTH = 32;
const DIGEST = "sha256";

let heartbeat = 0;

const timer = setInterval(() => {
  heartbeat++;
  console.log(`heartbeat ${heartbeat}`);
}, 100);

const start = performance.now();

await Promise.all(
  Array.from({ length: HASH_COUNT }, () =>
    pbkdf2Async(PASSWORD, SALT, ITERATIONS, KEY_LENGTH, DIGEST)
  )
);

const totalMs = performance.now() - start;
clearInterval(timer);

console.log(`Total time for 8 hashes: ${totalMs.toFixed(2)} ms`);
console.log(`Average per hash: ${(totalMs / HASH_COUNT).toFixed(2)} ms`);
console.log(`Heartbeats: ${heartbeat}`);
