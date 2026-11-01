import http from "node:http";
import app from "./app.js";
import { env } from "./config/env.js";
import { logger } from "./config/logger.js";
import { connectDatabase } from "./DB/database.js";
import { sendReminderEmail } from "./shared/jobs/sendReminderEmail.js";
import { socketIoServer } from "./shared/utils/socketio/socket.io.server.js";
import { monitorEventLoopDelay } from "node:perf_hooks";
import { Worker } from "node:worker_threads";

/**
 * Server entry point.
 *
 * Separation of app.ts and server.ts:
 * - app.ts: Express configuration (middleware, routes) — testable without starting HTTP server
 * - server.ts: Server lifecycle (startup, shutdown, connections) — infrastructure concerns
 *
 * This separation allows integration tests to import `app` directly
 * without binding to a port.
 */

// ======================= create server =======================
const server = http.createServer(app);

// ======================= startServer =======================
const startServer = async (): Promise<void> => {
  try {
    // 1. Connect to database
    await connectDatabase();
    // 2. Run all cron jobs
    sendReminderEmail();
    // 3. Start listening
    server.listen(env.PORT, () => {
      logger.info(`🚀 Server running on port ${env.PORT} [${env.NODE_ENV}]`);
      logger.info(
        `📍 Health check: http://localhost:${env.PORT}/api/v1/health`,
      );

      // TASK1
      // function runBlock() {
      //   const start = performance.now();
      //   logger.info(`[${new Date().toTimeString().slice(0, 8)}] Block:start`);
      //   while (performance.now() - start < 20_000) {}
      //   logger.info(`[${new Date().toTimeString().slice(0, 8)}] Block:end`);
      //   setTimeout(() => {
      //     runBlock();
      //   }, 20_000);
      // }

      // setTimeout(() => {
      //   runBlock();
      // }, 10_000);

      // TASK 2
      const histogram = monitorEventLoopDelay({ resolution: 20 });
      histogram.enable();
      setInterval(() => {
        logger.info(`${histogram.max / 1e6} mls`);
      }, 1_000);
      const blocking_worker = new Worker(
        new URL("./workers/blocking.worker.ts", import.meta.url),
      );
    });
  } catch (error) {
    logger.fatal(error, "Failed to start server");
    process.exit(1);
  }
};
startServer();

// ======================= socketIoServer =======================
socketIoServer(server);

// ======================= gracefulShutdown =======================
/**
 * Graceful shutdown handler.
 *
 * When the process receives SIGINT (Ctrl+C) or SIGTERM (Docker stop, Kubernetes, PM2):
 * 1. Stop accepting new connections
 * 2. Wait for in-flight requests to complete
 * 3. Close database connections
 * 4. Exit cleanly
 *
 * Without this, active requests would be dropped mid-response,
 * database connections would leak, and data corruption is possible.
 */
const gracefulShutdown = (signal: string): void => {
  logger.info(`${signal} received — starting graceful shutdown`);
  server.close(() => {
    logger.info("HTTP server closed");
    // Close database connection here:
    // await mongoose.connection.close();
    // await prisma.$disconnect();
    logger.info("All connections closed — process exiting");
    process.exit(0);
  });
  // Force shutdown after 10 seconds if connections hang
  setTimeout(() => {
    logger.error("Forced shutdown — connections did not close in time");
    process.exit(1);
  }, 10_000);
};
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// ======================= unhandledRejection =======================
/**
 * Last-resort handlers for unhandled rejections and uncaught exceptions.
 *
 * These should NEVER fire in well-written code, but they prevent
 * silent crashes in production and ensure errors are always logged.
 */
process.on("unhandledRejection", (reason: unknown) => {
  logger.error(reason, "Unhandled Promise Rejection");
  // In production, you might want to gracefully restart
});

// ======================= uncaughtException =======================
process.on("uncaughtException", (error: Error) => {
  logger.fatal(error, "Uncaught Exception — process must exit");
  process.exit(1);
});
