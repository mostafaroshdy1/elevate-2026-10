import { performance } from "node:perf_hooks";

const URL = "http://localhost:3000/api";
const RUN_TIME = 90_000;
const INTERVAL = 250;

const results = [];
const start = performance.now();

function sendRequest() {
  const requestStart = performance.now();

  fetch(URL)
    .then(async (response) => {
      await response.text();
      results.push({
        ms: performance.now() - requestStart,
        status: response.status,
      });
    })
    .catch((error) => {
      results.push({
        ms: performance.now() - requestStart,
        error: error.message,
      });
    });
}

const timer = setInterval(() => {
  if (performance.now() - start >= RUN_TIME) {
    clearInterval(timer);

    // Give requests that were waiting during the block time to finish.
    setTimeout(() => {
      const times = results.map((item) => item.ms);
      const fastest = Math.min(...times);
      const slowest = Math.max(...times);
      const average = times.reduce((sum, value) => sum + value, 0) / times.length;

      console.log(`Requests completed: ${results.length}`);
      console.log(`Fastest: ${fastest.toFixed(2)} ms`);
      console.log(`Slowest: ${slowest.toFixed(2)} ms`);
      console.log(`Average: ${average.toFixed(2)} ms`);
      console.log("Individual request times:");
      for (const item of results) {
        console.log(`${item.ms.toFixed(2)} ms | ${item.status ?? item.error}`);
      }
    }, 2_000);
  } else {
    // Do not wait for the previous request before sending the next one.
    sendRequest();
  }
}, INTERVAL);
