# Session 2 - Streams and Workers

## How to run

Use Node.js 22.18 or newer. Tests used Node.js 24.11.0 on Windows.
This project uses JavaScript and built-in Node.js modules only.
There are no extra packages to install.
Run commands from this folder.

### Streams

The data files are not included in Git. Generate one million rows first:

```powershell
npm install
npm run generate
$env:INPUT_FILE = 'data/cities-00000.ndjson'
npm run stats
npm run gzip
Remove-Item Env:INPUT_FILE
```

The generator uses the same data layout and batch idea as the course generator.
It writes one million rows, not the default 100 million rows in the course file.
It records the expected results while making the file.
The statistics script reads the file separately to check those results.
The original course files were not changed.

The generator and gzip script refuse to overwrite an existing output file.
Generate the data once. For another gzip run, set OUTPUT_FILE to a new path.
INPUT_FILE can point to another NDJSON file for the statistics or gzip script.

### Workers

```powershell
npm run demo
npm start
```

The demo uses two cities with temperatures 20 and 30. The result must be 25.
The server runs at http://localhost:3000. Stop other servers on port 3000 first.

- GET /cities/mean-temperature?count=1000 returns the mean for 1000 random cities.
- GET /cities/mean-temperature uses one million cities by default.
- GET /health returns {"ok":true}.

count must be a whole number from 1 to 5,000,000.
The limit avoids one request creating an extremely large buffer.
Press Ctrl+C to stop the server and its workers.

## Task 1 - Streams

### Statistics results

The input file had 1,000,000 rows and 78,970,320 bytes.

| Result | Value |
| --- | ---: |
| Rows | 1,000,000 |
| Average temperature | 12.5 |
| Minimum temperature | -10 |
| Maximum temperature | 35 |

These results matched the values recorded during file generation.
The script printed progress every 10 percent of file bytes.
This measures bytes read, not rows processed. The final results are printed
only after all lines have been processed.

The script uses createReadStream and readline. It parses one line at a time.
It keeps only the count, sum, minimum, and maximum for the result.
It does not keep an array of all cities.

### Why can reading the whole file run out of memory?

The course readFileInBulk function loads the whole file as text. It then makes
an array of lines and an array of objects. These copies need more memory than
the file alone. An 8 GB file can exceed the available memory or Node.js limits.
A stream reads smaller parts. It does not need the whole file in memory.

### What is backpressure?

Backpressure means the next stage cannot accept more data at the current rate.
The sender should pause instead of keeping a large queue in memory.

In the generator, write(chunk) returns false when the sender should wait.
The chunk was accepted. It should not be sent again.
await once(stream, 'drain') waits until more data can be sent.
This limits buffered data. It does not mean the whole file is finished.

### Gzip results

| File | Size in bytes |
| --- | ---: |
| Original | 78,970,320 |
| Gzip | 16,585,207 |

The program uses await pipeline(read stream, gzip stream, write stream).
It prints done only after the pipeline succeeds.
A streaming SHA-256 comparison of the original and the decompressed content
also matched. The original file was kept.
The evidence file lists both file sizes, like a file listing would.

### Why does main-final.ts print success too early?

.pipe() connects the streams and starts data flow. It returns before the whole
file has been written. The next console.log runs without waiting for that work.
The normal try/catch around .pipe() also does not catch later stream errors.

### Why use pipeline instead of only .pipe()?

.pipe() handles data flow and backpressure. By itself, it does not give one
Promise for the whole job or clean up all stages on every stream error.
The promise version of pipeline waits for completion, passes errors to the
caller, and destroys streams on failure.

### What is the difference between finish and pipeline?

finish is an event on the writable stream. It says that writable has finished
processing the data sent to it after end(). It does not handle every error in
all earlier stages by itself. It is not a guarantee of a physical disk flush.
await pipeline follows the whole chain and rejects if a stage fails.

### Why does the five-second timeout not stop gzip?

In main.ts, the timer rejects Promise.all. This reports a failure, but does not
cancel the running pipeline. The pipeline can keep working in the background.
To cancel it, pass an AbortController signal to pipeline and call abort().
The timer should be cleared when the job ends. No timeout was needed for this
local gzip run, so the script lets it finish normally.

## Task 2 - Workers

### What changed from the course example?

The course example builds an array of city objects, copies the fields into a
shared buffer, and builds objects again in the worker.
This version writes the four numeric fields directly into a Float64Array backed
by a SharedArrayBuffer. The worker reads the temperature fields directly.
No CityWeather object array is built on either side.

