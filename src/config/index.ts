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

function loadEnv(name: string, def: string): string {
  return process.env[name] ?? def;
}
