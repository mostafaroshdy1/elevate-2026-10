import type { Request, Response, NextFunction } from "express";
import { AppError } from "../shared/utils/error/app.error.js";
import { HttpStatusCode } from "../shared/utils/response/http.status.code.js";
import { logger } from "../config/logger.js";
import { env } from "../config/env.js";

/**
 * Global error handling middleware — the single place where all errors are caught and formatted.
 *
 * Design decisions:
 * 1. Handle operational Errors → AppError with isOperational=true, send error message to client
 * 2. Handle Zod validation Errors → extract and format field-level messages
 * 3. Handle JWT Errors → uniform 401 responses
 * 4. Handle Unknown/unexpected Errors → generic 500 message, log full details
 */

export const handleGlobalError = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  // Handle operational Errors
  if (err instanceof AppError) {
    logger.warn(
      { statusCode: err.statusCode, message: err.message },
      "Operational error",
    );

    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(env.isDevelopment && { stack: err.stack }),
    });
    return;
  }

  // Handle Zod validation Errors
  if (err.name === "ZodError" && "issues" in err) {
    type ZodIssue = { path: (string | number)[]; message: string };
    const zodErr = err as unknown as { issues: ZodIssue[] };
    const errors = zodErr.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    }));

    res.status(HttpStatusCode.UNPROCESSABLE_ENTITY).json({
      success: false,
      message: "Validation failed",
      errors,
    });
    return;
  }

  // Handle JWT Errors
  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    const message =
      err.name === "TokenExpiredError" ? "Token has expired" : "Invalid token";

    res.status(HttpStatusCode.UNAUTHORIZED).json({
      success: false,
      message,
    });
    return;
  }

  // Handle Unknown/unexpected Errors
  logger.error(err, "Unexpected error");

  res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: "Internal server error",
    ...(env.isDevelopment && { stack: err.stack }),
  });
};
