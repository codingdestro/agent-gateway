import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerTools } from "./tools/register-tools.ts";

export async function createMcpServer(): Promise<McpServer> {
  const server = new McpServer({
    name: "basic-tools-server",
    version: "1.0.0",
  });

  await registerTools(server);

  return server;
}
