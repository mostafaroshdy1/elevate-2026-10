import { Router } from "express";
import type { Request, Response } from "express";

/**
 * Health check route for load balancers, Kubernetes probes,
 * and monitoring services like UptimeRobot or Datadog.
 *
 * Returns 200 with uptime, timestamp, and environment info.
 * This endpoint should NOT require authentication.
 */

const router = Router();

router.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Server is healthy",
    data: {
      uptime: process.uptime(), // Total seconds the server has been running
      timestamp: new Date().toISOString(), // Current server time in ISO format
      environment: process.env["NODE_ENV"] ?? "development", // Current deployment mode
      memoryUsage: process.memoryUsage().rss, // Current RAM usage in bytes
    },
  });
});

export default router;
