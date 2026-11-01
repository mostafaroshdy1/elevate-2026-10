import Stripe from "stripe";
import { env } from "../../../config/env.js";

// Single shared instance — import this wherever you need stripeConfig
export const stripeConfig = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: "2026-04-22.dahlia",
  typescript: true,
});
