import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { createInterface } from 'node:readline';

const inputPath = process.env.INPUT_FILE
  ?? new URL('../../data/sample.ndjson', import.meta.url);

const { size: totalBytes } = await stat(inputPath);
const input = createReadStream(inputPath, { encoding: 'utf8' });

let bytesRead = 0;
let nextProgress = 10;

input.on('data', (chunk) => {
  bytesRead += Buffer.byteLength(chunk, 'utf8');
  const percentage = (bytesRead / totalBytes) * 100;

  while (nextProgress <= 100 && percentage >= nextProgress) {
    console.log(`Progress: ${nextProgress}%`);
    nextProgress += 10;
  }
});

const lines = createInterface({ input, crlfDelay: Infinity });

let count = 0;
let sum = 0;
let minimum = Infinity;
let maximum = -Infinity;

for await (const line of lines) {
  if (line.trim() === '') continue;

  const city = JSON.parse(line);
  const temperature = city.temperature;

  if (typeof temperature !== 'number' || !Number.isFinite(temperature)) {
    throw new Error('Each row must have a valid temperature number.');
  }

  count++;
  sum += temperature;
  minimum = Math.min(minimum, temperature);
  maximum = Math.max(maximum, temperature);
}

if (count === 0) {
  console.log('No records found.');
} else {
  console.log(`Total rows: ${count}`);
  console.log(`Average temperature: ${(sum / count).toFixed(1)}`);
  console.log(`Minimum temperature: ${minimum}`);
  console.log(`Maximum temperature: ${maximum}`);
}
