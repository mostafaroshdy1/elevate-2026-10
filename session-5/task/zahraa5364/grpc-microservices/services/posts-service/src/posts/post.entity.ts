export interface Post {
  id: number;
  authorId: number;
  title: string;
  content: string;
  createdAt: string;
}

export type CreatePostInput = Pick<Post, "authorId" | "title" | "content">;
export type UpdatePostInput = Partial<Pick<Post, "title" | "content">>;
