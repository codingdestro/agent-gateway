import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerTools(server: McpServer): void {
  server.registerTool(
    "add_numbers",
    {
      title: "Add numbers",
      description: "Add two numbers and return their sum.",
      inputSchema: {
        first: z.number().describe("The first number"),
        second: z.number().describe("The second number"),
      },
    },
    async ({ first, second }) => ({
      content: [{ type: "text", text: String(first + second) }],
    }),
  );

  server.registerTool(
    "greet",
    {
      title: "Greet someone",
      description: "Create a friendly greeting for a person.",
      inputSchema: {
        name: z.string().trim().min(1).describe("The person's name"),
      },
    },
    async ({ name }) => ({
      content: [{ type: "text", text: `Hello, ${name}!` }],
    }),
  );

  server.registerTool(
    "count_characters",
    {
      title: "Count characters",
      description: "Count the characters in a piece of text.",
      inputSchema: {
        text: z.string().describe("The text to count"),
      },
    },
    async ({ text }) => ({
      content: [{ type: "text", text: String([...text].length) }],
    }),
  );
}
