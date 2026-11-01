import type { Request } from "express";

/**
 * Build Prisma pagination.
 *
 * Example:
 *
 * ?page=2
 * &limit=20
 */
export function buildPagination(req: Request) {
  const page = Number(req.query.page ?? 1);

  const limit = Number(req.query.limit ?? 20);

  return {
    take: limit,
    skip: (page - 1) * limit,
  };
}
