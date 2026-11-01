import express from "express";
import cors from "cors";
import helmet from "helmet";
import { env } from "./config/env.js";

// Middlewares
import { limitRequests } from "./middlewares/limit.requests.js";
import { logRequests } from "./middlewares/log.requests.js";
import { handleGlobalError } from "./middlewares/handle.global.error.js";
import { handleRouteNotFound } from "./middlewares/handle.route.not.found.js";

// Routes
import healthRoutes from "./modules/health/health.route.js";
import authRoutes from "./modules/auth/auth.route.js";
import userRoutes from "./modules/user/user.route.js";
import taskRoutes from "./modules/task/task.route.js";

/**
 * Express application setup.
 *
 * Middleware order matters:
 * 1. Security (helmet, cors) — applied first to protect all routes
 * 2. Body parsing — before any route handler accesses req.body
 * 3. Rate limiting — before processing expensive requests
 * 4. Request logging — track all incoming requests
 * 5. Routes — the actual API endpoints
 * 6. 404 handler — catches unmatched routes
 * 7. Error handler — catches all errors (must be last, with 4 params)
 */

const app = express();
app.use(helmet()); // Sets security-related HTTP headers
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    maxAge: 86400, // Cache preflight for 24 hours
  }),
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(limitRequests);
app.use(logRequests);

const API_PREFIX = "/api/v1";
app.use(`${API_PREFIX}/health`, healthRoutes);
app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/users`, userRoutes);
app.use(`${API_PREFIX}/task`, taskRoutes);

app.use(handleRouteNotFound);
app.use(handleGlobalError);

export default app;
