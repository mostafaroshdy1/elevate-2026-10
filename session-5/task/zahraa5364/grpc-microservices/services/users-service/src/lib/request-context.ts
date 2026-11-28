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

type AnyHandler = (...args: any[]) => unknown;

/** Supports unary, client-streaming and server-streaming handlers. */
export function withRequestContext<T extends Record<string, AnyHandler>>(
  service: string,
  handlers: T,
): T {
  const wrapped: Record<string, AnyHandler> = {};
  for (const [method, handler] of Object.entries(handlers)) {
    wrapped[method] = (call: any, callback?: sendUnaryData<any>) => {
      const requestId = call.metadata?.get(REQUEST_ID_HEADER)[0]?.toString() ?? randomUUID();
      const startedAt = performance.now();
      let messages = 0;
      let logged = false;
      const finish = (error?: any) => {
        if (logged) return;
        logged = true;
        const code = error?.code ?? status.OK;
        const durationMs = Math.round((performance.now() - startedAt) * 100) / 100;
        const fields: Record<string, unknown> = { code, durationMs };
        if (method === "StreamPosts" || method === "ImportComments") fields.messages = messages;
        if (error) fields.err = error.details ?? error.message;
        write(error ? (code === status.INTERNAL ? "error" : "warn") : "info", error ? "rpc failed" : "rpc completed", fields);
      };
      call.on?.("data", () => { messages++; });
      if (typeof call.write === "function") {
        const originalWrite = call.write.bind(call);
        call.write = (...args: any[]) => { messages++; return originalWrite(...args); };
      }
      if (callback) {
        const loggedCallback: sendUnaryData<any> = (error, ...rest) => {
          finish(error);
          callback(error, ...rest);
        };
        return requestContext.run({ service, method, requestId }, () => handler(call, loggedCallback));
      }
      call.once?.("finish", () => finish());
      call.once?.("end", () => finish());
      call.once?.("cancelled", () => finish({ code: status.CANCELLED, message: "cancelled" }));
      call.once?.("error", finish);
      return requestContext.run({ service, method, requestId }, () => handler(call));
    };
  }
  return wrapped as T;
}
