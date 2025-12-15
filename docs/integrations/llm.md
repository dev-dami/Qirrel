# LLM Integration

Qirrel provides optional integration with Large Language Models to enhance text processing capabilities. This document covers how to configure and use LLM features in your applications.

## Overview

The LLM integration in Qirrel allows you to combine traditional rule-based text processing with the power of AI. The system uses an adapter pattern that can support multiple LLM providers, with Google Gemini currently implemented as the primary provider.

## Prerequisites

Before using LLM features, you need to install additional dependencies:

```bash
npm install qirrel @google/generative-ai
```

## Configuration

### Enabling LLM Support

LLM features are disabled by default. Enable them in your configuration file:

```yaml
llm:
  enabled: true                    # Enable LLM features
  provider: gemini                 # Currently only 'gemini' is supported
  apiKey: your-gemini-api-key      # Your API key (preferably via env var)
  model: gemini-2.5-flash          # Optional: specific model to use
  temperature: 0.7                 # Optional: creativity level (0.0-1.0)
  maxTokens: 1024                  # Optional: response length limit
  timeout: 30000                   # Optional: request timeout in ms
```

### Environment Variables

For security, it's recommended to set your API key through environment variables:

```bash
export QIRREL_LLM_API_KEY=your_actual_api_key_here
```

Then in your config file, you can omit the apiKey field or set it conditionally:

```yaml
llm:
  enabled: true
  provider: gemini
  apiKey: ${QIRREL_LLM_API_KEY}    # This will be resolved from environment
```

## Using LLM Features

### Getting the LLM Adapter

Access the LLM adapter through the Pipeline instance:

```ts
import { Pipeline } from 'qirrel';

const pipeline = new Pipeline('./config-with-llm.yaml');

// Wait for async initialization of LLM adapter
setTimeout(async () => {
  const llmAdapter = pipeline.getLLMAdapter();
  
  if (llmAdapter) {
    // Use the LLM adapter for enhanced processing
    const response = await llmAdapter.generateContent('Analyze this text: ...');
    console.log(response);
  } else {
    console.log('LLM adapter not available - check configuration');
  }
}, 100); // Allow time for async initialization
```

### Adding LLM Processors

You can add LLM-based processing components to your pipeline:

```ts
import { Pipeline, type PipelineComponent, type QirrelContext, type LLMAdapter } from 'qirrel';

// Factory function to create processor with injected adapter
function createLLMEnhancedProcessor(llmAdapter: LLMAdapter | undefined): PipelineComponent {
  return async (input: QirrelContext): Promise<QirrelContext> => {
    if (input.data && llmAdapter) {
      const analysis = await llmAdapter.analyzeText(`Analyze this text for sentiment: ${input.data.text}`);

      input.data.entities.push({
        type: 'llm_analysis',
        value: analysis.sentiment || 'neutral',
        start: 0,
        end: input.data.text.length
      });
    }

    return input;
  };
}

// Usage:
const pipeline = new Pipeline('./config-with-llm.yaml');
const llmEnhancedProcessor = createLLMEnhancedProcessor(pipeline.getLLMAdapter());
pipeline.addLLMProcessor(llmEnhancedProcessor);
```

## Available LLM Capabilities

### Content Generation

Generate new content based on input text:

```ts
const response = await llmAdapter.generateContent('Summarize this document: ...');
```

### Text Analysis

Analyze text for various attributes:

```ts
const analysis = await llmAdapter.analyzeText('Classify the sentiment of: ...');
```

### Contextual Processing

Combine traditional extraction with LLM understanding:

```ts
async function enhancedProcessing(text: string) {
  // First pass: traditional processing
  const traditionalResult = await processText(text);
  
  // Second pass: LLM enhancement
  const pipeline = new Pipeline('./config-with-llm.yaml');
  const llmAdapter = pipeline.getLLMAdapter();
  
  if (llmAdapter) {
    // Use extracted entities as context for LLM analysis
    const context = `Text: ${text}\nEntities: ${JSON.stringify(traditionalResult.entities)}`;
    const enhancedAnalysis = await llmAdapter.analyzeText(`Based on this text and extracted entities, identify key themes: ${context}`);
    
    // Combine traditional and LLM results
    return {
      ...traditionalResult,
      llmAnalysis: enhancedAnalysis
    };
  }
  
  return traditionalResult;
}
```

## Best Practices

### Performance Considerations

- LLM API calls are slower than local processing, so use them judiciously
- Consider caching responses for frequently processed text
- Use conditional LLM processing based on initial analysis results

```ts
// Only use LLM for complex texts
const shouldUseLLM = result.entities.length > 10 || text.length > 500;
if (shouldUseLLM && llmAdapter) {
  // Apply LLM processing
}
```

### Error Handling

LLM services can be unreliable, so implement fallback strategies:

```ts
async function resilientLLMProcessing(text: string) {
  try {
    const llmResult = await llmAdapter?.generateContent(text);
    if (llmResult) return llmResult;
  } catch (error) {
    console.warn('LLM processing failed, using traditional methods:', error);
    // Fallback to traditional processing
  }
  
  return await processText(text);
}
```

### Cost Management

- Monitor API usage to manage costs
- Use appropriate model sizes for your use case
- Implement rate limiting to avoid quota issues

## Supported Providers

### Google Gemini

Currently, Qirrel supports Google's Gemini models:

- **gemini-2.5-flash**: Fast, cost-effective model for most tasks
- **gemini-2.0-flash**: Alternative flash model
- **gemini-1.5-pro**: More capable model for complex tasks

### OpenAI Compatible APIs

Qirrel also supports any OpenAI-compatible API endpoint:

- **OpenAI**: Official OpenAI models (gpt-3.5-turbo, gpt-4, etc.)
- **Azure OpenAI**: Microsoft's Azure OpenAI service
- **Anthropic via Bedrock**: Anthropic models through AWS Bedrock
- **Mistral AI**: Mistral models with OpenAI-compatible API
- **Local LLMs**: Self-hosted models via LM Studio, Ollama, etc.
- **Custom endpoints**: Any service implementing the OpenAI API specification

To use OpenAI-compatible endpoints, configure your provider as "openai" and specify the appropriate base URL:

```yaml
llm:
  enabled: true
  provider: openai                 # Use OpenAI-compatible provider
  apiKey: your-api-key
  baseUrl: https://api.openai.com/v1    # Default OpenAI URL, or your custom endpoint
  model: gpt-3.5-turbo             # Model to use
```

The provider system is designed to support additional LLM providers in the future through the adapter pattern.

## Security Considerations

- Never hardcode API keys in source code
- Use environment variables or secure configuration management
- Be cautious with processing sensitive data through external LLM services
- Consider data residency requirements for your jurisdiction

## Troubleshooting

### LLM Adapter Not Available

If `getLLMAdapter()` returns undefined:

1. Verify that `llm.enabled: true` in your configuration
2. Ensure `apiKey` is correctly set (via config file or environment variable)
3. Check that the required provider packages are installed

### Performance Issues

If processing is slow:

1. Check if LLM processing is unintentionally enabled when not needed
2. Verify that you're reusing Pipeline instances rather than creating new ones
3. Consider implementing response caching for repeated operations

LLM integration enhances Qirrel's capabilities but isn't required for core functionality. You can use the library effectively for traditional NLP tasks even without LLM features enabled.