import type { Request, Response } from "express";
import type { APIService } from "./service";

export class APIController {
  constructor(private service: APIService) {}

  create = async (req: Request, res: Response) => {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { title, expiresInMs, scopes } = req.body ?? {};
    const result = await this.service.create({
      userId,
      title,
      expiresInMs,
      scopes,
    });

    return res.status(201).json(result);
  };

  list = async (req: Request, res: Response) => {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const keys = await this.service.list(userId);
    return res.status(200).json({ keys });
  };

  revoke = async (req: Request, res: Response) => {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const id = req.params.id;
    if (typeof id !== "string") {
      return res.status(400).json({ error: "Missing API key id" });
    }

    const apiKey = await this.service.revoke(id);
    if (!apiKey) {
      return res.status(404).json({ error: "API key not found" });
    }

    return res.status(200).json({ apiKey });
  };
}
