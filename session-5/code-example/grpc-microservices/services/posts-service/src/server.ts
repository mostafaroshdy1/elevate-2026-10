import "dotenv/config";
import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import { fileURLToPath } from "node:url";
import path from "node:path";

import { createDb } from "./db";
import { PostRepository } from "./posts/post.repository";
import { PostService } from "./posts/post.service";
import { createPostHandlers } from "./posts/post.grpc";
import { logger, withRequestContext } from "./lib/request-context";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROTO_PATH = path.resolve(__dirname, "../../../proto/social/posts/posts.proto");

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: false,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const proto = grpc.loadPackageDefinition(packageDefinition) as any;
const PostServiceDefinition = proto.social.posts.PostService;

const port = Number(process.env.GRPC_PORT ?? 50052);
const host = process.env.HOST ?? "0.0.0.0";

const server = new grpc.Server();

const db = createDb();
const repository = new PostRepository(db);
const service = new PostService(repository);

server.addService(
  PostServiceDefinition.service,
  withRequestContext("posts-service", createPostHandlers(service)),
);

server.bindAsync(`${host}:${port}`, grpc.ServerCredentials.createInsecure(), (error, boundPort) => {
  if (error) {
    logger.error("failed to bind", { err: error.message });
    process.exit(1);
  }
  logger.info(`posts-service (gRPC) listening on ${host}:${boundPort}`);
});
