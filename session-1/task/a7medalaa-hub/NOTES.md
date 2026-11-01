# Session 1 — Event Loop Lab

Submission by **a7medalaa-hub**. Plain JavaScript (`.mjs`), Node.js built-in modules only, no external dependencies.

## How to run

Run commands from `session-1/task/a7medalaa-hub/`.

### Task 1 + Task 2 — server and probe

Use two terminals. Start the server in Terminal 1 and run the probe in Terminal 2.

```powershell
# Before the fix: synchronous CPU work blocks the main thread
node src/server.mjs --mode=blocking

# Terminal 2
node probe.mjs
```

Stop the first server with `Ctrl+C`, then run the worker version:

```powershell
# Terminal 1
node src/server.mjs --mode=worker

# Terminal 2
node probe.mjs
```

To capture server logs in PowerShell, use:

```powershell
node src/server.mjs --mode=blocking 2>&1 | Tee-Object -FilePath evidence/lag-before.txt
node src/server.mjs --mode=worker 2>&1 | Tee-Object -FilePath evidence/lag-after.txt
```

Run only one server at a time. The probe sends one request every 250 ms for 90 seconds and reports latency statistics.

### Task 3 — libuv thread pool

The environment variable must be set before Node starts. Each command starts a new Node process.

```powershell
$env:UV_THREADPOOL_SIZE = "1"; node src/pool.mjs 2>&1 | Tee-Object -FilePath evidence/pool-1.txt
$env:UV_THREADPOOL_SIZE = "2"; node src/pool.mjs 2>&1 | Tee-Object -FilePath evidence/pool-2.txt
$env:UV_THREADPOOL_SIZE = "4"; node src/pool.mjs 2>&1 | Tee-Object -FilePath evidence/pool-4.txt
$env:UV_THREADPOOL_SIZE = "8"; node src/pool.mjs 2>&1 | Tee-Object -FilePath evidence/pool-8.txt
Remove-Item Env:UV_THREADPOOL_SIZE
```

## Files

| File | Purpose |
| --- | --- |
| `src/server.mjs` | HTTP `GET /api` server, scheduler, blocking/worker modes, event-loop delay monitor |
| `src/worker.mjs` | Worker thread that runs the CPU-bound job |
| `src/busy-loop.mjs` | Time-based synchronous loop used for the 20-second job |
| `src/pool.mjs` | Task 3: eight `crypto.pbkdf2` calls and a 100 ms heartbeat |
| `probe.mjs` | Sends requests every 250 ms for 90 seconds and measures latency |
| `evidence/*.txt` | Captured terminal output from the runs described below |

## Evidence environment and notes

- The evidence was collected locally on Windows using Node.js **v22.23.2**.
- The pool experiment reported **12 available CPU cores**.
- The server was configured with the assignment's default timings: first job after 10 seconds, 20 seconds of work, and a 40-second start-to-start interval.
- `before.txt` and `after.txt` are the Probe summaries for the blocking and worker runs. The `lag-before.txt` and `lag-after.txt` logs were captured in separate server runs, not during the exact same runs as the Probe files. Therefore, compare them as separate demonstrations of the same behavior, not as synchronized measurements.
- The server logs include repeated scheduled jobs because the server was left running for multiple intervals. The blocking log ends after a later block started; the worker log ends after a third job started and the server received `SIGINT`. The two completed worker jobs each reported `elapsedMs=20000`.
- Timings vary between runs and machines. These values are observations from these particular runs, not universal performance guarantees.

---

## Task 1 — Block the loop, then fix it

### Results

| Metric | Before (`before.txt`) | After (`after.txt`) |
| --- | ---: | ---: |
| Requests sent | 353 | 353 |
| Responses received | 353 | 353 |
| Failed / no answer | 0 | 0 |
| Fastest response | 1.2 ms | 1.2 ms |
| Slowest response | **19,831.1 ms** | **28.2 ms** |
| Average response | 6,067.3 ms | 2.5 ms |
| Requests over 200 ms | 194 | 0 |

