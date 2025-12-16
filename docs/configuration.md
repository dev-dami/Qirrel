# Configuration Guide

Qirrel offers extensive configuration options to customize the text processing pipeline according to your specific needs. This guide details all available configuration options and how to use them effectively.

## Using Configuration Files

Qirrel supports YAML configuration files that allow you to define processing behaviors without changing your code. To use a configuration file, pass its path when creating a Pipeline instance:

```ts
import { Pipeline } from 'qirrel';

// Use a custom configuration file
const pipeline = new Pipeline('./path/to/config.yaml');

// Or let Qirrel look for the default 'default.yaml' file
const pipeline = new Pipeline(); // Looks for default.yaml in cwd
```

## Default Configuration

The default configuration includes sensible settings for most use cases:

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
  model: gemini-2.5-flash
  temperature: 0.7
  maxTokens: 1024
  timeout: 30000

cache:
  maxEntries: 1000
  ttl: 300000
```

## Configuration Sections

### Pipeline Configuration (`pipeline`)

Controls which processing stages are enabled in the default pipeline:

- `enableNormalization`: When `true`, applies text normalization (converting abbreviations, etc.)
- `enableCleaning`: When `true`, removes punctuation and whitespace tokens
- `enableExtraction`: When `true`, enables entity extraction (emails, phones, etc.)
- `enableSegmentation`: When `true`, segments text into logical sections
- `enableAdvCleaning`: When `true`, performs advanced cleaning operations

### Tokenizer Configuration (`tokenizer`)

Controls how the tokenizer processes text:

- `lowercase`: When `true`, converts word tokens to lowercase
- `mergeSymbols`: When `true`, combines consecutive symbol characters into single tokens

### Speech Analysis Configuration (`speech`)

Features designed for processing transcribed speech:

- `removeFillerWords`: When `true`, identifies and handles common filler words
- `detectRepetitions`: When `true`, detects repeated words or phrases
- `findStutters`: When `true`, identifies stuttering patterns in text

### Extraction Configuration (`extraction`)

Controls which entity types are extracted from text:

- `extractEmails`: Enable/disable email address extraction
- `extractPhones`: Enable/disable phone number extraction
- `extractUrls`: Enable/disable URL extraction
- `extractNumbers`: Enable/disable numeric value extraction

### LLM Configuration (`llm`)

Settings for optional Large Language Model integration:

- `enabled`: When `true`, enables LLM features
- `provider`: Specifies the LLM provider ('gemini' is currently supported)
- `apiKey`: Your LLM service API key (optional, can be set via environment)
- `model`: The specific model to use (e.g., 'gemini-2.5-flash')
- `temperature`: Controls randomness in LLM output (0.0 to 1.0)
- `maxTokens`: Maximum number of tokens in LLM response
- `timeout`: Request timeout in milliseconds

## Creating Custom Configurations

You can create custom configuration files to adjust Qirrel's behavior for specific use cases. For example, to create a configuration that focuses only on entity extraction:

```yaml
pipeline:
  enableNormalization: false
  enableCleaning: false
  enableExtraction: true
  enableSegmentation: false
  enableAdvCleaning: false

extraction:
  extractEmails: true
  extractPhones: true
  extractUrls: true
  extractNumbers: true

tokenizer:
  lowercase: true
```

Or a configuration optimized for speech processing:

```yaml
speech:
  removeFillerWords: true
  detectRepetitions: true
  findStutters: true

pipeline:
  enableNormalization: true
  enableCleaning: true
  enableExtraction: false
  enableSegmentation: true
```

## Programmatic Configuration

You can also work with configurations programmatically:

```ts
import { Pipeline } from 'qirrel';

const pipeline = new Pipeline();
const config = pipeline.getConfig();

// Modify configuration programmatically
config.pipeline.enableExtraction = false;
config.extraction.extractEmails = true;
```

## Environment Variables for LLM

When using LLM features, you can set your API key through environment variables:

```bash
export QIRREL_LLM_API_KEY=your_api_key_here
```

The library will automatically use this value if the `apiKey` is not set directly in the configuration file.

### Cache Configuration (`cache`)

Controls caching behavior to improve performance:

- `maxEntries`: Maximum number of items to store in the cache (default: 1000)
- `ttl`: Time-to-live for cached items in milliseconds (default: 300000, which is 5 minutes)

When `maxEntries` is set to 0, caching is disabled entirely. The cache uses an LRU (Least Recently Used) eviction policy to manage space when the maximum is reached.