import "dotenv/config";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";

export function createDb(fileName = process.env.DB_FILE_NAME ?? "file:users.db") {
  const client = createClient({ url: fileName });
  return drizzle({ client });
}

export type Database = ReturnType<typeof createDb>;
