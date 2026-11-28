import type { ServerReadableStream, ServerUnaryCall, sendUnaryData } from "@grpc/grpc-js";
import { toGrpcError } from "../lib/grpc-error";
import type { CommentService } from "./comment.service";
import type { Comment, CreateCommentInput } from "./comment.entity";

interface ListCommentsByPostRequest { postId: number; }
interface ListCommentsByPostResponse { comments: Comment[]; }
interface CreateCommentRequest { postId: number; authorId: number; content: string; }
interface CreateCommentResponse { comment: Comment; }
interface DeleteCommentRequest { id: number; }
interface DeleteCommentResponse { postId: number; }
interface ImportCommentsRequest { postId: number; authorId: number; content: string; }
interface ImportCommentsResponse { imported: number; failed: number; errors: string[]; }

export function createCommentHandlers(service: CommentService) {
  return {
    ImportComments: async (
      call: ServerReadableStream<ImportCommentsRequest, ImportCommentsResponse>,
      callback: sendUnaryData<ImportCommentsResponse>,
    ) => {
      let imported = 0; let failed = 0; const errors: string[] = []; let batch: ImportCommentsRequest[] = [];
      const flush = async () => {
        if (!batch.length) return;
        const current = batch; batch = [];
        try { imported += (await service.createMany(current)).length; }
        catch (error) { failed += current.length; if (errors.length < 10) errors.push(error instanceof Error ? error.message : "batch insert failed"); }
      };
      try {
        for await (const item of call) { batch.push(item); if (batch.length >= 100) await flush(); }
        await flush();
        callback(null, { imported, failed, errors });
      } catch (error) { callback(toGrpcError(error), { imported, failed, errors: [...errors, error instanceof Error ? error.message : "stream failed"].slice(0, 10) }); }
    },
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
        const postId = await service.remove(call.request.id);
        callback(null, { postId });
      } catch (error) {
        callback(toGrpcError(error));
      }
    },
  };
}
