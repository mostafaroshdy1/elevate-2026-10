import * as grpc from "@grpc/grpc-js";
import { BadRequestError, ConflictError, NotFoundError } from "./http-error";

export function toGrpcError(error: unknown): grpc.ServiceError {
  const message = error instanceof Error ? error.message : "Internal server error";
  const err = new Error(message) as grpc.ServiceError;
  err.code = grpcCodeFor(error);
  err.details = message;
  err.metadata = new grpc.Metadata();
  return err;
}

function grpcCodeFor(error: unknown): number {
  if (error instanceof NotFoundError) return grpc.status.NOT_FOUND;
  if (error instanceof ConflictError) return grpc.status.ALREADY_EXISTS;
  if (error instanceof BadRequestError) return grpc.status.INVALID_ARGUMENT;
  return grpc.status.INTERNAL;
}
