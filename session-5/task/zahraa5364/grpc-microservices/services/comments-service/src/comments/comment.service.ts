import { NotFoundError } from "../lib/http-error";
import type { CommentRepository } from "./comment.repository";
import type { Comment, CreateCommentInput } from "./comment.entity";

export class CommentService {
  constructor(private readonly comments: CommentRepository) {}

  async listByPost(postId: number): Promise<Comment[]> {
    return this.comments.findByPostId(postId);
  }

  async create(input: CreateCommentInput): Promise<Comment> {
    // No cross-service checks: we cannot confirm that `postId` or `authorId`
    // exist because posts/users live in other services.
    return this.comments.create(input);
  }

  async createMany(inputs: CreateCommentInput[]): Promise<Comment[]> {
    return this.comments.createMany(inputs);
  }

  async remove(id: number): Promise<number> {
    const postId = await this.comments.remove(id);
    if (postId === undefined) throw new NotFoundError(`Comment ${id} not found`);
    return postId;
  }
}
