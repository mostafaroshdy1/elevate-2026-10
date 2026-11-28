import { createServer } from 'node:http';
import { performance, monitorEventLoopDelay } from 'node:perf_hooks';

const monitor = monitorEventLoopDelay({ resolution: 10 });
monitor.enable();

const lagTimer = setInterval(() => {
  const maxMs = monitor.max / 1_000_000;
  console.log('lag:max', new Date().toISOString(), `${maxMs.toFixed(2)} ms`);
  monitor.reset();
}, 1000);
lagTimer.unref();


const block = {
  running: false,
  lastStart: null,
  lastEnd: null
};

function runBlock() {
  block.running = true;
  block.lastStart = new Date().toISOString();
  console.log('block:start', block.lastStart);

  const start = performance.now();

  while (performance.now() - start < 20_000) {
    // Keep the main thread busy for 20 seconds.
  }

  block.running = false;
  block.lastEnd = new Date().toISOString();
  console.log('block:end', block.lastEnd);

  const elapsed = performance.now() - start;
  setTimeout(runBlock, Math.max(0, 40_000 - elapsed));
}

const server = createServer((request, response) => {
  response.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (request.method === 'GET' && request.url === '/api') {
    response.end(JSON.stringify({
      message: 'Server is running',
      now: new Date().toISOString(),
      block
    }));
    return;
  }

  response.statusCode = 404;
  response.end(JSON.stringify({ message: 'Not found' }));
});

server.listen(3000, '127.0.0.1', () => {
  console.log('Server is running at http://localhost:3000/api');
  setTimeout(runBlock, 10_000);
});

