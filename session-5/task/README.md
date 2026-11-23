# Session 5 — Friday Night Traffic

> The social app just went viral. Make the gRPC backend stream big results,
> answer hot reads from Redis, and protect itself from runaway clients —
> and prove each change with numbers.

## What you will do

| Task | What it proves |
| --- | --- |
| **0** | Warm-up: the interactive quiz ([`session-5-quiz.html`](./session-5-quiz.html)). 30 questions and 4 simulators on caching, rate limiting and gRPC. |
| **1** | The `stream` keyword in a `.proto` changes the shape of a call. Server streaming sends a large result without buffering it; client streaming uploads many records and gets one reply. |
| **2** | A cache in process memory breaks once you run two gateways. A shared Redis cache with cache-aside, explicit invalidation, ETags and stampede protection fixes it. |
| **3** | A rate limiter must keep its counters in a shared store. Fixed window is simple but lets a burst through at the window boundary; a sliding window or token bucket does not. |

**Suggested time:** 5–6 hours (the quiz takes about 30 minutes). Do the
tasks in order; each one builds on the previous one.

## Contents

- [Before you start](#before-you-start)
- [Rules](#rules)
- [Task 0 — Quiz](#task-0--quiz)
- [Task 1 — Stream it over gRPC](#task-1--stream-it-over-grpc)
- [Task 2 — Cache the hot post](#task-2--cache-the-hot-post)
- [Task 3 — Rate-limit the gateway](#task-3--rate-limit-the-gateway)
- [Bonus](#bonus)
- [Submission](#submission)
- [Common traps](#common-traps)
- [References](#references)

## Before you start

- Node.js **22.18+** (or 24+) and `pnpm`.
- The gRPC example in `session-5/code-example/grpc-microservices/`. Copy the
  whole project into your submission folder and work on the copy.
- Redis 7+. The easiest way:

  ```bash
  docker run -d --name redis -p 6379:6379 redis:7
  ```

  Check it with `docker exec -it redis redis-cli ping` (you should see `PONG`).
- [`ioredis`](https://github.com/redis/ioredis) for the gateway (see
  `session-5/code-example/cache/`).
- A load tool: `ab` (`apache2-utils`) or [`autocannon`](https://github.com/mcollina/autocannon)
  (`npx autocannon`). Optional: [`grpcurl`](https://github.com/fullstorydev/grpcurl).

Get the copy running first:

```bash
cd session-5/task/your-username/grpc-microservices
pnpm install
pnpm db:push
pnpm db:seed:bulk
pnpm dev
curl -i localhost:3009/posts/1
```

All paths below are relative to your copy, `session-5/task/your-username/grpc-microservices/`,
unless they start with `session-5/`.

## Rules

- Keep the architecture. Clients call the **gateway over HTTP**, and the
  gateway calls the **services over gRPC**. Do not let the gateway read a
  service's database.
- Every new RPC goes into the `.proto` first. Check it with
  `npx @bufbuild/buf lint` (the project's `buf.yaml` uses the `STANDARD`
  rules), then regenerate the gateway types with
  `pnpm --filter @social/gateway gen:proto`.
- Cache and rate-limit state must live in **Redis**. The only exception is
  Task 2.1, where you build the in-memory version on purpose to break it.
- Use plain `ioredis` commands. Do not use a caching or rate-limit library
  (`@fastify/rate-limit`, `cache-manager`, and so on).
- Every claim in `NOTES.md` needs evidence: a log excerpt, `curl -i` output, or
  a load-test summary saved under `evidence/`.
- Do not edit `session-5/task/README.md` or the quiz.
- Do not commit `node_modules`, `.env`, `*.db` files or build output.

## Task 0 — Quiz

Open [`session-5-quiz.html`](./session-5-quiz.html) in a browser. It runs
offline and needs no server.

- Answer all 30 questions and play with the four simulators.
- Take a screenshot of the final score screen and save it as
  `evidence/quiz-score.png`. Any score is accepted; the goal is to find what
  you have not understood yet.
- In `NOTES.md`, name the **two questions you got wrong (or guessed)** and
  explain the correct answer in your own words.

## Task 1 — Stream it over gRPC

The example only uses **unary** RPCs. Add the two one-way streaming shapes.

### 1.1 Server streaming: export all posts

`GET /posts` loads every post into one array and sends it in one response.
With 20k posts, that means one large protobuf message and one large JSON body.

1. In `posts.proto`, add:

   ```proto
   rpc StreamPosts(StreamPostsRequest) returns (stream StreamPostsResponse);

   message StreamPostsRequest {
     int32 author_id = 1;   // 0 = all authors
   }
   message StreamPostsResponse {
     Post post = 1;
   }
   ```

   Why not `returns (stream Post)`? `buf lint` requires every RPC to have its
   own request and response types, so the contract can grow later without
   affecting other RPCs.

2. In `posts-service`, implement the handler. Read the posts **in pages**
   (for example 500 at a time with `limit`/`offset` or `id > lastId`), and
   `call.write()` each post. Call `call.end()` at the end.
   - Respect backpressure: if `call.write()` returns `false`, wait for
     `drain` before you write more.
   - If the client cancels (`call.on('cancelled')`), stop reading from the
     database.
3. In the gateway, add `GET /posts/export?authorId=…`. It returns
   **NDJSON** (`Content-Type: application/x-ndjson`), one post per line,
   written as the messages arrive. Do not collect them into an array first.
4. Compare `GET /posts` with `GET /posts/export`:

   ```bash
   curl -s -o /dev/null -w "total=%{time_total}s ttfb=%{time_starttransfer}s size=%{size_download}\n" localhost:3009/posts
   curl -s -o /dev/null -w "total=%{time_total}s ttfb=%{time_starttransfer}s size=%{size_download}\n" localhost:3009/posts/export
   ```

   Save the output in `evidence/stream-posts.txt`. Add the gateway's memory
   (`process.memoryUsage().rss`) during each request if you can.

   Do not be surprised if the **total** time of the export is *higher*.
   Look at `ttfb` (time to first byte) and memory instead, and explain the
   difference in `NOTES.md`.
5. Prove that cancellation works. 20k posts fit in the buffers, so the
   stream finishes before the client can leave. Add a small delay per page
   behind an environment variable (for example `STREAM_PAGE_DELAY_MS=100`),
   then run `curl -m 0.8 localhost:3009/posts/export -o /dev/null`. The
   service log must show that it stopped early (for example
   `messages: 4000, cancelled: true`). Add this to
   `evidence/stream-posts.txt`.

### 1.2 Client streaming: bulk-import comments

1. In `comments.proto`, add:

   ```proto
   rpc ImportComments(stream ImportCommentsRequest) returns (ImportCommentsResponse);

   message ImportCommentsRequest {
     int32 post_id = 1;
     int32 author_id = 2;
     string content = 3;
   }
   message ImportCommentsResponse {
     int32 imported = 1;
     int32 failed = 2;
     repeated string errors = 3;   // keep at most 10
   }
   ```

2. In `comments-service`, read the stream. Insert in batches of 100 (not one
   INSERT per message, and not everything at the end). When the stream ends,
   reply once with the totals.
   - Tip: `for await (const msg of call)` pauses the stream while you
     `await` an insert. With `call.on('data')` and an async insert, messages
     keep arriving during the insert and you must handle that yourself.
3. In the gateway, add `POST /comments/import`. It accepts an **NDJSON** body,
   one comment per line, and forwards each line to the gRPC stream as it is
   parsed. Return the `ImportCommentsResponse` as JSON.
   - Fastify only parses JSON and plain text bodies by default, so an
     `application/x-ndjson` request gets **415**. Register a parser that
     passes the raw stream through:
     `app.addContentTypeParser("application/x-ndjson", (_req, payload, done) => done(null, payload))`.
     Then read `req.body` line by line (for example with `node:readline`).
   - A bad line (invalid JSON or a missing field) counts as `failed`. It must
     not kill the whole import.
4. Generate a 10,000-line file with a small script and import it. Save the
   command and the response in `evidence/import-comments.txt`.

### 1.3 Logging still works

`withRequestContext()` in each service was written for **unary** handlers:

- Its type only accepts `(call: ServerUnaryCall, callback)`, so
  `pnpm typecheck` fails as soon as you add a streaming handler. (`pnpm dev`
  still runs, because `tsx` does not typecheck.)
- It logs when the `callback` is called. A client-streaming handler has a
  callback, so it gets logged. A server-streaming handler has **no**
  callback, so it is never logged.

Fix the wrapper so `pnpm typecheck` passes and **every** RPC logs one line per
call: `service`, `method`, `requestId`, `code`, `durationMs`, plus `messages`
(how many messages were streamed) for the streaming RPCs. Show one log line
for each new RPC in `evidence/stream-logs.txt`.

### 1.4 Explain

Answer in `NOTES.md`:

1. Which of the four RPC types did you use for each endpoint, and why not
   unary?
2. What happens in the gateway if the HTTP client disconnects halfway through
   `/posts/export`? How did you make sure the service stops reading?
3. Why can a browser not call `StreamPosts` directly? What would you need to
   make it possible?
4. Your gateway keeps **one** channel per service. HTTP/2 multiplexes all
   calls over it. What does that mean for a load balancer in front of three
   `posts-service` replicas?

## Task 2 — Cache the hot post

`GET /posts/:id` is the hottest route. Each call fans out to several gRPC
calls: `GetPost`, `ListCommentsByPost`, then one `GetUser` for the author and
one for **each comment's author**. With the bulk seed, that is usually 7–8
calls. Count them in the service logs with one `x-request-id`:

```bash
curl -s -H 'x-request-id: before-cache' localhost:3009/posts/1 > /dev/null
```

### 2.1 Break it on purpose: the in-memory cache

1. Add a `Map`-based cache to the gateway for `GET /posts/:id` with a 60 s TTL.
   Add an `X-Cache: HIT | MISS` response header.
2. Run **two** gateways on different ports (`PORT=3009` and `PORT=3010`).
   This is what you get behind a load balancer.
3. Show the bug:
   - `GET /posts/1` on both ports (both now cache it);
   - `PATCH /posts/1` with a new title through port 3009, and clear 3009's
     cache;
   - `GET /posts/1` on port 3010 → the **old title**, with `X-Cache: HIT`.
4. Save the `curl -i` sequence in `evidence/inmemory-stale.txt`.

### 2.2 Redis cache-aside

Replace the `Map` with Redis. Put the cache code in its own module (for
example `src/cache.ts`) so the route handler stays readable.

- **Read path (cache-aside):** check `post:{id}:full`. On a miss, make the
  gRPC calls, store the JSON with `SET … EX`, and return it.
- **TTL with jitter:** base TTL 60 s ± up to 10 s random, so that hot keys do
  not all expire together.
- **Explicit invalidation:** delete the key on
  - `PATCH /posts/:id` and `DELETE /posts/:id`;
  - `POST /posts/:postId/comments` and `DELETE /comments/:id` (the comment
    list is part of the cached value). Note that `DELETE /comments/:id` does
    not tell the gateway which post the comment belonged to. Find a way: for
    example, change `DeleteCommentResponse` to return the deleted comment's
    `post_id`;
  - `PATCH /users/:id`: the cached value contains the **author's** user and
    the user of **every commenter**. Think about how you find every cached
    post that mentions that user. Write your choice and its cost in
    `NOTES.md`. A Redis set `user:{id}:posts` filled when you cache a post,
    versioned keys, and "only TTL" are all acceptable if you explain them.
- **Redis down:** if Redis fails, log a warning and serve from gRPC. The cache
  must never take the API down.

Repeat the 2.1 sequence with both gateways. Port 3010 must now return the
**new** title. Save the output in `evidence/redis-fresh.txt`.

### 2.3 Measure it

With `pnpm db:seed:bulk` data:

```bash
ab -n 5000 -c 50 -k http://localhost:3009/posts/1    # cache disabled
ab -n 5000 -c 50 -k http://localhost:3009/posts/1    # Redis cache enabled
```

Add a `CACHE=off` environment flag so you can switch. Save both summaries in
`evidence/bench-cache.txt`, and in `NOTES.md` compare requests per second,
mean latency and **p99**.

### 2.4 Let the browser cache it: ETag + 304

For `GET /posts/:id`:

- Send `Cache-Control: private, max-age=10` and an `ETag` (for example a
  short hash of the JSON body).
- If the request has `If-None-Match` equal to the current ETag, answer
  **`304 Not Modified`** with an empty body.

```bash
curl -i localhost:3009/posts/1
curl -i -H 'If-None-Match: "<etag from above>"' localhost:3009/posts/1
```

Save both in `evidence/etag.txt`. In `NOTES.md`, explain why this route is
`private` and not `public`, and what `no-store` would mean for it.

### 2.5 Stop the stampede

1. Write `services/gateway/scripts/stampede.ts` and run it from the gateway
   folder with `node --import tsx scripts/stampede.ts`. (Keep scripts inside
   `services/gateway/`: pnpm installs `ioredis` there, so a script at the
   workspace root cannot import it.) It deletes `post:1:full` and then fires
   **200 concurrent** `GET /posts/1` requests, each with its own
   `x-request-id` such as `stampede-17`.
2. Count how many `GetPost` RPCs reached `posts-service` (grep the service
   logs for `stampede-`). Without protection, it will be close to 200.
3. Add **lock-on-miss** (single-flight):
   - the first request to miss takes a lock with
     `SET lock:post:1 <token> NX PX 5000` and rebuilds the value;
   - the others wait briefly (poll the key every 25–50 ms, up to a limit) and
     then read the cached value;
   - only the owner releases the lock (compare the token before `DEL`).
4. Run the script again. The `GetPost` count should be **1** (or very close).

Save the before/after counts in `evidence/stampede.txt`.

### 2.6 Explain

Answer in `NOTES.md`:

1. Draw (ASCII is fine) the four cache layers in front of this app. Which
   layer answered each of these: the 304, the `X-Cache: HIT`, and a request
   that never left the browser?
2. Why did the in-memory cache serve stale data on port 3010? Give two more
   problems with per-process caches besides staleness.
3. Cache-aside, write-through, write-around: which one did you build? When
   would write-through be the better choice for this app?
4. Why is a TTL still needed when you invalidate explicitly?
5. Compare jitter, lock-on-miss and early refresh. Which problem does each
   one solve?

## Task 3 — Rate-limit the gateway

Protect the gateway from one noisy client. Identify the client by the
`x-api-key` header, or by IP if the header is missing.

### 3.1 Fixed window in Redis

Write a Fastify `onRequest` hook:

- key `rl:{client}:{windowStart}`, `INCR` it, and set `EXPIRE` on the first
  hit;
- limit: **20 requests per 10 seconds** per client (use environment
  variables);
- every response carries `X-RateLimit-Limit`, `X-RateLimit-Remaining` and
  `X-RateLimit-Reset`;
- over the limit: **`429 Too Many Requests`** with a `Retry-After` header and
  a JSON body;
- `/health` is never limited.

Prove the limit is **shared** across both gateways: send 30 requests
alternating between ports 3009 and 3010 with the same API key. Exactly 20
succeed. Save it in `evidence/ratelimit-shared.txt`.

Then make `INCR` + `EXPIRE` atomic (a `MULTI` transaction or a small Lua
script). In `NOTES.md`, explain what could go wrong if the process crashes
between the two commands.

Add a switch to turn the limiter off (for example `RL_ALGO=off`). With the
limiter on, `ab` and `stampede.ts` from Task 2 mostly get 429s, so turn it off
whenever you re-run Task 2 evidence.

### 3.2 Catch the boundary burst

Write `services/gateway/scripts/boundary-burst.ts` (use a fresh
`x-api-key` on each run so earlier runs do not count):

- wait until about 0.5 s before a window ends;
- send 20 requests, wait for the new window, then immediately send 20 more.

With a fixed window, about **40** requests succeed in about 1 second, which is
2× the limit. Save the output in `evidence/burst-fixed.txt`.

### 3.3 A better algorithm

Implement **one** of these, selected with `RL_ALGO=sliding|token`:

- **Sliding window log:** a Redis sorted set per client (`ZADD` now,
  `ZREMRANGEBYSCORE` older than 10 s, `ZCARD`). It must be atomic: use Lua
  or `MULTI`.
- **Token bucket:** capacity 20, refill 2 tokens/second. Store
  `{tokens, lastRefill}` in a hash and update it atomically with a Lua script.

Run `boundary-burst.ts` again and save the result in
`evidence/burst-<algo>.txt`. The burst should be blocked.

### 3.4 Explain

Answer in `NOTES.md`:

1. Why must the counters live in Redis and not in a `Map` in each gateway?
   Connect this to Task 2.1.
2. Why does `INCR` stay correct with two gateways sending at the same time?
3. Which algorithm did you choose in 3.3, and for which kind of client would
   the other one be better?
4. The deck says to enforce limits "at the edge". Where is the edge in this
   app? Name one limit you would put in the gateway and one you would put on
   an **outbound** call.
5. Rate limiting is one layer. Name the other layers of API protection and the
   attack each one stops.

## Bonus

Pick any. Bonus work does not replace the main tasks.

- **Bidirectional streaming:** `rpc LiveComments(stream CommentEvent) returns (stream CommentEvent)`.
  Clients send new comments and receive everyone else's in real time. Test it
  with two terminal clients.
- **Rate-limit an outbound call:** limit the gateway's calls to `users-service`
  with a token bucket, as if it were a paid third-party API.
- **Versioned keys:** replace explicit deletes for user changes with
  `user:{id}:v{n}` keys and compare the two approaches.
- **Deadlines:** add a 300 ms deadline to every gateway → service call, and
  map `DEADLINE_EXCEEDED` to `504`.

## Submission

Submit your work as a **pull request** to the course repository:

**Repository:** <https://github.com/mostafaroshdy1/elevate-2026-10>

### 1. Create a branch

```bash
git checkout main
git pull
git checkout -b session-5/your-username
```

Replace `your-username` with your GitHub username. If you do not have write
access, fork the repository first and create the branch in your fork.

### 2. Add your work

```text
session-5/task/your-username/
  NOTES.md
  grpc-microservices/        # your copy of the example, with your changes
    proto/...
    services/
      gateway/
        scripts/
          stampede.ts
          boundary-burst.ts
        src/...
      ...
  evidence/
    quiz-score.png
    stream-posts.txt
    import-comments.txt
    stream-logs.txt
    inmemory-stale.txt
    redis-fresh.txt
    bench-cache.txt
    etag.txt
    stampede.txt
    ratelimit-shared.txt
    burst-fixed.txt
    burst-<algo>.txt
```

`NOTES.md` must contain:

- how to run your version (including Redis and the second gateway)
- the answers to Task 0, 1.4, 2.6 and 3.4
- a short paragraph on the most surprising thing you measured

### 3. Commit and push

```bash
git add session-5/task/your-username
git commit -m "Session 5 submission - Your Name"
git push -u origin session-5/your-username
```

### 4. Open the pull request

- **Title:** `Session 5 - Your Name`
- **Base branch:** `main`
- **Compare branch:** `session-5/your-username`
- **Description:**

  ```md
  ## Summary
  - Task 1: ...
  - Task 2: ...
  - Task 3: ... (algorithm: sliding | token)

  ## How to run
  ...

  ## Evidence
  - see `evidence/`
  ```

### PR checklist

- [ ] The PR targets `main`.
- [ ] Only files under `session-5/task/your-username/` are added or changed.
- [ ] The assignment `README.md` and the quiz are unchanged.
- [ ] `node_modules`, `.env`, `*.db` files and build output are not committed.
- [ ] `pnpm install && pnpm db:push && pnpm db:seed:bulk && pnpm dev` works.
- [ ] Every `.proto` change passes `buf lint` and is matched by regenerated
      gateway types.
- [ ] `pnpm -r typecheck` passes.
- [ ] All evidence files are included.

## Common traps

- **Forgetting to regenerate types.** You edit the `.proto` but the gateway's
  `src/generated/` is stale, and TypeScript says the method does not exist.
- **A 415 on the import.** Fastify does not parse `application/x-ndjson`
  until you register a content-type parser.
- **Testing the cache with the limiter on.** Your benchmark measures how
  fast you can return 429s. Turn the limiter off for Task 2 measurements.
- **Collecting a stream into an array.** `call.on('data', p => all.push(p))`
  and then `reply.send(all)` is unary with extra steps. Write each message as
  it arrives.
- **Ignoring `write()` returning `false`.** It is the same backpressure as in
  Session 2: wait for `drain`.
- **Not stopping on cancel.** If the client leaves, the server must stop
  reading from the database. Listen for `cancelled`.
- **Caching per process.** Any `Map` in the gateway is a private cache per
  instance. Two instances means two truths.
- **Forgetting a key during invalidation.** The cached post includes the
  author and the comments, so changes to *those* must invalidate it too.
- **TTL without jitter.** Keys written together expire together, which causes
  a stampede.
- **A lock without a token or expiry.** If the owner crashes, nobody can rebuild
  the key, or another request deletes a lock it does not own.
- **`INCR` then `EXPIRE` as two separate calls.** A crash between them leaves a
  counter that never expires, and that client is blocked forever.
- **Rate-limiting `/health`.** The load balancer marks the node as down.
- **Forgetting `Retry-After`.** Clients retry immediately and make the flood
  worse.

## References

- Session slides: [`nodejs-scalability-session.pdf`](../nodejs-scalability-session.pdf)
  (Caching → Rate limiting) and [`nodejs-grpc.pdf`](../nodejs-grpc.pdf)
- gRPC core concepts and RPC types: <https://grpc.io/docs/what-is-grpc/core-concepts/>
- `@grpc/grpc-js` server and client streaming: <https://grpc.io/docs/languages/node/basics/>
- Redis `SET` (`NX`, `PX`, `EX`): <https://redis.io/docs/latest/commands/set/>
- Redis `INCR` rate-limiter pattern: <https://redis.io/docs/latest/commands/incr/>
- Redis sorted sets: <https://redis.io/docs/latest/develop/data-types/sorted-sets/>
- HTTP caching (`Cache-Control`, `ETag`): <https://developer.mozilla.org/en-US/docs/Web/HTTP/Caching>
- `429 Too Many Requests`: <https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/429>
- Session 4 example (HTTP microservices): [`session-4/microservices`](../../session-4/microservices/)
