import type Database from "../../database/db";
import type { User } from "./validation";

export class AuthRepository {
  constructor(private db: Database) {}
  async findByEmail(email: string): Promise<User | null> {
    this.db.query("SELECT * FROM users where email = ? ", [email]);
    return null;
  }

  async findById(id: string | number): Promise<User | null> {
    this.db.query("SELECT * FROM users where id = ? ", [id]);
    return null;
  }

  async createUser(data: {
    email: string;
    password: string;
    name?: string;
  }): Promise<User> {
    this.db.query("INSERT (name,email,password) INTO users (?,?,?) ", [
      data.name,
      data.email,
      data.password,
    ]);
    throw new Error("Not implemented");
  }
}
