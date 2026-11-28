# Session 5 — Friday Night Traffic

> Implementation copy: `grpc-microservices/`. The original example and `session-5/task/README.md` are unchanged.

## Run

Requirements: Node 22.18+ (or 24+), pnpm, Docker, Redis 7+.

```bash
cd grpc-microservices
docker run -d --name redis -p 6379:6379 redis:7
pnpm install
pnpm db:push
pnpm db:seed
pnpm --filter @social/gateway gen:proto
pnpm dev
```

Run a second gateway against the same services and Redis in another terminal:

```bash
cd grpc-microservices/services/gateway
PORT=3010 pnpm dev
```

Generate the 10,000-line import fixture from the gateway directory with `node --import tsx scripts/generate-import.ts comments-10k.ndjson`, then import it with `curl -i -H 'content-type: application/x-ndjson' --data-binary @comments-10k.ndjson localhost:3009/comments/import`. The default gateway is port 3009. Redis can be configured with `REDIS_URL`. Cache can be disabled with `CACHE=off`. Rate limiting can be disabled with `RL_ALGO=off`; fixed window is the default, and `RL_ALGO=sliding` or `RL_ALGO=token` selects the alternative. `RL_LIMIT` and `RL_WINDOW_MS` configure the limit (defaults 20 and 10000). `STREAM_PAGE_DELAY_MS` slows each server-stream page for cancellation tests.

## Task 0 — Quiz

