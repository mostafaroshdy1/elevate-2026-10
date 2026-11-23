import "dotenv/config";
import { createDb } from "./index";
import { users } from "./schema";

const iso = (minutes: number) =>
  new Date(Date.UTC(2026, 10, 5, 9, 0, 0) + minutes * 60_000).toISOString();

export async function seed() {
  const db = createDb();
  await db.delete(users);

  const seeded = await db
    .insert(users)
    .values([
      { id: 1, username: "alice", email: "alice@example.com", fullName: "Alice Johnson", createdAt: iso(0) },
      { id: 2, username: "bob", email: "bob@example.com", fullName: "Bob Smith", createdAt: iso(1) },
      { id: 3, username: "carol", email: "carol@example.com", fullName: "Carol White", createdAt: iso(2) },
      { id: 4, username: "dave", email: "dave@example.com", fullName: "Dave Brown", createdAt: iso(3) },
    ])
    .returning();

  return { users: seeded.length };
}

const isMain = process.argv[1]?.endsWith("seed.ts");
if (isMain) {
  seed()
    .then((counts) => {
      console.log("users-service seed complete:", counts);
      process.exit(0);
    })
    .catch((error) => {
      console.error("users-service seed failed:", error);
      process.exit(1);
    });
}
