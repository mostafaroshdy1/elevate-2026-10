import { HttpStatusCode } from "../response/http.status.code.js";

/**
 * Custom application error class.
 *
 * Why extend Error instead of using plain objects?
 * - Preserves stack trace for debugging
 * - Works with instanceof checks in the error middleware
 * - Carries HTTP status code so the error middleware knows exactly what to return
 *
 * `isOperational` distinguishes expected errors (bad input, not found)
 * from unexpected bugs (null pointer, DB crash). Only operational errors
 * are safe to expose to the client.
 */
export class AppError extends Error {
  public readonly statusCode: HttpStatusCode;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    statusCode: HttpStatusCode = HttpStatusCode.INTERNAL_SERVER_ERROR,
    isOperational = true,
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    // Maintain proper prototype chain
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

// ========================
// Convenience Subclasses
// ========================

export class NotFoundError extends AppError {
  constructor(resource = "Resource") {
    super(`${resource} not found`, HttpStatusCode.NOT_FOUND);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized") {
    super(message, HttpStatusCode.UNAUTHORIZED);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Forbidden — insufficient permissions") {
    super(message, HttpStatusCode.FORBIDDEN);
  }
}

export class BadRequestError extends AppError {
  constructor(message = "Bad request") {
    super(message, HttpStatusCode.BAD_REQUEST);
  }
}

export class ConflictError extends AppError {
  constructor(message = "Resource already exists") {
    super(message, HttpStatusCode.CONFLICT);
  }
}
