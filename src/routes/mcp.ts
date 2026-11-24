import { Router } from "express";
import type { APIService } from "../modules/api/service";
import { MCPController } from "../modules/mcp/controller";
import { apiKeyAuth, requireScope } from "../middlewares/api_key";

export const MCP_ACCESS_SCOPE = "mcp:access";

export function createMcpRouter(apiService: APIService): Router {
  const router = Router();
  const controller = new MCPController();

  router.post(
    "/",
    apiKeyAuth(apiService),
    requireScope(MCP_ACCESS_SCOPE),
    controller.handle,
  );
  router.all("/", controller.methodNotAllowed("GET"));

  return router;
}
