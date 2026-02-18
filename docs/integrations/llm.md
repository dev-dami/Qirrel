# LLM Integration

Qirrel supports pluggable LLM adapters (`gemini`, `openai`, and generic OpenAI-compatible endpoints).

## Install

```bash
bun add qirrel
bun add @google/generative-ai # only needed for gemini provider
```

## Configuration

```yaml
llm:
  enabled: true
  provider: openai
  apiKey: ${QIRREL_LLM_API_KEY}
  model: gpt-3.5-turbo
  baseUrl: https://api.openai.com/v1
  temperature: 0.7
  maxTokens: 1024
  timeout: 30000
  cacheTtl: 300000
```

Environment placeholders support:
- `${QIRREL_LLM_API_KEY}`
- `${QIRREL_LLM_API_KEY:-fallback-value}`

If `llm.enabled` is true and `apiKey` is omitted, Qirrel checks common env keys such as `QIRREL_LLM_API_KEY` and `OPENAI_API_KEY`.

## Usage

```ts
import { Pipeline } from 'qirrel';

const pipeline = new Pipeline('./config-with-llm.yaml');
await pipeline.init();

const adapter = pipeline.getLLMAdapter();
if (adapter) {
  const response = await adapter.generate('Classify sentiment: I love this.');
  console.log(response.content);
}
```

## LLM Processors

```ts
import { Pipeline, createLLMProcessor } from 'qirrel';

const pipeline = new Pipeline('./config-with-llm.yaml');
await pipeline.init();

const adapter = pipeline.getLLMAdapter();
if (adapter) {
  pipeline.addLLMProcessor(
    createLLMProcessor({
      adapter,
      promptTemplate: 'Extract themes from: {text}',
    }),
  );
}
```
