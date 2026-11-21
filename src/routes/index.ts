import { Router, type Request, type Response } from "express";

const route = Router();

route.get("/healthz", (_req: Request, res: Response) => {
  res.status(200).json({
    message: "OK",
    status: "Healthy",
  });
});

export default route;
