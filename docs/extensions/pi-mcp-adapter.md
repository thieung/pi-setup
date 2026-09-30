# pi-mcp-adapter

Pinned in `pi-dev` as:

```text
npm:pi-mcp-adapter@3.3.0
```

## Role

Adapter that exposes Model Context Protocol (MCP) servers to Pi.

## Why it is in pi-dev

MCP servers run external code and can carry credentials, so it starts in `pi-dev`. The reference setup recorded 2.34.0; 3.x is a major version newer and has only been load-tested here, not exercised against real MCP servers.

## Guardrails

- Keep MCP server definitions and tokens out of Git.

## Provenance

Recommended from `mrgoonie/zuey-pi-setup` and `luongnv89/pi-extensions`. Version pinned from the npm registry on 2026-09-30.

Sources:

- https://www.npmjs.com/package/pi-mcp-adapter
