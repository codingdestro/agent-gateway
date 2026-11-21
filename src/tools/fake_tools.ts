export interface ToolRow {
  name: string;
  description: string;
  input_schema: {
    type: "object";
    properties: Record<string, { type: string; description?: string }>;
    required?: string[];
  };
  handler_type: "echo" | "math" | "http";
  handler_config: Record<string, any>;
  required_scope: string | null;
  enabled: boolean;
}

const DUMMY_TOOLS: ToolRow[] = [
  {
    name: "echo",
    description: "Echo back the given message",
    input_schema: {
      type: "object",
      properties: { message: { type: "string", description: "Text to echo" } },
      required: ["message"],
    },
    handler_type: "echo",
    handler_config: { prefix: "Echo: " },
    required_scope: null, // no scope needed
    enabled: true,
  },
  {
    name: "add_numbers",
    description: "Add two numbers",
    input_schema: {
      type: "object",
      properties: {
        a: { type: "number", description: "First number" },
        b: { type: "number", description: "Second number" },
      },
      required: ["a", "b"],
    },
    handler_type: "math",
    handler_config: { op: "add" },
    required_scope: "notes:read",
    enabled: true,
  },
  {
    name: "get_joke",
    description: "Fetch a random joke (disabled example)",
    input_schema: { type: "object", properties: {} },
    handler_type: "http",
    handler_config: {
      url: "https://official-joke-api.appspot.com/random_joke",
      method: "GET",
    },
    required_scope: "notes:write",
    enabled: false, // filtered out below
  },
];

// Simulates: select * from mcp_tools where enabled = true
export async function loadTools(): Promise<ToolRow[]> {
  await new Promise((r) => setTimeout(r, 5)); // fake DB latency
  return DUMMY_TOOLS.filter((t) => t.enabled);
}

export const handlers: Record<
  string,
  (cfg: any, args: any) => Promise<string>
> = {
  echo: async (cfg, args) => `${cfg.prefix ?? ""}${args.message}`,
  math: async (cfg, args) => {
    if (cfg.op === "add") return String(args.a + args.b);
    throw new Error(`Unsupported op: ${cfg.op}`);
  },
  http: async (cfg) =>
    (await fetch(cfg.url, { method: cfg.method ?? "GET" })).text(),
};
