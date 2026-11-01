/**
 * HTTP Status Codes — only the ones commonly used in REST APIs.
 * Using an enum-like const object instead of a third-party lib keeps it lightweight and fully typed.
 */
export const HttpStatusCode = {
  // 2xx Success
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,

  // 3xx Redirection
  NOT_MODIFIED: 304,

  // 4xx Client Errors
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,

  // 5xx Server Errors
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
} as const;

// Extract the values from the object above to create a Union Type.
// Resulting type: 200 | 201 | 400 | 404 | ... (only allowed values)
export type HttpStatusCode =
  (typeof HttpStatusCode)[keyof typeof HttpStatusCode];
