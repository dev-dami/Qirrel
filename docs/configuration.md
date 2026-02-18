# Configuration Guide

[Docs Home](./README.md) | [API](./api.md) | [Examples](./examples.md) | [Basic](./usage/basic.md) | [Caching](./usage/caching.md) | [Events](./events.md) | [LLM](./integrations/llm.md) | [Architecture](./walkthrough.md) | [Agent-Native](./agent-native.md) | [Benchmarks](./benchmarks.md) | [Ecosystem](./ecosystem-comparison.md)

This page documents config loading order, schema, defaults, and production caveats.

## Config File Resolution Order

Qirrel loads config in this order:

1. Custom path passed to `new Pipeline(configPath)` when that path exists.
2. `./miniparse.config.yaml` in current working directory.
3. Repository-root `default.yaml`.
4. In-code defaults from `src/config/defaults.ts`.

If a file fails to parse, Qirrel logs a warning and falls back to in-code defaults.

## Complete Config Example

```yaml
pipeline:
  enableNormalization: true
  enableCleaning: true
  enableExtraction: true
  enableSegmentation: true
  enableAdvCleaning: false

tokenizer:
  lowercase: true
  mergeSymbols: false

cache:
  maxEntries: 1000
  ttl: 300000

speech:
  removeFillerWords: true
  detectRepetitions: false
  findStutters: false

extraction:
  extractEmails: true
  extractPhones: true
  extractUrls: true
  extractNumbers: true

llm:
  enabled: false
  provider: gemini
  apiKey: ${QIRREL_LLM_API_KEY}
  model: gemini-2.5-flash
  temperature: 0.7
  maxTokens: 1024
  timeout: 30000
  cacheTtl: 300000
```

## Section Reference

### `pipeline`

- `enableNormalization: boolean`
- `enableCleaning: boolean`
- `enableExtraction: boolean`
- `enableSegmentation: boolean`
- `enableAdvCleaning: boolean`

### `tokenizer`

- `lowercase: boolean`
- `mergeSymbols: boolean`

### `cache`

- `maxEntries?: number`
- `ttl?: number` (milliseconds)

Set `maxEntries: 0` to disable caching.

### `speech`

- `removeFillerWords: boolean`
- `detectRepetitions: boolean`
- `findStutters: boolean`

Important: these fields configure speech adapter behavior for `preprocessSpeechInput` and `analyzeSpeechPatterns`; they are not automatically applied by the default pipeline unless your integration explicitly uses the speech adapter APIs.

### `extraction`

- `extractEmails: boolean`
- `extractPhones: boolean`
- `extractUrls: boolean`
- `extractNumbers: boolean`

### `llm`

- `enabled: boolean`
- `provider: string` (`gemini`, `openai`, `generic`)
- `apiKey?: string`
- `model?: string`
- `baseUrl?: string`
- `temperature?: number`
- `maxTokens?: number`
- `timeout?: number` (milliseconds)
- `cacheTtl?: number` (milliseconds)

## Environment Variable Placeholders

Config string values support placeholders:

- `${QIRREL_LLM_API_KEY}`
- `${QIRREL_LLM_API_KEY:-fallback-value}`

When `llm.enabled` is true and `llm.apiKey` is missing, Qirrel tries these environment keys in order:

1. `QIRREL_LLM_API_KEY`
2. `MINIPARSE_LLM_API_KEY`
3. `OPENAI_API_KEY`
4. `GEMINI_API_KEY`

## Production Recommendations

- Keep one config file per environment (dev/staging/prod).
- Set explicit `cache.ttl` instead of relying on defaults.
- Start with `enableAdvCleaning: false` and enable only if emoji stripping is desired.
- For LLM-enabled deployments, set `timeout` and `cacheTtl` intentionally to prevent latency spikes.

## Common Pitfalls

- Omitting the `cache` block does not disable cache; defaults still apply unless `maxEntries: 0`.
- A missing custom config path does not fail hard; loader continues fallback resolution.
- `default.yaml` may be minimal; runtime defaults come from merged in-code defaults.
