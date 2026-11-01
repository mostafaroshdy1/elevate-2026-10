import type { Response } from "express";
import type { ApiResponse, PaginationMeta } from "../../types/shared.types.js";
import { HttpStatusCode } from "./http.status.code.js";

/**
 * Consistent API response helper.
 * Every endpoint returns the same shape — clients can always rely on { success, message, data }.
 */
export const responseHandler = <T>(
  res: Response,
  statusCode: number,
  message: string,
  data?: T,
  meta?: PaginationMeta,
): void => {
  const body: ApiResponse<T> = {
    success: statusCode >= 200 && statusCode < 300,
    message,
    ...(data !== undefined && { data }),
    ...(meta !== undefined && { meta }),
  };

  res.status(statusCode).json(body);
};
