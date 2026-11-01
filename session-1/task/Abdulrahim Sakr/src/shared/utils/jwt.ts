import jwt from "jsonwebtoken";
import type { Secret, SignOptions } from "jsonwebtoken";
import { AuthPayload, MyJwtPayload } from "../types/jwt.types.js";
import { generateOtp } from "./generate.otp.js";
import { env } from "../../config/env.js";

// ============================ createJwt ============================
export const createJwt = (
  payload: string | object,
  privateKey: Secret,
  options?: SignOptions,
) => {
  const token = jwt.sign(payload, privateKey, options);
  return token;
};

// ============================ verifyJwt ============================
export const verifyJwt = ({
  token,
  privateKey,
}: {
  token: string;
  privateKey: Secret;
}): MyJwtPayload => {
  const payload = jwt.verify(token, privateKey) as MyJwtPayload; // result || error
  return payload;
};

// ============================ generateAccessToken ============================
export const generateAccessToken = (payload: AuthPayload) => {
  return createJwt(payload, env.JWT_ACCESS_SECRET as string, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN as any,
    jwtid: generateOtp(),
  });
};

// ============================ generateRefreshToken ============================
export const generateRefreshToken = (payload: AuthPayload) => {
  return createJwt(payload, env.JWT_REFRESH_SECRET as string, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN as any,
    jwtid: generateOtp(),
  });
};

// ============================ verifyAccessToken ============================
export const verifyAccessToken = (token: string): MyJwtPayload => {
  return verifyJwt({ token, privateKey: env.JWT_ACCESS_SECRET as string });
};

// ============================ verifyRefreshToken ============================
export const verifyRefreshToken = (token: string): MyJwtPayload => {
  return verifyJwt({ token, privateKey: env.JWT_REFRESH_SECRET as string });
};
