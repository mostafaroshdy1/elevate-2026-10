import type { ServerUnaryCall, sendUnaryData } from "@grpc/grpc-js";
import { toGrpcError } from "../lib/grpc-error";
import type { UserService } from "./user.service";
import type { CreateUserInput, UpdateUserInput, User } from "./user.entity";

interface ListUsersRequest {}
interface ListUsersResponse { users: User[]; }
interface GetUserRequest { id: number; }
interface GetUserResponse { user: User; }
interface CreateUserRequest { username: string; email: string; fullName: string; }
interface CreateUserResponse { user: User; }
interface UpdateUserRequest { id: number; username: string; email: string; fullName: string; }
interface UpdateUserResponse { user: User; }
interface DeleteUserRequest { id: number; }
interface DeleteUserResponse {}

/**
 * gRPC transport adapter. Replaces the Fastify controller + routes: maps each
 * RPC to a service method and translates service errors to gRPC statuses.
 */
export function createUserHandlers(service: UserService) {
  return {
    ListUsers: async (
      _call: ServerUnaryCall<ListUsersRequest, ListUsersResponse>,
      callback: sendUnaryData<ListUsersResponse>,
    ) => {
      try {
        callback(null, { users: await service.list() });
      } catch (error) {
        callback(toGrpcError(error));
      }
    },

    GetUser: async (
      call: ServerUnaryCall<GetUserRequest, GetUserResponse>,
      callback: sendUnaryData<GetUserResponse>,
    ) => {
      try {
        callback(null, { user: await service.get(call.request.id) });
      } catch (error) {
        callback(toGrpcError(error));
      }
    },

    CreateUser: async (
      call: ServerUnaryCall<CreateUserRequest, CreateUserResponse>,
      callback: sendUnaryData<CreateUserResponse>,
    ) => {
      try {
        const input: CreateUserInput = {
          username: call.request.username,
          email: call.request.email,
          fullName: call.request.fullName,
        };
        callback(null, { user: await service.create(input) });
      } catch (error) {
        callback(toGrpcError(error));
      }
    },

    UpdateUser: async (
      call: ServerUnaryCall<UpdateUserRequest, UpdateUserResponse>,
      callback: sendUnaryData<UpdateUserResponse>,
    ) => {
      try {
        const input: UpdateUserInput = {};
        if (call.request.username) input.username = call.request.username;
        if (call.request.email) input.email = call.request.email;
        if (call.request.fullName) input.fullName = call.request.fullName;
        callback(null, { user: await service.update(call.request.id, input) });
      } catch (error) {
        callback(toGrpcError(error));
      }
    },

    DeleteUser: async (
      call: ServerUnaryCall<DeleteUserRequest, DeleteUserResponse>,
      callback: sendUnaryData<DeleteUserResponse>,
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
