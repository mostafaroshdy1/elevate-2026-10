import type { ServerUnaryCall, sendUnaryData } from "@grpc/grpc-js";
import { toGrpcError } from "../lib/grpc-error";
import type { CommentService } from "./comment.service";
import type { Comment, CreateCommentInput } from "./comment.entity";

interface ListCommentsByPostRequest { postId: number; }
interface ListCommentsByPostResponse { comments: Comment[]; }
interface CreateCommentRequest { postId: number; authorId: number; content: string; }
interface CreateCommentResponse { comment: Comment; }
interface DeleteCommentRequest { id: number; }
interface DeleteCommentResponse {}

export function createCommentHandlers(service: CommentService) {
  return {
    ListCommentsByPost: async (
      call: ServerUnaryCall<ListCommentsByPostRequest, ListCommentsByPostResponse>,
      callback: sendUnaryData<ListCommentsByPostResponse>,
    ) => {
      try {
        callback(null, { comments: await service.listByPost(call.request.postId) });
      } catch (error) {
        callback(toGrpcError(error));
      }
    },

    CreateComment: async (
      call: ServerUnaryCall<CreateCommentRequest, CreateCommentResponse>,
      callback: sendUnaryData<CreateCommentResponse>,
    ) => {
      try {
        const input: CreateCommentInput = {
          postId: call.request.postId,
          authorId: call.request.authorId,
          content: call.request.content,
        };
        callback(null, { comment: await service.create(input) });
      } catch (error) {
        callback(toGrpcError(error));
      }
    },

    DeleteComment: async (
      call: ServerUnaryCall<DeleteCommentRequest, DeleteCommentResponse>,
      callback: sendUnaryData<DeleteCommentResponse>,
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
