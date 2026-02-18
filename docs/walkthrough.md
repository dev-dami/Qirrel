# Architecture Walkthrough

[Docs Home](./README.md) | [API](./api.md) | [Configuration](./configuration.md) | [Examples](./examples.md) | [Basic](./usage/basic.md) | [Caching](./usage/caching.md) | [Events](./events.md) | [LLM](./integrations/llm.md)

This document explains how Qirrel processes input text from start to finish.

## End-to-End Flow

```text
Input text
  -> Tokenizer
  -> Pipeline components (normalize/clean/extract/segment)
  -> QirrelContext output
  -> optional cache reuse on future calls
```

## Key Runtime Object: `QirrelContext`

All processors read/write the same context object:

- `meta`: request metadata (`requestId`, `timestamp`, source)
- `memory`: per-request memory namespace
- `llm`: model/safety metadata
- `data.text`: current text payload
- `data.tokens`: tokenizer output
- `data.entities`: extracted entities

## Pipeline Construction

`Pipeline` builds a default chain from config in `src/config/loader.ts` + `src/config/defaults.ts`.

Typical enabled order:

1. `normalize`
2. `clean`
3. `advClean` (optional)
4. extraction processors (email/phone/url/number by flags)
5. `segment`

Each component can be wrapped with cache logic when caching is enabled.

## Processing Lifecycle

`Pipeline.process(text)` does this:

1. checks result cache
2. initializes context + tokenizes input
3. emits `RunStart`
4. executes each component
5. emits `ProcessorStart` / `ProcessorEnd` around each component
6. stores result in cache
7. emits `RunEnd`

If a component throws, pipeline emits `Error` and rethrows.

## Phone Extraction Hardening

Phone extraction uses `libphonenumber-js` scanning plus region fallbacks to improve support for:

- international formats (`+44`, `+234`, `+49`, etc.)
- extension forms (`ext. 42`)
- local patterns (with default-region matching)

The extractor deduplicates overlapping matches and rejects short numeric false positives.

## LLM Integration

When `llm.enabled` and API key are set, `Pipeline` initializes an adapter via `LLMAdapterFactory`.

Supported adapter paths:

- `gemini`
- `openai`
- `generic` (OpenAI-compatible style endpoint)

LLM adapters expose `generate()` and `generateWithContext()`.

## Caching Model

Qirrel uses LRU cache with TTL:

- pipeline result cache
- component-level cache wrappers
- adapter-level LLM response cache

Cached contexts are cloned on get/set to avoid mutation leakage across calls.

## Extension Points

- add custom components via `addCustomProcessor()`
- add LLM-aware components via `addLLMProcessor()`
- subscribe to lifecycle telemetry via `on()`/`off()`
- process in parallel with `processBatch(texts, { concurrency })`

## Source Map

- `src/core/pipeline.ts`: orchestration/events/batch/caching
- `src/core/Tokenizer.ts`: tokenization
- `src/processors/*`: built-in processors
- `src/config/*`: config defaults + loader
- `src/llms/*`: adapter abstractions/providers
- `src/utils/cache/*`: cache implementation
