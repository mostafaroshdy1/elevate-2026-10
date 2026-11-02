import { performance } from "node:perf_hooks";
import { writeFile } from "node:fs/promises";

const URL = "http://localhost:3000/api";

const DURATION = 90_000;
const INTERVAL = 250;

const results = [];
const pendingRequests = new Set();

function sendRequest() {
    const start = performance.now();

    const request = fetch(URL)
        .then(async (response) => {
            await response.text();

            const elapsedMs = performance.now() - start;

            results.push({
                status: response.status,
                elapsedMs: elapsedMs.toFixed(2)
            });
        })
        .catch((error) => {
            results.push({
                error: error.message,
                elapsedMs: (performance.now() - start).toFixed(2)
            });
        });

    pendingRequests.add(request);

    request.finally(() => {
        pendingRequests.delete(request);
    });
}

async function runProbe() {
    console.log("Probe started...");

    const intervalId = setInterval(sendRequest, INTERVAL);

    await new Promise((resolve) => {
        setTimeout(resolve, DURATION);
    });

    clearInterval(intervalId);

    await Promise.all(pendingRequests);

    const output = results
        .map((result) => JSON.stringify(result))
        .join("\n");

    await writeFile("evidence/after.txt", output);

    console.log("Probe finished.");
    console.log(`Total requests: ${results.length}`);
}

runProbe();