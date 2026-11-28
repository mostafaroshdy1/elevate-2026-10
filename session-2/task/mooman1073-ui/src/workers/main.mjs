import { createServer } from 'node:http';
import { Worker } from 'node:worker_threads';
import { randomUUID } from 'node:crypto';
import { createCitiesData } from './helpers/create-cities-data.mjs';

const MAX_ALLOWED_WORKERS = 1;
const workers = [];
const pendingRequests = new Map();
let nextWorkerIndex = 0;
let stopping = false;

function sendJson(response, status, data) {
  if (response.destroyed || response.writableEnded) return;
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  response.end(JSON.stringify(data));
}

function removeWorker(worker, message) {
  const index = workers.indexOf(worker);
  if (index !== -1) workers.splice(index, 1);

  for (const [requestId, pending] of pendingRequests) {
    if (pending.worker === worker) {
      sendJson(pending.response, 500, { error: message });
      pendingRequests.delete(requestId);
    }
  }
}

function getWorker() {
  if (workers.length < MAX_ALLOWED_WORKERS) {
    const worker = new Worker(new URL('./mean-temperature-worker.mjs', import.meta.url));

    worker.on('message', ({ requestId, meanTemperature }) => {
      const pending = pendingRequests.get(requestId);
      if (!pending || pending.worker !== worker) return;
      pendingRequests.delete(requestId);
      sendJson(pending.response, 200, { requestId, count: pending.count, meanTemperature });
    });

    worker.on('error', (error) => {
      console.error('worker:error', error.message);
      removeWorker(worker, 'The worker failed. Please try again.');
    });

    worker.on('exit', (code) => {
      if (!stopping) console.log('worker:exit', code);
      removeWorker(worker, 'The worker stopped before finishing the request.');
    });

    workers.push(worker);
  }

  const worker = workers[nextWorkerIndex % workers.length];
  nextWorkerIndex = (nextWorkerIndex + 1) % workers.length;
  return worker;
}

const server = createServer((request, response) => {
  const url = new URL(request.url, 'http://localhost');

  if (request.method === 'GET' && url.pathname === '/health') {
    sendJson(response, 200, { ok: true });
    return;
  }

  if (request.method !== 'GET' || url.pathname !== '/cities/mean-temperature') {
    sendJson(response, 404, { error: 'Not found' });
    return;
  }

  const count = Number(url.searchParams.get('count') ?? 1_000_000);
  if (!Number.isSafeInteger(count) || count < 1 || count > 5_000_000) {
    sendJson(response, 400, { error: 'count must be a whole number from 1 to 5000000.' });
    return;
  }

  const requestId = randomUUID();
  try {
    const citiesData = createCitiesData(count);
    const worker = getWorker();
    pendingRequests.set(requestId, { response, worker, count });
    response.on('close', () => pendingRequests.delete(requestId));
    worker.postMessage({ citiesData, requestId });
  } catch (error) {
    pendingRequests.delete(requestId);
    console.error('request:error', error.message);
    sendJson(response, 500, { error: 'Could not process this request.' });
  }
});

server.listen(3000, '127.0.0.1', () => {
  console.log('Server: http://localhost:3000');
  console.log('Mean: http://localhost:3000/cities/mean-temperature?count=1000');
});

async function stopServer() {
  if (stopping) return;
  stopping = true;
  server.close();
  for (const pending of pendingRequests.values()) {
    sendJson(pending.response, 503, { error: 'Server is stopping.' });
  }
  pendingRequests.clear();
  server.closeAllConnections();
  await Promise.all(workers.map(worker => worker.terminate()));
}

process.on('SIGINT', stopServer);
process.on('SIGTERM', stopServer);
