import type { Request, Response } from "express";
import { authService } from "./auth.service.js";
import { responseHandler } from "../../shared/utils/response/response.handler.js";
import type {
  RegisterDTO,
  LoginDTO,
  RefreshTokenDTO,
} from "./auth.validators.js";
import { HttpStatusCode } from "../../shared/utils/response/http.status.code.js";

export class AuthController {
  async register(req: Request, res: Response): Promise<void> {
    const data = req.body as RegisterDTO;
    const result = await authService.register(data);
    responseHandler(
      res,
      HttpStatusCode.CREATED,
      "Registration successful",
      result,
    );
  }

  async login(req: Request, res: Response): Promise<void> {
    const data = req.body as LoginDTO;
    const result = await authService.login(data);
    responseHandler(res, HttpStatusCode.OK, "Login successful", result);
  }

  async refreshToken(req: Request, res: Response): Promise<void> {
    const { refreshToken } = req.body as RefreshTokenDTO;
    const tokens = await authService.refreshToken(refreshToken);
    responseHandler(
      res,
      HttpStatusCode.OK,
      "Token refreshed successfully",
      tokens,
    );
  }
}

export const authController = new AuthController();
