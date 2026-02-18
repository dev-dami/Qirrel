# Agent-Native Integration

[Docs Home](./README.md) | [API](./api.md) | [Configuration](./configuration.md) | [Examples](./examples.md) | [Basic](./usage/basic.md) | [Caching](./usage/caching.md) | [Events](./events.md) | [LLM](./integrations/llm.md) | [Architecture](./walkthrough.md)

Qirrel now includes an agent-native layer with:

- a reusable `AgentBridge` abstraction
- built-in Qirrel tools (`qirrel.parse_text`, `qirrel.parse_batch`)
- built-in explainer tool (`qirrel.tool_help`) for model self-discovery
- a lightweight MCP JSON-RPC server (`qirrel-mcp`)
- tinybench benchmarks for direct vs agent-mode overhead

## Core Idea

Use one structure for both classic API calls and agent tools:

- Regular function: `processText(text)`
- Agent tool: `qirrel.parse_text({ text })`

`AgentBridge.registerApiTool(...)` adapts non-agent-native handlers into MCP-style tool results with both:

- `content` (agent-readable text)
- `structuredContent` (machine-usable JSON)

## Use the Built-In Bridge

```ts
import { createQirrelAgentBridge } from "qirrel";

const bridge = createQirrelAgentBridge();
const result = await bridge.callTool("qirrel.parse_text", {
  text: "Email hello@example.com",
});

console.log(result.structuredContent);
```

## Let Models Self-Discover Tools

```ts
const help = await bridge.callTool("qirrel.tool_help", {
  name: "qirrel.parse_text",
});

console.log(help.structuredContent);
```

`qirrel.tool_help` returns machine-usable metadata (`description`, `inputSchema`, `examples`) so agents can plan tool calls correctly.

## Wrap Your Existing APIs

```ts
import { AgentBridge } from "qirrel";

const bridge = new AgentBridge();

bridge.registerApiTool(
  {
    name: "inventory.lookup",
    description: "Lookup stock by SKU",
    inputSchema: {
      type: "object",
      properties: { sku: { type: "string" } },
      required: ["sku"],
    },
  },
  async ({ sku }: { sku: string }) => {
    return { sku, inStock: true };
  },
);
```

## Start MCP Server (stdio)

```bash
bun run mcp:start
```

Or after install:

```bash
qirrel-mcp
```

## Benchmark Agent Overhead

```bash
bun run bench:agent
```

This compares:

- direct API (`processText`)
- tool call via `AgentBridge`
- MCP `tools/call` request handler path

## Benchmark Against Other Lightweight Frameworks

```bash
bun run bench:frameworks
```

See detailed benchmark guidance in [Benchmarks](./benchmarks.md).
