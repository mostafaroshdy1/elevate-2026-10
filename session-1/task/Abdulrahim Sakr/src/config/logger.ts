import pino from "pino";
import { env } from "./env.js";

/**
 * Pino logger configured per environment:
 * - Development: pretty-printed, colorized output via pino-pretty
 * - Production: structured JSON logs for log aggregation tools (ELK, Datadog, etc.)
 */
export const logger = pino({
  level: env.isDevelopment ? "debug" : "info",

  ...(env.isDevelopment && {
    transport: {
      target: "pino-pretty",
      options: {
        colorize: true,
        translateTime: "SYS:HH:MM:ss",
        ignore: "pid,hostname",
      },
    },
  }),

  // Redact sensitive fields from all log output
  redact: {
    paths: ["req.headers.authorization", "req.headers.cookie", "body.password", "body.token"],
    censor: "[REDACTED]",
  },
});
