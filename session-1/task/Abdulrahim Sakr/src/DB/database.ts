import { logger } from "../config/logger.js";

/**
 * Database connection placeholder.
 * Replace with your actual database driver (Mongoose, Prisma, TypeORM, etc.).
 *
 * This function is called once during server startup.
 * Keep the connection logic centralized here to avoid scattered DB setup.
 */
export const connectDatabase = async (): Promise<void> => {
  try {
    // Example with Mongoose:
    // await mongoose.connect(env.DATABASE_URL);

    logger.info("✅ Database connected successfully");
  } catch (error) {
    logger.fatal(error, "❌ Database connection failed");
    process.exit(1);
  }
};
