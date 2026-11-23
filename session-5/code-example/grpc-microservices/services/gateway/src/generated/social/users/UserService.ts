// Original file: ../../proto/social/users/users.proto

import type * as grpc from '@grpc/grpc-js'
import type { MethodDefinition } from '@grpc/proto-loader'
import type { CreateUserRequest as _social_users_CreateUserRequest, CreateUserRequest__Output as _social_users_CreateUserRequest__Output } from '../../social/users/CreateUserRequest';
import type { CreateUserResponse as _social_users_CreateUserResponse, CreateUserResponse__Output as _social_users_CreateUserResponse__Output } from '../../social/users/CreateUserResponse';
import type { DeleteUserRequest as _social_users_DeleteUserRequest, DeleteUserRequest__Output as _social_users_DeleteUserRequest__Output } from '../../social/users/DeleteUserRequest';
import type { DeleteUserResponse as _social_users_DeleteUserResponse, DeleteUserResponse__Output as _social_users_DeleteUserResponse__Output } from '../../social/users/DeleteUserResponse';
import type { GetUserRequest as _social_users_GetUserRequest, GetUserRequest__Output as _social_users_GetUserRequest__Output } from '../../social/users/GetUserRequest';
import type { GetUserResponse as _social_users_GetUserResponse, GetUserResponse__Output as _social_users_GetUserResponse__Output } from '../../social/users/GetUserResponse';
import type { ListUsersRequest as _social_users_ListUsersRequest, ListUsersRequest__Output as _social_users_ListUsersRequest__Output } from '../../social/users/ListUsersRequest';
import type { ListUsersResponse as _social_users_ListUsersResponse, ListUsersResponse__Output as _social_users_ListUsersResponse__Output } from '../../social/users/ListUsersResponse';
import type { UpdateUserRequest as _social_users_UpdateUserRequest, UpdateUserRequest__Output as _social_users_UpdateUserRequest__Output } from '../../social/users/UpdateUserRequest';
import type { UpdateUserResponse as _social_users_UpdateUserResponse, UpdateUserResponse__Output as _social_users_UpdateUserResponse__Output } from '../../social/users/UpdateUserResponse';

export interface UserServiceClient extends grpc.Client {
  CreateUser(argument: _social_users_CreateUserRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_social_users_CreateUserResponse__Output>): grpc.ClientUnaryCall;
  CreateUser(argument: _social_users_CreateUserRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_social_users_CreateUserResponse__Output>): grpc.ClientUnaryCall;
  CreateUser(argument: _social_users_CreateUserRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_social_users_CreateUserResponse__Output>): grpc.ClientUnaryCall;
  CreateUser(argument: _social_users_CreateUserRequest, callback: grpc.requestCallback<_social_users_CreateUserResponse__Output>): grpc.ClientUnaryCall;
  createUser(argument: _social_users_CreateUserRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_social_users_CreateUserResponse__Output>): grpc.ClientUnaryCall;
  createUser(argument: _social_users_CreateUserRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_social_users_CreateUserResponse__Output>): grpc.ClientUnaryCall;
  createUser(argument: _social_users_CreateUserRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_social_users_CreateUserResponse__Output>): grpc.ClientUnaryCall;
  createUser(argument: _social_users_CreateUserRequest, callback: grpc.requestCallback<_social_users_CreateUserResponse__Output>): grpc.ClientUnaryCall;
  
  DeleteUser(argument: _social_users_DeleteUserRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_social_users_DeleteUserResponse__Output>): grpc.ClientUnaryCall;
  DeleteUser(argument: _social_users_DeleteUserRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_social_users_DeleteUserResponse__Output>): grpc.ClientUnaryCall;
  DeleteUser(argument: _social_users_DeleteUserRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_social_users_DeleteUserResponse__Output>): grpc.ClientUnaryCall;
  DeleteUser(argument: _social_users_DeleteUserRequest, callback: grpc.requestCallback<_social_users_DeleteUserResponse__Output>): grpc.ClientUnaryCall;
  deleteUser(argument: _social_users_DeleteUserRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_social_users_DeleteUserResponse__Output>): grpc.ClientUnaryCall;
  deleteUser(argument: _social_users_DeleteUserRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_social_users_DeleteUserResponse__Output>): grpc.ClientUnaryCall;
  deleteUser(argument: _social_users_DeleteUserRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_social_users_DeleteUserResponse__Output>): grpc.ClientUnaryCall;
  deleteUser(argument: _social_users_DeleteUserRequest, callback: grpc.requestCallback<_social_users_DeleteUserResponse__Output>): grpc.ClientUnaryCall;
  
