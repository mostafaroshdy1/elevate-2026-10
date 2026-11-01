import {
  BadRequestError,
  UnauthorizedError,
  ConflictError,
} from "../../shared/utils/error/app.error.js";
import { hashData, compareData } from "../../shared/utils/bcrypt.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../../shared/utils/jwt.js";
import type { RegisterDTO, LoginDTO } from "./auth.validators.js";
import type { AuthTokens } from "./auth.types.js";

/**
 * Auth service — handles registration, login, and token refresh.
 *
 * Replace placeholder comments with your actual DB queries.
 */

export class AuthService {
  async register(data: RegisterDTO) {
    // Check if user already exists
    // const existingUser = await UserModel.findOne({ email: data.email });
    const existingUser = null; // placeholder
    if (existingUser) throw new ConflictError("Email already registered");

    const hashedPassword = await hashData(data.password);

    // Create user
    // const user = await UserModel.create({ ...data, password: hashedPassword });

    const user = {
      id: "placeholder-id",
      name: data.name,
      email: data.email,
      role: "user" as const,
    };

    const accessToken = generateAccessToken({
      userId: user.id,
      role: user.role,
    });
    const refreshToken = generateRefreshToken({
      userId: user.id,
      role: user.role,
    });

    return { user, accessToken, refreshToken };
  }

  async login(data: LoginDTO) {
    // Find user and include password field
    // const user = await UserModel.findOne({ email: data.email }).select("+password");
    const user = null as any; // placeholder
    if (!user) throw new UnauthorizedError("Invalid email or password");

    const isPasswordValid = await compareData(data.password, user.password);
    if (!isPasswordValid)
      throw new UnauthorizedError("Invalid email or password");

    const accessToken = generateAccessToken({
      userId: user.id,
      role: user.role,
    });
    const refreshToken = generateRefreshToken({
      userId: user.id,
      role: user.role,
    });

    return { user, accessToken, refreshToken };
  }

  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    const payload = verifyRefreshToken(refreshToken);
    const accessToken = generateAccessToken({
      userId: payload.userId.toString(), // Ensuring it matches AuthPayload string type
      role: (payload as any).role,
    });
    const newRefreshToken = generateRefreshToken({
      userId: payload.userId.toString(),
      role: (payload as any).role,
    });
    return { accessToken, refreshToken: newRefreshToken };
  }
}

export const authService = new AuthService();
