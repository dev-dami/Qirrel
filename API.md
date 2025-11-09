# Miniparse API Documentation

Miniparse is a fast, lightweight, and configurable NLP library for text processing, tokenization, and analysis.

## Core Classes

### Pipeline

The main processing class that orchestrates text analysis.

#### Constructor
```typescript
new Pipeline(configPath?: string)
```
- `configPath` (optional): Path to a custom configuration file

#### Methods
```typescript
process(text: string): Promise<IntentResult>
```
Process text through the pipeline and return the analysis result.

```typescript
use(component: PipelineComponent): this
```
Add a custom component to the pipeline.

```typescript
addCustomProcessor(component: PipelineComponent): this
```
Add a custom processor to the pipeline (alias for `use`).

```typescript
getConfig(): MiniparseConfig
```
Get the current configuration.

```typescript
getLLMAdapter(): LLMAdapter | undefined
```
Get the configured LLM adapter if LLM functionality is enabled.

```typescript
addLLMProcessor(processor: PipelineComponent): this
```
Add an LLM-based processor to the pipeline.

### ConfigLoader

Utility class to load configurations from various sources.

#### Static Methods
```typescript
loadConfig(customConfigPath?: string): MiniparseConfig
```
Load configuration from the specified path or from default locations.

## Core Types

### IntentResult
```typescript
interface IntentResult {
  text: string;
  tokens: Token[];
  entities: Entity[];
}
```

### Token
```typescript
interface Token {
  value: string;
  type: TokenType;
  start: number;
  end: number;
}
```

### TokenType
```typescript
type TokenType = "word" | "number" | "punct" | "symbol" | "whitespace" | "unknown";
```

### Entity
```typescript
interface Entity {
  type: string;
  value: string;
  start: number;
  end: number;
}
```

### MiniparseConfig
```typescript
interface MiniparseConfig {
  pipeline: {
    enableNormalization: boolean;
    enableCleaning: boolean;
    enableExtraction: boolean;
    enableSegmentation: boolean;
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

## Speech Analysis Functions

### preprocessSpeechInput
Remove speech irregularities from input text.

```typescript
preprocessSpeechInput(text: string, options?: SpeechPatternOptions): string
```
- `text`: Input text to process
- `options` (optional): Configuration object for speech processing

### analyzeSpeechPatterns
Analyze text for speech patterns and return analysis.

```typescript
analyzeSpeechPatterns(text: string): {
  fillerWords: string[];
  repetitions: string[];
  stutters: string[];
}
```
- `text`: Input text to analyze
- Returns: Object with detected speech patterns

### SpeechPatternOptions
```typescript
interface SpeechPatternOptions {
  removeFillerWords?: boolean;
  detectRepetitions?: boolean;
  findStutters?: boolean;
}
```

## LLM Integration

### LLM Adapters

Miniparse provides adapters for various LLM providers:

#### GeminiLLMAdapter
Adapter for Google's Gemini API.

```typescript
const adapter = new GeminiLLMAdapter({
  apiKey: "your-api-key",
  model: "gemini-2.5-flash",
  temperature: 0.7,
  maxTokens: 1024,
  timeout: 30000
});
```

#### GenericLLMAdapter
Generic adapter for other LLM APIs.

```typescript
const adapter = new GenericLLMAdapter({
  apiKey: "your-api-key",
  model: "custom-model",
  baseUrl: "https://your-llm-api.com/v1",
  temperature: 0.7,
  maxTokens: 1024,
  timeout: 30000
});
```

#### LLMAdapterFactory
Factory class to create LLM adapters.

```typescript
const adapter = LLMAdapterFactory.create({
  apiKey: "your-api-key",
  model: "gpt-3.5-turbo"
}, "openai");
```

### LLM Response
```typescript
interface LLMResponse {
  content: string;
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
  model?: string;
}
```

### LLM Configuration
```typescript
interface LLMConfig {
  apiKey: string;
  model: string;
  baseUrl?: string;
  temperature?: number;
  maxTokens?: number;
  timeout?: number;
}
```

### LLM Caching

Miniparse provides caching for LLM responses to reduce API costs and improve performance.

```typescript
const cache = new LLMCache({
  maxEntries: 1000,
  ttl: 300000 // 5 minutes in milliseconds
});
```

### LLM Processors

#### createLLMProcessor
Creates a generic LLM processor.

```typescript
const llmProcessor = createLLMProcessor({
  promptTemplate: "Analyze the sentiment of this text: {text}",
  adapter: yourLLMAdapter
});
```

#### createLLMEntityExtractor
Creates an LLM-based entity extractor.

```typescript
const entityExtractor = createLLMEntityExtractor(
  "Extract named entities from the following text:",
  yourLLMAdapter
);
```

#### createLLMSummarizer
Creates an LLM-based text summarizer.

```typescript
const summarizer = createLLMSummarizer(
  yourLLMAdapter,
  { temperature: 0.3 },
  100 // max summary length
);
```

#### createLLMSentimentAnalyzer
Creates an LLM-based sentiment analyzer.

```typescript
const sentimentAnalyzer = createLLMSentimentAnalyzer(
  yourLLMAdapter,
  { temperature: 0 }
);
```

#### createLLMIntentClassifier
Creates an LLM-based intent classifier.

```typescript
const intentClassifier = createLLMIntentClassifier(
  yourLLMAdapter,
  ["question", "statement", "command", "greeting"]
);
```

#### createLLMTopicClassifier
Creates an LLM-based topic classifier.

```typescript
const topicClassifier = createLLMTopicClassifier(
  yourLLMAdapter
);
```

#### createLLMTextEnhancer
Creates an LLM-based text enhancer.

```typescript
const textEnhancer = createLLMTextEnhancer(
  yourLLMAdapter
);
```

## Processors

Miniparse comes with several built-in processors:

### normalize
Normalizes text tokens and entity values.

### clean
Removes punctuation and whitespace tokens, filters empty entities.

### extract
Extracts structured data like emails, phones, URLs, and numbers.

### segment
Segments text into sentences.

## Default Configuration

The default configuration is:

```yaml
pipeline:
  enableNormalization: true
  enableCleaning: true
  enableExtraction: true
  enableSegmentation: true

tokenizer:
  lowercase: true
  mergeSymbols: false

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
  provider: openai
  model: gpt-3.5-turbo
  temperature: 0.7
  maxTokens: 1024
  timeout: 30000
```