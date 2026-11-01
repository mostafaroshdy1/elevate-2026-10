/**
 * User type definitions.
 *
 * Keep types close to the module that owns them.
 * Shared types go in src/common/types.ts.
 */

import type { UserRole } from "../../shared/types/shared.types.js";

export interface IUser {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserPublic {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
}
