import type { Request, Response, NextFunction } from "express";
import { ForbiddenError } from "../shared/utils/error/app.error.js";
/**
 * Role-based authorization middleware factory.
 *
 * Usage:
 *   router.delete("/users/:id", authenticate, authorize("admin", "superadmin"), handler);
 *
 * Design: Higher-order function (factory pattern) returns a middleware closure
 * that has access to the allowed roles via closure scope.
 * This is more flexible and composable than a single middleware with hardcoded roles.
 */
export const authorize = (...allowedRoles: any[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = (req as any).user as any | undefined;

    if (!user) {
      throw new ForbiddenError("Authentication required before authorization");
    }

    if (!allowedRoles.includes(user.role)) {
      throw new ForbiddenError(
        `Role '${user.role}' is not authorized to access this resource`,
      );
    }

    next();
  };
};