The request ID, pending-request Map, worker messages, and reusable worker idea
come from the course example. This version uses node:http instead of Express
and JavaScript .mjs files instead of TypeScript.
It also checks count, cleans up requests when the client disconnects, and
handles worker error and exit events.

### Data flow

Request -> read count -> write random city values into shared memory -> send
its Float64Array view and request ID to the worker -> worker computes the mean
-> worker sends the mean and request ID back -> server replies.

Each city uses four numbers: ID, latitude, longitude, and temperature.
Each Float64 number takes 8 bytes. Two cities need 2 * 4 * 8 = 64 bytes.
The worker reads temperature at indexes 3, 7, 11, and so on.

### Mean result

The saved request used count=1000 and returned HTTP 200 with a mean of 12.515.
New requests can return different means because the city data is random.
The two-city demo returned 25. A separate check on the same 1000 generated
cities matched the worker result with a calculation on the main thread.

### Why does the calculation belong in a worker?

Adding many temperatures is CPU work. On the main thread, a long calculation
can delay request handlers, as in Session 1. A worker runs the calculation on
another thread so the main thread can handle other requests during that part.

### What does postMessage copy?

By default, postMessage uses structured cloning for message data.
Copying a million objects costs time and memory.
A view over SharedArrayBuffer lets the receiver access the same backing memory.
The message and view still have some overhead, but the large buffer contents
are shared instead of copied.
The main thread finishes writing the data before sending the job, and does
not change it while the worker reads it.

### Sharing versus transferring

SharedArrayBuffer lets both threads access the same bytes.
It is useful when both sides need access, with a clear rule for reading and
writing. Concurrent changes may need Atomics or another coordination method.

Transferring an ArrayBuffer moves ownership to the receiver. The sender can no
longer use that buffer. Use it when only the receiving thread needs the data.
A SharedArrayBuffer is shared, not passed in a transfer list.

### Why use a pool?

Starting a new worker for every request costs time and memory.
The pool keeps a worker ready for later jobs. MAX_ALLOWED_WORKERS is 1 here.
If raised, the code can create more workers and assign requests in rotation.
More jobs could run at once, but workers use more CPU and memory.
A larger pool does not remove main-thread data generation.

### Health test

A request for five million cities finished after 238.38 ms.
Five health requests were sent while it was pending.

| Health request | Response time (ms) | Arrived before the mean response |
| --- | ---: | --- |
| 1 | 202.07 | Yes |
| 2 | 188.34 | Yes |
| 3 | 173.53 | Yes |
| 4 | 159.63 | Yes |
| 5 | 145.69 | Yes |

The health replies arrived before the mean reply, but were not immediate.
The main thread still generates all the random city data synchronously.
That can delay health requests before the worker starts its calculation.
The timings include local client, connection, and scheduling overhead too;
they are not a separate measurement of generation time.

### What still runs on the main thread?

Reading requests, checking count, allocating the buffer, generating city data,
managing pending requests, and sending replies run on the main thread.
A next improvement would be to move generation into a worker too, or generate
in smaller batches that let the event loop run between batches.

### What happens when a worker fails?

The server listens for error and exit. It removes that worker from the pool.
It sends HTTP 500 to requests waiting for that worker and removes their Map
entries. The next request creates a replacement worker.
A client disconnect also removes its pending entry.
A failed request is not retried automatically.

Separate test processes made the first worker throw or exit before replying.
In both tests, the pending request received HTTP 500, health returned HTTP 200,
and the next mean request succeeded with HTTP 200 using a replacement worker.
No failure endpoint was added to the normal server.

## What I learned

Streams can process large files without keeping the whole file in memory.
Backpressure slows the sender when the next stage needs time.
Starting a stream is different from waiting for it to finish.
Shared memory avoids a large copy between the main thread and a worker.
A worker helps only with the work moved into it. Generation on the main thread
can still delay requests. Worker failures need cleanup for pending requests.

## Evidence files

- generate-data.txt: expected statistics recorded while generating the data.
- stream-stats.txt: statistics from reading the generated file.
- stream-gzip.txt: completion and original/compressed sizes.
- worker-mean.txt: response for 1000 cities.
- worker-health.txt: timings during a five-million-city request.
- worker-errors.txt: worker failure and replacement checks.

Large data files, gzip files, node_modules, and .env files are not submitted.
