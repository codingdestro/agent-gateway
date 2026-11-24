import { Router } from "express";
import type { UserController } from "../modules/identity/controller";
import type { APIController } from "../modules/api/controller";
import type { APIService } from "../modules/api/service";
import { requireUserId } from "../middlewares/auth";
import { createMcpRouter } from "./mcp";

export interface RouterDeps {
  userController: UserController;
  apiController: APIController;
  apiService: APIService;
}

export function createRouter(deps: RouterDeps): Router {
  const router = Router();

  router.get("/healthz", (_req, res) => {
    res.status(200).json({ message: "OK", status: "Healthy" });
  });

  router.post("/api/user/login", deps.userController.login);
  router.post("/api/user/register", deps.userController.register);
  router.post("/api/key/create", requireUserId, deps.apiController.create);
  router.post("/api/key/list", requireUserId, deps.apiController.list);

  router.use("/mcp", createMcpRouter(deps.apiService));

  return router;
}
