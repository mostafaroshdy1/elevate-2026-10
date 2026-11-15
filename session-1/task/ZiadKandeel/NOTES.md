
# Task 1 - Blocking vs Worker Thread

## 1. Before Worker

The CPU-intensive job runs synchronously on the Main Thread.

- The job starts 10 seconds after the server starts.
- It runs for approximately 20 seconds.
- During this time, the Event Loop cannot process incoming HTTP requests.
- Requests accumulate and their response times become very high.

## 2. After Worker

The CPU-intensive job runs inside a separate Worker Thread.

- The Worker starts 10 seconds after the server starts.
- It runs the CPU-intensive loop for approximately 20 seconds.
- The Main Thread remains available to handle HTTP requests.
- The Worker sends its result back using `parentPort.postMessage()`.
- The result contains the number of iterations and the elapsed execution time.
- The server stores the latest result in `lastResult` and exposes it through the `/api` endpoint.

## 3. Worker Management

- Worker errors are handled using the `error` event.
- Worker termination is monitored using the `exit` event.
- The current Worker is terminated when the server receives `SIGINT` or `SIGTERM`.
- A Worker is created for each scheduled job, not for every HTTP request.

## 4. Comparison

### Before Worker

- Requests experienced very high latency.
- Example response time: approximately 18,140 ms.

### After Worker

- Requests were handled without waiting for the CPU-intensive job.
- Most response times were around 17 ms.

## 5. Conclusion

Moving CPU-intensive work to a Worker Thread prevents it from blocking the Main Thread and allows the server to handle incoming requests while the job is running.









## Task 2 — Event Loop Delay Monitoring

### Why does the monitoring log stop during the block?

The monitoring log stops because the blocking job runs synchronously on the Main Thread for 20 seconds.

During this time, the Main Thread cannot execute other callbacks, including the monitoring `setInterval` callback.

### Why is that pause itself evidence that the loop was blocked?

The monitoring interval is scheduled to execute every second.

When the Main Thread is blocked, the callback cannot execute at its scheduled time.

After the blocking job finishes, the callback executes and the histogram reports a large delay.

This confirms that the Event Loop was blocked.

### Results

**Before Worker:**
- Maximum Event Loop Delay: approximately 20,015 ms.
- Monitoring logs stopped during the blocking job.

**After Worker:**
- Maximum Event Loop Delay: approximately 91.75 ms.
- Monitoring logs continued while the Worker was running.

### Conclusion

Moving the CPU-intensive job to a Worker Thread prevents the Main Thread from being blocked and keeps the Event Loop responsive.






## Task 3 — Async I/O and libuv Thread Pool

### 1. Does the heartbeat stay on time? What does this tell us about the Event Loop?

Yes, the heartbeat continues running while the PBKDF2 operations are executing.

This shows that asynchronous PBKDF2 operations do not block the Main Thread because the actual hashing work runs in the libuv Thread Pool.

### 2. Why does total time change when the pool size changes?

Increasing the Thread Pool size allows more PBKDF2 operations to execute concurrently.

With a pool size of 1, operations execute one after another.

With larger pool sizes, multiple operations can execute at the same time, reducing the total execution time.

### 3. Why doesn't UV_THREADPOOL_SIZE fix Task 1?

Because Task 1 uses a synchronous JavaScript busy loop.

Synchronous JavaScript runs on the Main Thread and blocks the Event Loop.

UV_THREADPOOL_SIZE only controls the libuv Thread Pool. It does not move synchronous JavaScript code away from the Main Thread.

### 4. What is the default libuv Thread Pool size?

The default libuv Thread Pool size is 4 threads.