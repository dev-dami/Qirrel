# Agent Feature Roadmap

[Docs Home](./README.md) | [Agent-Native](./agent-native.md) | [Benchmarks](./benchmarks.md) | [Framework Comparison](./framework-comparison.md) | [Ecosystem](./ecosystem-comparison.md)

This roadmap tracks high-value work to strengthen Qirrel as an agent-compatible runtime while preserving lightweight deterministic parsing.

## Roadmap Principles

- Keep deterministic parsing as a stable core.
- Add agent/runtime capabilities as optional layers.
- Prefer explicit contracts (schemas, errors, protocol behavior).
- Avoid hidden coupling between direct API mode and agent mode.

## Priority Backlog

### 1. MCP Resources and Prompts

**Why:** improves interoperability and discoverability in MCP-native orchestrators.

**Candidate scope:**
- `resources/list`, `resources/read`
- `prompts/list`, `prompts/get`
- reusable extraction profile resources

**Done when:** tools + resources + prompts can be consumed by a generic MCP client without custom glue.

### 2. Strict Tool I/O Contracts

**Why:** tool invocation failures should be deterministic and machine-actionable.

**Candidate scope:**
- strict schema validation for `tools/call` arguments
- optional output-schema enforcement
- standardized validation error payloads

**Done when:** invalid inputs consistently return structured, predictable error responses.

### 3. Memory Adapters

**Why:** many agents need short-term and long-term memory surfaces.

**Candidate scope:**
- in-memory session memory
- SQLite adapter
- key-value interface for external stores

**Done when:** memory adapters are pluggable without changing parse pipeline internals.

### 4. Human-in-the-Loop Controls

**Why:** operations teams need explicit approval controls for sensitive flows.

**Candidate scope:**
- tool-level approval metadata
- pause/resume workflow hooks
- policy hooks (allow/deny by tool and argument shape)

**Done when:** approvals can be enforced by policy without forking core runtime.

### 5. Tracing and Evaluations

**Why:** production agent stacks need observability and reproducible quality checks.

**Candidate scope:**
- event-to-trace export (JSONL/OTel-friendly)
- eval harness for tool success rate/latency/schema violations

**Done when:** teams can compare versions with repeatable metrics and trace artifacts.

## Suggested Sequencing

1. strict tool contracts
2. resources/prompts
3. tracing/evals
4. memory adapters
5. human approval controls

This order front-loads interoperability + reliability before higher-level workflow features.
