# API Documentation

Qirrel provides a comprehensive API for text processing, tokenization, and entity extraction. This document details all available functions, classes, and types.

## Main Functions

### `processText(text: string, configPath?: string) => Promise<QirrelContext>`
Asynchronously processes text using the default pipeline configuration. This is the simplest way to use Qirrel.

**Parameters:**
- `text: string` - The input text to process
- `configPath?: string` - Optional path to a YAML configuration file

**Returns:** Promise that resolves to a `QirrelContext` object

**Example:**
```ts
import { processText } from 'qirrel';
const result = await processText('Contact us at info@example.com');
```

## Classes

### `Pipeline`
The core class for building custom text processing pipelines. Allows for fine-grained control over the processing workflow.

**Constructor:**
```ts
new Pipeline(configPath?: string)
```

**Parameters:**
- `configPath?: string` - Optional path to a YAML configuration file

**Methods:**

#### `process(text: string) => Promise<QirrelContext>`
Processes the input text through the pipeline components.

#### `use(component: PipelineComponent) => this`
Adds a processing component to the pipeline.

#### `addCustomProcessor(component: PipelineComponent) => this`
Manually adds a custom processing component to the pipeline.

#### `getConfig() => MiniparseConfig`
Retrieves the current configuration object.

#### `getLLMAdapter() => LLMAdapter | undefined`
Returns the initialized LLM adapter if available.

#### `addLLMProcessor(processor: PipelineComponent) => this`
Adds a processor that uses LLM capabilities.

#### `getCacheManager() => LruCacheManager`
Returns the cache manager instance used by the pipeline.

#### `isCached(text: string) => boolean`
Checks if a result is already cached for the given text.

#### `getCached(text: string) => QirrelContext | undefined`
Retrieves a cached result for the given text, if available.

#### `setCached(text: string, result: QirrelContext, ttl?: number) => void`
Caches a result for the given text with an optional TTL.

**Example:**
```ts
import { Pipeline } from 'qirrel';
const pipeline = new Pipeline();
const result = await pipeline.process('Hello world!');
```

### `Tokenizer`
Handles text tokenization into meaningful units (words, numbers, punctuation, symbols).

**Constructor:**
```ts
new Tokenizer(options?: TokenizerOptions)
```

**Parameters:**
- `options?: TokenizerOptions` - Configuration options for tokenization

**Methods:**

#### `tokenize(text: string) => Token[]`
Converts input text into an array of Token objects.

**Example:**
```ts
import { Tokenizer } from 'qirrel';
const tokenizer = new Tokenizer({ lowercase: true });
const tokens = tokenizer.tokenize('Hello World!');
```

## Processors

Qirrel provides several built-in processors for different text analysis tasks:

### `clean`
Removes punctuation and whitespace tokens from the tokenized text.

### `extract`
Extracts various entities (emails, phones, URLs, numbers) from the text and adds them to the entities array.

### `extractEmailsOnly`
Extracts only email addresses from the text.

### `extractPhonesOnly`
Extracts only phone numbers from the text.

### `extractUrlsOnly`
Extracts only URLs from the text.

### `extractNumbersOnly`
Extracts only numbers from the text.

### `normalize`
Normalizes text by converting common abbreviations and symbols.

### `segment`
Segments text into logical sections or paragraphs.

### `advClean`
Performs advanced cleaning operations on the text.

## Types

### `QirrelContext`
Represents the canonical context for text processing operations.

```ts
interface QirrelContext {
  meta: MetaContext;
  memory: MemoryContext;
  llm: LLMContext;
  data?: {
    text: string;        // Original input text
    tokens: Token[];     // Array of processed tokens
    entities: Entity[];  // Array of extracted entities
  };
}
```

### `MetaContext`
Operational and request-scoped data.

```ts
interface MetaContext {
  requestId: string;
  timestamp: number;
  source?: 'http' | 'cli' | 'worker';
  trace?: Record<string, string>;
}
```

### `MemoryContext`
State accumulated across turns or executions.

