import type { ServerUnaryCall, sendUnaryData } from "@grpc/grpc-js";
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

export function createPostHandlers(service: PostService) {
  return {
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
