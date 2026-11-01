import rateLimit from "express-rate-limit";
import { env } from "../config/env.js";
import { HttpStatusCode } from "../shared/utils/response/http.status.code.js";

/**
 * Rate limiting middleware to prevent abuse and DDoS attacks.
 *
 * Configurable per-route or globally. Uses the default in-memory store,
 * which is sufficient for single-instance deployments.
 *
 * For multi-instance (clustered/containerized) deployments,
 * switch to rate-limit-redis or rate-limit-memcached.
 */

/** Global rate limiter — applied to all routes via app.use() */
export const limitRequests = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX_REQUESTS,
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Old servers used headers starting with X-, removes those old headers to keep your response clean
  message: {
    success: false,
    message: "Too many requests — please try again later",
  },
  statusCode: HttpStatusCode.TOO_MANY_REQUESTS,
});
