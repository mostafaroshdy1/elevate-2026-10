import { AsyncLocalStorage } from "node:async_hooks";
import { randomUUID } from "node:crypto";
import type {
  ServerUnaryCall,
  ServiceError,
  sendUnaryData,
} from "@grpc/grpc-js";
import { status } from "@grpc/grpc-js";

const REQUEST_ID_HEADER = "x-request-id";

interface RequestContext {
  service: string;
  method: string;
  requestId: string;
}

const requestContext = new AsyncLocalStorage<RequestContext>();

type Level = "info" | "warn" | "error";

function write(level: Level, msg: string, fields: Record<string, unknown>) {
  const line = JSON.stringify({
    level,
    time: new Date().toISOString(),
    ...requestContext.getStore(),
    msg,
    ...fields,
  });
  if (level === "error") console.error(line);
  else console.log(line);
}

// JSON logger that automatically tags each line with the current request's
// service, method and requestId — usable from any layer (service, repository).
export const logger = {
  info: (msg: string, fields: Record<string, unknown> = {}) =>
    write("info", msg, fields),
  warn: (msg: string, fields: Record<string, unknown> = {}) =>
    write("warn", msg, fields),
  error: (msg: string, fields: Record<string, unknown> = {}) =>
    write("error", msg, fields),
};

type UnaryHandler = (
  call: ServerUnaryCall<any, any>,
  callback: sendUnaryData<any>,
) => unknown;

/**
 * Wraps every unary handler so that it:
 *  - reads the `x-request-id` the gateway put in the gRPC metadata,
 *  - runs inside a request context (so `logger` picks the id up),
 *  - logs one line per RPC with its status code and duration.
 */
export function withRequestContext<T extends Record<string, UnaryHandler>>(
  service: string,
  handlers: T,
): T {
  const wrapped: Record<string, UnaryHandler> = {};

  for (const [method, handler] of Object.entries(handlers)) {
    wrapped[method] = (call, callback) => {
      const requestId =
        call.metadata.get(REQUEST_ID_HEADER)[0]?.toString() ?? randomUUID();
      const startedAt = performance.now();

      const loggedCallback: sendUnaryData<any> = (error, ...rest) => {
        const err = error as Partial<ServiceError> | null;
        const code = err?.code ?? status.OK;
        const durationMs = Math.round((performance.now() - startedAt) * 100) / 100;
        if (err) {
          const level = code === status.INTERNAL ? "error" : "warn";
          write(level, "rpc failed", { code, durationMs, err: err.details ?? err.message });
        } else {
          write("info", "rpc completed", { code, durationMs });
        }
        callback(error, ...rest);
      };

      return requestContext.run({ service, method, requestId }, () =>
        handler(call, loggedCallback),
      );
    };
  }

  return wrapped as T;
}
