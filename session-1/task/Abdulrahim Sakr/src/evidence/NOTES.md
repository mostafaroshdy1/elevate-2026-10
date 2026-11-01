# Task 3 - Async I/O is not parallel JavaScript

## Experiment

I used `crypto.pbkdf2` to run 8 hashing operations at the same time.

All operations used the same inputs:

- Iterations: 200,000
- Key length: 32
- Digest: sha256

I also added a heartbeat using `setInterval` to print a message every 100ms while the hashes were running.

I repeated the experiment with different `UV_THREADPOOL_SIZE` values.

## Results

| Thread Pool Size | Total Time (ms) | Average per Hash (ms) |
|---:|---:|---:|
| 1 | 300.1029 | 37.5129 |
| 2 | 157.7022 | 19.7128 |
| 4 | 107.0662 | 13.3833 |
| 8 | 129.8459 | 16.2307 |

Average time per hash = Total time / 8.

## Questions

### 1. Does the heartbeat stay on schedule? What does it tell you about the Event Loop?

The heartbeat kept running while the PBKDF2 operations were executing.

It may not run at exactly every 100ms, but it continued to print messages during the hashing process.

This shows that the Event Loop was still working and the Main Thread was not blocked by these asynchronous operations.

### 2. Why does total time change with pool size?

Because PBKDF2 uses the libuv thread pool to perform the hashing work.

With a pool size of 1, the operations take more time because they cannot all run at the same time.

When I increased the pool size to 2 and then 4, the total execution time became shorter.

However, using 8 threads was not faster than using 4. This can happen because of CPU limitations and the overhead of managing more threads.

### 3. Why doesn't UV_THREADPOOL_SIZE fix Task 1?

In Task 1, I used a synchronous busy loop that runs directly on the Main Thread.

Changing `UV_THREADPOOL_SIZE` does not move JavaScript code to another thread.

It only changes the size of the libuv thread pool, which is used by certain Node.js operations.

That's why increasing the pool size cannot solve the blocking problem in Task 1. Worker Threads are needed for that.

### 4. What is the default thread-pool size?

The default libuv thread pool size is 4 threads.