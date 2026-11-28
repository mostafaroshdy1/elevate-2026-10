import "dotenv/config";
import { reset, seed } from "drizzle-seed";
import { createDb } from "./index";
import { posts } from "./schema";

/**
 * Bulk seed for load-testing / benchmarking. Generates `SEED_POSTS` (default
 * 20000) posts.
 *
 * `authorId` has NO foreign key (users live in users-service), so we constrain
 * it to `1..SEED_USERS` to line up with the users-service seed.
 */
export async function bulkSeed() {
  const count = Number(process.env.SEED_POSTS ?? 20000);
  const authors = Number(process.env.SEED_USERS ?? 1000);
  const db = createDb();

  await reset(db, { posts });
  await seed(db, { posts }, { seed: 42, count }).refine((f) => ({
    posts: {
      count,
      columns: {
        authorId: f.int({ minValue: 1, maxValue: authors }),
      },
    },
  }));

  return { posts: count };
}

const isMain = process.argv[1]?.endsWith("seed-bulk.ts");
if (isMain) {
  bulkSeed()
    .then((counts) => {
      console.log("posts-service bulk seed complete:", counts);
      process.exit(0);
    })
    .catch((error) => {
      console.error("posts-service bulk seed failed:", error);
      process.exit(1);
    });
}
