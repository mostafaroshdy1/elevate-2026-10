import { createReadStream, createWriteStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { createGzip } from 'node:zlib';
import { pipeline } from 'node:stream/promises';

const inputPath = process.env.INPUT_FILE
  ?? fileURLToPath(new URL('../../data/cities-00000.ndjson', import.meta.url));
const outputPath = process.env.OUTPUT_FILE ?? `${inputPath}.gz`;

await pipeline(
  createReadStream(inputPath),
  createGzip(),
  createWriteStream(outputPath, { flags: 'wx' })
);

console.log('done');

const inputInfo = await stat(inputPath);
const outputInfo = await stat(outputPath);
console.log(`Input: ${inputPath}`);
console.log(`Input size: ${inputInfo.size} bytes (${(inputInfo.size / 1024 / 1024).toFixed(2)} MiB)`);
console.log(`Output: ${outputPath}`);
console.log(`Output size: ${outputInfo.size} bytes (${(outputInfo.size / 1024 / 1024).toFixed(2)} MiB)`);
