import type { NextFunction, Request, Response } from "express";
import { createMcpExpressApp } from "@modelcontextprotocol/sdk/server/express.js";

import { log } from "./logger";
import { loadConfig } from "./config";
import Database from "./database/db";
import { AuthRepository } from "./modules/identity/repository";
import { UserService } from "./modules/identity/service";
import { UserController } from "./modules/identity/controller";
import { APIRepository } from "./modules/api/repository";
import { APIService } from "./modules/api/service";
import { APIController } from "./modules/api/controller";
import { createRouter } from "./routes";

const cnf = loadConfig();

const port = cnf.port;

const db = Database.getInstance(cnf.databaseUrl);

const userRepo = new AuthRepository(db);
const userService = new UserService(userRepo);
const userController = new UserController(userService);

const apiRepo = new APIRepository(db);
const apiService = new APIService(apiRepo);
const apiController = new APIController(apiService);

const app = createMcpExpressApp();

app.use(createRouter({ userController, apiController, apiService }));

function errorField(
  error: unknown,
  field: "status" | "statusCode" | "type",
): unknown {
  if (typeof error !== "object" || error === null) return undefined;
  return (error as Record<string, unknown>)[field];
}

function statusOf(error: unknown): number | undefined {
  const status = errorField(error, "status") ?? errorField(error, "statusCode");

  if (
    typeof status === "number" &&
    Number.isInteger(status) &&
    status >= 400 &&
    status <= 599
  ) {
    return status;
  }

  return undefined;
}

function errorTypeOf(error: unknown): string | undefined {
  const type = errorField(error, "type");
  return typeof type === "string" ? type : undefined;
}

app.use((error: unknown, req: Request, res: Response, _next: NextFunction) => {
  const status = statusOf(error) ?? 500;

  log("error", "request.failed", {
    error,
    status,
    method: req.method,
    url: req.originalUrl,
  });

  if (res.headersSent) {
    res.end();
    return;
  }

  const isParseFailure = errorTypeOf(error) === "entity.parse.failed";

  res.status(status).json({
    jsonrpc: "2.0",
    error: {
      code: isParseFailure ? -32700 : -32603,
      message: isParseFailure
        ? "Parse error: Invalid JSON"
        : "Internal server error",
    },
    id: null,
  });
});

const httpServer = app.listen(port as number, cnf.host, () => {
  log("info", "server.listening", { url: `http://${cnf.host}:${port}/mcp` });
});

httpServer.on("error", (error) => {
  log("error", "server.listen_failed", { error, port });
  process.exit(1);
});
