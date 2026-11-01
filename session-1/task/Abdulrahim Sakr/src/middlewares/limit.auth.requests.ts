import rateLimit from "express-rate-limit";
import { HttpStatusCode } from "../shared/utils/response/http.status.code.js";

/** Strict limiter for auth routes (login, register, forgot password) */
export const limitAuthRequests = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message:
      "Too many authentication attempts — please try again after 15 minutes",
  },
  statusCode: HttpStatusCode.TOO_MANY_REQUESTS,
});
