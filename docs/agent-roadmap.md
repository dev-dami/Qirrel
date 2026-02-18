# Agent Feature Roadmap

[Docs Home](./README.md) | [Agent-Native](./agent-native.md) | [Benchmarks](./benchmarks.md) | [API](./api.md) | [Configuration](./configuration.md) | [Examples](./examples.md) | [Basic](./usage/basic.md) | [Caching](./usage/caching.md) | [Events](./events.md) | [LLM](./integrations/llm.md) | [Architecture](./walkthrough.md)

This roadmap captures high-value features for making Qirrel a stronger agent platform while keeping the current lightweight core.

## High-Impact Next Features

1. MCP Resources and Prompts
- Add `resources/list` + `resources/read` for reusable parsing schemas and saved extraction profiles.
- Add `prompts/list` + `prompts/get` for prebuilt extraction prompts and workflow templates.

2. Strict Tool I/O Contracts
- Add optional strict-mode schema enforcement for tool arguments and tool outputs.
- Return standardized validation errors in MCP `tools/call`.

3. Agent Memory Layer
- Add optional lightweight memory adapters:
- in-memory session memory
- SQLite-backed memory
- key-value interface for external stores

4. Human-in-the-Loop Controls
- Add approval-gated tools (e.g., `requiresApproval: true`) with resumable handoff.
- Add policy hooks for deny/allow logic by tool name or argument pattern.

5. Tracing + Evaluations
- Add event-based trace exporter (JSONL/OTel-friendly format).
- Add benchmark+eval harness for tool success rate, latency, and schema-violation rate.

## Why These Features

- They map to common agent framework capabilities without forcing heavy runtime dependencies.
- They preserve Qirrel’s current shape: deterministic parsing pipeline + optional agent wrapper.
- They keep direct API users and agent users on the same core logic.

## Research Notes

- MCP evolution emphasizes standardized tools/resources/prompts for interoperability.
- Modern agent SDKs emphasize structured schemas, retries, guardrails, and traceability.
- Lightweight frameworks vary heavily in dispatch overhead; benchmark before choosing orchestration.
