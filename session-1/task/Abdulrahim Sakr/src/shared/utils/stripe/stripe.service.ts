/**
 * Stripe — Common Patterns
 * -------------------------
 * Import the shared stripeConfig instance and use it directly.
 * No wrapper classes, no abstraction layers.
 *
 * SETUP:
 * ------
 * 1. npm install stripe
 * 2. Add to your .env:
 *    STRIPE_SECRET_KEY=sk_live_...        (or sk_test_... for testing)
 *    STRIPE_WEBHOOK_SECRET=whsec_...      (from Stripe Dashboard → Developers → Webhooks)
 *    STRIPE_SUCCESS_URL=https://yourapp.com/success
 *    STRIPE_CANCEL_URL=https://yourapp.com/cancel
 *
 * LOCAL WEBHOOK TESTING:
 * ----------------------
 * Install Stripe CLI and run:
 *   stripe listen --forward-to localhost:3000/webhook
 * It prints a temporary STRIPE_WEBHOOK_SECRET — put it in your .env while developing.
 */

import { env } from "../../../config/env.js";
import { stripeConfig } from "./stripe.config.js";
import type Stripe from "stripe";

// ── Checkout — one-time payment ───────────────────────────────────────────────
//
// The simplest payment flow. Stripe hosts the payment page for you —
// no card UI to build. You create a session and redirect the customer to session.url.
//
// Flow:
//   1. Call createCheckoutSession() → get a URL
//   2. Redirect the customer to that URL
//   3. Customer pays on Stripe's hosted page
//   4. Stripe redirects to your success_url
//   5. ⚠️  Always call getCheckoutSession() on the success page to confirm
//      payment_status === "paid" before giving access — never trust the redirect alone.
//
// line_items accepts two shapes:
//
//   A) Pre-created price from Stripe Dashboard (recommended for fixed prices):
//      line_items: [{ price: "price_xxx", quantity: 1 }]
//
//   B) Dynamic price (no dashboard setup needed, good for variable amounts):
//      line_items: [{
//        quantity: 1,
//        price_data: {
//          currency: "usd",
//          unit_amount: 2900,   // $29.00 in cents
//          product_data: { name: "Pro Plan" },
//        },
//      }]

export async function createCheckoutSession({
  line_items,
  customer_email,
  discounts = [],
  metadata = {},
  success_url = env.STRIPE_SUCCESS_URL,
  cancel_url = env.STRIPE_CANCEL_URL,
}: Omit<Stripe.Checkout.SessionCreateParams, "mode">) {
  const session = await stripeConfig.checkout.sessions.create({
    mode: "payment",
    line_items,
    customer_email,
    discounts,
    metadata,
    success_url,
    cancel_url,
  });
  return session;
}

// ── Checkout — subscription ───────────────────────────────────────────────────
//
// Same as createCheckoutSession but for recurring billing.
// mode: "subscription" tells Stripe to charge the customer on a recurring schedule
// defined by the price (weekly, monthly, yearly, etc.).
//
// The price must be a recurring price created in the Stripe Dashboard.
// One-time prices won't work here.
//
// After a successful subscription checkout, listen for these webhook events
// to keep your DB in sync:
//   - customer.subscription.created  → grant access
//   - invoice.paid                   → renew access each billing period
//   - invoice.payment_failed         → notify customer, card may have expired
//   - customer.subscription.deleted  → revoke access

export async function createSubscriptionCheckout({
  line_items,
  customer,
  customer_email,
  metadata = {},
  success_url = env.STRIPE_SUCCESS_URL,
  cancel_url = env.STRIPE_CANCEL_URL,
}: Omit<Stripe.Checkout.SessionCreateParams, "mode">) {
  const session = await stripeConfig.checkout.sessions.create({
    mode: "subscription",
    line_items,
    customer,
    customer_email,
    metadata,
    success_url,
    cancel_url,
  });
  return session;
}

