export interface Comment {
  id: number;
  postId: number;
  authorId: number;
  content: string;
  createdAt: string;
}

export type CreateCommentInput = Pick<Comment, "postId" | "authorId" | "content">;
