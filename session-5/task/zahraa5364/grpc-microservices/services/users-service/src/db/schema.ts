import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";

/**
 * users-service owns the `users` table and ONLY the `users` table.
 *
 * There are no foreign keys to posts or comments: those live in other services
 * with their own databases. The database boundary is the service boundary.
 */
export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  fullName: text("fullName").notNull(),
  createdAt: text("createdAt").notNull(),
});
