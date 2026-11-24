import type { Request, Response, NextFunction } from "express";
import type { APIService } from "../modules/api/service";

function extractKey(req: Request): string {
  const header = req.header("authorization") ?? "";
  if (header.startsWith("Bearer ")) {
    return header.slice(7).trim();
  }

  return (req.header("x-api-key") ?? "").trim();
}

export function apiKeyAuth(service: APIService) {
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const key = extractKey(req);
    if (!key) {
      res.status(401).json({ error: "Missing API key" });
      return;
    }

    const apiKey = await service.verify(key);
    if (!apiKey) {
      res.status(401).json({ error: "Invalid or expired API key" });
      return;
    }

    req.userId = apiKey.user_id;
    req.scopes = apiKey.scopes;
    req.apiKeyId = apiKey.id;
    next();
  };
}

export function requireScope(...required: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const scopes = req.scopes ?? [];
    const missing = required.filter((scope) => !scopes.includes(scope));

    if (missing.length > 0) {
      res
        .status(403)
        .json({ error: `Forbidden: missing scope ${missing.join(", ")}` });
      return;
    }

    next();
  };
}
