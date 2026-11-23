import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";

/**
 * posts-service owns the `posts` table.
 *
 * `authorId` is just an integer. There is NO foreign key to a `users` table,
 * because users live in users-service and a different database. Referential
 * integrity across services must be handled by the application/gateway.
 */
export const posts = sqliteTable("posts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  authorId: integer("authorId").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  createdAt: text("createdAt").notNull(),
});
