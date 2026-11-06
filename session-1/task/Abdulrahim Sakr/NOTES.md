# Node.js Event Loop Lab — Session 1

## Task 1 — Main-thread blocking and Worker Threads

- HTTP endpoint: `GET /api`
- First blocking operation starts about 10 seconds after server startup.
- Each blocking operation runs synchronously for at least 20 seconds.
- Blocking operation start times are scheduled 40 seconds apart.
- In main-thread mode, the CPU loop runs on the main thread and delays HTTP responses.
- In worker mode, the same CPU loop runs in a Worker Thread, keeping the main event loop responsive.

Run:
- Main thread: `node src/server.mjs`
- Worker thread: `BLOCKING_MODE=worker node src/server.mjs` (PowerShell: `$env:BLOCKING_MODE='worker'; node src/server.mjs`)

## Task 2 — Event Loop delay monitoring

The server uses `monitorEventLoopDelay({ resolution: 20 })`, reports the maximum delay every second in milliseconds, then resets the histogram for the next interval. Compare the output in main-thread and worker modes.

## Task 3 — libuv thread pool

`src/pool.mjs` runs eight asynchronous `crypto.pbkdf2` operations using SHA-256, 200,000 iterations, and a 32-byte key. A heartbeat is printed every 100 ms. Set `UV_THREADPOOL_SIZE` before starting Node; changing it after startup does not resize the pool.

Recorded experiment results:

| UV_THREADPOOL_SIZE | Total time (ms) | Average per operation (ms) |
|---:|---:|---:|
| 1 | 300.1029 | 37.5129 |
| 2 | 157.7022 | 19.7128 |
| 4 | 107.0662 | 13.3833 |
| 8 | 129.8459 | 16.2307 |

The measured run was fastest with a pool size of 4. Increasing the pool to 8 did not improve this workload.

## Evidence note

The Task 3 timings above are the recorded measurements available for this submission. The original raw Task 1 probe captures and Task 2 histogram captures were not present in the retained conversation data, so their evidence files identify the required test configuration rather than inventing measurements. Re-run those experiments to produce authentic raw captures if required.
