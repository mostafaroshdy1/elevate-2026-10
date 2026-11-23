import type * as grpc from '@grpc/grpc-js';
import type { MessageTypeDefinition } from '@grpc/proto-loader';

import type { Comment as _social_comments_Comment, Comment__Output as _social_comments_Comment__Output } from './social/comments/Comment';
import type { CommentServiceClient as _social_comments_CommentServiceClient, CommentServiceDefinition as _social_comments_CommentServiceDefinition } from './social/comments/CommentService';
import type { CreateCommentRequest as _social_comments_CreateCommentRequest, CreateCommentRequest__Output as _social_comments_CreateCommentRequest__Output } from './social/comments/CreateCommentRequest';
import type { CreateCommentResponse as _social_comments_CreateCommentResponse, CreateCommentResponse__Output as _social_comments_CreateCommentResponse__Output } from './social/comments/CreateCommentResponse';
import type { DeleteCommentRequest as _social_comments_DeleteCommentRequest, DeleteCommentRequest__Output as _social_comments_DeleteCommentRequest__Output } from './social/comments/DeleteCommentRequest';
import type { DeleteCommentResponse as _social_comments_DeleteCommentResponse, DeleteCommentResponse__Output as _social_comments_DeleteCommentResponse__Output } from './social/comments/DeleteCommentResponse';
import type { ListCommentsByPostRequest as _social_comments_ListCommentsByPostRequest, ListCommentsByPostRequest__Output as _social_comments_ListCommentsByPostRequest__Output } from './social/comments/ListCommentsByPostRequest';
import type { ListCommentsByPostResponse as _social_comments_ListCommentsByPostResponse, ListCommentsByPostResponse__Output as _social_comments_ListCommentsByPostResponse__Output } from './social/comments/ListCommentsByPostResponse';

type SubtypeConstructor<Constructor extends new (...args: any) => any, Subtype> = {
  new(...args: ConstructorParameters<Constructor>): Subtype;
};

export interface ProtoGrpcType {
  social: {
    comments: {
      Comment: MessageTypeDefinition<_social_comments_Comment, _social_comments_Comment__Output>
      CommentService: SubtypeConstructor<typeof grpc.Client, _social_comments_CommentServiceClient> & { service: _social_comments_CommentServiceDefinition }
      CreateCommentRequest: MessageTypeDefinition<_social_comments_CreateCommentRequest, _social_comments_CreateCommentRequest__Output>
      CreateCommentResponse: MessageTypeDefinition<_social_comments_CreateCommentResponse, _social_comments_CreateCommentResponse__Output>
      DeleteCommentRequest: MessageTypeDefinition<_social_comments_DeleteCommentRequest, _social_comments_DeleteCommentRequest__Output>
      DeleteCommentResponse: MessageTypeDefinition<_social_comments_DeleteCommentResponse, _social_comments_DeleteCommentResponse__Output>
      ListCommentsByPostRequest: MessageTypeDefinition<_social_comments_ListCommentsByPostRequest, _social_comments_ListCommentsByPostRequest__Output>
      ListCommentsByPostResponse: MessageTypeDefinition<_social_comments_ListCommentsByPostResponse, _social_comments_ListCommentsByPostResponse__Output>
    }
  }
}

