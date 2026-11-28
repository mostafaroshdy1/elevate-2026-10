import type { ServerUnaryCall, ServerWritableStream, sendUnaryData } from "@grpc/grpc-js";
import { toGrpcError } from "../lib/grpc-error";
import type { PostService } from "./post.service";
import type { CreatePostInput, Post, UpdatePostInput } from "./post.entity";

interface ListPostsRequest {}
interface ListPostsResponse { posts: Post[]; }
interface GetPostRequest { id: number; }
interface GetPostResponse { post: Post; }
interface CreatePostRequest { authorId: number; title: string; content: string; }
interface CreatePostResponse { post: Post; }
interface UpdatePostRequest { id: number; title: string; content: string; }
interface UpdatePostResponse { post: Post; }
interface DeletePostRequest { id: number; }
interface DeletePostResponse {}
interface StreamPostsRequest { authorId: number; }
interface StreamPostsResponse { post: Post; }

export function createPostHandlers(service: PostService) {
  return {
    StreamPosts: async (call: ServerWritableStream<StreamPostsRequest, StreamPostsResponse>) => {
      let afterId = 0; let messages = 0; let cancelled = false;
      call.on("cancelled", () => { cancelled = true; });
      try {
        while (!cancelled) {
          const page = await service.page(afterId, 500, call.request.authorId);
          if (!page.length) break;
          for (const post of page) {
            if (cancelled) break;
            if (!call.write({ post })) await new Promise<void>(resolve => {
              const done = () => resolve();
              call.once("drain", done); call.once("cancelled", done);
            });
            afterId = post.id; messages++;
          }
          const delay = Number(process.env.STREAM_PAGE_DELAY_MS ?? 0);
          if (delay > 0 && !cancelled) await new Promise(resolve => setTimeout(resolve, delay));
          if (page.length < 500) break;
        }
        call.end();
      } catch (error) { call.destroy(toGrpcError(error)); }
      finally { /* withRequestContext records messages, duration and cancellation status */ }
    },
    ListPosts: async (
      _call: ServerUnaryCall<ListPostsRequest, ListPostsResponse>,
      callback: sendUnaryData<ListPostsResponse>,
    ) => {
      try {
        callback(null, { posts: await service.list() });
      } catch (error) {
        callback(toGrpcError(error));
      }
    },

    GetPost: async (
      call: ServerUnaryCall<GetPostRequest, GetPostResponse>,
      callback: sendUnaryData<GetPostResponse>,
    ) => {
      try {
        callback(null, { post: await service.get(call.request.id) });
      } catch (error) {
        callback(toGrpcError(error));
      }
    },

    CreatePost: async (
      call: ServerUnaryCall<CreatePostRequest, CreatePostResponse>,
      callback: sendUnaryData<CreatePostResponse>,
    ) => {
      try {
        const input: CreatePostInput = {
          authorId: call.request.authorId,
          title: call.request.title,
          content: call.request.content,
        };
        callback(null, { post: await service.create(input) });
      } catch (error) {
        callback(toGrpcError(error));
      }
    },

    UpdatePost: async (
      call: ServerUnaryCall<UpdatePostRequest, UpdatePostResponse>,
      callback: sendUnaryData<UpdatePostResponse>,
    ) => {
      try {
        const input: UpdatePostInput = {};
        if (call.request.title) input.title = call.request.title;
        if (call.request.content) input.content = call.request.content;
        callback(null, { post: await service.update(call.request.id, input) });
      } catch (error) {
        callback(toGrpcError(error));
      }
    },

    DeletePost: async (
      call: ServerUnaryCall<DeletePostRequest, DeletePostResponse>,
      callback: sendUnaryData<DeletePostResponse>,
    ) => {
      try {
        await service.remove(call.request.id);
        callback(null, {});
      } catch (error) {
        callback(toGrpcError(error));
      }
    },
  };
}