// Retrieve a session by ID.
// Always call this on your success page to verify payment_status === "paid"
// before granting access or fulfilling an order.
//
// Usage:
//   app.get("/success", async (req, res) => {
//     const session = await getCheckoutSession(req.query.session_id);
//     if (session.payment_status === "paid") { ...grant access... }
//   });
//
// Set your success_url to include the session ID:
//   success_url: "https://yourapp.com/success?session_id={CHECKOUT_SESSION_ID}"
//   Stripe replaces {CHECKOUT_SESSION_ID} with the real ID automatically.

export async function getCheckoutSession(sessionId: string) {
  return stripeConfig.checkout.sessions.retrieve(sessionId);
}

// ── Payment Intent ────────────────────────────────────────────────────────────
//
// Use this instead of Checkout when you want to build your own payment UI
// (custom card form, mobile app, etc.) using Stripe.js or the mobile SDKs.
//
// Flow:
//   1. Call createPaymentIntent() on your server → returns client_secret
//   2. Send client_secret to your frontend
//   3. Frontend uses Stripe.js to collect card details and confirm the payment:
//      stripeConfig.confirmCardPayment(clientSecret, { payment_method: { card } })
//   4. Stripe handles 3D Secure and returns the result to your frontend
//
// metadata is useful for linking the payment to your own data (order ID, user ID, etc.)
// You can read it back later from the PaymentIntent or webhook event.
//
// Example call:
//   const clientSecret = await createPaymentIntent({
//     amount: 2900,       // $29.00 in cents
//     currency: "usd",
//     metadata: { orderId: "ORDER-123", userId: "USER-456" },
//   });

export async function createPaymentIntent(
  params: Stripe.PaymentIntentCreateParams,
) {
  const intent = await stripeConfig.paymentIntents.create({
    automatic_payment_methods: { enabled: true }, // default, can be overridden
    ...params,
  });
  return intent.client_secret;
}

// Retrieve a PaymentIntent by ID.
// Useful for checking current status before performing operations like refunds.
// Statuses: requires_payment_method, requires_confirmation, requires_action,
//           processing, requires_capture, canceled, succeeded

export async function getPaymentIntent(paymentIntentId: string) {
  return stripeConfig.paymentIntents.retrieve(paymentIntentId);
}

// ── Customers ─────────────────────────────────────────────────────────────────
//
// Creating a customer in Stripe lets you:
//   - Attach and save payment methods (cards) to them
//   - Link subscriptions to them
//   - See their full payment history in the Stripe Dashboard
//
// Best practice: when a user signs up in your app, create a Stripe customer
// and save the returned customer.id (cus_...) in your database.
// Then pass that ID to checkout sessions, payment intents, and subscriptions.

export async function createCustomer(email: string, name?: string) {
  return stripeConfig.customers.create({ email, name });
}

// ── Subscriptions ─────────────────────────────────────────────────────────────

// Cancel a subscription gracefully — the customer keeps access until the
// end of the current billing period, then it stops.
//
// If you want to cancel immediately and revoke access now, use:
//   stripeConfig.subscriptions.cancel(subscriptionId)

export async function cancelSubscription(subscriptionId: string) {
  return stripeConfig.subscriptions.update(subscriptionId, {
    cancel_at_period_end: true,
  });
}

// ── Refunds ───────────────────────────────────────────────────────────────────
//
// Refunds return money to the customer's original payment method.
// Stripe's processing fees are not returned to you.
//
// We retrieve the PaymentIntent first to check its status before attempting
// the refund — this gives a cleaner error than letting Stripe reject it.
//
// amountCents is optional:
//   - Omit it for a full refund
//   - Pass a value for a partial refund (e.g. 1000 = $10.00)
//
// Example:
//   await refund("pi_xxx");        // full refund
//   await refund("pi_xxx", 1000); // partial — $10.00

