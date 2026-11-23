import "dotenv/config";
import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import { fileURLToPath } from "node:url";
import path from "node:path";

import { createDb } from "./db";
import { UserRepository } from "./users/user.repository";
import { UserService } from "./users/user.service";
import { createUserHandlers } from "./users/user.grpc";
import { logger, withRequestContext } from "./lib/request-context";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROTO_PATH = path.resolve(__dirname, "../../../proto/social/users/users.proto");

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: false,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

// proto-loader returns a dynamically-typed package tree.
const proto = grpc.loadPackageDefinition(packageDefinition) as any;
const UserServiceDefinition = proto.social.users.UserService;

const port = Number(process.env.GRPC_PORT ?? 50051);
const host = process.env.HOST ?? "0.0.0.0";

const server = new grpc.Server();

// Composition root: repository -> service -> gRPC handlers.
const db = createDb();
const repository = new UserRepository(db);
const service = new UserService(repository);

server.addService(
  UserServiceDefinition.service,
  withRequestContext("users-service", createUserHandlers(service)),
);

server.bindAsync(`${host}:${port}`, grpc.ServerCredentials.createInsecure(), (error, boundPort) => {
  if (error) {
    logger.error("failed to bind", { err: error.message });
    process.exit(1);
  }
  logger.info(`users-service (gRPC) listening on ${host}:${boundPort}`);
});
