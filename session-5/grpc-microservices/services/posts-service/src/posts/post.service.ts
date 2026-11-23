import { NotFoundError } from "../lib/http-error";
import type { PostRepository } from "./post.repository";
import type { CreatePostInput, Post, UpdatePostInput } from "./post.entity";

export class PostService {
  constructor(private readonly posts: PostRepository) {}

  async list(): Promise<Post[]> {
    return this.posts.findAll();
  }

  async get(id: number): Promise<Post> {
    const post = await this.posts.findById(id);
    if (!post) throw new NotFoundError(`Post ${id} not found`);
    return post;
  }

  async create(input: CreatePostInput): Promise<Post> {
    // NOTE: we cannot validate that `authorId` exists — users live in
    // users-service, a different database. Cross-service referential
    // integrity is lost by design.
    return this.posts.create(input);
  }

  async update(id: number, input: UpdatePostInput): Promise<Post> {
    const updated = await this.posts.update(id, input);
    if (!updated) throw new NotFoundError(`Post ${id} not found`);
    return updated;
  }

  async remove(id: number): Promise<void> {
    const ok = await this.posts.remove(id);
    if (!ok) throw new NotFoundError(`Post ${id} not found`);
  }
}
