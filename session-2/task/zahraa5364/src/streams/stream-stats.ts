import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createInterface } from "node:readline";
import { resolve } from "node:path";

const input = resolve(process.env.INPUT ?? "./data/cities-00000.ndjson");
const { size } = await stat(input);
let rows = 0, sum = 0, min = Infinity, max = -Infinity, bytes = 0, lastPct = -1;

const stream = createReadStream(input);
stream.on("data", (chunk: Buffer) => {
  bytes += chunk.length;
  const pct = Math.min(100, Math.floor(bytes / size * 100));
  if (pct >= lastPct + 10 || pct === 100) {
    console.log(`progress: ${pct}%`);
    lastPct = pct;
  }
});
const lines = createInterface({ input: stream, crlfDelay: Infinity });
for await (const line of lines) {
  if (!line.trim()) continue;
  const record = JSON.parse(line) as { temperature: number };
  if (typeof record.temperature !== "number" || !Number.isFinite(record.temperature)) {
    throw new Error(`Invalid temperature on row ${rows + 1}`);
  }
  rows++; sum += record.temperature;
  min = Math.min(min, record.temperature);
  max = Math.max(max, record.temperature);
}
if (!rows) throw new Error("Input contains no records");
console.log(`total rows: ${rows}`);
console.log(`average temperature: ${(sum / rows).toFixed(1)}`);
console.log(`minimum temperature: ${min}`);
console.log(`maximum temperature: ${max}`);
