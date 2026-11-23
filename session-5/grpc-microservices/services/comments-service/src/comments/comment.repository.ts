import { asc, eq } from "drizzle-orm";
import { comments } from "../db/schema";
import type { Database } from "../db";
import type { Comment, CreateCommentInput } from "./comment.entity";

export class CommentRepository {
  constructor(private readonly db: Database) {}

  async findByPostId(postId: number): Promise<Comment[]> {
    return this.db.select().from(comments).where(eq(comments.postId, postId)).orderBy(asc(comments.id));
  }

  async findById(id: number): Promise<Comment | undefined> {
    const rows = await this.db.select().from(comments).where(eq(comments.id, id)).limit(1);
    return rows[0];
  }

  async create(input: CreateCommentInput): Promise<Comment> {
    const rows = await this.db
      .insert(comments)
      .values({ ...input, createdAt: new Date().toISOString() })
      .returning();
    return rows[0];
  }

  async remove(id: number): Promise<boolean> {
    const rows = await this.db.delete(comments).where(eq(comments.id, id)).returning();
    return rows.length > 0;
  }
}
