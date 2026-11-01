import crypto from "node:crypto";

/**
 * Generates a cryptographically secure numeric OTP.
 *
 * Uses crypto.randomInt instead of Math.random for security.
 * Math.random is not cryptographically secure and should never be used for OTPs.
 */
export const generateOtp = (length: number = 4): string => {
  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;
  return crypto.randomInt(min, max + 1).toString();
};