```ts
interface MemoryContext {
  shortTerm?: unknown;
  longTerm?: unknown;
  cache?: Record<string, unknown>;
}
```

### `LLMContext`
LLM-specific controls and safety boundaries.

```ts
interface LLMContext {
  model: string;
  temperature?: number;
  safety: {
    allowTools: boolean;
    redactions?: string[];
  };
}
```

### `Token`
Represents a single token in the tokenized text.

```ts
interface Token {
  value: string;    // The actual text content
  type: TokenType;  // The category of token
  start: number;    // Starting position in original text
  end: number;      // Ending position in original text
}
```

### `TokenType`
Enumeration of possible token types:

- `"word"` - Alphabetic characters
- `"number"` - Numeric characters
- `"punct"` - Punctuation marks
- `"symbol"` - Special symbols
- `"whitespace"` - Space, tab, newline characters
- `"unknown"` - Unrecognized character types

### `Entity`
Represents an extracted entity from the text.

```ts
interface Entity {
  type: string;     // The type of entity (email, phone, etc.)
  value: string;    // The actual extracted content
  start: number;    // Starting position in original text
  end: number;      // Ending position in original text
}
```

### `MiniparseConfig`
Configuration object that controls the behavior of the pipeline.

```ts
interface MiniparseConfig {
  pipeline: {
    enableNormalization: boolean;
    enableCleaning: boolean;
    enableExtraction: boolean;
    enableSegmentation: boolean;
    enableAdvCleaning: boolean;
  };
  tokenizer: {
    lowercase: boolean;
    mergeSymbols: boolean;
  };
  speech: {
    removeFillerWords: boolean;
    detectRepetitions: boolean;
    findStutters: boolean;
  };
  extraction: {
    extractEmails: boolean;
    extractPhones: boolean;
    extractUrls: boolean;
    extractNumbers: boolean;
  };
  llm?: {
    enabled: boolean;
    provider: string;
    apiKey?: string;
    model?: string;
    baseUrl?: string;
    temperature?: number;
    maxTokens?: number;
    timeout?: number;
  };
}
```

### `TokenizerOptions`
Configuration options for the Tokenizer class.

```ts
interface TokenizerOptions {
  lowercase?: boolean;     // Convert alphabetic tokens to lowercase
  mergeSymbols?: boolean;  // Merge consecutive symbol tokens
}

### `CacheOptions`
Configuration options for cache managers.

```ts
interface CacheOptions {
  maxEntries?: number;   // Maximum number of entries to store (default: 1000)
  ttl?: number;          // Time-to-live in milliseconds (default: 300000 - 5 minutes)
}
```
```

### `LruCacheManager`
A cache manager implementation using LRU (Least Recently Used) eviction policy with TTL (Time To Live) support.

**Constructor:**
```ts
new LruCacheManager(options?: CacheOptions)
```

**Parameters:**
- `options?: CacheOptions` - Configuration options for the cache

**Methods:**

#### `get<T>(key: string) => T | undefined`
Retrieves a value from the cache.

#### `set(key: string, value: any, ttl?: number) => void`
Sets a value in the cache with an optional TTL.

#### `has(key: string) => boolean`
Checks if a key exists in the cache.

#### `delete(key: string) => boolean`
Deletes a key from the cache.

#### `clear() => void`
Clears all entries from the cache.

#### `size() => number`
Returns the current size of the cache.

#### `maxSize() => number`
Returns the maximum capacity of the cache.

### `LLMCacheManager`
A specialized cache manager for LLM responses, extending LruCacheManager.

**Example:**
```ts
import { LruCacheManager } from 'qirrel';

const cache = new LruCacheManager({
  maxEntries: 500,
  ttl: 600000  // 10 minutes
});

cache.set('key', 'value');
const value = cache.get('key');
```

### `PipelineComponent`
Type representing a processing component that can be added to a Pipeline.

```ts
type PipelineComponent = (input: QirrelContext) => Promise<QirrelContext>;
```