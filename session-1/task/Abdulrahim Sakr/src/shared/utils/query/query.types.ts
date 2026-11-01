/**
 * Supported operators.
 *
 * Example:
 *
 * ?price[gte]=100
 * ?price[lte]=500
 */
export type PrismaOperator =
  | "equals"
  | "contains"
  | "startsWith"
  | "endsWith"
  | "gte"
  | "lte"
  | "gt"
  | "lt"
  | "in"
  | "notIn";

/**
 * Controls which fields/operators
 * are allowed for a specific endpoint.
 */
export interface FilterOptions {
  allowedFields?: string[];

  operators?: Record<string, PrismaOperator[]>;
}
