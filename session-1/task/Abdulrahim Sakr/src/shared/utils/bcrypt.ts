import bcrypt from "bcrypt";
import { env } from "../../config/env.js";

export const hashData = async (plainText: string): Promise<string> => {
  return await bcrypt.hash(plainText, Number(env.SALT));
};

export const compareData = async (
  plainText: string,
  hashedText: string,
): Promise<boolean> => {
  return await bcrypt.compare(plainText, hashedText);
};
