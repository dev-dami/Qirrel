# Usage Examples

This document provides practical examples of how to use Qirrel for various text processing tasks, from basic operations to advanced configurations.

## Basic Usage

### Simple Text Processing

The simplest way to use Qirrel is through the `processText` function, which applies default processing:

```ts
import { processText } from 'qirrel';

async function basicExample() {
  const text = 'Contact us at support@example.com or call +1-555-123-4567';
  const result = await processText(text);
  
  console.log('Original text:', result.text);
  console.log('Tokens:', result.tokens);
  console.log('Extracted entities:', result.entities);
  // Output would include entities like:
  // { type: 'email', value: 'support@example.com', start: 13, end: 32 }
  // { type: 'phone', value: '+1-555-123-4567', start: 37, end: 51 }
}

basicExample();
```

### Using the Pipeline Class

For more control over the processing workflow, use the Pipeline class:

```ts
import { Pipeline } from 'qirrel';

async function pipelineExample() {
  const pipeline = new Pipeline();
  const result = await pipeline.process('Visit https://example.com for more info.');
  
  console.log('Entities found:', result.entities);
  // Would include: { type: 'url', value: 'https://example.com', ... }
}

pipelineExample();
```

## Custom Tokenization

Configure the tokenizer to handle your specific needs:

```ts
import { Tokenizer } from 'qirrel';

// Create a tokenizer that preserves case and merges symbols
const tokenizer = new Tokenizer({
  lowercase: false,      // Preserve original capitalization
  mergeSymbols: true     // Combine consecutive symbols into single tokens
});

const tokens = tokenizer.tokenize('Hello @world! #test');
console.log(tokens);
// This would keep 'Hello' as uppercase and potentially merge symbols differently
```

## Entity Extraction Examples

### Extract Specific Entity Types

```ts
import { extractEmailsOnly, extractPhonesOnly, extractUrlsOnly, extractNumbersOnly } from 'qirrel';

async function extractEmailsOnlyExample() {
  const input = {
    text: 'Email me at contact@company.com or call 555-123-4567',
    tokens: [],
    entities: []
  };
  
  const result = extractEmailsOnly(input);
  console.log('Emails found:', result.entities);
  // Only emails will be extracted
}

async function extractPhonesOnlyExample() {
  const input = {
    text: 'Call me at +1-800-555-0199 or reach out at info@example.com',
    tokens: [],
    entities: []
  };
  
  const result = extractPhonesOnly(input);
  console.log('Phones found:', result.entities);
  // Only phone numbers will be extracted
}
```

### Custom Pipeline with Selective Extraction

```ts
import { Pipeline, extractNumbersOnly, clean } from 'qirrel';

async function customExtractionExample() {
  // Create a pipeline focused only on number extraction
  const pipeline = new Pipeline();
  pipeline.use(clean)           // Clean up punctuation and whitespace
          .addCustomProcessor(extractNumbersOnly); // Then extract only numbers
  
  const result = await pipeline.process('The price is $29.99, quantity is 5, discount 20%');
  console.log('Numbers extracted:', result.entities);
  // Will contain: '29.99', '5', '20'
}

customExtractionExample();
```

## Configuration-Based Processing

Load a custom configuration file to change processing behavior:

```ts
import { Pipeline } from 'qirrel';

async function configBasedProcessing() {
  // Assumes './custom-config.yaml' exists with your configuration
  const pipeline = new Pipeline('./custom-config.yaml');
  
  // Process text using custom configuration
  const result = await pipeline.process('Transcribed speech: umm, well, like, the thing...');
  console.log('Processed text:', result);
}

configBasedProcessing();
```

## Advanced Processing with Multiple Components

Chain multiple processors together for complex operations:

```ts
import { Pipeline, clean, normalize, segment } from 'qirrel';

async function advancedProcessingExample() {
  const pipeline = new Pipeline();
  
  // Add multiple processors in sequence
  pipeline.use(normalize)  // Normalize text first
          .use(clean)      // Then clean punctuation
          .use(segment);   // Finally segment into sections
  
  const result = await pipeline.process('The U.S.A is a big country, with approx. 50 states!');
  console.log('Advanced processing result:', result);
}

advancedProcessingExample();
```

## Working with Tokens

Access and manipulate tokens at different stages:

```ts
import { Pipeline } from 'qirrel';

async function tokenAnalysis() {
  const pipeline = new Pipeline();
  const result = await pipeline.process('The price is $19.99 + tax.');

  // Separate tokens by type
  const words = result.tokens.filter(token => token.type === 'word');
  const numbers = result.tokens.filter(token => token.type === 'number');
  const symbols = result.tokens.filter(token => token.type === 'symbol');
  
  console.log('Words:', words.map(t => t.value));
  console.log('Numbers:', numbers.map(t => t.value));
  console.log('Symbols:', symbols.map(t => t.value));
}

tokenAnalysis();
```

## Adding Custom Processors

Extend Qirrel's functionality with custom processing components:

```ts
import { Pipeline, type PipelineComponent, type QirrelContext } from 'qirrel';

// Define a custom processor to identify capitalized words
const extractCapitalizedWords: PipelineComponent = (input: QirrelContext): QirrelContext => {
  if (input.data) {
    const capitalizedWords = input.data.tokens.filter(token =>
      token.type === 'word' &&
      token.value.charAt(0) === token.value.charAt(0).toUpperCase() &&
      token.value.length > 1
    );

    // Add these as entities
    capitalizedWords.forEach(token => {
      input.data.entities.push({
        type: 'capitalized_word',
        value: token.value,
        start: token.start,
        end: token.end
      });
    });
  }

  return input;
};

async function customProcessorExample() {
  const pipeline = new Pipeline();
  pipeline.addCustomProcessor(extractCapitalizedWords);
  
  const result = await pipeline.process('John visited New York City last Tuesday.');
  console.log('Capitalized words found:', result.entities);
  // Would include: 'John', 'New', 'York', 'City', 'Tuesday'
}

customProcessorExample();
```

## Handling Different Text Types

Configure Qirrel for different types of input text:

```ts
import { Pipeline } from 'qirrel';

// Processing technical documentation
async function technicalTextProcessing() {
  const techPipeline = new Pipeline();
  
  // Configured to preserve technical terms and symbols
  const result = await techPipeline.process(`
    The API endpoint is GET /users/{id}, 
    with rate limit of 1000 req/min. 
    Contact admin@company.com for access.
  `);
  
  console.log('Technical text result:', result);
}

technicalTextProcessing();
```

These examples demonstrate the flexibility and power of Qirrel for various text processing tasks. Customize the components and configurations to suit your specific use case.