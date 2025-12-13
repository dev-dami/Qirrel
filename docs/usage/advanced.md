# Advanced Usage

This guide covers advanced techniques for maximizing Qirrel's capabilities, including custom processors, fine-tuned configurations, and integration with external services.

## Custom Processors

One of Qirrel's most powerful features is the ability to create custom processing components that can be inserted into the pipeline.

### Creating Custom Processors

A processor is a function that implements the `PipelineComponent` type:

```ts
import { type PipelineComponent, type IntentResult } from 'qirrel';

// Define a processor that finds capitalized words
const capitalizeProcessor: PipelineComponent = (input: IntentResult): IntentResult => {
  // Find tokens that are capitalized words
  const capitalizedTokens = input.tokens.filter(token => 
    token.type === 'word' && 
    token.value.charAt(0) === token.value.charAt(0).toUpperCase() &&
    token.value.toLowerCase() !== token.value
  );
  
  // Add them as entities
  capitalizedTokens.forEach(token => {
    input.entities.push({
      type: 'capitalized_word',
      value: token.value,
      start: token.start,
      end: token.end
    });
  });
  
  return input;
};
```

### Adding Custom Processors to Pipeline

```ts
import { Pipeline } from 'qirrel';

const pipeline = new Pipeline();
pipeline.addCustomProcessor(capitalizeProcessor);

const result = await pipeline.process('John visited New York and saw a Big sign.');
// result.entities will include capitalized words as entities
```

### Processor Chaining

Processors are executed in the order they are added to the pipeline:

```ts
const pipeline = new Pipeline();
pipeline
  .use(normalize)              // First normalize the text
  .use(clean)                  // Then clean punctuation  
  .addCustomProcessor(customTransform)  // Apply custom logic
  .use(segment);               // Finally segment the text
```

## Advanced Configuration

### Dynamic Configuration

While configuration files are useful for static settings, you can also modify configuration programmatically:

```ts
import { Pipeline } from 'qirrel';

const pipeline = new Pipeline();
const config = pipeline.getConfig();

// Modify configuration at runtime
config.extraction.extractEmails = false;
config.extraction.extractPhones = true;

// The pipeline will now use the updated configuration
```

### Environment-Aware Configurations

Create configurations that adapt based on environment variables:

```ts
import { Pipeline } from 'qirrel';

function createPipeline() {
  const configPath = process.env.NODE_ENV === 'production' 
    ? './prod-config.yaml' 
    : './dev-config.yaml';
    
  return new Pipeline(configPath);
}
```

## Performance Optimization

### Selective Processing

For high-performance scenarios, disable unnecessary processing:

```ts
// For tokenization only (no extraction or cleaning)
const minimalConfig = {
  pipeline: {
    enableNormalization: false,
    enableCleaning: false, 
    enableExtraction: false,
    enableSegmentation: false,
    enableAdvCleaning: false
  }
  // ... other config with only required features enabled
};
```

### Reusing Pipeline Instances

Pipeline construction is more expensive than processing, so reuse instances when possible:

```ts
// Efficient: Reuse the same pipeline for multiple operations
const pipeline = new Pipeline();
const results = await Promise.all([
  pipeline.process('Text 1'),
  pipeline.process('Text 2'), 
  pipeline.process('Text 3')
]);

// Less efficient: Creating a new pipeline for each operation
// const results = await Promise.all([
//   (new Pipeline()).process('Text 1'),
//   (new Pipeline()).process('Text 2'),
//   (new Pipeline()).process('Text 3')
// ]);
```

## Advanced Entity Extraction

### Custom Entity Types

Beyond the built-in entity types, you can create custom extraction logic:

```ts
import { type PipelineComponent, type IntentResult } from 'qirrel';

const extractHashtags: PipelineComponent = (input: IntentResult): IntentResult => {
  // Find hashtag patterns
  const hashtagRegex = /#[a-zA-Z0-9_]+/g;
  let match;
  
  while ((match = hashtagRegex.exec(input.text)) !== null) {
    input.entities.push({
      type: 'hashtag',
      value: match[0],
      start: match.index,
      end: match.index + match[0].length
    });
  }
  
  return input;
};

// Use the custom extractor
const pipeline = new Pipeline();
pipeline.addCustomProcessor(extractHashtags);
```

