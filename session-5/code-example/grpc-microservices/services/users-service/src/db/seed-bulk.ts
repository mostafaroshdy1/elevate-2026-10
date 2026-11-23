import "dotenv/config";
import { reset, seed } from "drizzle-seed";
import { createDb } from "./index";
import { users } from "./schema";

/**
 * Bulk seed for load-testing / benchmarking. Generates `SEED_USERS` (default
 * 1000) users with realistic data.
 */
export async function bulkSeed() {
  const count = Number(process.env.SEED_USERS ?? 1000);
  const db = createDb();

  await reset(db, { users });
  await seed(db, { users }, { seed: 42, count });

  return { users: count };
}

const isMain = process.argv[1]?.endsWith("seed-bulk.ts");
if (isMain) {
  bulkSeed()
    .then((counts) => {
      console.log("users-service bulk seed complete:", counts);
      process.exit(0);
    })
    .catch((error) => {
      console.error("users-service bulk seed failed:", error);
      process.exit(1);
    });
}
