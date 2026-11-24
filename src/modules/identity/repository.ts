import type Database from "../../database/db";
import type { User } from "./validation";

export class AuthRepository {
  constructor(private db: Database) {}

  async findByEmail(email: string): Promise<User | null> {
    const result = await this.db.query<User>(
      "SELECT * FROM users WHERE email = $1",
      [email],
    );
    return result.rows[0] ?? null;
  }

  async findById(id: string | number): Promise<User | null> {
    const result = await this.db.query<User>(
      "SELECT * FROM users WHERE id = $1",
      [id],
    );
    return result.rows[0] ?? null;
  }

  async createUser(data: {
    email: string;
    password: string;
    username: string;
  }): Promise<User> {
    const result = await this.db.query<User>(
      `INSERT INTO users (username, email, password)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [data.username, data.email, data.password],
    );
    return result.rows[0]!;
  }
}
