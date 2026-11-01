import CryptoJS from "crypto-js";
import { env } from "../../config/env.js";

/**
 * AES encryption/decryption using crypto-js.
 *
 * Used for encrypting sensitive data at rest (e.g., phone numbers, PII fields).
 * NOT a replacement for bcrypt for passwords — this is for reversible encryption.
 */

export const encrypt = (text: string): string => {
  return CryptoJS.AES.encrypt(text, env.CRYPTO_SECRET_KEY).toString();
};

export const decrypt = (cipherText: string): string => {
  const bytes = CryptoJS.AES.decrypt(cipherText, env.CRYPTO_SECRET_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
};
