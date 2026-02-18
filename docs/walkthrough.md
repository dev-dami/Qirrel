# Architecture Walkthrough

[Docs Home](./README.md) | [API](./api.md) | [Configuration](./configuration.md) | [Examples](./examples.md) | [Basic](./usage/basic.md) | [Caching](./usage/caching.md) | [Events](./events.md) | [LLM](./integrations/llm.md) | [Agent-Native](./agent-native.md) | [Benchmarks](./benchmarks.md) | [Ecosystem](./ecosystem-comparison.md)

This document explains how Qirrel processes input text internally.

## End-to-End Flow

```text
Input text
  -> Tokenizer
  -> Pipeline components (normalize/clean/extract/segment)
  -> QirrelContext output
  -> optional cache reuse on future calls
```

## Runtime Data Contract: `QirrelContext`

All processors read/write one shared context object:
- `meta`: request metadata (`requestId`, `timestamp`, `source`)
- `memory`: extension namespace for integration state
- `llm`: model metadata/safety metadata
- `data.text`: current text value
- `data.tokens`: tokenizer output
- `data.entities`: extracted entities

## Pipeline Assembly

`Pipeline` construction combines:
- config from `src/config/loader.ts`
- defaults from `src/config/defaults.ts`
- built-in processors in this typical order:
  1. `normalize`
  2. `clean`
  3. `advClean` (optional)
  4. extraction processors (email/phone/url/number)
  5. `segment`

When cache is enabled and component is `cacheable`, Qirrel wraps the component with cache logic.

## Processing Lifecycle

`Pipeline.process(text)` does this:

1. check result cache by hashed text key
2. tokenize and create initial context
3. emit `RunStart`
4. emit processor events around each component
5. cache final result (if enabled)
6. emit `RunEnd`
7. on failure, emit `Error` then rethrow

## Batch Processing Model

`processBatch` uses worker-style bounded concurrency:
- validates inputs and concurrency,
- processes texts in parallel,
- preserves original order in results.

## LLM Adapter Lifecycle

If `llm.enabled` and API key are present:
- adapter is initialized asynchronously during `Pipeline` construction,
- `pipeline.init()` and `process()` both await that initialization path.

## Caching Model

Qirrel currently uses:
- pipeline result cache,
- component-level cache wrappers,
- adapter-level LLM response cache.

Contexts are cloned when entering/leaving caches to prevent mutation leaks.

## Agent-Native Layer

Agent components are intentionally separate from core parsing:
- `AgentBridge` for tool registration/calling,
- MCP request handler for JSON-RPC method handling,
- built-in Qirrel tool catalog for self-discovery.

See [Agent-Native Integration](./agent-native.md) for protocol-level details.

## Source Map

- `src/core/pipeline.ts`: orchestration, events, batch, cache integration
- `src/core/Tokenizer.ts`: tokenization
- `src/processors/*`: deterministic processors
- `src/config/*`: config loading/defaults/env resolution
- `src/llms/*`: adapter abstractions/providers
- `src/agent/*`: tool bridge + MCP handler
- `src/utils/cache/*`: cache primitives and wrappers
