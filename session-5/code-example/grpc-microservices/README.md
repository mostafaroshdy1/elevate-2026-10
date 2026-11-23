# Social Microservices — gRPC

The same social media app as `session-4/microservices`, but the gateway talks to
each service over **gRPC** (protobuf over HTTP/2) instead of JSON over HTTP/1.1.

The service/repository/entity layers and the database + seeds are **identical**
to the HTTP version — only the transport layer changes. This makes it a
one-to-one benchmark against the HTTP microservices.

## Services

| Service            | Protocol | Port | Database      | Owns     |
| ------------------ | -------- | ---- | ------------- | -------- |
| `users-service`    | gRPC     | 50051 | `users.db`    | users    |
| `posts-service`    | gRPC     | 50052 | `posts.db`    | posts    |
| `comments-service` | gRPC     | 50053 | `comments.db` | comments |
| `gateway`          | HTTP     | 3009  | —             | public API |

## Protobuf contract

The shared `.proto` definitions live in [`proto/social/`](./proto/social), laid
out so each package matches its directory (buf `PACKAGE_DIRECTORY_MATCH`):

- `social/users/users.proto` → `UserService` (ListUsers, GetUser, CreateUser, UpdateUser, DeleteUser)
- `social/posts/posts.proto` → `PostService` (ListPosts, GetPost, CreatePost, UpdatePost, DeletePost)
- `social/comments/comments.proto` → `CommentService` (ListCommentsByPost, CreateComment, DeleteComment)

Fields are `snake_case` in the proto; `@grpc/proto-loader` (with
`keepCase: false`) maps them to the camelCase entities, so the gateway's public
JSON is byte-for-byte identical to the HTTP version.

## Key differences from the HTTP version (`session-4/microservices`)

- Services expose a **gRPC server** (no Fastify). `controller.ts`/`routes.ts`
  are replaced by `{domain}.grpc.ts` (RPC handlers) + a gRPC `server.ts`.
- The gateway keeps Fastify (the public HTTP API) but uses **gRPC clients**
  instead of `fetch`. It reuses one multiplexed HTTP/2 channel per service
  instead of opening an HTTP/1.1 round-trip per call.
- Errors map both ways: `HttpError` → gRPC status in the services
  (`NotFoundError` → `NOT_FOUND`, `ConflictError` → `ALREADY_EXISTS`,
  `BadRequestError` → `INVALID_ARGUMENT`), and gRPC status → HTTP status in the
  gateway.
- Same teaching point holds: `posts.authorId` / `comments.postId` / `authorId`
  are plain integers — no cross-service foreign keys.

## Run it

```bash
pnpm install
pnpm db:push      # create the schema for all three services
pnpm db:seed      # seed all three services (IDs line up across services)
pnpm dev          # 3 gRPC servers + the HTTP gateway (ports 50051-50053, 3009)
```

Then hit the gateway: `http://localhost:3009`.

### Bulk seed (identical to the HTTP version)

```bash
pnpm db:seed:bulk   # 1000 users, 20k posts, 100k comments (across 3 DBs)

# tune sizes:
SEED_USERS=100 SEED_POSTS=2000 SEED_COMMENTS=10000 pnpm db:seed:bulk
```

## Request tracing (`x-request-id`)

Every request gets one id that shows up in the logs of the gateway **and** every
service it calls, so you can follow a single request across processes.

1. **Gateway** — Fastify reuses the caller's `x-request-id` header or generates a
   UUID, logs it as `requestId`, and echoes it back in the response header.
   The id is stored in an `AsyncLocalStorage` context for the request
   ([`request-context.ts`](./services/gateway/src/request-context.ts)).
2. **gRPC hop** — a client interceptor copies that id into each outgoing call's
   **metadata** (gRPC's version of headers), so no call site has to pass it.
3. **Services** — `withRequestContext()` (`src/lib/request-context.ts`) wraps the
   handlers, reads the id from the metadata, and logs one JSON line per RPC
   (`service`, `method`, `requestId`, `code`, `durationMs`). Call `logger.info()`
   from any layer and it is tagged with the same id.

```bash
curl -H 'x-request-id: demo-1' localhost:3009/posts/1
# then search the `pnpm dev` output for demo-1: you'll see the gateway's lines plus
# posts-service GetPost, comments-service ListCommentsByPost, users-service GetUser…
```

## Public API (via the gateway)

Identical surface to `session-4/microservices`:

| Method | Path |
| ------ | ---- |
| POST / GET / PATCH / DELETE | `/users`, `/users/:id` |
| POST / GET | `/posts` |
| GET / PATCH / DELETE | `/posts/:id` (GET aggregates author + comments) |
| POST / GET | `/posts/:postId/comments` (GET enriches with author) |
| DELETE | `/comments/:id` |

## Benchmarking (HTTP vs gRPC)

Both gateways expose the same HTTP API on port `3009`, so the comparison is
apples-to-apples:

```bash
ab -V || sudo apt-get install apache2-utils

# HTTP microservices (session-4) and gRPC microservices (this project) both:
pnpm db:seed:bulk
pnpm start

ab -n 5000 -c 50 -k http://localhost:3009/posts/1
ab -n 5000 -c 50 -k http://localhost:3009/posts/1/comments
```

To load-test a gRPC service directly (bypassing the HTTP gateway), use
[`ghz`](https://ghz.sh):

```bash
ghz --insecure --proto proto/social/posts/posts.proto \
    --call social.posts.PostService.GetPost \
    -d '{"id":1}' \
    localhost:50052
```
