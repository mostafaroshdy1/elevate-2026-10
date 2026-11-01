import type { Request } from "express";

/**
 * Build Prisma search query.
 *
 * Example:
 *
 * ?search=iphone
 */
export function buildSearch(req: Request, fields: string[]) {
  const keyword = req.query.search;

  if (typeof keyword !== "string") {
    return undefined;
  }

  return {
    OR: fields.map((field) => ({
      [field]: {
        contains: keyword,
      },
    })),
  };
}
