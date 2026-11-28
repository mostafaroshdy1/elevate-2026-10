import type * as grpc from '@grpc/grpc-js';
import type { MessageTypeDefinition } from '@grpc/proto-loader';

import type { CreatePostRequest as _social_posts_CreatePostRequest, CreatePostRequest__Output as _social_posts_CreatePostRequest__Output } from './social/posts/CreatePostRequest';
import type { CreatePostResponse as _social_posts_CreatePostResponse, CreatePostResponse__Output as _social_posts_CreatePostResponse__Output } from './social/posts/CreatePostResponse';
import type { DeletePostRequest as _social_posts_DeletePostRequest, DeletePostRequest__Output as _social_posts_DeletePostRequest__Output } from './social/posts/DeletePostRequest';
import type { DeletePostResponse as _social_posts_DeletePostResponse, DeletePostResponse__Output as _social_posts_DeletePostResponse__Output } from './social/posts/DeletePostResponse';
import type { GetPostRequest as _social_posts_GetPostRequest, GetPostRequest__Output as _social_posts_GetPostRequest__Output } from './social/posts/GetPostRequest';
import type { GetPostResponse as _social_posts_GetPostResponse, GetPostResponse__Output as _social_posts_GetPostResponse__Output } from './social/posts/GetPostResponse';
import type { ListPostsRequest as _social_posts_ListPostsRequest, ListPostsRequest__Output as _social_posts_ListPostsRequest__Output } from './social/posts/ListPostsRequest';
import type { ListPostsResponse as _social_posts_ListPostsResponse, ListPostsResponse__Output as _social_posts_ListPostsResponse__Output } from './social/posts/ListPostsResponse';
import type { Post as _social_posts_Post, Post__Output as _social_posts_Post__Output } from './social/posts/Post';
import type { PostServiceClient as _social_posts_PostServiceClient, PostServiceDefinition as _social_posts_PostServiceDefinition } from './social/posts/PostService';
import type { StreamPostsRequest as _social_posts_StreamPostsRequest, StreamPostsRequest__Output as _social_posts_StreamPostsRequest__Output } from './social/posts/StreamPostsRequest';
import type { StreamPostsResponse as _social_posts_StreamPostsResponse, StreamPostsResponse__Output as _social_posts_StreamPostsResponse__Output } from './social/posts/StreamPostsResponse';
import type { UpdatePostRequest as _social_posts_UpdatePostRequest, UpdatePostRequest__Output as _social_posts_UpdatePostRequest__Output } from './social/posts/UpdatePostRequest';
import type { UpdatePostResponse as _social_posts_UpdatePostResponse, UpdatePostResponse__Output as _social_posts_UpdatePostResponse__Output } from './social/posts/UpdatePostResponse';

type SubtypeConstructor<Constructor extends new (...args: any) => any, Subtype> = {
  new(...args: ConstructorParameters<Constructor>): Subtype;
};

export interface ProtoGrpcType {
  social: {
    posts: {
      CreatePostRequest: MessageTypeDefinition<_social_posts_CreatePostRequest, _social_posts_CreatePostRequest__Output>
      CreatePostResponse: MessageTypeDefinition<_social_posts_CreatePostResponse, _social_posts_CreatePostResponse__Output>
      DeletePostRequest: MessageTypeDefinition<_social_posts_DeletePostRequest, _social_posts_DeletePostRequest__Output>
      DeletePostResponse: MessageTypeDefinition<_social_posts_DeletePostResponse, _social_posts_DeletePostResponse__Output>
      GetPostRequest: MessageTypeDefinition<_social_posts_GetPostRequest, _social_posts_GetPostRequest__Output>
      GetPostResponse: MessageTypeDefinition<_social_posts_GetPostResponse, _social_posts_GetPostResponse__Output>
      ListPostsRequest: MessageTypeDefinition<_social_posts_ListPostsRequest, _social_posts_ListPostsRequest__Output>
      ListPostsResponse: MessageTypeDefinition<_social_posts_ListPostsResponse, _social_posts_ListPostsResponse__Output>
      Post: MessageTypeDefinition<_social_posts_Post, _social_posts_Post__Output>
      PostService: SubtypeConstructor<typeof grpc.Client, _social_posts_PostServiceClient> & { service: _social_posts_PostServiceDefinition }
      StreamPostsRequest: MessageTypeDefinition<_social_posts_StreamPostsRequest, _social_posts_StreamPostsRequest__Output>
      StreamPostsResponse: MessageTypeDefinition<_social_posts_StreamPostsResponse, _social_posts_StreamPostsResponse__Output>
      UpdatePostRequest: MessageTypeDefinition<_social_posts_UpdatePostRequest, _social_posts_UpdatePostRequest__Output>
      UpdatePostResponse: MessageTypeDefinition<_social_posts_UpdatePostResponse, _social_posts_UpdatePostResponse__Output>
    }
  }
}

