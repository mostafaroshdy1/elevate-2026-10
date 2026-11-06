import { pbkdf2 } from 'node:crypto';
import { performance } from 'node:perf_hooks';

const password = 'test-password';
const salt = 'test-salt';
const iterations = 600_000;
const keyLength = 32;
const digest = 'sha512';
const hashCount = 8;

console.log(`Pool size: ${process.env.UV_THREADPOOL_SIZE ?? 4}`);
console.log(`Hashes: ${hashCount}, iterations: ${iterations}, key length: ${keyLength}, digest: ${digest}`);
console.log('Fixed test password and salt are used for this lab only.');

const start = performance.now();
let lastBeat = start;
let maxHeartbeatGap = 0;
const hashTimes = [];

const heartbeat = setInterval(() => {
  const now = performance.now();
  const gap = now - lastBeat;
  maxHeartbeatGap = Math.max(maxHeartbeatGap, gap);
  lastBeat = now;
  console.log(`heartbeat: ${(now - start).toFixed(2)} ms, gap: ${gap.toFixed(2)} ms`);
}, 100);

function runHash(id) {
  const hashStart = performance.now();

  return new Promise((resolve, reject) => {
    pbkdf2(password, salt, iterations, keyLength, digest, (error, key) => {
      if (error) {
        reject(error);
        return;
      }

      const elapsed = performance.now() - hashStart;
      hashTimes.push(elapsed);
      console.log(`Hash ${id}: ${elapsed.toFixed(2)} ms, result length: ${key.length} bytes`);
      resolve();
    });
  });
}

try {
  const jobs = [];
  for (let id = 1; id <= hashCount; id++) {
    jobs.push(runHash(id));
  }
  await Promise.all(jobs);

  const totalMs = performance.now() - start;
  const meanHashMs = hashTimes.reduce((sum, time) => sum + time, 0) / hashCount;
  console.log('\nSummary');
  console.log(`Total time: ${totalMs.toFixed(2)} ms`);
  console.log(`Total time / 8: ${(totalMs / hashCount).toFixed(2)} ms`);
  console.log(`Mean request-to-completion time per hash: ${meanHashMs.toFixed(2)} ms`);
  console.log(`Largest heartbeat gap: ${maxHeartbeatGap.toFixed(2)} ms`);
} catch (error) {
  console.error('Hash failed:', error.message);
  process.exitCode = 1;
} finally {
  clearInterval(heartbeat);
}
