# LLM Integration

[Docs Home](../README.md) | [API](../api.md) | [Configuration](../configuration.md) | [Examples](../examples.md) | [Basic](../usage/basic.md) | [Caching](../usage/caching.md) | [Events](../events.md) | [Architecture](../walkthrough.md) | [Agent-Native](../agent-native.md) | [Benchmarks](../benchmarks.md) | [Ecosystem](../ecosystem-comparison.md)

Qirrel supports pluggable LLM adapters:
- `gemini`
- `openai`
- `generic` (OpenAI-compatible style HTTP endpoint)

## Install

```bash
bun add qirrel
bun add @google/generative-ai # needed only for gemini provider
```

## Configuration

```yaml
llm:
  enabled: true
  provider: openai
  apiKey: ${QIRREL_LLM_API_KEY}
  model: gpt-4o-mini
  baseUrl: https://api.openai.com/v1
  temperature: 0.7
  maxTokens: 1024
  timeout: 30000
  cacheTtl: 300000
```

Environment placeholders are supported:
- `${QIRREL_LLM_API_KEY}`
- `${QIRREL_LLM_API_KEY:-fallback-value}`

## Initialization Lifecycle

```ts
import { Pipeline } from 'qirrel';

const pipeline = new Pipeline('./config-with-llm.yaml');
await pipeline.init();

const adapter = pipeline.getLLMAdapter();
if (!adapter) {
  throw new Error('LLM adapter not available');
}
```

`Pipeline.init()` waits for asynchronous adapter setup and should be called during service startup.

## Direct Adapter Usage

```ts
const response = await adapter.generate('Classify sentiment: I love this.');
console.log(response.content);
```

## LLM Processor Usage

```ts
import { createLLMProcessor } from 'qirrel';

pipeline.addLLMProcessor(
  createLLMProcessor({
    adapter,
    promptTemplate: 'Extract themes from: {text}',
  }),
);
```

## Provider Behavior Notes

Current adapter behavior differs by provider:

- `openai`: validates base URL and throws explicit errors for HTTP/timeout/response issues.
- `gemini`: loads SDK dynamically; when SDK/API fails, default fallback handler returns fallback content.
- `generic`: uses HTTPS endpoint `/completions`; failures are routed through fallback handler.

Plan your error handling based on provider semantics.

## Caching and Timeouts

- `cacheTtl` controls adapter response caching duration.
- `timeout` controls request timeout behavior.

If deterministic behavior is critical, combine LLM output with deterministic processors rather than replacing them.

## Production Guidance

- Keep prompts explicit and short.
- Guard any LLM-generated entities before consuming them downstream.
- Record model name and latency in your app telemetry.
- Decide whether fallback content should be surfaced to end users or treated as degraded mode.