  GetUser(argument: _social_users_GetUserRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_social_users_GetUserResponse__Output>): grpc.ClientUnaryCall;
  GetUser(argument: _social_users_GetUserRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_social_users_GetUserResponse__Output>): grpc.ClientUnaryCall;
  GetUser(argument: _social_users_GetUserRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_social_users_GetUserResponse__Output>): grpc.ClientUnaryCall;
  GetUser(argument: _social_users_GetUserRequest, callback: grpc.requestCallback<_social_users_GetUserResponse__Output>): grpc.ClientUnaryCall;
  getUser(argument: _social_users_GetUserRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_social_users_GetUserResponse__Output>): grpc.ClientUnaryCall;
  getUser(argument: _social_users_GetUserRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_social_users_GetUserResponse__Output>): grpc.ClientUnaryCall;
  getUser(argument: _social_users_GetUserRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_social_users_GetUserResponse__Output>): grpc.ClientUnaryCall;
  getUser(argument: _social_users_GetUserRequest, callback: grpc.requestCallback<_social_users_GetUserResponse__Output>): grpc.ClientUnaryCall;
  
  ListUsers(argument: _social_users_ListUsersRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_social_users_ListUsersResponse__Output>): grpc.ClientUnaryCall;
  ListUsers(argument: _social_users_ListUsersRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_social_users_ListUsersResponse__Output>): grpc.ClientUnaryCall;
  ListUsers(argument: _social_users_ListUsersRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_social_users_ListUsersResponse__Output>): grpc.ClientUnaryCall;
  ListUsers(argument: _social_users_ListUsersRequest, callback: grpc.requestCallback<_social_users_ListUsersResponse__Output>): grpc.ClientUnaryCall;
  listUsers(argument: _social_users_ListUsersRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_social_users_ListUsersResponse__Output>): grpc.ClientUnaryCall;
  listUsers(argument: _social_users_ListUsersRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_social_users_ListUsersResponse__Output>): grpc.ClientUnaryCall;
  listUsers(argument: _social_users_ListUsersRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_social_users_ListUsersResponse__Output>): grpc.ClientUnaryCall;
  listUsers(argument: _social_users_ListUsersRequest, callback: grpc.requestCallback<_social_users_ListUsersResponse__Output>): grpc.ClientUnaryCall;
  
  UpdateUser(argument: _social_users_UpdateUserRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_social_users_UpdateUserResponse__Output>): grpc.ClientUnaryCall;
  UpdateUser(argument: _social_users_UpdateUserRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_social_users_UpdateUserResponse__Output>): grpc.ClientUnaryCall;
  UpdateUser(argument: _social_users_UpdateUserRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_social_users_UpdateUserResponse__Output>): grpc.ClientUnaryCall;
  UpdateUser(argument: _social_users_UpdateUserRequest, callback: grpc.requestCallback<_social_users_UpdateUserResponse__Output>): grpc.ClientUnaryCall;
  updateUser(argument: _social_users_UpdateUserRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_social_users_UpdateUserResponse__Output>): grpc.ClientUnaryCall;
  updateUser(argument: _social_users_UpdateUserRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_social_users_UpdateUserResponse__Output>): grpc.ClientUnaryCall;
  updateUser(argument: _social_users_UpdateUserRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_social_users_UpdateUserResponse__Output>): grpc.ClientUnaryCall;
  updateUser(argument: _social_users_UpdateUserRequest, callback: grpc.requestCallback<_social_users_UpdateUserResponse__Output>): grpc.ClientUnaryCall;
  
}

export interface UserServiceHandlers extends grpc.UntypedServiceImplementation {
  CreateUser: grpc.handleUnaryCall<_social_users_CreateUserRequest__Output, _social_users_CreateUserResponse>;
  
  DeleteUser: grpc.handleUnaryCall<_social_users_DeleteUserRequest__Output, _social_users_DeleteUserResponse>;
  
  GetUser: grpc.handleUnaryCall<_social_users_GetUserRequest__Output, _social_users_GetUserResponse>;
  
  ListUsers: grpc.handleUnaryCall<_social_users_ListUsersRequest__Output, _social_users_ListUsersResponse>;
  
  UpdateUser: grpc.handleUnaryCall<_social_users_UpdateUserRequest__Output, _social_users_UpdateUserResponse>;
  
}

export interface UserServiceDefinition extends grpc.ServiceDefinition {
  CreateUser: MethodDefinition<_social_users_CreateUserRequest, _social_users_CreateUserResponse, _social_users_CreateUserRequest__Output, _social_users_CreateUserResponse__Output>
  DeleteUser: MethodDefinition<_social_users_DeleteUserRequest, _social_users_DeleteUserResponse, _social_users_DeleteUserRequest__Output, _social_users_DeleteUserResponse__Output>
  GetUser: MethodDefinition<_social_users_GetUserRequest, _social_users_GetUserResponse, _social_users_GetUserRequest__Output, _social_users_GetUserResponse__Output>
  ListUsers: MethodDefinition<_social_users_ListUsersRequest, _social_users_ListUsersResponse, _social_users_ListUsersRequest__Output, _social_users_ListUsersResponse__Output>
  UpdateUser: MethodDefinition<_social_users_UpdateUserRequest, _social_users_UpdateUserResponse, _social_users_UpdateUserRequest__Output, _social_users_UpdateUserResponse__Output>
}
