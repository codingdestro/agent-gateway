import type { PoolClient, QueryResult, QueryResultRow } from "pg";
import { Pool } from "pg";

class Database {
  private static instance: Database;
  private pool: Pool;

  private constructor(private databaseUrl: string) {
    this.pool = new Pool({
      connectionString: this.databaseUrl,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });

    this.pool.on("error", (err) => {
      console.error("Unexpected error on idle PostgreSQL client", err);
      process.exit(-1);
    });
  }

  public static getInstance(databaseUrl: string): Database {
    if (!Database.instance) {
      Database.instance = new Database(databaseUrl);
    }
    return Database.instance;
  }

  public async query<T extends QueryResultRow = any>(
    text: string,
    params?: any[],
  ): Promise<QueryResult<T>> {
    return this.pool.query<T>(text, params);
  }

  public async getClient(): Promise<PoolClient> {
    return this.pool.connect();
  }

  public async withTransaction<T>(
    callback: (client: PoolClient) => Promise<T>,
  ): Promise<T> {
    const client = await this.pool.connect();

    try {
      await client.query("BEGIN");
      const result = await callback(client);
      await client.query("COMMIT");
      return result;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  public async close(): Promise<void> {
    await this.pool.end();
  }
}

export default Database;
