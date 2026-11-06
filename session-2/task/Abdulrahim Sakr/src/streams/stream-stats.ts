import fs from "node:fs";
import path from "node:path";

const filePath = path.join(process.cwd(), "src", "streams", "cities.ndjson");

const totalBytes = fs.statSync(filePath).size;

const readableStream = fs.createReadStream(filePath, {
  highWaterMark: 16 * 1024,
  encoding: "utf-8",
});

let buffer = "";

let totalRows = 0;
let sum = 0;
let min = Infinity;
let max = -Infinity;

let bytesRead = 0;
let nextProgress = 10;

const processLine = (line: string) => {
  if (!line.trim()) return;

  const city = JSON.parse(line);

  if (typeof city.temperature !== "number") {
    throw new Error("Invalid temperature value");
  }

  totalRows++;
  sum += city.temperature;

  min = Math.min(min, city.temperature);
  max = Math.max(max, city.temperature);
};

readableStream.on("data", (chunk) => {
  bytesRead += Buffer.byteLength(chunk, "utf-8");

  const progress = totalBytes > 0 ? (bytesRead / totalBytes) * 100 : 100;

  while (progress >= nextProgress && nextProgress <= 100) {
    console.log(`Progress: ${nextProgress}%`);
    nextProgress += 10;
  }

  const data = buffer + chunk;
  const lines = data.split("\n");

  buffer = lines.pop() || "";

  for (const line of lines) {
    processLine(line);
  }
});

readableStream.on("end", () => {
  if (buffer.trim()) {
    processLine(buffer);
  }

  const average = totalRows > 0 ? sum / totalRows : 0;

  console.log("\n========== STREAM STATS ==========");
  console.log("Total Rows:", totalRows);
  console.log("Average Temperature:", average);
  console.log("Min Temperature:", totalRows > 0 ? min : null);
  console.log("Max Temperature:", totalRows > 0 ? max : null);
  console.log("==================================");
});

readableStream.on("error", (error) => {
  console.error("Stream error:", error);
});
