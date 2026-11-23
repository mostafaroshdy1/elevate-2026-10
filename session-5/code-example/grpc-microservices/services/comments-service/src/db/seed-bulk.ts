import "dotenv/config";
import { reset, seed } from "drizzle-seed";
import { createDb } from "./index";
import { comments } from "./schema";

/**
 * Bulk seed for load-testing / benchmarking. Generates `SEED_COMMENTS`
 * (default 100000) comments.
 *
 * `postId` and `authorId` have no foreign keys (posts/users live in other
 * services), so we constrain them to `1..SEED_POSTS` and `1..SEED_USERS` to
 * line up with the posts-service and users-service seeds.
 */
export async function bulkSeed() {
  const count = Number(process.env.SEED_COMMENTS ?? 100000);
  const postsCount = Number(process.env.SEED_POSTS ?? 20000);
  const authors = Number(process.env.SEED_USERS ?? 1000);
  const db = createDb();

  await reset(db, { comments });
  await seed(db, { comments }, { seed: 42, count }).refine((f) => ({
    comments: {
      count,
      columns: {
        postId: f.int({ minValue: 1, maxValue: postsCount }),
        authorId: f.int({ minValue: 1, maxValue: authors }),
      },
    },
  }));

  return { comments: count };
}

const isMain = process.argv[1]?.endsWith("seed-bulk.ts");
if (isMain) {
  bulkSeed()
    .then((counts) => {
      console.log("comments-service bulk seed complete:", counts);
      process.exit(0);
    })
    .catch((error) => {
      console.error("comments-service bulk seed failed:", error);
      process.exit(1);
    });
}
