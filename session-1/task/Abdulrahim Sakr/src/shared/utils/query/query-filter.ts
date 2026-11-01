import type { Request } from "express";

import { RESERVED_QUERY_KEYS } from "./query.constants.js";
import type { FilterOptions } from "./query.types.js";

/**
 * Convert string values coming from
 * req.query into useful JavaScript values.
 */
function parseValue(value: unknown): unknown {
  if (value === "true") return true;
  if (value === "false") return false;
  if (value === "null") return null;

  if (typeof value === "string" && /^-?\d+(\.\d+)?$/.test(value)) {
    return Number(value);
  }

  return value;
}

/**
 * Build Prisma where object.
 *
 * Supports:
 *
 * ?status=ACTIVE
 *
 * ?price[gte]=100
 */
export function buildFilter(req: Request, options: FilterOptions) {
  const where: Record<string, unknown> = {};

  const allowedFields = options.allowedFields ?? [];

  for (const [key, rawValue] of Object.entries(req.query)) {
    if (RESERVED_QUERY_KEYS.includes(key)) {
      continue;
    }

    const operatorMatch = key.match(/^(.+)\[(.+)\]$/);

    /**
     * Operator syntax.
     *
     * Example:
     *
     * ?price[gte]=100
     */
    if (operatorMatch) {
      const [, field, operator] = operatorMatch;

      if (!field || !operator || !allowedFields.includes(field)) {
        continue;
      }

      const allowedOperators = options.operators?.[field] ?? [];

      if (!allowedOperators.includes(operator as any)) {
        continue;
      }

      where[field] = {
        ...(where[field] as object),
        [operator]: parseValue(rawValue),
      };

      continue;
    }

    /**
     * Simple field.
     *
     * Example:
     *
     * ?status=ACTIVE
     */
    if (!allowedFields.includes(key)) {
      continue;
    }

    where[key] = parseValue(rawValue);
  }

  return where;
}
