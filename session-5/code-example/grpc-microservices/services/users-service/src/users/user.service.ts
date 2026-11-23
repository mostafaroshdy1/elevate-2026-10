import { ConflictError, NotFoundError } from "../lib/http-error";
import type { UserRepository } from "./user.repository";
import type { CreateUserInput, UpdateUserInput, User } from "./user.entity";

export class UserService {
  constructor(private readonly users: UserRepository) {}

  async list(): Promise<User[]> {
    return this.users.findAll();
  }

  async get(id: number): Promise<User> {
    const user = await this.users.findById(id);
    if (!user) throw new NotFoundError(`User ${id} not found`);
    return user;
  }

  async create(input: CreateUserInput): Promise<User> {
    const [byUsername, byEmail] = await Promise.all([
      this.users.findByUsername(input.username),
      this.users.findByEmail(input.email),
    ]);
    if (byUsername) throw new ConflictError(`Username "${input.username}" is already taken`);
    if (byEmail) throw new ConflictError(`Email "${input.email}" is already registered`);
    return this.users.create(input);
  }

  async update(id: number, input: UpdateUserInput): Promise<User> {
    await this.get(id);

    if (input.username) {
      const existing = await this.users.findByUsername(input.username);
      if (existing && existing.id !== id) throw new ConflictError(`Username "${input.username}" is already taken`);
    }
    if (input.email) {
      const existing = await this.users.findByEmail(input.email);
      if (existing && existing.id !== id) throw new ConflictError(`Email "${input.email}" is already registered`);
    }

    const updated = await this.users.update(id, input);
    if (!updated) throw new NotFoundError(`User ${id} not found`);
    return updated;
  }

  async remove(id: number): Promise<void> {
    const ok = await this.users.remove(id);
    if (!ok) throw new NotFoundError(`User ${id} not found`);
  }
}
