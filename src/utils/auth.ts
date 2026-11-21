import { createHash, timingSafeEqual } from "node:crypto";
import type { Request, Response, NextFunction } from "express";
import type { AuthInfo } from "@modelcontextprotocol/sdk/server/auth/types.js";

const sha256 = (s: string) => createHash("sha256").update(s).digest();

export const KEYS = [
  {
    hash: Buffer.from(process.env.KEY_HASH_ADMIN ?? "", "hex"),
    clientId: "admin-bot",
    scopes: ["notes:read", "notes:write"],
  },
].filter((k) => k.hash.length === 32);

// 2. Auth middleware
export function apiKeyAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.header("authorization") ?? "";
  const key = header.startsWith("Bearer ")
    ? header.slice(7)
    : (req.header("x-api-key") ?? "");

  const incoming = sha256(key);
  const match = KEYS.find((k) => timingSafeEqual(k.hash, incoming));

  if (!match) {
    res.status(401).json({
      jsonrpc: "2.0",
      error: { code: -32001, message: "Invalid or missing API key" },
      id: null,
    });
    return;
  }

  // The SDK forwards req.auth to tool handlers as extra.authInfo
  const authInfo: AuthInfo = {
    token: "redacted",
    clientId: match.clientId,
    scopes: match.scopes,
  };
  (req as Request & { auth?: AuthInfo }).auth = authInfo;
  next();
}

// 3. Scope check helper
export function requireScope(extra: { authInfo?: AuthInfo }, scope: string) {
  if (!extra.authInfo?.scopes.includes(scope)) {
    throw new Error(`Forbidden: missing scope ${scope}`);
  }
}
