import fs from "node:fs";
import path from "node:path";
import { createGzip } from "node:zlib";
import { pipeline } from "node:stream/promises";

const inputPath = path.join(process.cwd(), "src", "streams", "cities.ndjson");

const outputPath = path.join(
  process.cwd(),
  "src",
  "streams",
  "cities.ndjson.gz",
);

const compressFile = async () => {
  const controller = new AbortController();

  try {
    const readable = fs.createReadStream(inputPath);
    const gzip = createGzip();
    const writable = fs.createWriteStream(outputPath);

    await pipeline(readable, gzip, writable, { signal: controller.signal });

    console.log("done");
  } catch (error) {
    if ((error as Error).name === "AbortError") {
      console.log("Compression aborted");
      return;
    }

    console.error("Compression error:", error);
  }
};

compressFile();
