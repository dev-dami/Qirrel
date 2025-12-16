# Qirrel

<div align="center">

[![NPM Version](https://img.shields.io/npm/v/qirrel.svg)](https://www.npmjs.com/package/qirrel)
[![NPM Downloads](https://img.shields.io/npm/dm/qirrel.svg)](https://www.npmjs.com/package/qirrel)
[![License](https://img.shields.io/npm/l/qirrel.svg)](./LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

</div>

Sophisticated NLP library for comprehensive text processing, tokenization, and analysis with LLM integration.

[GitHub](https://github.com/dev-dami/qirrel) | [NPM](https://www.npmjs.com/package/qirrel) | Author: [Damilare Osibanjo](https://github.com/dev-dami)

## Quick Start

```bash
npm install qirrel
```

### Extract Multiple Entity Types

```ts
import { processText } from 'qirrel';
const result = await processText('Contact John at john@example.com or call +1-555-123-4567');
console.log(result.data?.entities);
// [
//   { type: 'email', value: 'john@example.com', ... },
//   { type: 'phone', value: '+1-555-123-4567', ... }
// ]
```

### Extract URLs and Numbers

```ts
import { processText } from 'qirrel';
const result = await processText('Visit https://example.com for more info. Price: $29.99');
console.log(result.data?.entities);
// [
//   { type: 'url', value: 'https://example.com', ... },
//   { type: 'number', value: '29.99', ... }
// ]
```

### Advanced Pipeline Usage

```ts
import { Pipeline } from 'qirrel';
const pipeline = new Pipeline();
const result = await pipeline.process('Check out https://github.com and email support@example.com');
console.log(result.data?.entities);
```

## LLM Integration

Connect to large language models for enhanced text analysis:

```ts
import { Pipeline } from 'qirrel';

// Enable LLM in your config
const pipeline = new Pipeline('./config-with-llm.yaml');
const llmAdapter = pipeline.getLLMAdapter();

if (llmAdapter) {
  // Use LLM for advanced analysis
  const response = await llmAdapter.generateContent('Analyze this text...');
  console.log(response);
}
```

## Caching

Qirrel includes built-in caching functionality to improve performance by storing frequently accessed results:

```ts
import { Pipeline, LruCacheManager } from 'qirrel';

// The pipeline automatically uses caching based on configuration
const pipeline = new Pipeline();

// Access the cache manager directly if needed
const cacheManager = pipeline.getCacheManager();

// Custom cache usage
const cache = new LruCacheManager({
  maxEntries: 1000,  // Maximum number of cached items
  ttl: 300000        // Time-to-live in milliseconds (5 minutes)
});

// Check if a result is already cached
if (pipeline.isCached('some text')) {
  const cachedResult = pipeline.getCached('some text');
  console.log('Using cached result');
} else {
  const result = await pipeline.process('some text');
  console.log('Processing new text');
}
```

## Pipeline Lifecycle Events

Monitor and react to pipeline execution with comprehensive lifecycle events:

```ts
import { Pipeline, PipelineEvent } from 'qirrel';

const pipeline = new Pipeline();

// Subscribe to pipeline events
pipeline.on(PipelineEvent.RunStart, (payload) => {
  console.log('Pipeline started:', payload.context.meta?.requestId);
});

pipeline.on(PipelineEvent.ProcessorEnd, (payload) => {
  console.log(`Processor ${payload.processorName} completed in ${payload.duration}ms`);
});

pipeline.on(PipelineEvent.RunEnd, (payload) => {
  console.log('Pipeline completed in', payload.duration, 'ms');
});

const result = await pipeline.process('Your text here');
```

## Use Cases

Qirrel is perfect for developers building solutions for:

- **Business Applications**: Extract customer contact details, lead generation from documents, document processing for legal/medical/financial use cases
- **Social Media Analysis**: Process social content for mentions, hashtags, links, and user-generated content patterns
- **Research & Content**: Extract structured data from academic papers, news articles, or documentation
- **Data Processing**: Unstructured data extraction, log file analysis, preprocessing for ML pipelines
- **Communication Tools**: Email processing, chat applications, content moderation

## Documentation
- [API Reference](./docs/api.md)
- [Configuration Guide](./docs/configuration.md)
- [Usage Examples](./docs/examples.md)
- [Code Walkthrough](./docs/walkthrough.md)
- [Basic Usage](./docs/usage/basic.md)
- [Advanced Usage](./docs/usage/advanced.md)
- [LLM Integration](./docs/integrations/llm.md)
- [Pipeline Events](./docs/events.md)
- [Caching](./docs/usage/caching.md)

## Contributing
We welcome contributions from the community! Please read our [Contributing Guide](./docs/contributing.md) for more information.

## License
This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.
