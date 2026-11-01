import type { Request } from "express";

import { buildFilter } from "./query-filter.js";
import { buildPagination } from "./query-pagination.js";
import { buildSearch } from "./query-search.js";
import { buildSort } from "./query-sort.js";

import type { FilterOptions } from "./query.types.js";

/**
 * Main query builder.
 *
 * Acts as a facade over all query helpers.
 */
export class QueryBuilder {
  constructor(private readonly req: Request) {}

  /**
   * Build Prisma where clause.
   */
  filter(options: FilterOptions) {
    return buildFilter(this.req, options);
  }

  /**
   * Build Prisma orderBy clause.
   */
  sort() {
    return buildSort(this.req);
  }

  /**
   * Build Prisma pagination.
   */
  pagination() {
    return buildPagination(this.req);
  }

  /**
   * Build Prisma search conditions.
   */
  search(fields: string[]) {
    return buildSearch(this.req, fields);
  }
}
