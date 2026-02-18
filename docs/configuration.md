# Configuration Guide

Qirrel loads config in this order:

1. Custom path passed to `new Pipeline(configPath)`
2. `./miniparse.config.yaml` in current working directory
3. Bundled `default.yaml`

## Example Config

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

extraction:
  extractEmails: true
  extractPhones: true
  extractUrls: true
  extractNumbers: true

cache:
  maxEntries: 1000
  ttl: 300000

llm:
  enabled: false
  provider: gemini
  model: gemini-2.5-flash
  temperature: 0.7
  maxTokens: 1024
  timeout: 30000
  cacheTtl: 300000
```

## Sections

### `pipeline`
- `enableNormalization`
- `enableCleaning`
- `enableExtraction`
- `enableSegmentation`
- `enableAdvCleaning`

### `tokenizer`
- `lowercase`
- `mergeSymbols`

### `extraction`
- `extractEmails`
- `extractPhones`
- `extractUrls`
- `extractNumbers`

### `cache`
- `maxEntries`
- `ttl`

Set `maxEntries: 0` to disable caching.

### `llm`
- `enabled`
- `provider` (`gemini`, `openai`, `generic`)
- `apiKey`
- `model`
- `baseUrl`
- `temperature`
- `maxTokens`
- `timeout`
- `cacheTtl`

## Environment Variables

Config strings support placeholders:

- `${QIRREL_LLM_API_KEY}`
- `${QIRREL_LLM_API_KEY:-fallback}`

If `llm.enabled` is true and `llm.apiKey` is omitted, Qirrel tries environment keys including:

- `QIRREL_LLM_API_KEY`
- `MINIPARSE_LLM_API_KEY`
- `OPENAI_API_KEY`
- `GEMINI_API_KEY`
