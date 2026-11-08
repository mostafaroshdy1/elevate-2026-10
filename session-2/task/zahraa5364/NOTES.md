# Notes — Session 2

## Task 1
1. `readFile` materializes the complete file (and decoded string/parsed objects) in memory. Streaming keeps only bounded chunks and the current line/aggregates.
2. Backpressure is flow control: a writable returning `false` signals the producer to wait for `drain`; this prevents queued buffers from growing without bound.
3. `pipeline` connects streams, forwards errors, destroys connected streams on failure, and its promise settles only after completion. `.pipe()` connects readable to writable but does not provide the same unified error handling or an awaitable completion signal.
4. The timeout in the example merely throws on its own timer; it does not cancel the independent stream chain. Use `AbortController` and pass its signal to `pipeline` (or destroy the streams).
5. `.pipe()` example logs success immediately because it does not await the writable's completion. `finish` indicates the writable has processed its input; `await pipeline(...)` additionally coordinates completion and errors across the chain.

## Task 2
Data flow: request -> validate count -> generate values directly into a `Float64Array` backed by `SharedArrayBuffer` -> post the view and request ID -> worker sums every fourth value (temperature) -> worker posts mean and ID -> server resolves matching pending request -> HTTP response.

1. The sum is CPU-bound because it iterates through many values; doing it on the event-loop thread delays other callbacks. A worker has its own thread and keeps that calculation off the main event loop.
2. `postMessage` normally structured-clones its payload. Cloning a million objects requires traversing and copying a large object graph. A shared buffer lets both threads view the same memory; only the small message/view metadata is sent.
3. Shared memory remains accessible to both sides and requires coordination if concurrent writes occur. Transfer moves an ArrayBuffer's ownership via `transferList`; the sender's buffer becomes detached. Use sharing for concurrent access; transfer for handing off data that the sender no longer needs.
4. A pool reuses initialized workers and avoids startup/memory cost per request. Raising the pool size can increase parallel throughput but also CPU and memory use; too many workers can hurt responsiveness.
5. Generation/random-number creation and buffer filling still run on the main thread, as do HTTP handling and JSON response work. Next, consider moving generation into a worker or distributing generation and reduction while preserving the requested shared-buffer approach.
6. A worker error/exit removes it from the pool and rejects all requests assigned to it, so they do not hang. A later request creates a replacement.

## What I learned
Streams process large input incrementally and use backpressure to bound buffering. Workers isolate CPU-heavy work from the event loop; shared buffers avoid copying large object arrays, while explicit error handling is needed to settle pending requests.
