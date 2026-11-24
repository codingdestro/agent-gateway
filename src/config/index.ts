import dotenv from "dotenv";

dotenv.config();

interface schema {
  port: string | number;
  host: string;
  databaseUrl: string;
}

export function loadConfig(): schema {
  return {
    port: (() => {
      const port = Number(loadEnv("PORT", "3000"));
      if (!Number.isInteger(port) || port < 1 || port > 65535) {
        process.exit(1);
      }
      return port;
    })(),
    host: loadEnv("HOST", "127.0.0.1"),
    databaseUrl: mustEnv("DATABASE_URL"),
  };
}

function loadEnv(key: string, def: string): string {
  return process.env[key] ?? def;
}

function mustEnv(key: string): string {
  const value = process.env[key];
  if (!value || value === "") {
    console.error(key, "must be provided!");
    process.exit(1);
  }
  return value;
}
