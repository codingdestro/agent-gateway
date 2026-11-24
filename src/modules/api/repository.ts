import type Database from "../../database/db";
import type { APIKey } from "./validation";

export interface APIKeyInsert {
  user_id: string;
  title: string;
  hashed_key: string;
  scopes: string[];
  expires_at: Date | null;
}

export class APIRepository {
  constructor(private db: Database) {}

  async findById(id: string): Promise<APIKey | null> {
    const result = await this.db.query<APIKey>(
      "SELECT * FROM apikeys WHERE id = $1",
      [id],
    );
    return result.rows[0] ?? null;
  }

  async findByUserId(userId: string): Promise<APIKey[]> {
    const result = await this.db.query<APIKey>(
      "SELECT * FROM apikeys WHERE user_id = $1 ORDER BY created_at DESC",
      [userId],
    );
    return result.rows;
  }

  async findActive(): Promise<APIKey[]> {
    const result = await this.db.query<APIKey>(
      `SELECT * FROM apikeys
       WHERE revoked = false
         AND (expires_at IS NULL OR expires_at > now())`,
    );
    return result.rows;
  }

  async create(data: APIKeyInsert): Promise<APIKey> {
    const result = await this.db.query<APIKey>(
      `INSERT INTO apikeys (user_id, title, hashed_key, scopes, expires_at)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        data.user_id,
        data.title,
        data.hashed_key,
        data.scopes,
        data.expires_at,
      ],
    );
    return result.rows[0]!;
  }

  async revoke(id: string): Promise<APIKey | null> {
    const result = await this.db.query<APIKey>(
      `UPDATE apikeys
       SET revoked = true, updated_at = now()
       WHERE id = $1
       RETURNING *`,
      [id],
    );
    return result.rows[0] ?? null;
  }
}
