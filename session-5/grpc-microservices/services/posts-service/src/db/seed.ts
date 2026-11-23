import "dotenv/config";
import { createDb } from "./index";
import { posts } from "./schema";

const iso = (minutes: number) =>
  new Date(Date.UTC(2026, 10, 5, 9, 0, 0) + minutes * 60_000).toISOString();

export async function seed() {
  const db = createDb();
  await db.delete(posts);

  const seeded = await db
    .insert(posts)
    .values([
      { id: 1, authorId: 1, title: "Hello, world!", content: "My first post on this demo social network.", createdAt: iso(10) },
      { id: 2, authorId: 1, title: "Why I like Drizzle", content: "Type-safe SQL with a tiny footprint. What's not to like?", createdAt: iso(20) },
      { id: 3, authorId: 2, title: "Clean architecture with Fastify", content: "Controller -> Service -> Repository keeps the layers honest.", createdAt: iso(30) },
      { id: 4, authorId: 3, title: "Monolith vs microservices", content: "Start with a monolith, split when you outgrow it.", createdAt: iso(40) },
      { id: 5, authorId: 4, title: "SQLite for local development", content: "Zero setup and it behaves like production SQL.", createdAt: iso(50) },
      { id: 6, authorId: 2, title: "Seeding your database", content: "Deterministic seed data makes demos and tests reliable.", createdAt: iso(60) },
    ])
    .returning();

  return { posts: seeded.length };
}

const isMain = process.argv[1]?.endsWith("seed.ts");
if (isMain) {
  seed()
    .then((counts) => {
      console.log("posts-service seed complete:", counts);
      process.exit(0);
    })
    .catch((error) => {
      console.error("posts-service seed failed:", error);
      process.exit(1);
    });
}
