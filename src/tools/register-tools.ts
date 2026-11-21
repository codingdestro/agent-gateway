import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerTools(server: McpServer): void {
  server.registerTool(
    "greeting",
    {
      title: "greet username",
      description: "greet user with their name",
      inputSchema: {
        username: z.string().describe("username"),
      },
    },
    async ({ username }) => ({
      content: [
        {
          type: "text",
          text: String(
            `Hello, ${username}, Welcome to my Agent Gateway MCP Server!`,
          ),
        },
      ],
    }),
  );
}
