import type { Request, Response, NextFunction } from "express";

/**
 * Wraps async route handlers to catch rejected promises automatically.
 *
 * Without this, every async handler would need its own try/catch + next(error).
 * This eliminates that boilerplate entirely.
 *
 * Usage:
 *   router.get("/users", asyncHandler(async (req, res) => { ... }));
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>,
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    fn(req, res, next).catch(next);
  };
};
