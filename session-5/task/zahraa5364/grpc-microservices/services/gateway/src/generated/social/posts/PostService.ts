// Original file: ../../proto/social/posts/posts.proto

import type * as grpc from '@grpc/grpc-js'
import type { MethodDefinition } from '@grpc/proto-loader'
import type { CreatePostRequest as _social_posts_CreatePostRequest, CreatePostRequest__Output as _social_posts_CreatePostRequest__Output } from '../../social/posts/CreatePostRequest';
import type { CreatePostResponse as _social_posts_CreatePostResponse, CreatePostResponse__Output as _social_posts_CreatePostResponse__Output } from '../../social/posts/CreatePostResponse';
import type { DeletePostRequest as _social_posts_DeletePostRequest, DeletePostRequest__Output as _social_posts_DeletePostRequest__Output } from '../../social/posts/DeletePostRequest';
import type { DeletePostResponse as _social_posts_DeletePostResponse, DeletePostResponse__Output as _social_posts_DeletePostResponse__Output } from '../../social/posts/DeletePostResponse';
import type { GetPostRequest as _social_posts_GetPostRequest, GetPostRequest__Output as _social_posts_GetPostRequest__Output } from '../../social/posts/GetPostRequest';
import type { GetPostResponse as _social_posts_GetPostResponse, GetPostResponse__Output as _social_posts_GetPostResponse__Output } from '../../social/posts/GetPostResponse';
import type { ListPostsRequest as _social_posts_ListPostsRequest, ListPostsRequest__Output as _social_posts_ListPostsRequest__Output } from '../../social/posts/ListPostsRequest';
import type { ListPostsResponse as _social_posts_ListPostsResponse, ListPostsResponse__Output as _social_posts_ListPostsResponse__Output } from '../../social/posts/ListPostsResponse';
import type { StreamPostsRequest as _social_posts_StreamPostsRequest, StreamPostsRequest__Output as _social_posts_StreamPostsRequest__Output } from '../../social/posts/StreamPostsRequest';
import type { StreamPostsResponse as _social_posts_StreamPostsResponse, StreamPostsResponse__Output as _social_posts_StreamPostsResponse__Output } from '../../social/posts/StreamPostsResponse';
import type { UpdatePostRequest as _social_posts_UpdatePostRequest, UpdatePostRequest__Output as _social_posts_UpdatePostRequest__Output } from '../../social/posts/UpdatePostRequest';
import type { UpdatePostResponse as _social_posts_UpdatePostResponse, UpdatePostResponse__Output as _social_posts_UpdatePostResponse__Output } from '../../social/posts/UpdatePostResponse';

export interface PostServiceClient extends grpc.Client {
  CreatePost(argument: _social_posts_CreatePostRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_social_posts_CreatePostResponse__Output>): grpc.ClientUnaryCall;
  CreatePost(argument: _social_posts_CreatePostRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_social_posts_CreatePostResponse__Output>): grpc.ClientUnaryCall;
  CreatePost(argument: _social_posts_CreatePostRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_social_posts_CreatePostResponse__Output>): grpc.ClientUnaryCall;
  CreatePost(argument: _social_posts_CreatePostRequest, callback: grpc.requestCallback<_social_posts_CreatePostResponse__Output>): grpc.ClientUnaryCall;
  createPost(argument: _social_posts_CreatePostRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_social_posts_CreatePostResponse__Output>): grpc.ClientUnaryCall;
  createPost(argument: _social_posts_CreatePostRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_social_posts_CreatePostResponse__Output>): grpc.ClientUnaryCall;
  createPost(argument: _social_posts_CreatePostRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_social_posts_CreatePostResponse__Output>): grpc.ClientUnaryCall;
  createPost(argument: _social_posts_CreatePostRequest, callback: grpc.requestCallback<_social_posts_CreatePostResponse__Output>): grpc.ClientUnaryCall;
  
