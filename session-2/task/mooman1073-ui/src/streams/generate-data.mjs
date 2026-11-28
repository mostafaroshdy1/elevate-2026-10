import { createWriteStream } from 'node:fs';
import { mkdir } from 'node:fs/promises';
import { once } from 'node:events';

const dataDirectory = new URL('../../data/', import.meta.url);
await mkdir(dataDirectory, { recursive: true });

const outputPath = new URL('cities-00000.ndjson', dataDirectory);
const output = createWriteStream(outputPath, { flags: 'wx' });
const total = 1_000_000;
const batchSize = 50_000;
let sum = 0;
let minimum = Infinity;
let maximum = -Infinity;

for (let written = 0; written < total; written += batchSize) {
  const batchCount = Math.min(batchSize, total - written);
  let chunk = '';

  for (let index = 0; index < batchCount; index++) {
    const cityId = written + index + 1;
    const latitude = (Math.random() * 180 - 90).toFixed(6);
    const longitude = (Math.random() * 360 - 180).toFixed(6);
    const temperature = Math.floor(Math.random() * 46) - 10;

    chunk += `{"cityId":${cityId},"latitude":${latitude},"longitude":${longitude},"temperature":${temperature}}\n`;
    sum += temperature;
    minimum = Math.min(minimum, temperature);
    maximum = Math.max(maximum, temperature);
  }

  if (!output.write(chunk)) {
    await once(output, 'drain');
  }
}

const finished = once(output, 'finish');
output.end();
await finished;

console.log(`Generated rows: ${total}`);
console.log(`Expected average: ${(sum / total).toFixed(1)}`);
console.log(`Expected minimum: ${minimum}`);
console.log(`Expected maximum: ${maximum}`);
