import "dotenv/config";
import Fastify from "fastify";
import type { FastifyReply, FastifyRequest } from "fastify";

const USERS_URL = process.env.USERS_SERVICE_URL ?? "http://localhost:3001";
const POSTS_URL = process.env.POSTS_SERVICE_URL ?? "http://localhost:3002";
const COMMENTS_URL =
  process.env.COMMENTS_SERVICE_URL ?? "http://localhost:3003";

const app = Fastify({ logger: true, http2: true });

interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  createdAt: string;
}

interface Post {
  id: number;
  authorId: number;
  title: string;
  content: string;
  createdAt: string;
}

interface Comment {
  id: number;
  postId: number;
  authorId: number;
  content: string;
  createdAt: string;
}

async function fetchJson<T = unknown>(
  url: string | URL,
  init?: RequestInit,
): Promise<{ status: number; data: T | null }> {
  const res = await fetch(url, init);
  const text = await res.text();
  let data: T | null = null;
  if (text) {
    try {
      data = JSON.parse(text) as T;
    } catch {
      data = text as unknown as T;
    }
  }
  return { status: res.status, data };
}

/** Plain reverse-proxy for a single upstream service. */
async function forward(
  request: FastifyRequest,
  reply: FastifyReply,
  baseUrl: string,
) {
  const url = new URL(request.url, baseUrl);
  const init: RequestInit = {
    method: request.method,
    headers: { "content-type": "application/json" },
  };
  if (request.method !== "GET" && request.method !== "HEAD") {
    init.body = JSON.stringify(request.body ?? {});
  }
  const { status, data } = await fetchJson(url, init);
  return reply.status(status).send(data ?? undefined);
}

async function getUser(id: number): Promise<User | null> {
  const { status, data } = await fetchJson<User>(`${USERS_URL}/users/${id}`);
  return status === 200 && data ? data : null;
}

async function enrichComments(comments: Comment[]) {
  return Promise.all(
    comments.map(async (comment) => ({
      ...comment,
      author: await getUser(comment.authorId),
    })),
  );
}

// Users: pure proxy.
app.post("/users", (req, reply) => forward(req, reply, USERS_URL));
app.get("/users", (req, reply) => forward(req, reply, USERS_URL));
app.get("/users/:id", (req, reply) => forward(req, reply, USERS_URL));
app.patch("/users/:id", (req, reply) => forward(req, reply, USERS_URL));
app.delete("/users/:id", (req, reply) => forward(req, reply, USERS_URL));

// Posts: proxy, except the detail route which aggregates across services.
app.post("/posts", (req, reply) => forward(req, reply, POSTS_URL));
app.get("/posts", (req, reply) => forward(req, reply, POSTS_URL));
app.patch("/posts/:id", (req, reply) => forward(req, reply, POSTS_URL));
app.delete("/posts/:id", (req, reply) => forward(req, reply, POSTS_URL));

app.get<{ Params: { id: string } }>("/posts/:id", async (request, reply) => {
  const id = request.params.id;

  // The monolith does this with SQL JOINs; the gateway does it with HTTP calls.
  const [postRes, commentsRes] = await Promise.all([
    fetchJson<Post>(`${POSTS_URL}/posts/${id}`),
    fetchJson<Comment[]>(`${COMMENTS_URL}/posts/${id}/comments`),
  ]);

  if (postRes.status === 404) {
    return reply.status(404).send({ error: "Post not found" });
  }
  if (postRes.status !== 200 || !postRes.data) {
    return reply.status(postRes.status).send({ error: "Posts service error" });
  }

  const post = postRes.data;
  const comments =
    commentsRes.status === 200 && commentsRes.data ? commentsRes.data : [];

  const [author, enrichedComments] = await Promise.all([
    getUser(post.authorId),
    enrichComments(comments),
  ]);

  return reply.send({ ...post, author, comments: enrichedComments });
});

// Comments.
app.post("/posts/:postId/comments", (req, reply) =>
  forward(req, reply, COMMENTS_URL),
);
app.get<{ Params: { postId: string } }>(
  "/posts/:postId/comments",
  async (request, reply) => {
    const postId = request.params.postId;
    const { status, data } = await fetchJson<Comment[]>(
      `${COMMENTS_URL}/posts/${postId}/comments`,
    );
    if (status !== 200) {
      return reply.status(status).send(data ?? undefined);
    }
    return reply.send(await enrichComments(data ?? []));
  },
);
app.delete("/comments/:id", (req, reply) => forward(req, reply, COMMENTS_URL));

app.get("/health", async () => ({ ok: true }));

const port = Number(process.env.PORT ?? 3010);
const host = process.env.HOST ?? "0.0.0.0";

app
  .listen({ port, host })
  .then(() => app.log.info(`gateway listening on http://${host}:${port}`))
  .catch((error) => {
    app.log.error(error);
    process.exit(1);
  });