  DeletePost(argument: _social_posts_DeletePostRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_social_posts_DeletePostResponse__Output>): grpc.ClientUnaryCall;
  DeletePost(argument: _social_posts_DeletePostRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_social_posts_DeletePostResponse__Output>): grpc.ClientUnaryCall;
  DeletePost(argument: _social_posts_DeletePostRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_social_posts_DeletePostResponse__Output>): grpc.ClientUnaryCall;
  DeletePost(argument: _social_posts_DeletePostRequest, callback: grpc.requestCallback<_social_posts_DeletePostResponse__Output>): grpc.ClientUnaryCall;
  deletePost(argument: _social_posts_DeletePostRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_social_posts_DeletePostResponse__Output>): grpc.ClientUnaryCall;
  deletePost(argument: _social_posts_DeletePostRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_social_posts_DeletePostResponse__Output>): grpc.ClientUnaryCall;
  deletePost(argument: _social_posts_DeletePostRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_social_posts_DeletePostResponse__Output>): grpc.ClientUnaryCall;
  deletePost(argument: _social_posts_DeletePostRequest, callback: grpc.requestCallback<_social_posts_DeletePostResponse__Output>): grpc.ClientUnaryCall;
  
  GetPost(argument: _social_posts_GetPostRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_social_posts_GetPostResponse__Output>): grpc.ClientUnaryCall;
  GetPost(argument: _social_posts_GetPostRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_social_posts_GetPostResponse__Output>): grpc.ClientUnaryCall;
  GetPost(argument: _social_posts_GetPostRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_social_posts_GetPostResponse__Output>): grpc.ClientUnaryCall;
  GetPost(argument: _social_posts_GetPostRequest, callback: grpc.requestCallback<_social_posts_GetPostResponse__Output>): grpc.ClientUnaryCall;
  getPost(argument: _social_posts_GetPostRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_social_posts_GetPostResponse__Output>): grpc.ClientUnaryCall;
  getPost(argument: _social_posts_GetPostRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_social_posts_GetPostResponse__Output>): grpc.ClientUnaryCall;
  getPost(argument: _social_posts_GetPostRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_social_posts_GetPostResponse__Output>): grpc.ClientUnaryCall;
  getPost(argument: _social_posts_GetPostRequest, callback: grpc.requestCallback<_social_posts_GetPostResponse__Output>): grpc.ClientUnaryCall;
  
  ListPosts(argument: _social_posts_ListPostsRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_social_posts_ListPostsResponse__Output>): grpc.ClientUnaryCall;
  ListPosts(argument: _social_posts_ListPostsRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_social_posts_ListPostsResponse__Output>): grpc.ClientUnaryCall;
  ListPosts(argument: _social_posts_ListPostsRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_social_posts_ListPostsResponse__Output>): grpc.ClientUnaryCall;
  ListPosts(argument: _social_posts_ListPostsRequest, callback: grpc.requestCallback<_social_posts_ListPostsResponse__Output>): grpc.ClientUnaryCall;
  listPosts(argument: _social_posts_ListPostsRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_social_posts_ListPostsResponse__Output>): grpc.ClientUnaryCall;
  listPosts(argument: _social_posts_ListPostsRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_social_posts_ListPostsResponse__Output>): grpc.ClientUnaryCall;
  listPosts(argument: _social_posts_ListPostsRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_social_posts_ListPostsResponse__Output>): grpc.ClientUnaryCall;
  listPosts(argument: _social_posts_ListPostsRequest, callback: grpc.requestCallback<_social_posts_ListPostsResponse__Output>): grpc.ClientUnaryCall;
  
  StreamPosts(argument: _social_posts_StreamPostsRequest, metadata: grpc.Metadata, options?: grpc.CallOptions): grpc.ClientReadableStream<_social_posts_StreamPostsResponse__Output>;
  StreamPosts(argument: _social_posts_StreamPostsRequest, options?: grpc.CallOptions): grpc.ClientReadableStream<_social_posts_StreamPostsResponse__Output>;
  streamPosts(argument: _social_posts_StreamPostsRequest, metadata: grpc.Metadata, options?: grpc.CallOptions): grpc.ClientReadableStream<_social_posts_StreamPostsResponse__Output>;
  streamPosts(argument: _social_posts_StreamPostsRequest, options?: grpc.CallOptions): grpc.ClientReadableStream<_social_posts_StreamPostsResponse__Output>;
  
