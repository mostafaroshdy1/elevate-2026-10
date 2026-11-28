import "dotenv/config";
import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import { fileURLToPath } from "node:url";
import path from "node:path";

import { createDb } from "./db";
import { CommentRepository } from "./comments/comment.repository";
import { CommentService } from "./comments/comment.service";
import { createCommentHandlers } from "./comments/comment.grpc";
import { logger, withRequestContext } from "./lib/request-context";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROTO_PATH = path.resolve(__dirname, "../../../proto/social/comments/comments.proto");

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: false,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const proto = grpc.loadPackageDefinition(packageDefinition) as any;
const CommentServiceDefinition = proto.social.comments.CommentService;

const port = Number(process.env.GRPC_PORT ?? 50053);
const host = process.env.HOST ?? "0.0.0.0";

const server = new grpc.Server();

const db = createDb();
const repository = new CommentRepository(db);
const service = new CommentService(repository);

server.addService(
  CommentServiceDefinition.service,
  withRequestContext("comments-service", createCommentHandlers(service)),
);

server.bindAsync(`${host}:${port}`, grpc.ServerCredentials.createInsecure(), (error, boundPort) => {
  if (error) {
    logger.error("failed to bind", { err: error.message });
    process.exit(1);
  }
  logger.info(`comments-service (gRPC) listening on ${host}:${boundPort}`);
});