### Entity Post-Processing

Perform additional analysis on extracted entities:

```ts
async function analyzeEntities(text: string) {
  const result = await processText(text);
  
  // Categorize entities by type
  const emails = result.entities.filter(e => e.type === 'email');
  const phones = result.entities.filter(e => e.type === 'phone');
  const urls = result.entities.filter(e => e.type === 'url');
  
  // Perform domain-specific analysis
  const corporateEmails = emails.filter(email => 
    ['.com', '.org', '.gov'].some(domain => 
      email.value.endsWith(domain)
    )
  );
  
  return { emails, phones, urls, corporateEmails };
}
```

## Integration with External Services

### LLM Integration

Use LLM capabilities for advanced text understanding:

```ts
import { Pipeline } from 'qirrel';

// Enable LLM features in your configuration
const config = {
  llm: {
    enabled: true,
    provider: 'gemini',
    apiKey: process.env.QIRREL_LLM_API_KEY,
    model: 'gemini-2.5-flash'
  }
};

const pipeline = new Pipeline();  // Using config file with LLM settings
const llmAdapter = pipeline.getLLMAdapter();

if (llmAdapter) {
  // Use LLM for enhanced processing
  const analysis = await llmAdapter.analyzeText('Analyze this text');
}
```

### Streaming Processing

For large text processing, consider breaking into chunks:

```ts
import { Pipeline } from 'qirrel';

async function processLargeText(text: string, chunkSize: number = 1000) {
  const pipeline = new Pipeline();
  const results = [];
  
  for (let i = 0; i < text.length; i += chunkSize) {
    const chunk = text.substring(i, i + chunkSize);
    const result = await pipeline.process(chunk);
    results.push(result);
  }
  
  // Combine results as needed
  return results;
}
```

## Working with Token Details

### Advanced Token Analysis

Access detailed token information for complex text processing:

```ts
function analyzeTextComplexity(result: IntentResult) {
  // Calculate average word length
  const words = result.tokens.filter(t => t.type === 'word');
  const avgWordLength = words.reduce((sum, token) => 
    sum + token.value.length, 0) / words.length;
    
  // Find punctuation patterns
  const punctTokens = result.tokens.filter(t => t.type === 'punct');
  
  return {
    wordCount: words.length,
    avgWordLength,
    punctuationDensity: punctTokens.length / result.tokens.length
  };
}
```

### Token-Level Filtering

Perform sophisticated filtering on token arrays:

```ts
function extractNouns(text: string) {
  const result = await processText(text);
  
  // This would require a POS tagger integration in a real implementation
  const potentialNouns = result.tokens.filter(token => 
    token.type === 'word' && 
    token.value.length > 2 &&  // Exclude short words like 'a', 'I'
    !['the', 'and', 'or', 'but'].includes(token.value.toLowerCase())  // Exclude common words
  );
  
  return potentialNouns;
}
```

## Error Recovery and Resilience

### Graceful Degradation

Handle failures in specific processing components:

```ts
import { clean, extract } from 'qirrel';

const resilientProcessor: PipelineComponent = async (input: IntentResult): Promise<IntentResult> => {
  try {
    return await extract(input);
  } catch (extractError) {
    console.warn('Entity extraction failed:', extractError);
    // Return input unchanged instead of failing completely
    return input;
  }
};

const pipeline = new Pipeline();
pipeline.addCustomProcessor(resilientProcessor);
```

### Fallback Strategies

Implement fallback processing when primary methods fail:

```ts
async function processWithFallback(text: string) {
  let result;
  
  try {
    // Try with full processing
    result = await processText(text);
  } catch (primaryError) {
    console.warn('Full processing failed, using minimal processing');
    try {
      // Fallback to tokenization only
      const minimalPipeline = new Pipeline('./minimal-config.yaml');
      result = await minimalPipeline.process(text);
    } catch (fallbackError) {
      // Ultimate fallback
      return { 
        text, 
        tokens: [{ value: text, type: 'unknown', start: 0, end: text.length }], 
        entities: [] 
      };
    }
  }
  
  return result;
}
```

These advanced techniques allow you to tailor Qirrel to your specific requirements, whether you need custom entity extraction, performance optimization, or integration with other services.