export async function refund(paymentIntentId: string, amountCents?: number) {
  const intent = await getPaymentIntent(paymentIntentId);

  if (intent.status !== "succeeded") {
    throw new Error(
      `Cannot refund a payment intent with status: ${intent.status}`,
    );
  }

  return stripeConfig.refunds.create({
    payment_intent: paymentIntentId,
    amount: amountCents,
  });
}

// ── Coupons ───────────────────────────────────────────────────────────────────
//
// Coupons define a discount rule. You apply them to a checkout session via
// the discounts field:
//   createCheckoutSession({ discounts: [{ coupon: "coupon_id" }], ... })
//
// Examples:
//   // 20% off forever (good for subscriptions)
//   await createCoupon({ percent_off: 20, duration: "forever" });
//
//   // $10 off once
//   await createCoupon({ amount_off: 1000, currency: "usd", duration: "once" });
//
//   // 50% off for 3 months
//   await createCoupon({ percent_off: 50, duration: "repeating", duration_in_months: 3 });

export async function createCoupon(params: Stripe.CouponCreateParams) {
  return stripeConfig.coupons.create(params);
}

// ── Webhooks ──────────────────────────────────────────────────────────────────
//
// When a payment succeeds or fails, Stripe proactively POST-s your server
// with the event details — you don't poll for it.
//
// The problem: anyone on the internet could hit your webhook URL and fake
// a payment success. So Stripe signs every request with your STRIPE_WEBHOOK_SECRET
// and you verify it before trusting the data.
//
// HOW TO REGISTER YOUR WEBHOOK:
//   Go to Stripe Dashboard → Developers → Webhooks → Add endpoint
//   URL: https://yourapp.com/webhook
//   Select the events you want (checkout.session.completed, etc.)
//
// HOW TO USE IN EXPRESS:
//   import express from "express";
//   import { constructWebhookEvent, handleWebhookEvent } from "./stripe.examples.js";
//
//   // ⚠️ Must use express.raw — NOT express.json()
//   // Stripe needs the raw body bytes to verify the signature.
//   // If you parse the body as JSON first, verification will always fail.
//   app.post("/webhook", express.raw({ type: "application/json" }), async (req, res) => {
//     const signature = req.headers["stripe-signature"] as string;
//
//     let event;
//     try {
//       event = constructWebhookEvent(req.body, signature);
//     } catch (err) {
//       return res.status(400).send("Webhook signature verification failed");
//     }
//
//     await handleWebhookEvent(event);
//     res.sendStatus(200); // always respond fast — Stripe retries if it doesn't get a 200
//   });
//
// FULL FLOW:
//   Customer pays
//     → Stripe processes it
//     → Stripe POST /webhook
//     → constructWebhookEvent() verifies signature
//     → handleWebhookEvent() runs your business logic
//     → res.sendStatus(200)

export function constructWebhookEvent(
  rawBody: Buffer | string,
  signature: string,
): Stripe.Event {
  return stripeConfig.webhooks.constructEvent(
    rawBody,
    signature,
    env.STRIPE_WEBHOOK_SECRET,
  );
}

// Add or remove cases as your app grows.
// Replace the console.log lines with your real business logic.
// Full list of event types: https://stripe.com/docs/api/events/types

export async function handleWebhookEvent(event: Stripe.Event) {
  switch (event.type) {
    // Fired when a checkout session payment is confirmed.
    // This is your main trigger for one-time payments —
    // fulfill the order, send a receipt, grant access, etc.
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      console.log("Payment succeeded:", session.id);
      break;
    }

    // Fired when a subscription is cancelled (immediately or at period end).
    // Revoke the customer's access here.
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      console.log("Subscription cancelled:", sub.id);
      break;
    }

    // Fired when a subscription renewal charge fails.
    // Notify the customer — their card may have expired.
    // Stripe will retry automatically based on your retry settings.
    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      console.log("Invoice payment failed:", invoice.id);
      break;
    }

    default:
      break;
  }
}
