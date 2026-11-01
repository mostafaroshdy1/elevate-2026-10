/**
 * Paymob Payment Integration Service
 * ------------------------------------
 * Zero dependencies — no ORM, no framework, no project-specific code.
 * Works with any Node.js / Bun / Edge runtime project.
 *
 * QUICK START:
 * ------------
 * import { paymobConfig } from "./paymob.config.js";
 *
 * 1. Create a payment intention
 * const intention = await paymobConfig.createIntention({ ... });
 *
 * 2. Build the hosted checkout URL
 * const url = paymobConfig.getCheckoutUrl(intention.client_secret);
 *
 * 3. Verify an incoming webhook
 * const valid = paymobConfig.verifyCallback(req.body, req.query.hmac);
 */

import crypto from "crypto";
import {
  CreateIntentionRequest,
  CreateQuickLinkRequest,
  IntentionResponse,
  PaymobConfig,
  QuickLinkResponse,
  TransactionCallback,
} from "../../types/paymob.types.js";

export class PaymobService {
  private readonly baseUrl: string;
  private readonly authTokenTtlMs: number;
  private readonly config: PaymobConfig;

  private authToken: string | null = null;
  private authTokenExpiresAt = 0;

  constructor(config: PaymobConfig) {
    this.config = config;
    this.baseUrl = config.baseUrl ?? "https://accept.paymob.com";
    this.authTokenTtlMs = config.authTokenTtlMs ?? 55 * 60 * 1000;
  }

  // ─── Private helpers ───────────────────────

