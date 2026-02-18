# Benchmark Report (Local Machine)

[Docs Home](./README.md) | [Benchmarks](./benchmarks.md) | [Framework Comparison](./framework-comparison.md) | [Ecosystem](./ecosystem-comparison.md) | [Agent-Native](./agent-native.md)

This report is generated from this repository with:

```bash
bun run bench:report
```

## Machine

- Date (UTC): 2026-02-18T06:24:49.777Z
- Runtime: Bun 1.3.6
- OS: linux 6.17.0-14-generic (x64)
- CPU: Intel(R) Core(TM) i3-8130U CPU @ 2.20GHz
- Logical cores: 4

## Agent Overhead

| Scenario | ops/sec | avg ms | p99 ms | vs direct |
| --- | ---: | ---: | ---: | ---: |
| direct: processText() | 526 | 1.899 | 6.880 | 1.00x |
| agent bridge: qirrel.parse_text | 544 | 1.838 | 5.042 | 0.97x |
| mcp handler: tools/call | 441 | 2.269 | 5.681 | 1.19x |

## Framework Comparison

| Scenario | ops/sec | avg ms | p99 ms | vs direct |
| --- | ---: | ---: | ---: | ---: |
| Direct handler | 672637 | 0.001 | 0.009 | 1.00x |
| Qirrel AgentBridge | 173444 | 0.006 | 0.019 | 3.88x |
| Qirrel MCP Handler | 168128 | 0.006 | 0.016 | 4.00x |
| LangChain tool() | 23150 | 0.043 | 0.112 | 29.06x |
| AI SDK tool() | 476938 | 0.002 | 0.009 | 1.41x |

## Highlights

- Qirrel AgentBridge is 7.49x faster than LangChain tool() in this run.
- Qirrel MCP handler is 7.26x faster than LangChain tool() in this run.
- Qirrel MCP handler runs at 0.35x of AI SDK tool() throughput while adding MCP compatibility.


## Reproduce

1. Close heavy background apps.
2. Run `bun run bench:report` twice.
3. Commit this file if the numbers are representative.
