# Qirrel Documentation

This directory is the source-of-truth for how to use Qirrel in production.

## How to Use This Docs Set

1. Start with [Basic Usage](./usage/basic.md) if you are integrating Qirrel for the first time.
2. Read [API Reference](./api.md) for exact signatures and behavior.
3. Read [Configuration Guide](./configuration.md) before shipping to production.
4. Use [Architecture Walkthrough](./walkthrough.md) to understand internals and extension points.
5. If you are integrating with agents, read [Agent-Native Integration](./agent-native.md).

## Core Docs

- [Project README](../README.MD)
- [API Reference](./api.md)
- [Configuration Guide](./configuration.md)
- [Usage Examples](./examples.md)
- [Basic Usage](./usage/basic.md)
- [Caching](./usage/caching.md)
- [Pipeline Events](./events.md)
- [LLM Integration](./integrations/llm.md)
- [Architecture Walkthrough](./walkthrough.md)

## Agent and Interop Docs

- [Agent-Native Integration](./agent-native.md)
- [Agent Feature Roadmap](./agent-roadmap.md)

## Benchmark and Positioning Docs

- [Benchmarks](./benchmarks.md)
- [Benchmark Report (Local Machine)](./benchmark-report.md)
- [Framework Comparison](./framework-comparison.md)
- [Ecosystem Comparison](./ecosystem-comparison.md)

## Conventions Used in These Docs

- Examples use TypeScript.
- Install/run commands prefer Bun to match this repository scripts.
- Config keys and runtime behavior are documented against the current `src/*` implementation.
- When behavior differs by provider (for example LLM adapters), docs call that out explicitly.
