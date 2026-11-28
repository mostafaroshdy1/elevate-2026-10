# Evidence capture checklist

These files must contain real local command output. No benchmark numbers, quiz result, or service logs were fabricated in the prepared workspace because it has no pnpm installation, Docker daemon, or running Redis/database.

Capture each file after running the stack:

- `quiz-score.png`: final score screenshot from `session-5/task/session-5-quiz.html`.
- `stream-posts.txt`: `/posts` vs `/posts/export` curl timing/size, RSS if available, plus `curl -m 0.8` cancellation and posts-service cancellation log.
- `import-comments.txt`: command used to generate 10,000 records and POST response.
- `stream-logs.txt`: one posts-service `StreamPosts` log and one comments-service `ImportComments` log.
- `inmemory-stale.txt`: two-port memory-cache stale-data curl sequence (`CACHE=memory`).
- `redis-fresh.txt`: same sequence with both gateways using Redis.
- `bench-cache.txt`: two `ab -n 5000 -c 50 -k` summaries (`CACHE=off` and Redis on), include RPS, mean and p99.
- `etag.txt`: first GET response with ETag and matching conditional GET returning 304.
- `stampede.txt`: before/after GetPost log counts for 200 concurrent requests.
- `ratelimit-shared.txt`: 30 alternating requests across ports using one API key; expected 20 success and 10 429.
- `burst-fixed.txt`, `burst-sliding.txt`: boundary-burst output for both algorithms.
