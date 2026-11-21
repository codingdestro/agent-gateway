import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import { z } from "zod";
import { handlers, loadTools } from "./fake_tools";

export async function registerTools(server: McpServer) {
  const rows = await loadTools(); // select * from mcp_tools where enabled
  console.log("registering", rows.length, "tools");

  for (const t of rows) {
    server.registerTool(
      t.name,
      {
        description: t.description,
        inputSchema: jsonSchemaToZodShape(t.input_schema), // see below
      },
      async (args) => {
        try {
          const text = await handlers[t.handler_type]!(t.handler_config, args);
          return { content: [{ type: "text", text }] };
        } catch (e: any) {
          return {
            isError: true,
            content: [{ type: "text", text: e.message }],
          };
        }
      },
    );
  }
}

export function jsonSchemaToZodShape(schema: any) {
  const shape: Record<string, z.ZodTypeAny> = {};
  for (const [key, p] of Object.entries<any>(schema.properties ?? {})) {
    let f: z.ZodTypeAny =
      p.type === "number"
        ? z.number()
        : p.type === "boolean"
          ? z.boolean()
          : z.string();
    if (p.description) f = f.describe(p.description);
    if (!schema.required?.includes(key)) f = f.optional();
    shape[key] = f;
  }
  return shape;
}
