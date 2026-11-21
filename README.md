# Basic MCP tools server

A small TypeScript MCP server built with Bun and the official MCP TypeScript SDK. It serves the Streamable HTTP transport at `/mcp`.

## Requirements

- Bun 1.3 or newer

## Setup

```bash
bun install
bun run dev
```

The server listens on `http://localhost:3000/mcp` by default. Set `PORT` to use another port.

The server is stateless: it issues no session ID, and every `POST` is handled
independently by a fresh server instance. `GET` and `DELETE` on `/mcp` return `405`.

## Tools

- `add_numbers`: adds two numbers
- `greet`: greets a person by name
- `count_characters`: counts Unicode characters in a string

## Connect a client

Configure an MCP client to use the Streamable HTTP URL `http://localhost:3000/mcp`.

For a production run, use `bun run start`. To check types, use `bun run typecheck`.

## Logging

Request and error events are written to **stderr** as one JSON object per line, so
stdout stays clean for piping. Set `LOG_LEVEL` to `debug`, `info` (default), `warn`,
or `error` to control verbosity.

```json
{"level":"info","time":"2026-01-01T00:00:00.000Z","event":"server.listening","url":"http://127.0.0.1:3000/mcp"}
```

