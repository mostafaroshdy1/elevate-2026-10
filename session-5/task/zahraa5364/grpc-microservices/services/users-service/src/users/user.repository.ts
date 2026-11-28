import { asc, eq } from "drizzle-orm";
import { users } from "../db/schema";
import type { Database } from "../db";
import type { CreateUserInput, UpdateUserInput, User } from "./user.entity";

export class UserRepository {
  constructor(private readonly db: Database) {}

  async findAll(): Promise<User[]> {
    return this.db.select().from(users).orderBy(asc(users.id));
  }

  async findById(id: number): Promise<User | undefined> {
    const rows = await this.db.select().from(users).where(eq(users.id, id)).limit(1);
    return rows[0];
  }

  async findByUsername(username: string): Promise<User | undefined> {
    const rows = await this.db.select().from(users).where(eq(users.username, username)).limit(1);
    return rows[0];
  }

  async findByEmail(email: string): Promise<User | undefined> {
    const rows = await this.db.select().from(users).where(eq(users.email, email)).limit(1);
    return rows[0];
  }

  async create(input: CreateUserInput): Promise<User> {
    const rows = await this.db
      .insert(users)
      .values({ ...input, createdAt: new Date().toISOString() })
      .returning();
    return rows[0];
  }

  async update(id: number, input: UpdateUserInput): Promise<User | undefined> {
    const rows = await this.db.update(users).set(input).where(eq(users.id, id)).returning();
    return rows[0];
  }

  async remove(id: number): Promise<boolean> {
    const rows = await this.db.delete(users).where(eq(users.id, id)).returning();
    return rows.length > 0;
  }
}