  UpdatePost(argument: _social_posts_UpdatePostRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_social_posts_UpdatePostResponse__Output>): grpc.ClientUnaryCall;
  UpdatePost(argument: _social_posts_UpdatePostRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_social_posts_UpdatePostResponse__Output>): grpc.ClientUnaryCall;
  UpdatePost(argument: _social_posts_UpdatePostRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_social_posts_UpdatePostResponse__Output>): grpc.ClientUnaryCall;
  UpdatePost(argument: _social_posts_UpdatePostRequest, callback: grpc.requestCallback<_social_posts_UpdatePostResponse__Output>): grpc.ClientUnaryCall;
  updatePost(argument: _social_posts_UpdatePostRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_social_posts_UpdatePostResponse__Output>): grpc.ClientUnaryCall;
  updatePost(argument: _social_posts_UpdatePostRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_social_posts_UpdatePostResponse__Output>): grpc.ClientUnaryCall;
  updatePost(argument: _social_posts_UpdatePostRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_social_posts_UpdatePostResponse__Output>): grpc.ClientUnaryCall;
  updatePost(argument: _social_posts_UpdatePostRequest, callback: grpc.requestCallback<_social_posts_UpdatePostResponse__Output>): grpc.ClientUnaryCall;
  
}

export interface PostServiceHandlers extends grpc.UntypedServiceImplementation {
  CreatePost: grpc.handleUnaryCall<_social_posts_CreatePostRequest__Output, _social_posts_CreatePostResponse>;
  
  DeletePost: grpc.handleUnaryCall<_social_posts_DeletePostRequest__Output, _social_posts_DeletePostResponse>;
  
  GetPost: grpc.handleUnaryCall<_social_posts_GetPostRequest__Output, _social_posts_GetPostResponse>;
  
  ListPosts: grpc.handleUnaryCall<_social_posts_ListPostsRequest__Output, _social_posts_ListPostsResponse>;
  
  StreamPosts: grpc.handleServerStreamingCall<_social_posts_StreamPostsRequest__Output, _social_posts_StreamPostsResponse>;
  
  UpdatePost: grpc.handleUnaryCall<_social_posts_UpdatePostRequest__Output, _social_posts_UpdatePostResponse>;
  
}

export interface PostServiceDefinition extends grpc.ServiceDefinition {
  CreatePost: MethodDefinition<_social_posts_CreatePostRequest, _social_posts_CreatePostResponse, _social_posts_CreatePostRequest__Output, _social_posts_CreatePostResponse__Output>
  DeletePost: MethodDefinition<_social_posts_DeletePostRequest, _social_posts_DeletePostResponse, _social_posts_DeletePostRequest__Output, _social_posts_DeletePostResponse__Output>
  GetPost: MethodDefinition<_social_posts_GetPostRequest, _social_posts_GetPostResponse, _social_posts_GetPostRequest__Output, _social_posts_GetPostResponse__Output>
  ListPosts: MethodDefinition<_social_posts_ListPostsRequest, _social_posts_ListPostsResponse, _social_posts_ListPostsRequest__Output, _social_posts_ListPostsResponse__Output>
  StreamPosts: MethodDefinition<_social_posts_StreamPostsRequest, _social_posts_StreamPostsResponse, _social_posts_StreamPostsRequest__Output, _social_posts_StreamPostsResponse__Output>
  UpdatePost: MethodDefinition<_social_posts_UpdatePostRequest, _social_posts_UpdatePostResponse, _social_posts_UpdatePostRequest__Output, _social_posts_UpdatePostResponse__Output>
}
