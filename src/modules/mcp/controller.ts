import type { Request, Response } from "express";
import type { AuthInfo } from "@modelcontextprotocol/sdk/server/auth/types.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { createMcpServer } from "../../server";
import { log } from "../../logger";

interface McpRequestBody {
  method?: string;
  id?: unknown;
}

export class MCPController {
  handle = async (req: Request, res: Response): Promise<void> => {
    const startedAt = performance.now();
    const body = req.body as McpRequestBody | undefined;

    const authInfo: AuthInfo = {
      token: "redacted",
      clientId: req.apiKeyId ?? "unknown",
      scopes: req.scopes ?? [],
    };
    (req as Request & { auth?: AuthInfo }).auth = authInfo;

    const server = await createMcpServer();
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
  };

  methodNotAllowed(method: string) {
    return (_req: Request, res: Response): void => {
      log("warn", "mcp.method_not_allowed", { method });
      res.status(405).json({
        jsonrpc: "2.0",
        error: { code: -32000, message: "Method not allowed." },
        id: null,
      });
    };
  }
}
