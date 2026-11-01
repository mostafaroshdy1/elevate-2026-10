import { NotFoundError } from "../../shared/utils/error/app.error.js";
import type { CreateUserDTO, UpdateUserDTO } from "./user.validators.js";

/**
 * User service — business logic layer.
 *
 * Rules for services:
 * 1. Services contain ALL business logic
 * 2. Services are framework-agnostic (no req/res objects)
 * 3. Services throw AppError subclasses on failure
 * 4. Services interact with models/repositories, never directly with HTTP
 *
 * This separation makes services testable without mocking Express.
 */

export class UserService {
  async getAll() {
    // return UserModel.find({ isActive: true }).select("-password");
    return [];
  }

  async getById(id: string) {
    // const user = await UserModel.findById(id).select("-password");
    const user = null; // placeholder
    if (!user) throw new NotFoundError("User");
    return user;
  }

  async create(data: CreateUserDTO) {
    // const user = await UserModel.create(data);
    // return user;
    return data;
  }

  async update(id: string, data: UpdateUserDTO) {
    // const user = await UserModel.findByIdAndUpdate(id, data, { new: true }).select("-password");
    const user = null; // placeholder
    if (!user) throw new NotFoundError("User");
    return user;
  }

  async delete(id: string) {
    // const user = await UserModel.findByIdAndUpdate(id, { isActive: false });
    const user = null; // placeholder
    if (!user) throw new NotFoundError("User");
  }
}

export const userService = new UserService();
