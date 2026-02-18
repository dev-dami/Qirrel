# Benchmarks

[Docs Home](./README.md) | [Agent-Native](./agent-native.md) | [Benchmark Report](./benchmark-report.md) | [Framework Comparison](./framework-comparison.md) | [Ecosystem](./ecosystem-comparison.md) | [API](./api.md) | [Configuration](./configuration.md) | [Examples](./examples.md)

This page explains what benchmark scripts measure, what they do not measure, and how to interpret results safely.

## Benchmark Tracks

### 1) Agent Overhead

```bash
bun run bench:agent
```

Measures end-to-end path cost for:
- direct parse (`processText`)
- `AgentBridge` tool path
- MCP `tools/call` handler path

### 2) Framework Dispatch Comparison

```bash
bun run bench:frameworks
```

Measures local tool-dispatch overhead with one shared handler implementation:
- Direct handler baseline
- Qirrel AgentBridge
- Qirrel MCP handler
- LangChain `tool()` (if installed)
- AI SDK `tool()` (if installed)

### 3) Markdown Report Generation

```bash
bun run bench:report
```

Generates/updates:
- [Benchmark Report](./benchmark-report.md)

## Methodology Notes

- Benchmarks are local machine measurements, not universal truth.
- This suite isolates orchestration overhead (no external model API calls in framework comparison track).
- Optional frameworks are skipped if dependencies are unavailable.

## How to Read Metrics

- `ops/sec`: higher is better.
- `avg ms`: lower is better.
- `p99 ms`: lower is better for tail latency stability.
- `vs direct`: slowdown relative to direct baseline (`1.00x` = equal to baseline).

## Reproducibility Checklist

1. Close resource-heavy apps.
2. Run each benchmark at least twice.
3. Compare runs on the same runtime version and machine profile.
4. Commit results only when stable.

## Common Misinterpretations

- A faster wrapper in synthetic benchmarks does not automatically mean better full-system latency.
- Cross-machine comparisons are usually invalid unless hardware/runtime are normalized.
- Throughput alone is not enough; include ergonomics, interoperability, and failure handling in selection decisions.
