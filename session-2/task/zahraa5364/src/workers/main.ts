import { Worker } from "node:worker_threads";
import express from "express";
import { randomUUID } from "node:crypto";
import { createCityData } from "./helpers/cityToSharedArrayBuffer.ts";

const app = express();
const MAX_ALLOWED_WORKERS = 1;
type Pending = { resolve: (mean: number) => void; reject: (err: Error) => void; worker: Worker };
const pending = new Map<string, Pending>();
const workers: Worker[] = [];
let nextWorker = 0;

function createWorker(): Worker {
  const worker = new Worker(new URL("./mean-temperature-worker.ts", import.meta.url));
  workers.push(worker);
  worker.on("message", (m: { requestId: string; meanTemperature: number }) => {
    const p = pending.get(m.requestId);
    if (p) { pending.delete(m.requestId); p.resolve(m.meanTemperature); }
  });
  const failed = (err: Error) => {
    const idx = workers.indexOf(worker);
    if (idx >= 0) workers.splice(idx, 1);
    for (const [id, p] of pending) {
      if (p.worker === worker) { pending.delete(id); p.reject(err); }
    }
  };
  worker.on("error", failed);
  worker.on("exit", code => { if (code !== 0 || workers.includes(worker)) failed(new Error(`Worker exited (${code})`)); });
  return worker;
}
function getWorker(): Worker {
  if (workers.length < MAX_ALLOWED_WORKERS) return createWorker();
  const worker = workers[nextWorker % workers.length]!;
  nextWorker++;
  return worker;
}
app.get("/health", (_req, res) => res.json({ ok: true }));
app.get("/cities/mean-temperature", async (req, res) => {
  const parsed = Number(req.query.count ?? 1_000_000);
  if (!Number.isSafeInteger(parsed) || parsed < 1 || parsed > 10_000_000) {
    res.status(400).json({ error: "count must be an integer from 1 to 10000000" }); return;
  }
  const requestId = randomUUID();
  try {
    const data = createCityData(parsed);
    const worker = getWorker();
    const result = await new Promise<number>((resolve, reject) => {
      pending.set(requestId, { resolve, reject, worker });
      worker.postMessage({ data, requestId });
    });
    res.json({ meanTemperature: result });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
  }
});
app.listen(3000, () => console.log("Server running at http://localhost:3000"));
