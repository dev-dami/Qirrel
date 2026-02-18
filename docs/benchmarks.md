# Benchmarks

[Docs Home](./README.md) | [Agent-Native](./agent-native.md) | [API](./api.md) | [Configuration](./configuration.md) | [Examples](./examples.md) | [Basic](./usage/basic.md) | [Caching](./usage/caching.md) | [Events](./events.md) | [LLM](./integrations/llm.md) | [Architecture](./walkthrough.md)

Qirrel includes two benchmark tracks:

## 1) Agent Overhead Benchmark

```bash
bun run bench:agent
```

Measures end-to-end path cost for:

- direct Qirrel parsing (`processText`)
- Qirrel `AgentBridge` tool call
- Qirrel MCP `tools/call` handler path

## 2) Lightweight Framework Comparison

```bash
bun run bench:frameworks
```

Measures local tool-dispatch overhead with the same handler:

- Direct handler baseline
- Qirrel `AgentBridge`
- Qirrel MCP request handler
- LangChain `tool()` wrapper (if installed)
- Vercel AI SDK `tool()` wrapper (if installed)

This benchmark is API-free and model-free by design, so results isolate orchestration overhead.

## Reading Results

- `ops/sec` higher is better.
- `avg ms` lower is better.
- `p99 ms` lower is better (tail latency stability).

## Notes

- Benchmarks are sensitive to CPU, thermal state, and background load.
- Always compare runs on the same machine and runtime settings.
