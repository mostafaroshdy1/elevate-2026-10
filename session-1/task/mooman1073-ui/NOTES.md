# Event Loop Lab

## How to run

Use Node.js 22.18 or newer. These tests used Node.js 24.11.0 on Windows.
There are no extra packages to install.
Run the commands from this folder.

- `npm run before`: start the server with the loop on the main thread.
- `npm start`: start the server with a worker.
- `npm run probe`: test the running server from another terminal.
- `npm run pool`: run the pool test with the default pool size.

Only run one server at a time. Stop it with Ctrl+C before starting the other.
Open http://localhost:3000/api to see the response.
Both servers print the largest event loop delay every second.

For the pool tests, use PowerShell:

```powershell
$env:UV_THREADPOOL_SIZE = '1'
node src/pool.mjs
```

Repeat with 2, 4, and 8. Set the value before starting Node.js.
After the tests, remove the setting from this terminal:

```powershell
Remove-Item Env:UV_THREADPOOL_SIZE
```

## Task 1

### Why did requests wait?

The main thread was busy with the loop. It could not run the request handler
until the loop ended.

### Why is setTimeout different?

setTimeout sets a timer. It does not keep the main thread busy while it waits.
A while loop keeps running JavaScript on the main thread.

### What changed with a worker?

The worker ran the loop. The main thread could reply to requests during the job.
The job still took at least 20 seconds. The job did not become shorter.
The server became more responsive.

| Result | Before | After |
| --- | ---: | ---: |
| Requests sent | 352 | 351 |
| Failed requests | 0 | 0 |
| Fastest reply (ms) | 0.81 | 0.75 |
| Slowest reply (ms) | 20001.32 | 198.55 |
| Average reply time (ms) | 5773.01 | 3.94 |

Both probe tests sent requests every 250 ms for 90 seconds.
Timers are not exact, so the request counts are a little different.
All replies in the after test were under 200 ms.

### When is a worker the wrong tool?

A worker is usually not needed just to wait for a database or a network request.
An async API is a better starting point for that work.
A worker also has a cost to start, so it may not help with very small jobs.

## Task 2

monitorEventLoopDelay measured the delay. The server printed the maximum every
second and reset the measurements. The values were changed from nanoseconds
to milliseconds by dividing by 1,000,000.

| Largest delay | Milliseconds |
| --- | ---: |
| Before the worker | 20032.00 |
| After the worker | 106.82 |

Each saved lag test ran for 35 seconds and included one full 20-second job.
The loop started after 10 seconds. The job schedule stayed at 40 seconds
from one start to the next. No shorter job timings were used for this evidence.

### Why did the log stop during the loop?

The log callback also needed the main thread. It had to wait for the loop.
The pause showed that even a small timer callback could not run.
A large delay appeared after the loop ended.

The worker reduced the delay a lot. The saved after test still had a maximum
of 106.82 ms. This was above the expected limit of 100 ms.
The result is kept as measured. The reason for this spike has not been confirmed.

## Task 3

The script started 8 async pbkdf2 jobs with the same inputs.
Each job used 600,000 iterations, a 32-byte key, and SHA-512.
The password and salt were fixed test values for this lab only.
The server was stopped during these tests.

| Pool size | Total time (ms) | Total / 8 (ms) | Mean time per hash, including wait (ms) |
| --- | ---: | ---: | ---: |
| 1 | 3264.14 | 408.02 | 1824.41 |
| 2 | 2487.49 | 310.94 | 1649.62 |
| 4 | 1837.70 | 229.71 | 1371.46 |
| 8 | 1993.03 | 249.13 | 1955.85 |

Total / 8 is the total run time divided by the number of jobs.
It is not the time each job waited for its own result.
The last column measures the time from starting each job to its callback.
It includes time waiting for a free pool thread.

### Did the heartbeat stay on time?

The heartbeat kept printing while the hashes ran. The main thread could still
run timer callbacks. The timing was not exact. The largest heartbeat gaps were
112.40, 116.10, 131.98, and 180.43 ms for pool sizes 1, 2, 4, and 8.

### Why did the total time change?

More pool threads could work on more hashes at once.
The CPU still had limited power. More threads did not always mean less time.
In this test, a pool size of 4 was faster than 8.
These results are from one run per size on this computer.

### Why does a larger pool not fix Task 1?

The JavaScript loop runs on the main thread. Changing the pool size does not
move that loop into the pool. A worker was used to move the loop.

### What is the default pool size?

The default libuv thread pool size is 4.

## What I learned

A long JavaScript loop can stop the main thread from replying to requests.
A worker can run that loop while the main thread stays available.
Some async APIs use the libuv pool for their work.
Async does not mean that any JavaScript loop runs on another thread.
Measurements help show the difference.

## Evidence

The evidence folder contains the probe results, the lag results, and all four
pool tests. These are actual outputs from the programs.

## Lag review

A second 35-second worker test used the same code and timings.
The worker finished the full 20-second job.
The largest delay was 44.27 ms. All 34 samples were below 100 ms.
The output is saved in evidence/lag-after-review.txt.
The first result of 106.82 ms is also kept. The two runs show that the measured
maximum can change between runs. The cause of the first spike is not confirmed.

