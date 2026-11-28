import { createServer } from 'node:http';
import { Worker } from 'node:worker_threads';
import { performance, monitorEventLoopDelay } from 'node:perf_hooks';

const monitor = monitorEventLoopDelay({ resolution: 10 });
monitor.enable();

const lagTimer = setInterval(() => {
  const maxMs = monitor.max / 1_000_000;
  console.log('lag:max', new Date().toISOString(), `${maxMs.toFixed(2)} ms`);
  monitor.reset();
}, 1000);
lagTimer.unref();


const job = {
  running: false,
  lastStart: null,
  lastEnd: null,
  lastResult: null
};

let activeWorker = null;
let timer;
let stopping = false;

function runJob() {
  if (stopping || activeWorker) return;

  const start = performance.now();
  job.running = true;
  job.lastStart = new Date().toISOString();
  console.log('job:start', job.lastStart);

  let receivedResult = false;
  let failed = false;

  function scheduleNext() {
    job.running = false;
    job.lastEnd = new Date().toISOString();
    activeWorker = null;

    if (!stopping) {
      const elapsed = performance.now() - start;
      timer = setTimeout(runJob, Math.max(0, 40_000 - elapsed));
    }
  }

  try {
    activeWorker = new Worker(new URL('./worker.mjs', import.meta.url));
  } catch (error) {
    console.error('worker:error', error.message);
    scheduleNext();
    return;
  }

  activeWorker.on('message', (result) => {
    receivedResult = true;
    job.lastResult = result;
    console.log('job:result', result);
  });

  activeWorker.on('error', (error) => {
    failed = true;
    console.error('worker:error', error.message);
  });

  activeWorker.on('exit', (code) => {
    if (!stopping && (code !== 0 || !receivedResult) && !failed) {
      console.error('worker:exit', code, 'Job did not complete.');
    }
    scheduleNext();
    console.log('job:end', job.lastEnd);
  });
}

const server = createServer((request, response) => {
  response.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (request.method === 'GET' && request.url === '/api') {
    response.end(JSON.stringify({
      message: 'Server is running',
      now: new Date().toISOString(),
      job
    }));
    return;
  }

  response.statusCode = 404;
  response.end(JSON.stringify({ message: 'Not found' }));
});

server.listen(3000, '127.0.0.1', () => {
  console.log('Server is running at http://localhost:3000/api');
  timer = setTimeout(runJob, 10_000);
});

async function stopServer() {
  if (stopping) return;
  stopping = true;
  clearTimeout(timer);
  server.close();
  server.closeAllConnections();
  if (activeWorker) await activeWorker.terminate();
}

process.on('SIGINT', stopServer);
process.on('SIGTERM', stopServer);

