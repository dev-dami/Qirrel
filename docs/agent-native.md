# Agent-Native Integration

[Docs Home](./README.md) | [API](./api.md) | [Configuration](./configuration.md) | [Examples](./examples.md) | [Basic](./usage/basic.md) | [Caching](./usage/caching.md) | [Events](./events.md) | [LLM](./integrations/llm.md) | [Architecture](./walkthrough.md) | [Benchmarks](./benchmarks.md) | [Framework Comparison](./framework-comparison.md) | [Ecosystem](./ecosystem-comparison.md)

Qirrel ships an agent-native layer so the same parsing logic can be consumed as tools in agent runtimes.

## What You Get

- `AgentBridge` abstraction for registering/calling tools.
- Built-in tools:
  - `qirrel.parse_text`
  - `qirrel.parse_batch`
  - `qirrel.speech_clean`
  - `qirrel.tool_help`
  - `qirrel.capabilities`

- MCP JSON-RPC request handler and stdio server (`qirrel-mcp`).

## Core Usage

```ts
import { createQirrelAgentBridge } from 'qirrel';

const bridge = createQirrelAgentBridge();
const result = await bridge.callTool('qirrel.parse_text', {
  text: 'Email hello@example.com',
});

console.log(result.structuredContent);
```

## Tool Discovery for Models

```ts
const help = await bridge.callTool('qirrel.tool_help', {
  name: 'qirrel.parse_text',
});

console.log(help.structuredContent);
```

Use `qirrel.tool_help` so planners can read `inputSchema`, examples, and descriptions before invoking tools.

## MCP Server (stdio)

```bash
bun run mcp:start
```

After package install:

```bash
qirrel-mcp
```

Optional config path argument:

```bash
qirrel-mcp ./qirrel.config.yaml
```

## Copy-Paste System Prompt for AI Agents

Paste this prompt into your AI Agent's system instructions (`.cursorrules`, Claude Custom Instructions, or Agent System Prompt):

```text
You have access to Qirrel MCP tools for fast, zero-token local text processing, entity extraction, and transcript cleaning.

When processing user input, raw text, customer messages, or voice transcripts:
1. BEFORE calling an external LLM for simple entity extraction, use `qirrel.parse_text` to extract emails, phone numbers, URLs, and numbers deterministically with 0ms latency and 0 token cost.
2. For audio/voice transcripts containing spoken fillers ("um", "uh", "you know"), stutters, or duplicate words, call `qirrel.speech_clean` to sanitize the transcript before generating responses.
3. For multiple text inputs, use `qirrel.parse_batch` with optional concurrency.
4. If you need details on available tool arguments or schemas, call `qirrel.tool_help` or `qirrel.capabilities`.
```


## MCP Handler Behavior (Current)

Qirrel currently handles these methods:
- `initialize`
- `tools/list`
- `tools/call`
- `ping`

Implemented protocol version default: `2025-03-26`.

Notifications (requests without `id`) are processed but no response is written.

## Error Codes Returned

- `-32700`: parse error (invalid JSON line)
- `-32600`: invalid request
- `-32601`: method not found
- `-32602`: invalid params
- `-32000`: tool execution/internal failure

## Registering Your Own API as Tools

```ts
import { AgentBridge } from 'qirrel';

const bridge = new AgentBridge();

bridge.registerApiTool(
  {
    name: 'inventory.lookup',
    description: 'Lookup stock by SKU',
    inputSchema: {
      type: 'object',
      properties: { sku: { type: 'string' } },
      required: ['sku'],
    },
  },
  async ({ sku }: { sku: string }) => ({ sku, inStock: true }),
);
```

## Operational Guidance

- Keep tool schemas strict and explicit.
- Treat `structuredContent` as the machine contract and `content` as human-readable fallback.
- For transport interoperability planning, pair this page with [Framework Comparison](./framework-comparison.md) and [Ecosystem Comparison](./ecosystem-comparison.md).
