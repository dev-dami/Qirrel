# Basic Usage

This guide covers the fundamentals of using Qirrel for text processing. If you're new to the library, start here to understand the core concepts.

## Getting Started

### Installation

First, install Qirrel in your project:

```bash
npm install qirrel
```

If you plan to use LLM features, you'll also need the provider-specific package:

```bash
npm install qirrel @google/generative-ai  # for Google Gemini
```

### Simple Text Processing

The easiest way to start using Qirrel is with the `processText` function:

```ts
import { processText } from 'qirrel';

async function example() {
  const result = await processText('Contact me at email@example.com');
  console.log(result);
}
```

This will return an `IntentResult` object containing:
- The original text
- An array of tokens
- An array of extracted entities

### Understanding the Output

```ts
{
  text: "Contact me at email@example.com",
  tokens: [
    { value: "contact", type: "word", start: 0, end: 7 },
    { value: "me", type: "word", start: 8, end: 10 },
    // ... more tokens
  ],
  entities: [
    {
      type: "email", 
      value: "email@example.com",
      start: 14,
      end: 31
    }
  ]
}
```

## Core Concepts

### The Pipeline Pattern

Qirrel uses a pipeline approach where text flows through multiple processing stages:

```ts
import { Pipeline } from 'qirrel';

const pipeline = new Pipeline();
// Default pipeline includes tokenization, cleaning, extraction, etc.
```

The default pipeline automatically:
1. Tokenizes the input text
2. Normalizes the text (converts abbreviations)
3. Cleans punctuation (configurable)
4. Extracts entities (emails, phones, etc.)

### Entities

Qirrel can automatically identify and extract various types of entities:

- **Emails**: Valid email addresses
- **Phones**: International phone number formats
- **URLs**: HTTP/HTTPS web addresses
- **Numbers**: Integers, decimals, scientific notation

```ts
const result = await processText('Call 1-800-FLOWERS or visit https://flowers.com');
// result.entities would contain both phone and URL entities
```

### Configuration

For basic usage, the default configuration works well. But you can provide a custom YAML configuration file:

```ts
const pipeline = new Pipeline('./my-config.yaml');
```

## Common Basic Patterns

### Extracting Specific Information

If you're interested in specific entity types, you can use targeted processors:

```ts
import { extractEmailsOnly, extractPhonesOnly } from 'qirrel';

// Process text to get only emails
const emailResult = extractEmailsOnly({
  text: 'Contact: email@test.com or call (555) 123-4567',
  tokens: [],
  entities: []
});
// Only emails will be in emailResult.entities
```

### Token Analysis

You can work directly with tokens to understand the text structure:

```ts
const result = await processText('The price is $19.99');
const words = result.tokens.filter(token => token.type === 'word');
const numbers = result.tokens.filter(token => token.type === 'number');
```

## Customizing Behavior

### Using Different Pipeline Options

You can configure the pipeline at initialization:

```ts
// Create a pipeline with custom behavior
const pipeline = new Pipeline('./custom-config.yaml');
const result = await pipeline.process('Some text here');
```

### Configuration File Example

Create a `config.yaml` file:

```yaml
pipeline:
  enableNormalization: true
  enableCleaning: true
  enableExtraction: true
  enableSegmentation: false  # Disable segmentation

extraction:
  extractEmails: true
  extractPhones: false      # Don't extract phone numbers
  extractUrls: true
  extractNumbers: true
```

## Error Handling

The basic Qirrel functions are designed to be robust:

```ts
try {
  const result = await processText(userInput);
  // Handle normal case
} catch (error) {
  // This rarely happens, as Qirrel handles errors gracefully
  console.error('Unexpected error processing text:', error);
}
```

Remember that Qirrel processes text defensively and will return results even if some components fail, so basic error handling isn't typically needed for standard use cases.

Now that you understand basic usage, you can move on to more advanced techniques for customizing Qirrel's behavior to meet specific requirements.