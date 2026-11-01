import type { Request, Response } from "express";
import { userService } from "./user.service.js";
import { HttpStatusCode } from "../../shared/utils/response/http.status.code.js";
import { responseHandler } from "../../shared/utils/response/response.handler.js";
import type { CreateUserDTO, UpdateUserDTO } from "./user.validators.js";

/**
 * User controller — HTTP layer.
 *
 * Controllers are thin:
 * 1. Extract data from req (body, params, query)
 * 2. Call the service
 * 3. Send the response
 *
 * NO business logic in controllers. If a controller has an if/else
 * that decides business outcomes, it belongs in the service layer.
 */

export class UserController {
  async getAll(req: Request, res: Response): Promise<void> {
    const users = await userService.getAll();
    responseHandler(res,HttpStatusCode.OK, "Users retrieved successfully", users);
  }

  async getById(req: Request, res: Response): Promise<void> {
    const id = req.params["id"] as string;
    const user = await userService.getById(id);
    responseHandler(res,HttpStatusCode.OK, "User retrieved successfully", user);
  }

  async create(req: Request, res: Response): Promise<void> {
    const data = req.body as CreateUserDTO;
    const user = await userService.create(data);
    responseHandler(res,HttpStatusCode.CREATED, "User created successfully", user);
  }

  async update(req: Request, res: Response): Promise<void> {
    const id = req.params["id"] as string;
    const data = req.body as UpdateUserDTO;
    const user = await userService.update(id, data);
    responseHandler(res,HttpStatusCode.OK, "User updated successfully", user);
  }

  async delete(req: Request, res: Response): Promise<void> {
    const id = req.params["id"] as string;
    await userService.delete(id);
    responseHandler(res, HttpStatusCode.OK, "User deleted successfully");
  }
}

export const userController = new UserController();
