import { createReadStream, createWriteStream } from "node:fs";
import { pipeline } from "node:stream/promises";
import { createGzip } from "node:zlib";
import { resolve } from "node:path";

const input = resolve(process.env.INPUT ?? "./data/cities-00000.ndjson");
const output = resolve(process.env.OUTPUT ?? `${input}.gz`);
await pipeline(createReadStream(input), createGzip(), createWriteStream(output));
console.log("done");