**Interpretation**

- **Before:** A synchronous CPU-bound busy loop occupied the main thread for about 20 seconds. Requests that arrived during a block could not be processed until the loop finished. The slowest observed request took 19,831.1 ms, and 194 requests exceeded 200 ms.
- **After:** The CPU-bound job ran in a Worker Thread, leaving the main thread available to handle HTTP requests. The slowest observed response was 28.2 ms, and no requests exceeded 200 ms.
- Both runs received all 353 responses, so this experiment primarily demonstrates severe **latency**, rather than failed requests.
- The measurements are from separate runs. The difference between them is large and consistent with the intended effect of moving CPU-bound JavaScript away from the event-loop thread.

### Questions

**1. Why do requests wait while the loop is computing?**

Node.js executes JavaScript callbacks on the main thread. That thread also runs the event loop, which processes incoming HTTP sockets, invokes request handlers, and runs timers and promise callbacks. A synchronous `while` loop that runs for 20 seconds does not return control to the event loop. Node therefore cannot process requests during that interval. The operating system may accept and buffer TCP data, but the JavaScript request handler cannot run until the main thread is free. The client sees this as high latency.

**2. Why does `setTimeout(20_000)` not reproduce the bug?**

`setTimeout` schedules a callback to run later and returns immediately; it does not keep the main thread busy for 20 seconds. While waiting for the timer, the event loop can continue processing HTTP requests. The bug requires synchronous CPU work that occupies the main thread, such as a busy loop.

### Responsiveness versus computation time

The job did not become faster: each completed job in the worker log still reports `elapsedMs=20000`. The improvement is **server responsiveness**, not the duration of the CPU computation. With the worker approach, `/api` can respond while the job runs on another thread.

### When is a Worker Thread the wrong tool?

- **I/O-bound work:** Database, HTTP, and file operations should generally use asynchronous APIs where available; a worker may add unnecessary overhead.
- **Very short tasks:** Starting workers and exchanging messages have costs. Creating a new worker for every small task is usually inefficient.
- **Native asynchronous APIs:** APIs such as `crypto.pbkdf2` already offload their native work to libuv's thread pool.
- **CPU/resource constraints:** Workers compete for CPU resources. If the machine is saturated, responsiveness or total throughput may still be affected.
- **Work requiring process-level isolation or multi-machine scaling:** Separate processes, a job queue, or a distributed worker system may be more appropriate depending on the reliability and scaling requirements.

---

## Task 2 — Make event-loop delay visible

The server uses `monitorEventLoopDelay({ resolution: 10 })` from `node:perf_hooks`. It reports the histogram maximum every second and resets the histogram after each report. Values are converted from nanoseconds to milliseconds.

### Results from the captured server logs

| Evidence file | Observed maximum event-loop delay | What the log shows |
| --- | ---: | --- |
| `lag-before.txt` | **20,032.00 ms** | Multiple 20-second blocking jobs; the log also shows a later `block:start` near the end |
| `lag-after.txt` | **58.36 ms** | Two completed worker jobs, each reporting `elapsedMs=20000`; a third job started before shutdown |

The blocking log also includes a later maximum of `20,015.22 ms`. The largest value in the captured `lag-before.txt` file was `20,032.00 ms`. In the captured worker log, the largest event-loop-delay report was `58.36 ms`.

Normal measurements are not zero because `monitorEventLoopDelay` samples on a timer; the configured 10 ms resolution and normal scheduling jitter contribute to the observed values. Actual values depend on system load and timing.

### Why does the monitoring log stop during a block?

The reporting callback uses a timer, and the event-loop delay monitor also depends on event-loop scheduling. Both need the main thread to run JavaScript callbacks. During a synchronous busy loop, those callbacks cannot execute, so no periodic report is printed until the loop releases the thread.

### Why is the pause evidence of blocking?

