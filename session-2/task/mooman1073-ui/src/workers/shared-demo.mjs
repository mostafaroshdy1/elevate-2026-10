import { Worker } from 'node:worker_threads';

const cityCount = 2;
const fieldsPerCity = 4;
const buffer = new SharedArrayBuffer(
  cityCount * fieldsPerCity * Float64Array.BYTES_PER_ELEMENT
);
const citiesData = new Float64Array(buffer);

citiesData.set([
  1, 30, 31, 20,
  2, 40, 35, 30
]);

const worker = new Worker(
  new URL('./mean-temperature-worker.mjs', import.meta.url)
);

try {
  const result = await new Promise((resolve, reject) => {
    worker.once('message', resolve);
    worker.once('error', reject);
    worker.once('exit', (code) => {
      reject(new Error(`Worker exited before sending a result. Code: ${code}`));
    });

    worker.postMessage({ citiesData, requestId: 'demo-1' });
  });

  console.log(`Request ID: ${result.requestId}`);
  console.log('Temperatures: 20, 30');
  console.log('Expected mean: 25');
  console.log(`Worker mean: ${result.meanTemperature}`);

  if (result.requestId !== 'demo-1' || result.meanTemperature !== 25) {
    throw new Error('The worker returned an unexpected result.');
  }
} finally {
  await worker.terminate();
}
