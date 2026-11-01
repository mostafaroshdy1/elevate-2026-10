import type { Request, Response } from "express";
import { HttpStatusCode } from "../shared/utils/response/http.status.code.js";

/**
 * Catch-all for undefined routes.
 * Must be registered AFTER all valid routes.
 */
export const handleRouteNotFound = (req: Request, res: Response): void => {
  res.status(HttpStatusCode.NOT_FOUND).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
};
