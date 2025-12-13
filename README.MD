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
console.log(result.entities);
// [
//   { type: 'email', value: 'john@example.com', ... },
//   { type: 'phone', value: '+1-555-123-4567', ... }
// ]
```

### Extract URLs and Numbers

```ts
import { processText } from 'qirrel';
const result = await processText('Visit https://example.com for more info. Price: $29.99');
console.log(result.entities);
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
console.log(result.entities);
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

## Contributing
We welcome contributions from the community! Please read our [Contributing Guide](./docs/contributing.md) for more information.

## License
This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.
