import type { Request, Response, NextFunction } from "express";
import { getSessionIdFromRequest } from "../utils/cookies";
import { getSession, refreshSession } from "../utils/session";

export async function userAuth(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const sessionId = getSessionIdFromRequest(req);
  if (!sessionId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const session = await getSession(sessionId);

  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  await refreshSession(sessionId);
  next();
}
