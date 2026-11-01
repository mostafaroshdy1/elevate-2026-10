import type { Request, Response, NextFunction } from "express";
import { logger } from "../config/logger.js";

/**
 * HTTP request logger middleware using Pino.
 *
 * Logs method, URL, status code, and response time for every request.
 * Uses res.on('finish') to capture the actual status code after the response is sent.
 *
 * Why not morgan? Morgan is great but doesn't integrate natively with Pino's
 * structured JSON logging. This custom middleware gives us consistent
 * log format across the entire application.
 */
export const logRequests = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;

    logger.info(
      {
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
      },
      `${req.method} ${req.originalUrl} ${res.statusCode} — ${duration}ms`,
    );
  });

  next();
};
