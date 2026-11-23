import "dotenv/config";
import Fastify from "fastify";
import type { FastifyReply } from "fastify";
import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { randomUUID } from "node:crypto";

import {
  REQUEST_ID_HEADER,
  requestContext,
  requestIdInterceptor,
} from "./request-context";
import type { ProtoGrpcType as UsersProto } from "./generated/users";
import type { ProtoGrpcType as PostsProto } from "./generated/posts";
import type { ProtoGrpcType as CommentsProto } from "./generated/comments";
import type { User__Output as User } from "./generated/social/users/User";
import type { CreateUserRequest } from "./generated/social/users/CreateUserRequest";
import type { CreatePostRequest } from "./generated/social/posts/CreatePostRequest";
import type { Comment__Output as Comment } from "./generated/social/comments/Comment";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// proto-loader parses the .proto at runtime, so TypeScript can't see its
// shape. We cast the result to the types generated from the same .proto by
// `pnpm gen:proto` (proto-loader-gen-types) — that's what makes calls typed.
function loadProto<T>(relPath: string): T {
  const packageDefinition = protoLoader.loadSync(
    path.resolve(__dirname, relPath),
    {
      keepCase: false,
      longs: String,
      enums: String,
      defaults: true,
      oneofs: true,
    },
  );
  return grpc.loadPackageDefinition(packageDefinition) as T;
}

const usersProto = loadProto<UsersProto>(
  "../../../proto/social/users/users.proto",
);
const postsProto = loadProto<PostsProto>(
  "../../../proto/social/posts/posts.proto",
);
const commentsProto = loadProto<CommentsProto>(
  "../../../proto/social/comments/comments.proto",
);

const USERS_GRPC = process.env.USERS_GRPC_URL ?? "localhost:50051";
const POSTS_GRPC = process.env.POSTS_GRPC_URL ?? "localhost:50052";
const COMMENTS_GRPC = process.env.COMMENTS_GRPC_URL ?? "localhost:50053";

// One long-lived channel per service — reuses the multiplexed HTTP/2
// connection across requests (the key perf win over per-request fetch).
const insecure = grpc.credentials.createInsecure();
const clientOptions = { interceptors: [requestIdInterceptor] };
const userClient = new usersProto.social.users.UserService(
  USERS_GRPC,
  insecure,
  clientOptions,
);
const postClient = new postsProto.social.posts.PostService(
  POSTS_GRPC,
  insecure,
  clientOptions,
);
const commentClient = new commentsProto.social.comments.CommentService(
  COMMENTS_GRPC,
  insecure,
  clientOptions,
);

// Pull the request/response types out of a generated client method. For
// overloaded methods TS matches the last overload: (argument, callback).
type UnaryFn<Req, Res> = (
  argument: Req,
  callback: grpc.requestCallback<Res>,
) => grpc.ClientUnaryCall;
type UnaryMethods<C> = {
  [K in keyof C]: C[K] extends UnaryFn<any, any> ? K : never;
}[keyof C];
type RequestOf<F> = F extends UnaryFn<infer Req, any> ? Req : never;
type ResponseOf<F> = F extends UnaryFn<any, infer Res> ? Res : never;

// Promise wrapper around a unary RPC. The method name is checked against the
// client, and the request/response types come from the .proto.
function callUnary<C extends grpc.Client, M extends UnaryMethods<C>>(
  client: C,
  method: M,
  request: RequestOf<C[M]>,
): Promise<ResponseOf<C[M]>> {
  return new Promise((resolve, reject) => {
    const fn = client[method] as UnaryFn<RequestOf<C[M]>, ResponseOf<C[M]>>;
    fn.call(client, request, (error, response) => {
      if (error) reject(error);
      else resolve(response!);
    });
  });
}

async function getUser(id: number): Promise<User | null> {
  try {
    const { user } = await callUnary(userClient, "GetUser", { id });
    return user;
  } catch (error) {
    if ((error as grpc.ServiceError).code === grpc.status.NOT_FOUND)
      return null;
    throw error;
  }
}

async function enrichComments(comments: Comment[]) {
  return Promise.all(
    comments.map(async (comment) => ({
      ...comment,
      author: await getUser(comment.authorId),
    })),
  );
}

function grpcStatusToHttp(code: number): number {
  switch (code) {
    case grpc.status.NOT_FOUND:
      return 404;
    case grpc.status.ALREADY_EXISTS:
      return 409;
    case grpc.status.INVALID_ARGUMENT:
      return 400;
    case grpc.status.UNAVAILABLE:
      return 503;
    case grpc.status.UNIMPLEMENTED:
      return 501;
    default:
      return 500;
  }
}

function grpcErrorMessage(error: unknown): string {
  const err = error as grpc.ServiceError;
  if (err.details) return err.details;
  return error instanceof Error ? error.message : "Internal server error";
}

function sendGrpcError(reply: FastifyReply, error: unknown) {
  const code = (error as grpc.ServiceError).code ?? grpc.status.INTERNAL;
  return reply
    .status(grpcStatusToHttp(code))
    .send({ error: grpcErrorMessage(error) });
}

// Every request gets an id: reuse the caller's x-request-id if they sent one
// (so ids can span systems), otherwise mint one here. Fastify adds it as
// `requestId` to every log line for this request.
const app = Fastify({
  logger: true,
  requestIdHeader: REQUEST_ID_HEADER,
  requestIdLogLabel: "requestId",
  genReqId: () => randomUUID(),
});

// Echo the id back to the client and make it available to the gRPC
// interceptor for the rest of this request.
app.addHook("onRequest", (req, reply, done) => {
  reply.header(REQUEST_ID_HEADER, req.id);
  requestContext.run({ requestId: req.id }, done);
});

