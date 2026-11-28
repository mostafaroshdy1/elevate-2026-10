import { AsyncLocalStorage } from "node:async_hooks";
import * as grpc from "@grpc/grpc-js";

export const REQUEST_ID_HEADER = "x-request-id";

// Holds the current HTTP request's id for everything that runs while handling
// it (including the gRPC calls it fans out to), without threading it through
// every function signature.
export const requestContext = new AsyncLocalStorage<{ requestId: string }>();

// Client interceptor: stamps the current request id onto every outgoing gRPC
// call as metadata (gRPC's equivalent of HTTP headers). Call sites don't need
// to know about it.
export const requestIdInterceptor: grpc.Interceptor = (options, nextCall) =>
  new grpc.InterceptingCall(nextCall(options), {
    start(metadata, listener, next) {
      const requestId = requestContext.getStore()?.requestId;
      if (requestId) metadata.set(REQUEST_ID_HEADER, requestId);
      next(metadata, listener);
    },
  });
