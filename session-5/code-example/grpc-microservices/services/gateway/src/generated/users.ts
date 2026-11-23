import type * as grpc from '@grpc/grpc-js';
import type { MessageTypeDefinition } from '@grpc/proto-loader';

import type { CreateUserRequest as _social_users_CreateUserRequest, CreateUserRequest__Output as _social_users_CreateUserRequest__Output } from './social/users/CreateUserRequest';
import type { CreateUserResponse as _social_users_CreateUserResponse, CreateUserResponse__Output as _social_users_CreateUserResponse__Output } from './social/users/CreateUserResponse';
import type { DeleteUserRequest as _social_users_DeleteUserRequest, DeleteUserRequest__Output as _social_users_DeleteUserRequest__Output } from './social/users/DeleteUserRequest';
import type { DeleteUserResponse as _social_users_DeleteUserResponse, DeleteUserResponse__Output as _social_users_DeleteUserResponse__Output } from './social/users/DeleteUserResponse';
import type { GetUserRequest as _social_users_GetUserRequest, GetUserRequest__Output as _social_users_GetUserRequest__Output } from './social/users/GetUserRequest';
import type { GetUserResponse as _social_users_GetUserResponse, GetUserResponse__Output as _social_users_GetUserResponse__Output } from './social/users/GetUserResponse';
import type { ListUsersRequest as _social_users_ListUsersRequest, ListUsersRequest__Output as _social_users_ListUsersRequest__Output } from './social/users/ListUsersRequest';
import type { ListUsersResponse as _social_users_ListUsersResponse, ListUsersResponse__Output as _social_users_ListUsersResponse__Output } from './social/users/ListUsersResponse';
import type { UpdateUserRequest as _social_users_UpdateUserRequest, UpdateUserRequest__Output as _social_users_UpdateUserRequest__Output } from './social/users/UpdateUserRequest';
import type { UpdateUserResponse as _social_users_UpdateUserResponse, UpdateUserResponse__Output as _social_users_UpdateUserResponse__Output } from './social/users/UpdateUserResponse';
import type { User as _social_users_User, User__Output as _social_users_User__Output } from './social/users/User';
import type { UserServiceClient as _social_users_UserServiceClient, UserServiceDefinition as _social_users_UserServiceDefinition } from './social/users/UserService';

type SubtypeConstructor<Constructor extends new (...args: any) => any, Subtype> = {
  new(...args: ConstructorParameters<Constructor>): Subtype;
};

export interface ProtoGrpcType {
  social: {
    users: {
      CreateUserRequest: MessageTypeDefinition<_social_users_CreateUserRequest, _social_users_CreateUserRequest__Output>
      CreateUserResponse: MessageTypeDefinition<_social_users_CreateUserResponse, _social_users_CreateUserResponse__Output>
      DeleteUserRequest: MessageTypeDefinition<_social_users_DeleteUserRequest, _social_users_DeleteUserRequest__Output>
      DeleteUserResponse: MessageTypeDefinition<_social_users_DeleteUserResponse, _social_users_DeleteUserResponse__Output>
      GetUserRequest: MessageTypeDefinition<_social_users_GetUserRequest, _social_users_GetUserRequest__Output>
      GetUserResponse: MessageTypeDefinition<_social_users_GetUserResponse, _social_users_GetUserResponse__Output>
      ListUsersRequest: MessageTypeDefinition<_social_users_ListUsersRequest, _social_users_ListUsersRequest__Output>
      ListUsersResponse: MessageTypeDefinition<_social_users_ListUsersResponse, _social_users_ListUsersResponse__Output>
      UpdateUserRequest: MessageTypeDefinition<_social_users_UpdateUserRequest, _social_users_UpdateUserRequest__Output>
      UpdateUserResponse: MessageTypeDefinition<_social_users_UpdateUserResponse, _social_users_UpdateUserResponse__Output>
      User: MessageTypeDefinition<_social_users_User, _social_users_User__Output>
      UserService: SubtypeConstructor<typeof grpc.Client, _social_users_UserServiceClient> & { service: _social_users_UserServiceDefinition }
    }
  }
}

