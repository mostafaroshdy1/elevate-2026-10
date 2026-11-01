// Task 3: the libuv thread pool.
//
// Starts 8 crypto.pbkdf2 hashes at the same time. pbkdf2 is async, but its
// work runs on libuv's thread pool, whose size is set by UV_THREADPOOL_SIZE
// (default 4). That variable is read when the process starts, so it must be
// set BEFORE running node:
//
//   Unix:        UV_THREADPOOL_SIZE=4 node src/pool.mjs
//   PowerShell:  $env:UV_THREADPOOL_SIZE = "4"; node src/pool.mjs
//
// While the hashes run, a 100 ms heartbeat keeps printing. If the heartbeat
// stays on time, the main thread (event loop) is NOT blocked.
import { pbkdf2 } from "node:crypto";
import os from "node:os";
import { performance } from "node:perf_hooks";

const HASH_COUNT = 8;
const PASSWORD = "correct horse battery staple";
const SALT = "fixed-salt-for-the-lab";
const ITERATIONS = 200_000;
const KEY_LENGTH = 64;
const DIGEST = "sha512";
const HEARTBEAT_MS = 100;

console.log("libuv thread pool experiment");
console.log(`UV_THREADPOOL_SIZE: ${process.env.UV_THREADPOOL_SIZE ?? "(not set, default 4)"}`);
console.log(`CPU cores available: ${os.availableParallelism()}`);
console.log(`node: ${process.version}`);
console.log(
  `Hashes: ${HASH_COUNT} x pbkdf2(${DIGEST}, ${ITERATIONS} iterations, ${KEY_LENGTH} bytes)\n`,
);

const startedAt = performance.now();

// Heartbeat: prints how long since the previous beat. ~100 ms means the event
// loop is free; a much bigger gap would mean the loop was blocked.
let lastBeat = startedAt;
const heartbeat = setInterval(() => {
  const now = performance.now();
  console.log(
    `  heartbeat t=${(now - startedAt).toFixed(0)} ms (gap ${(now - lastBeat).toFixed(0)} ms)`,
  );
  lastBeat = now;
}, HEARTBEAT_MS);

const finishTimes = [];
let finished = 0;

for (let i = 1; i <= HASH_COUNT; i++) {
  pbkdf2(PASSWORD, SALT, ITERATIONS, KEY_LENGTH, DIGEST, (err) => {
    if (err) throw err;

    const elapsed = performance.now() - startedAt;
    finishTimes.push(elapsed);
    console.log(`  hash ${i} finished at t=${elapsed.toFixed(0)} ms`);

    if (++finished === HASH_COUNT) {
      clearInterval(heartbeat);
      const total = elapsed; // the last hash to finish defines the total
      const averagePerHash = total / HASH_COUNT;
      const averageCompletion = finishTimes.reduce((a, b) => a + b, 0) / HASH_COUNT;

      console.log("\n--- Result ---");
      console.log(`Total time for ${HASH_COUNT} hashes:        ${total.toFixed(0)} ms`);
      console.log(`Average per hash (total / ${HASH_COUNT}):    ${averagePerHash.toFixed(0)} ms`);
      console.log(`Average completion time per hash: ${averageCompletion.toFixed(0)} ms`);
    }
  });
}
