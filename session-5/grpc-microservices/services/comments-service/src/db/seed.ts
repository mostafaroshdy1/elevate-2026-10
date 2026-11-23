import "dotenv/config";
import { createDb } from "./index";
import { comments } from "./schema";

const iso = (minutes: number) =>
  new Date(Date.UTC(2026, 10, 5, 9, 0, 0) + minutes * 60_000).toISOString();

export async function seed() {
  const db = createDb();
  await db.delete(comments);

  const seeded = await db
    .insert(comments)
    .values([
      { id: 1, postId: 1, authorId: 2, content: "Welcome!", createdAt: iso(15) },
      { id: 2, postId: 1, authorId: 3, content: "Nice first post.", createdAt: iso(16) },
      { id: 3, postId: 2, authorId: 3, content: "Drizzle is awesome.", createdAt: iso(25) },
      { id: 4, postId: 2, authorId: 4, content: "Agreed.", createdAt: iso(26) },
      { id: 5, postId: 3, authorId: 1, content: "Great architecture.", createdAt: iso(35) },
      { id: 6, postId: 3, authorId: 4, content: "Clean code!", createdAt: iso(36) },
      { id: 7, postId: 4, authorId: 1, content: "Interesting comparison.", createdAt: iso(45) },
      { id: 8, postId: 4, authorId: 2, content: "Microservices are hard, though.", createdAt: iso(46) },
      { id: 9, postId: 5, authorId: 1, content: "SQLite is perfect for demos.", createdAt: iso(55) },
      { id: 10, postId: 5, authorId: 3, content: "Zero setup!", createdAt: iso(56) },
      { id: 11, postId: 6, authorId: 1, content: "Seeding makes demos easy.", createdAt: iso(65) },
      { id: 12, postId: 6, authorId: 3, content: "Thanks for the tip.", createdAt: iso(66) },
    ])
    .returning();

  return { comments: seeded.length };
}

const isMain = process.argv[1]?.endsWith("seed.ts");
if (isMain) {
  seed()
    .then((counts) => {
      console.log("comments-service seed complete:", counts);
      process.exit(0);
    })
    .catch((error) => {
      console.error("comments-service seed failed:", error);
      process.exit(1);
    });
}