A missing stretch in a log that normally reports about once per second shows that the callback could not run on schedule. Immediately after a block, the histogram can report a very large maximum because a timer was delayed by approximately the duration of the block. In the worker mode, the main thread remains available to run the monitoring callback while the CPU job runs on the worker, so the recorded delay stays much lower.

The log files were captured in separate runs from the Probe files, so their timestamps should not be treated as a single synchronized trace. They independently demonstrate the blocking and worker behavior.

---

## Task 3 — Async native work and the libuv thread pool

`src/pool.mjs` starts eight `crypto.pbkdf2` calls using SHA-512, 200,000 iterations, and a 64-byte key, while also printing a heartbeat intended to run every 100 ms.

### Results from the local evidence

| `UV_THREADPOOL_SIZE` | Total time for 8 hashes (ms) | Average per hash: total / 8 (ms) | Average completion time per hash (ms) | Largest observed heartbeat gap (ms) |
| ---: | ---: | ---: | ---: | ---: |
| 1 | 634 | 79 | 352 | 111 |
| 2 | 347 | 43 | 216 | 112 |
| 4 | 258 | 32 | 181 | 116 |
| 8 | 187 | 23 | 159 | 107 |

The pool logs report 12 available CPU cores and Node.js v22.23.2. In this particular set of runs, total time decreased as the pool size increased from 1 to 8. This is an observed result from one run per setting, not proof that every workload or machine will scale the same way. For reliable benchmarking, repeat each setting several times under similar system conditions and compare the results.

### Questions

**1. Did the heartbeat stay on time? What does that tell us about the event loop?**

The largest observed heartbeat gaps ranged from 107 to 116 ms, close to the 100 ms target. Small delays are expected because of timer scheduling, system load, and callback execution. This suggests that the main event loop remained responsive while the native `pbkdf2` work ran in the libuv thread pool. It contrasts with the synchronous JavaScript busy loop, which prevented the event loop from running.

**2. Why does total time change when the pool size changes?**

The eight `pbkdf2` operations are submitted to libuv's thread pool. A pool with one thread processes at most one of these operations at a time; a larger pool can run more of them concurrently. On a machine with available CPU capacity, that can reduce total elapsed time. The benefit depends on the workload, CPU resources, system load, and overhead. More threads do not guarantee a proportional speedup.

**3. Why does `UV_THREADPOOL_SIZE` not fix Task 1?**

The Task 1 busy loop is ordinary synchronous JavaScript running on the main thread. It is not automatically submitted to libuv's thread pool, so increasing the pool size does not move it off the event loop. To run CPU-bound JavaScript away from the main thread, use a Worker Thread or a separate process.

**4. What is the default thread-pool size?**

The default libuv thread-pool size is 4 threads. `UV_THREADPOOL_SIZE` can change it, and the variable must be set before the Node.js process starts. The experiment explicitly sets the size for each run.

---

## What I learned

- Node.js runs JavaScript callbacks on the main thread, which also runs the event loop. Synchronous CPU-heavy code on that thread delays HTTP handlers, timers, and other callbacks.
- A server can have very high latency without returning failed requests. Client-side measurement is important because it records how long a request actually waited.
- `monitorEventLoopDelay` helps quantify scheduling delays. In these captured logs, the maximum was 20,032.00 ms in blocking mode and 58.36 ms in worker mode.
- A Worker Thread does not make the CPU job itself take less time. It moves CPU-bound JavaScript away from the event-loop thread, improving the server's ability to respond while the job runs.
- Asynchronous native APIs such as `crypto.pbkdf2` use libuv's thread pool for their native work; their JavaScript callbacks still run on the main thread.
- Increasing `UV_THREADPOOL_SIZE` can improve concurrent native work when CPU resources are available, but it does not solve synchronous JavaScript blocking.
- Measurements depend on the machine and current system load. The evidence should be interpreted as the results of these specific runs, not as universal performance guarantees.
