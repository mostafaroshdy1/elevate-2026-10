import cron from "node-cron";
import { logger } from "../../config/logger.js";

/**
 * Cron job registry.
 *
 * Define all scheduled tasks here. Each job is a named function
 * registered with node-cron.
 *
 * Cron expression reference:
 *   ┌──────────── second (optional)
 *   │ ┌────────── minute
 *   │ │ ┌──────── hour
 *   │ │ │ ┌────── day of month
 *   │ │ │ │ ┌──── month
 *   │ │ │ │ │ ┌── day of week
 *   * * * * * *
 *
 * Example: "0 0 * * *" = every day at midnight
 */

export const sendReminderEmail = (): void => {
  // Example: cleanup expired sessions every day at 2 AM
  cron.schedule("0 2 * * *", async () => {
    try {
      // logic ...
      logger.info("Cron job success: sendReminderEmail");
    } catch (error) {
      logger.error(error, "Cron job failed: sendReminderEmail");
    }
  });
};
