// Original file: ../../proto/social/comments/comments.proto

import type * as grpc from '@grpc/grpc-js'
import type { MethodDefinition } from '@grpc/proto-loader'
import type { CreateCommentRequest as _social_comments_CreateCommentRequest, CreateCommentRequest__Output as _social_comments_CreateCommentRequest__Output } from '../../social/comments/CreateCommentRequest';
import type { CreateCommentResponse as _social_comments_CreateCommentResponse, CreateCommentResponse__Output as _social_comments_CreateCommentResponse__Output } from '../../social/comments/CreateCommentResponse';
import type { DeleteCommentRequest as _social_comments_DeleteCommentRequest, DeleteCommentRequest__Output as _social_comments_DeleteCommentRequest__Output } from '../../social/comments/DeleteCommentRequest';
import type { DeleteCommentResponse as _social_comments_DeleteCommentResponse, DeleteCommentResponse__Output as _social_comments_DeleteCommentResponse__Output } from '../../social/comments/DeleteCommentResponse';
import type { ListCommentsByPostRequest as _social_comments_ListCommentsByPostRequest, ListCommentsByPostRequest__Output as _social_comments_ListCommentsByPostRequest__Output } from '../../social/comments/ListCommentsByPostRequest';
import type { ListCommentsByPostResponse as _social_comments_ListCommentsByPostResponse, ListCommentsByPostResponse__Output as _social_comments_ListCommentsByPostResponse__Output } from '../../social/comments/ListCommentsByPostResponse';

export interface CommentServiceClient extends grpc.Client {
  CreateComment(argument: _social_comments_CreateCommentRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_social_comments_CreateCommentResponse__Output>): grpc.ClientUnaryCall;
  CreateComment(argument: _social_comments_CreateCommentRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_social_comments_CreateCommentResponse__Output>): grpc.ClientUnaryCall;
  CreateComment(argument: _social_comments_CreateCommentRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_social_comments_CreateCommentResponse__Output>): grpc.ClientUnaryCall;
  CreateComment(argument: _social_comments_CreateCommentRequest, callback: grpc.requestCallback<_social_comments_CreateCommentResponse__Output>): grpc.ClientUnaryCall;
  createComment(argument: _social_comments_CreateCommentRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_social_comments_CreateCommentResponse__Output>): grpc.ClientUnaryCall;
  createComment(argument: _social_comments_CreateCommentRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_social_comments_CreateCommentResponse__Output>): grpc.ClientUnaryCall;
  createComment(argument: _social_comments_CreateCommentRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_social_comments_CreateCommentResponse__Output>): grpc.ClientUnaryCall;
  createComment(argument: _social_comments_CreateCommentRequest, callback: grpc.requestCallback<_social_comments_CreateCommentResponse__Output>): grpc.ClientUnaryCall;
  
  DeleteComment(argument: _social_comments_DeleteCommentRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_social_comments_DeleteCommentResponse__Output>): grpc.ClientUnaryCall;
  DeleteComment(argument: _social_comments_DeleteCommentRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_social_comments_DeleteCommentResponse__Output>): grpc.ClientUnaryCall;
  DeleteComment(argument: _social_comments_DeleteCommentRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_social_comments_DeleteCommentResponse__Output>): grpc.ClientUnaryCall;
  DeleteComment(argument: _social_comments_DeleteCommentRequest, callback: grpc.requestCallback<_social_comments_DeleteCommentResponse__Output>): grpc.ClientUnaryCall;
  deleteComment(argument: _social_comments_DeleteCommentRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_social_comments_DeleteCommentResponse__Output>): grpc.ClientUnaryCall;
  deleteComment(argument: _social_comments_DeleteCommentRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_social_comments_DeleteCommentResponse__Output>): grpc.ClientUnaryCall;
  deleteComment(argument: _social_comments_DeleteCommentRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_social_comments_DeleteCommentResponse__Output>): grpc.ClientUnaryCall;
  deleteComment(argument: _social_comments_DeleteCommentRequest, callback: grpc.requestCallback<_social_comments_DeleteCommentResponse__Output>): grpc.ClientUnaryCall;
  
  ListCommentsByPost(argument: _social_comments_ListCommentsByPostRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_social_comments_ListCommentsByPostResponse__Output>): grpc.ClientUnaryCall;
  ListCommentsByPost(argument: _social_comments_ListCommentsByPostRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_social_comments_ListCommentsByPostResponse__Output>): grpc.ClientUnaryCall;
  ListCommentsByPost(argument: _social_comments_ListCommentsByPostRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_social_comments_ListCommentsByPostResponse__Output>): grpc.ClientUnaryCall;
  ListCommentsByPost(argument: _social_comments_ListCommentsByPostRequest, callback: grpc.requestCallback<_social_comments_ListCommentsByPostResponse__Output>): grpc.ClientUnaryCall;
  listCommentsByPost(argument: _social_comments_ListCommentsByPostRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_social_comments_ListCommentsByPostResponse__Output>): grpc.ClientUnaryCall;
  listCommentsByPost(argument: _social_comments_ListCommentsByPostRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_social_comments_ListCommentsByPostResponse__Output>): grpc.ClientUnaryCall;
  listCommentsByPost(argument: _social_comments_ListCommentsByPostRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_social_comments_ListCommentsByPostResponse__Output>): grpc.ClientUnaryCall;
  listCommentsByPost(argument: _social_comments_ListCommentsByPostRequest, callback: grpc.requestCallback<_social_comments_ListCommentsByPostResponse__Output>): grpc.ClientUnaryCall;
  
}

export interface CommentServiceHandlers extends grpc.UntypedServiceImplementation {
  CreateComment: grpc.handleUnaryCall<_social_comments_CreateCommentRequest__Output, _social_comments_CreateCommentResponse>;
  
  DeleteComment: grpc.handleUnaryCall<_social_comments_DeleteCommentRequest__Output, _social_comments_DeleteCommentResponse>;
  
  ListCommentsByPost: grpc.handleUnaryCall<_social_comments_ListCommentsByPostRequest__Output, _social_comments_ListCommentsByPostResponse>;
  
}

export interface CommentServiceDefinition extends grpc.ServiceDefinition {
  CreateComment: MethodDefinition<_social_comments_CreateCommentRequest, _social_comments_CreateCommentResponse, _social_comments_CreateCommentRequest__Output, _social_comments_CreateCommentResponse__Output>
  DeleteComment: MethodDefinition<_social_comments_DeleteCommentRequest, _social_comments_DeleteCommentResponse, _social_comments_DeleteCommentRequest__Output, _social_comments_DeleteCommentResponse__Output>
  ListCommentsByPost: MethodDefinition<_social_comments_ListCommentsByPostRequest, _social_comments_ListCommentsByPostResponse, _social_comments_ListCommentsByPostRequest__Output, _social_comments_ListCommentsByPostResponse__Output>
}
