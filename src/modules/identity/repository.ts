import type { User } from "./validation";

// Replace this with your actual DB client (Prisma, Drizzle, Knex, etc.)
export class AuthRepository {
  async findByEmail(email: string): Promise<User | null> {
    // Example with Prisma:
    // return prisma.user.findUnique({ where: { email } });

    // Placeholder
    return null;
  }

  async findById(id: string | number): Promise<User | null> {
    // return prisma.user.findUnique({ where: { id } });
    return null;
  }

  async createUser(data: {
    email: string;
    password: string;
    name?: string;
  }): Promise<User> {
    // return prisma.user.create({ data });
    throw new Error("Not implemented");
  }
}
