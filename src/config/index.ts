import dotenv from "dotenv";

dotenv.config();

interface schema {
  port: string;
  host: string;
}

export function loadConfig(): schema {
  return {
    port: loadEnv("PORT", "3000"),
    host: loadEnv("HOST", "127.0.0.1"),
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
