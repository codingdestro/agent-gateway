import type { Request, Response, NextFunction } from "express";
import type { AuthInfo } from "@modelcontextprotocol/sdk/server/auth/types.js";

export async function MCPAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.header("authorization") ?? "";
  const key = header.startsWith("Bearer ")
    ? header.slice(7)
    : (req.header("x-api-key") ?? "");

  //verify key
  const match = key ? true : false;
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
    clientId: "testing",
    scopes: ["all"],
  };
  (req as Request & { auth?: AuthInfo }).auth = authInfo;
  next();
}
