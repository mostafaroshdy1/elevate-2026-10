
# Task 1 - Streams

## 1. Why can readFile consume all RAM with an 8GB file while Streams cannot?

readFile loads the entire file into memory before processing it.

An 8GB file may require at least 8GB of RAM.

Streams process data in small chunks instead of loading the entire file into memory.

Therefore, memory consumption remains relatively low.

## 2. What is Backpressure and how does drain solve it?

Backpressure happens when a Writable Stream cannot process data as fast as a Readable Stream produces it.

When writable.write() returns false, we should stop writing temporarily.

The drain event indicates that the Writable Stream is ready to receive more data.

This prevents excessive memory consumption.

## 3. Why use pipeline() instead of pipe()?

pipe() connects streams together, but handling errors and cleaning up all connected streams requires additional work.

pipeline() handles errors and destroys connected streams when a failure occurs.

It also provides a Promise API through node:stream/promises, allowing us to use async/await.

## 4. Why doesn't setTimeout stop compression, and how can AbortController cancel it?

setTimeout only schedules a callback. It does not automatically stop an ongoing stream operation.

AbortController provides an AbortSignal that can be passed to pipeline().

Calling controller.abort() signals pipeline() to cancel the operation and clean up its streams.

## pipe() vs pipeline()

| pipe() | pipeline() |
|---|---|
| Connects streams | Connects streams |
| Requires manual error handling | Handles errors |
| Manual cleanup may be needed | Handles stream cleanup |
| Does not return a Promise | Supports Promise API |
| No built-in AbortSignal option | Supports AbortSignal |

# Task 2 — Worker Mean Temperature

## 1. Why is mean calculation CPU-bound?

Calculating the mean requires iterating over a large number of
temperatures and summing them.

This is CPU-intensive work. Running it on the main thread can
block the Event Loop and delay incoming requests.

A Worker Thread performs this calculation separately, keeping
the main thread responsive.

## 2. Why use SharedArrayBuffer?

By default, postMessage uses the structured clone algorithm
to transfer data between threads.

Sending large arrays of objects can introduce copying and
memory overhead.

SharedArrayBuffer allows both threads to access the same
underlying memory without copying the data.

## 3. SharedArrayBuffer vs TransferList

SharedArrayBuffer shares memory between threads.

TransferList transfers ownership of transferable objects,
such as ArrayBuffer, to another thread.

After transferring an ArrayBuffer, the original buffer
becomes detached and cannot be used normally.

## 4. Worker Pool

Creating a new Worker for every request introduces startup
overhead.

A Worker Pool reuses existing workers and queues incoming jobs.

MAX_ALLOWED_WORKERS is currently set to 1.

Increasing it allows more jobs to run concurrently, depending
on available CPU resources.

## 5. What still runs on the main thread?

The main thread still handles:

- HTTP requests and responses.
- Query validation.
- SharedArrayBuffer allocation.
- Random temperature generation.
- Sending jobs to workers.

The next improvement would be moving data generation into
a Worker Thread as well.

## 6. Worker errors

The Worker Pool listens for error and exit events.

If a worker fails:

- It is removed from the pool.
- Its pending job is rejected.
- A replacement worker is created.
- Queued jobs continue processing.