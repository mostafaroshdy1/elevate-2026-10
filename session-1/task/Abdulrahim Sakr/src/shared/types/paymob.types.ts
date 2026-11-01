export interface PaymobConfig {
  /** Secret key (used for intention / server-side calls) */
  secretKey: string;
  /** Public key (used to build the hosted checkout URL) */
  publicKey: string;
  /** API key (used to obtain legacy auth tokens for refund / void) */
  apiKey: string;
  /** Integration / payment method ID */
  integrationId: string;
  /** HMAC secret for verifying webhook callbacks */
  hmacSecret: string;
  /** Override the Paymob base URL. Defaults to https://accept.paymob.com */
  baseUrl?: string;
  /** Auth token time-to-live in milliseconds. Defaults to 55 minutes */
  authTokenTtlMs?: number;
  /** Where Paymob sends payment notifications */
  notificationUrl?: string;
  /** Where to redirect after payment */
  redirectionUrl?: string;
  /** Redirect on success */
  redirectionSuccessUrl?: string;
  /** Redirect on failure */
  redirectionFailureUrl?: string;
}

export interface CreateIntentionRequest {
  amount: number; // in cents
  currency: string; // e.g. "EGP"
  payment_methods: number[];
  items: IntentionItem[];
  billing_data: BillingData;
  customer?: {
    first_name?: string;
    last_name?: string;
    email?: string;
  };
  /** Any extra key/value pairs supported by Paymob */
  [key: string]: unknown;
}

export interface IntentionItem {
  name: string;
  amount: number; // in cents
  description?: string;
  quantity: number;
}

export interface BillingData {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  apartment?: string;
  floor?: string;
  street?: string;
  building?: string;
  shipping_method?: string;
  postal_code?: string;
  city?: string;
  country?: string;
  state?: string;
}

export interface IntentionResponse {
  id: string;
  client_secret: string;
  payment_key?: string;
  intention_order_id?: string;
  [key: string]: unknown;
}

export interface TransactionCallback {
  obj: {
    amount_cents: number;
    created_at: string;
    currency: string;
    error_occured: boolean;
    has_parent_transaction: boolean;
    id: number;
    integration_id: number;
    is_3d_secure: boolean;
    is_auth: boolean;
    is_capture: boolean;
    is_refunded: boolean;
    is_standalone_payment: boolean;
    is_voided: boolean;
    order?: { id: number | string };
    owner: number;
    pending: boolean;
    source_data?: { pan?: string; sub_type?: string; type?: string };
    success: boolean;
    [key: string]: unknown;
  };
}

export interface CreateQuickLinkRequest {
  amount_cents: number;
  reference_id: string;
  integration_id: number[];
  client_email: string;
  client_name: string;
  client_mobile: string;
  description?: string;
  expires_at?: string;
  [key: string]: unknown;
}

export interface QuickLinkResponse {
  id: string | number;
  client_url: string;
  [key: string]: unknown;
}