`Completed all 30 quiz questions. Final score: 28/30.
The actual score screenshot is saved as `evidence/quiz-score.png`.
Review notes for Q1 and Q8 are included below.

## Task 1.4 — Streaming

- `GET /posts/export` uses **server streaming**: one gateway request receives many `StreamPostsResponse` messages and writes NDJSON lines as they arrive. A unary response would have to buffer the full result in memory before responding.
- `POST /comments/import` uses **client streaming**: the gateway sends many parsed comment records in one gRPC stream and receives one aggregate result. Unary would require one RPC per record or a huge single request.
- Existing CRUD endpoints remain unary. There is no bidirectional endpoint in the main task.
- If the HTTP client disconnects during export, the gateway cancels the gRPC client stream. The posts service listens for the gRPC `cancelled` event and stops fetching additional database pages.
- A browser cannot call this native gRPC service directly because browsers do not expose the native HTTP/2 gRPC transport and framing expected by gRPC clients. gRPC-Web (with a compatible proxy/server) or a gateway endpoint such as the NDJSON HTTP route is needed.
- One gateway channel per service multiplexes concurrent RPCs over one HTTP/2 connection. A TCP load balancer sees the connection, not individual RPCs, so it can pin a gateway's channel to one posts-service replica. Use a gRPC-aware/L7 load balancer, client-side balancing, or multiple channels/connections to distribute RPCs across replicas.

## Task 2.6 — Cache

Four layers: (1) browser private HTTP cache, (2) gateway Redis shared cache, (3) gateway process memory (only the deliberate broken 2.1 experiment; removed from the final read path), (4) service database. A 304 is the browser validating its stored representation with the gateway; `X-Cache: HIT` means Redis supplied the aggregate; a request served without reaching the network is the browser's own fresh private cache.

The Map cache became stale because port 3010 had a different process-local Map. A mutation and invalidation on port 3009 could not invalidate port 3010's copy. Other process-local-cache problems include duplicated memory use and inconsistent cache contents/eviction/TTL across replicas.

The implemented read strategy is **cache-aside**: read Redis, build through gRPC on a miss, then populate Redis. Write-through would be useful if every write must synchronously update the cache and read-after-write consistency is more important than write latency/availability.

TTL remains necessary because invalidation can fail, clients or services may bypass the gateway, and indexes/relationships can change without the gateway knowing. TTL bounds the lifetime of stale data. Jitter spreads expirations over time. Lock-on-miss coalesces concurrent rebuilds of the same missing key. Early refresh refreshes a key before expiry so users are less likely to encounter an expired hot key.

For user updates, this implementation conservatively deletes all `post:*:full` aggregate keys because cached values embed author and commenter user data and the current data model does not maintain a reverse index. This is simple and correct but costs O(number of cached post keys) Redis key scanning and invalidates unrelated posts. A production alternative is a Redis set `user:{id}:posts` populated on cache fill.

## Task 3.4 — Rate limiting

Counters live in Redis because both gateway processes must observe the same client usage; this is the same cross-process consistency issue demonstrated by the in-memory cache. Redis `INCR` is atomic, so simultaneous increments are serialized and each request receives a unique counter value. The fixed-window increment and first-hit expiry are executed in one Lua script, avoiding a crash between separate `INCR` and `EXPIRE` commands that could leave a permanent counter.

The alternative implemented here is a **sliding-window log** (atomic sorted-set operations). It is appropriate when a strict rolling-window request cap matters. A token bucket is often better for clients that should be allowed short bursts while enforcing a long-term average rate.

The edge in this app is the HTTP gateway, the first application-controlled ingress point. A per-client request limit belongs there. An outbound-call limit (for example, users-service calls per second) belongs around the gateway's gRPC client to protect a dependency.

Other API-protection layers include authentication/authorization (stops unauthorized access), request size limits (large-body exhaustion), schema/input validation (malformed or abusive payloads), concurrency limits and deadlines (slow-client/resource exhaustion), connection/TLS controls and WAF/DDoS protection (network floods and common exploit traffic), and quotas/billing controls (sustained resource abuse).

## Measurements and evidence

Runtime tests were performed on Windows with Node.js 24.11.1, pnpm 12.23.0, Docker, and Redis 7.

Evidence saved under `evidence/`:
- `quiz-score.png` — quiz result screenshot (28/30).
- `stream-posts.txt` — server streaming export output.
- `stream-cancel.txt` — client disconnect and server cancellation log.
- `comments-10000.ndjson` — 10,000-comment import fixture.
- `import-comments.txt` — successful import: 10,000 imported, 0 failed.
- `stream-logs.txt` — request ID and gRPC logging evidence.
- `rate-limit-fixed.txt` — fixed-window rate limit test.
- `rate-limit-shared.txt` — shared Redis limit across gateway ports 3009 and 3010.
- `rate-limit-headers.txt` — HTTP 429 and Retry-After header evidence.

Validation:
- `pnpm -r typecheck` passed for all four services.
- `/health` successfully handled 25 consecutive requests without rate limiting.
- The fixed-window limiter allowed 20 requests and rejected subsequent requests with HTTP 429.
- Both gateway instances shared the same Redis rate-limit counter.

Cache runtime verification and performance benchmarks remain incomplete. Buf lint was not run because the Buf CLI is not installed in the project.

Expected evidence files:

- `quiz-score.png`
- `stream-posts.txt`, `import-comments.txt`, `stream-logs.txt`
- `inmemory-stale.txt`, `redis-fresh.txt`, `bench-cache.txt`, `etag.txt`, `stampede.txt`
- `ratelimit-shared.txt`, `burst-fixed.txt`, `burst-sliding.txt`

## Surprising measurement

Cache benchmarks and the `/posts` versus `/posts/export` comparison were not completed. No TTFB, RSS, requests-per-second, mean/p99, or stampede RPC-count results are claimed.

### Quiz review

- **Q1 — Why cache?** Caching stores frequently requested data so the system can serve repeated requests faster, reduce database and service calls, and improve performance. Cached data should have a suitable TTL and be invalidated when the original data changes.
- **Q8 — All layers together.** The browser cache, gateway cache, and database work together to improve performance. Each layer has a different responsibility: the browser avoids unnecessary network requests, the gateway cache avoids repeated service and database calls, and the database remains the source of truth. Cache invalidation and TTL are important to prevent stale data.
