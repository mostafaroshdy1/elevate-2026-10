
## Task 1 — Block the loop, then fix it

**Why do requests wait while the loop is computing?**

The JavaScript busy loop runs on Node's main thread. While it is running, Node cannot run the /api handler or other JavaScript callbacks. Requests wait until the loop is free.

**Why doesn't setTimeout(20_000) reproduce the bug?**

setTimeout schedules code to run later but lets Node do other work while waiting. A synchronous while loop is needed to keep the main thread busy.

**Did the job get faster after moving it to a worker? What improved?**

The CPU job still takes about 20 seconds. The server responds faster because the worker does the calculation on a separate thread, leaving the main thread free to handle /api. Add the actual timings from evidence/before.txt and evidence/after.txt after running the tests.

**When would a worker be the wrong tool?**

For normal asynchronous I/O, such as waiting for a network or database response, a worker is usually unnecessary. Worker threads are useful for CPU-heavy JavaScript.

## Task 2 — Make the lag visible

**Why does the monitoring log stop during the block?**

The monitoring timer also needs the main event loop to run. During the busy loop, its callback cannot run.

**Why is that pause evidence that the loop was blocked?**

The timer is delayed until the loop finishes. The maximum delay should show a large value after the blocked period. Measurements depend on the computer.

## Task 3 — Async I/O is not parallel JavaScript

**Does the heartbeat stay on time? What does that tell you?**

The heartbeat should keep printing while the asynchronous PBKDF2 jobs run. That shows the main event loop is still free to run JavaScript callbacks, although the heartbeat may not be exactly every 100 ms.

**Why does total time change with the pool size?**

The eight PBKDF2 calls use libuv's thread pool. With a larger pool, more calls can run at the same time, depending on the CPU and system load.

**Why doesn't UV_THREADPOOL_SIZE fix Task 1?**

The busy loop is JavaScript running on the main thread. The libuv pool does not move that JavaScript to another thread. A worker thread is used for that.

**What is the default pool size?**

The default libuv thread-pool size is 4 threads.

## Pool-size results

Run the four commands and enter the times printed on your computer.

| UV_THREADPOOL_SIZE | Total time for 8 hashes (ms) | Average per hash (ms) |
|---:|---:|---:|
| 1 | TODO | TODO |
| 2 | TODO | TODO |
| 4 | TODO | TODO |
| 8 | TODO | TODO |

## What I learned

A synchronous CPU-heavy loop blocks Node's main JavaScript thread. A worker can run that CPU work separately so the server can still answer requests. Async native work such as PBKDF2 uses libuv's thread pool, which is different from the main JavaScript thread.














