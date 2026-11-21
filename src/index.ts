import type { NextFunction, Request, Response } from "express";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { createMcpExpressApp } from "@modelcontextprotocol/sdk/server/express.js";
import { createMcpServer } from "./server";
import { log } from "./logger";

const port = Number(process.env.PORT ?? 3000);

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  log("error", "config.invalid_port", { PORT: process.env.PORT });
  process.exit(1);
}

const app = createMcpExpressApp();

app.post("/mcp", async (req: Request, res: Response) => {
  const startedAt = performance.now();
  const body = req.body as { method?: string; id?: unknown } | undefined;
  const server = createMcpServer();
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
  });

  let cleanedUp = false;
  const cleanup = async (): Promise<void> => {
    if (cleanedUp) return;
    cleanedUp = true;

    try {
      await transport.close();
    } catch (error) {
      log("warn", "transport.close_failed", { error });
    }

    try {
      await server.close();
    } catch (error) {
      log("warn", "server.close_failed", { error });
    }
  };

  res.on("close", () => {
    void cleanup();
  });

  transport.onerror = (error) => {
    log("error", "transport.error", {
      error,
      method: body?.method,
      id: body?.id,
    });
  };

  try {
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
    log("info", "mcp.request", {
      method: body?.method,
      id: body?.id,
      durationMs: Math.round(performance.now() - startedAt),
    });
  } catch (error) {
    log("error", "mcp.request_failed", {
      error,
      method: body?.method,
      id: body?.id,
      durationMs: Math.round(performance.now() - startedAt),
    });

    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: "2.0",
        error: { code: -32603, message: "Internal server error" },
        id: body?.id ?? null,
      });
    }

    await cleanup();
  }
});

function methodNotAllowed(method: string) {
  return (_req: Request, res: Response): void => {
    log("warn", "mcp.method_not_allowed", { method });
    res.status(405).json({
      jsonrpc: "2.0",
      error: { code: -32000, message: "Method not allowed." },
      id: null,
    });
  };
}

app.get("/mcp", methodNotAllowed("GET"));
app.delete("/mcp", methodNotAllowed("DELETE"));

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

const httpServer = app.listen(port, "127.0.0.1", () => {
  log("info", "server.listening", { url: `http://127.0.0.1:${port}/mcp` });
});

httpServer.on("error", (error) => {
  log("error", "server.listen_failed", { error, port });
  process.exit(1);
});
