import { PaymobService } from "./paymob.service.js";
import { env } from "../../../config/env.js";

// Pre-configured shared instance — import this wherever you need Paymob
export const paymobConfig = new PaymobService({
  secretKey: env.PAYMOB_SECRET_KEY,
  publicKey: env.PAYMOB_PUBLIC_KEY,
  apiKey: env.PAYMOB_API_KEY,
  integrationId: env.PAYMOB_INTEGRATION_ID,
  hmacSecret: env.PAYMOB_HMAC_SECRET,
  baseUrl: env.PAYMOB_BASE_URL,
  authTokenTtlMs: env.PAYMOB_AUTH_TOKEN_TTL_MS,
});
