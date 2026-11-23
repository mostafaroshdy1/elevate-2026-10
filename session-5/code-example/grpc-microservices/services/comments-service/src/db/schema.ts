import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";

/**
 * comments-service owns the `comments` table.
 *
 * `postId` and `authorId` are plain integers — no foreign keys, because posts
 * and users live in other services/databases.
 */
export const comments = sqliteTable("comments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  postId: integer("postId").notNull(),
  authorId: integer("authorId").notNull(),
  content: text("content").notNull(),
  createdAt: text("createdAt").notNull(),
});
