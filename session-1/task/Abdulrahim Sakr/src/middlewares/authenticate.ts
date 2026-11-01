import type { Request, Response, NextFunction } from "express";
import { decodeToken } from "../shared/utils/decode.token.js";

/**
 * Authentication middleware — verifies JWT from the Authorization header.
 *
 * Flow:
 * 1. Pass authorization header to decodeToken utility
 * 2. Attach decoded payload to (req as any).user
 * 3. Pass to next middleware
 */
export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const payload = decodeToken({
    authorization: req.headers.authorization as string,
  });

  (req as any).payload = payload;

  next();
};