// --- Users ---
app.post("/users", async (req, reply) => {
  try {
    const { user } = await callUnary(
      userClient,
      "CreateUser",
      req.body as CreateUserRequest,
    );
    return reply.code(201).send(user);
  } catch (error) {
    return sendGrpcError(reply, error);
  }
});
app.get("/users", async (_req, reply) => {
  try {
    const { users } = await callUnary(userClient, "ListUsers", {});
    return reply.send(users);
  } catch (error) {
    return sendGrpcError(reply, error);
  }
});
app.get<{ Params: { id: string } }>("/users/:id", async (req, reply) => {
  try {
    const { user } = await callUnary(userClient, "GetUser", {
      id: Number(req.params.id),
    });
    return reply.send(user);
  } catch (error) {
    return sendGrpcError(reply, error);
  }
});
app.patch<{ Params: { id: string } }>("/users/:id", async (req, reply) => {
  try {
    const body = (req.body ?? {}) as {
      username?: string;
      email?: string;
      fullName?: string;
    };
    const { user } = await callUnary(userClient, "UpdateUser", {
      id: Number(req.params.id),
      ...body,
    });
    return reply.send(user);
  } catch (error) {
    return sendGrpcError(reply, error);
  }
});
app.delete<{ Params: { id: string } }>("/users/:id", async (req, reply) => {
  try {
    await callUnary(userClient, "DeleteUser", { id: Number(req.params.id) });
    return reply.code(204).send();
  } catch (error) {
    return sendGrpcError(reply, error);
  }
});

// --- Posts ---
app.post("/posts", async (req, reply) => {
  try {
    const { post } = await callUnary(
      postClient,
      "CreatePost",
      req.body as CreatePostRequest,
    );
    return reply.code(201).send(post);
  } catch (error) {
    return sendGrpcError(reply, error);
  }
});
app.get("/posts", async (_req, reply) => {
  try {
    const { posts } = await callUnary(postClient, "ListPosts", {});
    return reply.send(posts);
  } catch (error) {
    return sendGrpcError(reply, error);
  }
});
app.patch<{ Params: { id: string } }>("/posts/:id", async (req, reply) => {
  try {
    const body = (req.body ?? {}) as { title?: string; content?: string };
    const { post } = await callUnary(postClient, "UpdatePost", {
      id: Number(req.params.id),
      ...body,
    });
    return reply.send(post);
  } catch (error) {
    return sendGrpcError(reply, error);
  }
});
app.delete<{ Params: { id: string } }>("/posts/:id", async (req, reply) => {
  try {
    await callUnary(postClient, "DeletePost", { id: Number(req.params.id) });
    return reply.code(204).send();
  } catch (error) {
    return sendGrpcError(reply, error);
  }
});

// Post detail: aggregate across services over gRPC (the monolith does this
// with SQL JOINs; session-4's gateway does it with HTTP calls).
app.get<{ Params: { id: string } }>("/posts/:id", async (req, reply) => {
  const id = Number(req.params.id);

  const [postResult, commentsResult] = await Promise.allSettled([
    callUnary(postClient, "GetPost", { id }),
    callUnary(commentClient, "ListCommentsByPost", {
      postId: id,
    }),
  ]);

  if (postResult.status === "rejected") {
    const code =
      (postResult.reason as grpc.ServiceError).code ?? grpc.status.INTERNAL;
    if (code === grpc.status.NOT_FOUND) {
      return reply.status(404).send({ error: "Post not found" });
    }
    return reply
      .status(grpcStatusToHttp(code))
      .send({ error: grpcErrorMessage(postResult.reason) });
  }

  const post = postResult.value.post;
  if (!post) return reply.status(404).send({ error: "Post not found" });
  const comments =
    commentsResult.status === "fulfilled" ? commentsResult.value.comments : [];

  const [author, enrichedComments] = await Promise.all([
    getUser(post.authorId),
    enrichComments(comments),
  ]);

  return reply.send({ ...post, author, comments: enrichedComments });
});

// --- Comments ---
app.post<{ Params: { postId: string } }>(
  "/posts/:postId/comments",
  async (req, reply) => {
    try {
      const body = (req.body ?? {}) as { authorId?: number; content?: string };
      const { comment } = await callUnary(commentClient, "CreateComment", {
        postId: Number(req.params.postId),
        ...body,
      });
      return reply.code(201).send(comment);
    } catch (error) {
      return sendGrpcError(reply, error);
    }
  },
);
app.get<{ Params: { postId: string } }>(
  "/posts/:postId/comments",
  async (req, reply) => {
    try {
      const { comments } = await callUnary(
        commentClient,
        "ListCommentsByPost",
        { postId: Number(req.params.postId) },
      );
      return reply.send(await enrichComments(comments));
    } catch (error) {
      return sendGrpcError(reply, error);
    }
  },
);
app.delete<{ Params: { id: string } }>("/comments/:id", async (req, reply) => {
  try {
    await callUnary(commentClient, "DeleteComment", {
      id: Number(req.params.id),
    });
    return reply.code(204).send();
  } catch (error) {
    return sendGrpcError(reply, error);
  }
});

app.get("/health", async () => ({ ok: true }));

const port = Number(process.env.PORT ?? 3009);
const host = process.env.HOST ?? "0.0.0.0";

app
  .listen({ port, host })
  .then(() =>
    app.log.info(`gateway (gRPC clients) listening on http://${host}:${port}`),
  )
  .catch((error) => {
    app.log.error(error);
    process.exit(1);
  });
