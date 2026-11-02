
import express from "express";
import { Worker } from "node:worker_threads";
import { monitorEventLoopDelay } from "node:perf_hooks";

const histogram = monitorEventLoopDelay({
    resolution: 20
});

histogram.enable();

setInterval(() => {
    console.log("Event Loop Delay:", {
        max: (histogram.max / 1e6).toFixed(2)
    });

    histogram.reset();

}, 1000);

const app = express();
const PORT = 3000;

let running = false;
let lastStart: string | null = null;
let lastEnd: string | null = null;
let lastResult: {
    iterations: number;
    elapsedMs: string;
} | null = null;
let currentWorker: Worker | null = null;

app.get("/api", (req, res) => {
    res.json({
        now: new Date().toISOString(),
        block: {
            running,
            lastStart,
            lastEnd,
            lastResult
        }
    });
});
 


function runWorkerJob(): void {
    running = true;
    lastStart = new Date().toISOString();

    console.log("block:start", lastStart);

    const worker = new Worker(
        new URL("./worker.ts", import.meta.url)
    );
    currentWorker = worker;
    worker.on("message", (data) => {
        running = false;
        
        lastEnd = new Date().toISOString();
        lastResult = data;
        console.log("block:end", lastEnd, data);

        setTimeout(runWorkerJob, 20_000);
    });

    worker.on("error", (error) => {
        running = false;
        console.error("Worker error:", error);
    });


    worker.on("exit", (code) => {
    if (code !== 0) {
        running = false;
        console.error(`Worker stopped with exit code ${code}`);
    }
});


}


function runBlockingJob(): void {
    running = true;
    lastStart = new Date().toISOString();

    console.log("block:start", lastStart);

    const start = performance.now();
    let iterations = 0;

    while (performance.now() - start < 20_000) {
        iterations++;
    }

    const elapsedMs = performance.now() - start;

    running = false;
    lastEnd = new Date().toISOString();

    console.log("block:end", lastEnd, {
        iterations,
        elapsedMs: elapsedMs.toFixed(2)
    });

    setTimeout(runBlockingJob, 20_000);
}

const server = app.listen(PORT, () => {
    console.log(`Server listening at http://localhost:${PORT}`);

    setTimeout(runWorkerJob, 10_000);
});

function shutdown(signal: string): void {
    console.log(`${signal} received. Shutting down...`);

    currentWorker?.terminate();

    server.close(() => {
        console.log("Server closed");
        process.exit(0);
    });
}

process.on("SIGINT", () => shutdown("SIGINT"));

process.on("SIGTERM", () => shutdown("SIGTERM"));

// app.listen(PORT, () => {
//     console.log(`Server listening at http://localhost:${PORT}`);

//     setTimeout(runBlockingJob, 10_000);
// });


   