  /** Centralised fetch: throws on non-2xx with full error context. */
  private async request<T>(
    url: string,
    options: RequestInit,
    label: string,
  ): Promise<T> {
    const res = await fetch(url, options);
    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(
        `[Paymob] ${label} failed (HTTP ${res.status}): ${JSON.stringify(error)}`,
      );
    }
    return res.json() as Promise<T>;
  }

  /** Returns a valid auth token, refreshing automatically when expired. */
  private async fetchAuthToken(): Promise<string> {
    if (this.authToken && Date.now() < this.authTokenExpiresAt) {
      return this.authToken;
    }

    const data = await this.request<{ token: string }>(
      `${this.baseUrl}/api/auth/tokens`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ api_key: this.config.apiKey }),
      },
      "Auth token fetch",
    );

    this.authToken = data.token;
    this.authTokenExpiresAt = Date.now() + this.authTokenTtlMs;
    return data.token;
  }

  // ─── Public API ────────────────────────────

  /**
   * Create a payment intention.
   * Returns `client_secret` which you pass to `getCheckoutUrl()`.
   *
   * @example
   * const intention = await paymob.createIntention({
   *   amount: 10000, // in cents
   *   currency: "EGP",
   *   payment_methods: [123456],
   *   items: [{ name: "Order #1", amount: 10000, quantity: 1 }],
   *   billing_data: {
   *     first_name: "John", last_name: "Doe",
   *     email: "john@example.com", phone_number: "01234567890",
   *   },
   * });
   */
  async createIntention(
    request: CreateIntentionRequest,
  ): Promise<IntentionResponse> {
    return this.request<IntentionResponse>(
      `${this.baseUrl}/v1/intention/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${this.config.secretKey}`,
        },
        body: JSON.stringify(request),
      },
      "Create intention",
    );
  }

  /**
   * Build the hosted checkout URL from a `client_secret`.
   *
   * @example
   * const url = paymob.getCheckoutUrl(intention.client_secret);
   * res.redirect(url);
   */
  getCheckoutUrl(clientSecret: string): string {
    return `${this.baseUrl}/unifiedcheckout/?publicKey=${this.config.publicKey}&clientSecret=${clientSecret}`;
  }

  /**
   * Verify that an incoming webhook callback is genuinely from Paymob.
   * Call this synchronously — no async needed.
   *
   * @example
   * app.post("/webhook", (req, res) => {
   *   if (!paymob.verifyCallback(req.body, req.query.hmac)) {
   *     return res.status(401).send("Unauthorized");
   *   }
   *   // handle confirmed payment ...
   * });
   */
  verifyCallback(body: TransactionCallback, hmac: string): boolean {
    const obj = body.obj;
    const concatenated = [
      obj.amount_cents,
      obj.created_at,
      obj.currency,
      obj.error_occured,
      obj.has_parent_transaction,
      obj.id,
      obj.integration_id,
      obj.is_3d_secure,
      obj.is_auth,
      obj.is_capture,
      obj.is_refunded,
      obj.is_standalone_payment,
      obj.is_voided,
      obj.order?.id,
      obj.owner,
      obj.pending,
      obj.source_data?.pan,
      obj.source_data?.sub_type,
      obj.source_data?.type,
      obj.success,
    ].join("");

    const calculated = crypto
      .createHmac("sha512", this.config.hmacSecret)
      .update(concatenated)
      .digest("hex");

    return calculated === hmac;
  }

  /**
   * Refund a transaction.
   *
   * @param transactionId - Paymob transaction ID
   * @param amountCents   - Amount to refund **in cents**
   *
   * @example
   * await paymob.refund(987654, 5000); // refund 50 EGP (5000 cents)
   */
  async refund(transactionId: number, amountCents: number): Promise<unknown> {
    const token = await this.fetchAuthToken();

    return this.request<unknown>(
      `${this.baseUrl}/api/acceptance/void_refund/refund`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          auth_token: token,
          transaction_id: transactionId,
          amount_cents: amountCents,
        }),
      },
      "Refund",
    );
  }

  /**
   * Void (cancel) a transaction before it settles.
   *
   * @example
   * await paymob.void(987654);
   */
  async void(transactionId: number): Promise<unknown> {
    const token = await this.fetchAuthToken();

    return this.request<unknown>(
      `${this.baseUrl}/api/acceptance/void_refund/void`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          auth_token: token,
          transaction_id: transactionId,
        }),
      },
      "Void",
    );
  }

  /**
   * Fetch the details of a single transaction.
   *
   * @example
   * const tx = await paymob.getTransaction(987654);
   */
  async getTransaction(transactionId: number): Promise<unknown> {
    const token = await this.fetchAuthToken();

    return this.request<unknown>(
      `${this.baseUrl}/api/acceptance/transactions/${transactionId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
      "Get transaction",
    );
  }

  /**
   * Create a shareable payment link (Quick Link).
   *
   * Use this to send a payment URL to a customer later (WhatsApp, SMS, email, etc.).
   * For immediate in-app checkout flows, use `createIntention` + `getCheckoutUrl` instead.
   *
   * @example
   * const link = await paymob.createQuickLink({
   *   amountCents: 10000, // in cents
   *   customerName: "John Doe",
   *   customerEmail: "john@example.com",
   *   customerPhone: "+201234567890",
   *   referenceId: "ORDER-123",
   * });
   * console.log(link.client_url);
   */
  async createQuickLink(options: {
    /** Amount in cents */
    amountCents: number;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    referenceId: string;
    description?: string;
    expiresAt?: string;
  }): Promise<QuickLinkResponse> {
    const token = await this.fetchAuthToken();

    const body: CreateQuickLinkRequest = {
      amount_cents: options.amountCents,
      reference_id: options.referenceId,
      integration_id: [parseInt(this.config.integrationId, 10)],
      client_email: options.customerEmail,
      client_name: options.customerName,
      client_mobile: options.customerPhone,
      ...(options.description && { description: options.description }),
      ...(options.expiresAt && { expires_at: options.expiresAt }),
    };

    return this.request<QuickLinkResponse>(
      `${this.baseUrl}/api/ecommerce/payment-links`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      },
      "Create QuickLink",
    );
  }
}
