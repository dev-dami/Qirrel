# LLM Examples

This document shows examples of using Miniparse with LLM integrations.

## Basic LLM Integration

```typescript
import { Pipeline, GeminiLLMAdapter, createLLMSentimentAnalyzer } from 'miniparse';

// Create an LLM adapter
const llmAdapter = new GeminiLLMAdapter({
  apiKey: process.env.GEMINI_API_KEY!,
  model: 'gemini-2.5-flash',
});

// Create a pipeline with LLM components
const pipeline = new Pipeline();

// Add an LLM sentiment analyzer
pipeline.addLLMProcessor(createLLMSentimentAnalyzer(llmAdapter));

// Process text with LLM analysis
const result = await pipeline.process('I love this product! It works perfectly.');
console.log(result.entities); // Will include sentiment entity
```

## LLM Entity Extraction

```typescript
import { Pipeline, GeminiLLMAdapter, createLLMEntityExtractor } from 'miniparse';

const llmAdapter = new GeminiLLMAdapter({
  apiKey: process.env.GEMINI_API_KEY!,
  model: 'gemini-2.5-flash',
});

const pipeline = new Pipeline();

// Create an LLM entity extractor
const entityExtractor = createLLMEntityExtractor(
  'Extract named entities from the text. Look for persons, organizations, and locations.',
  llmAdapter
);

pipeline.addLLMProcessor(entityExtractor);

const result = await pipeline.process('Apple Inc. is located in Cupertino, California.');
console.log(result.entities); // Will include entities identified by the LLM
```

## Text Summarization with LLM

```typescript
import { Pipeline, GeminiLLMAdapter, createLLMSummarizer } from 'miniparse';

const llmAdapter = new GeminiLLMAdapter({
  apiKey: process.env.GEMINI_API_KEY!,
  model: 'gemini-2.5-flash',
});

const pipeline = new Pipeline();

// Add a summarizer that uses LLM
pipeline.addLLMProcessor(createLLMSummarizer(llmAdapter, undefined, 50));

const longText = `Artificial intelligence is transforming many industries. 
Machine learning models are becoming more sophisticated and capable of 
performing complex tasks that were previously only possible for humans.`;

const result = await pipeline.process(longText);
console.log(result.entities); // Will include a summary entity
```

## Using Configuration

You can also enable LLM functionality through configuration:

```yaml
# miniparse.config.yaml
llm:
  enabled: true
  provider: gemini
  apiKey: ${GEMINI_API_KEY}  # Environment variable
  model: gemini-2.5-flash
  temperature: 0.7
  maxTokens: 1024

pipeline:
  enableNormalization: true
  enableCleaning: true
  enableExtraction: true
  enableSegmentation: true

tokenizer:
  lowercase: true
  mergeSymbols: false
```

```typescript
import { Pipeline } from 'miniparse';

// Pipeline will automatically initialize the LLM adapter based on config
const pipeline = new Pipeline('./miniparse.config.yaml');

// You can access the adapter if needed
const llmAdapter = pipeline.getLLMAdapter();

// Add custom LLM processors
// ...
```

## Error Handling and Fallbacks

```typescript
import { 
  Pipeline, 
  GeminiLLMAdapter, 
  DefaultFallbackHandler,
  createLLMSentimentAnalyzer 
} from 'miniparse';

// Create an adapter with a fallback handler
const llmAdapter = new GeminiLLMAdapter({
  apiKey: process.env.GEMINI_API_KEY!,
  model: 'gemini-2.5-flash',
}, true, new DefaultFallbackHandler());

const pipeline = new Pipeline();

// This processor will use fallback if the LLM call fails
pipeline.addLLMProcessor(createLLMSentimentAnalyzer(llmAdapter));

const result = await pipeline.process('This is a test sentence.');
console.log(result);
```

## Multiple LLM Processors

```typescript
import { 
  Pipeline, 
  GeminiLLMAdapter, 
  createLLMSentimentAnalyzer,
  createLLMTopicClassifier,
  createLLMSummarizer
} from 'miniparse';

const llmAdapter = new GeminiLLMAdapter({
  apiKey: process.env.GEMINI_API_KEY!,
  model: 'gemini-2.5-flash',
});

const pipeline = new Pipeline();

// Add multiple LLM processors
pipeline.addLLMProcessor(createLLMSentimentAnalyzer(llmAdapter));
pipeline.addLLMProcessor(createLLMTopicClassifier(llmAdapter));
pipeline.addLLMProcessor(createLLMSummarizer(llmAdapter, undefined, 50));

const result = await pipeline.process('Artificial intelligence is revolutionizing technology. It has positive impacts on many industries.');
console.log(result.entities); // Will include sentiment, topic, and summary entities
```