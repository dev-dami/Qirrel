# Qirrel

<div align="center">

[![NPM Version](https://img.shields.io/npm/v/qirrel.svg)](https://www.npmjs.com/package/qirrel)
[![NPM Downloads](https://img.shields.io/npm/dm/qirrel.svg)](https://www.npmjs.com/package/qirrel)
[![License](https://img.shields.io/npm/l/qirrel.svg)](./LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

</div>

Qirrel is a TypeScript NLP library for tokenization, rule-based entity extraction, optional LLM enrichment, and pipeline orchestration.

[GitHub](https://github.com/dev-dami/qirrel) | [NPM](https://www.npmjs.com/package/qirrel) | Author: [Damilare Osibanjo](https://github.com/dev-dami)

## Install

```bash
bun add qirrel
```

## Quick Start

```ts
import { processText } from 'qirrel';

const result = await processText('Contact John at john@example.com or call +1 415 555 2671');
console.log(result.data?.entities);
```

## Batch Processing

```ts
import { processTexts, Pipeline } from 'qirrel';

const results = await processTexts(['first input', 'second input'], undefined, { concurrency: 2 });

const pipeline = new Pipeline();
const ordered = await pipeline.processBatch(['a', 'b', 'c'], { concurrency: 3 });
```

## LLM Integration

```ts
import { Pipeline } from 'qirrel';

const pipeline = new Pipeline('./config-with-llm.yaml');
await pipeline.init();

const llmAdapter = pipeline.getLLMAdapter();
if (llmAdapter) {
  const response = await llmAdapter.generate('Summarize this text: Hello world');
  console.log(response.content);
}
```

## Caching

```ts
import { Pipeline } from 'qirrel';

const pipeline = new Pipeline();

if (pipeline.isCached('some text')) {
  console.log(pipeline.getCached('some text'));
} else {
  const result = await pipeline.process('some text');
  console.log(result.data?.entities);
}
```

## Documentation

- [API Reference](./docs/api.md)
- [Configuration Guide](./docs/configuration.md)
- [Usage Examples](./docs/examples.md)
- [Basic Usage](./docs/usage/basic.md)
- [LLM Integration](./docs/integrations/llm.md)
- [Pipeline Events](./docs/events.md)
- [Caching](./docs/usage/caching.md)

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).

## License

MIT. See [LICENSE](./LICENSE).
