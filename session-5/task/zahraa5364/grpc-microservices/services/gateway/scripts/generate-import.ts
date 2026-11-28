import { createWriteStream } from "node:fs";
import { once } from "node:events";

const output = process.argv[2] ?? "comments-10k.ndjson";
const stream = createWriteStream(output);
for (let i = 0; i < 10_000; i++) {
  const line = JSON.stringify({ postId: 1, authorId: 1, content: `Bulk imported comment ${i + 1}` }) + "\n";
  if (!stream.write(line)) await once(stream, "drain");
}
stream.end();
await once(stream, "finish");
console.log(`Wrote 10000 NDJSON comments to ${output}`);
