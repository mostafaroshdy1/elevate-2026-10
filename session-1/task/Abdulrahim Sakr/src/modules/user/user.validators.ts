import { z } from "zod";

/**
 * User validation schemas using Zod.
 *
 * These schemas serve double duty:
 * 1. Runtime validation in the validate() middleware
 * 2. TypeScript type inference via z.infer<typeof schema>
 *
 * Keep validators in the module folder — they're part of the module's contract.
 */

export const createUserSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be at most 50 characters")
    .trim(),
  email: z.string().email("Invalid email format").toLowerCase().trim(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must be at most 128 characters"),
  role: z.enum(["user", "admin"]).optional().default("user"),
});

export const updateUserSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be at most 50 characters")
    .trim()
    .optional(),
  email: z
    .string()
    .email("Invalid email format")
    .toLowerCase()
    .trim()
    .optional(),
});

export const idParamSchema = z.object({
  id: z.string().min(1, "ID is required"),
});

export type CreateUserDTO = z.infer<typeof createUserSchema>;
export type UpdateUserDTO = z.infer<typeof updateUserSchema>;
