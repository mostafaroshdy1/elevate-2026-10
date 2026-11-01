import type { Request } from "express";

/**
 * Build Prisma orderBy.
 *
 * Example:
 *
 * ?sort=-createdAt,name
 */
export function buildSort(req: Request) {
  const sort = req.query.sort;

  if (typeof sort !== "string") {
    return undefined;
  }

  return sort.split(",").map((field) => ({
    [field.replace("-", "")]: field.startsWith("-") ? "desc" : "asc",
  }));
}
