# Code Walkthrough

This document provides insights into Qirrel's architecture and implementation, helping you understand how the library works internally and how to best utilize its features.

## Architecture Overview

Qirrel follows a modular pipeline architecture that allows for flexible text processing workflows. The core components work together to provide comprehensive text analysis capabilities:

```
Input Text → Tokenizer → Pipeline Components → Output (QirrelContext)
```

### Core Components

#### 1. Tokenizer (src/core/Tokenizer.ts)
The Tokenizer is responsible for breaking down input text into meaningful units called tokens. Each token contains information about its type, value, and position in the original text.

- **Purpose**: Splits text into discrete elements like words, numbers, punctuation, and symbols
- **Key Feature**: Optimized classification algorithm that efficiently categorizes Unicode characters
- **Customizable**: Options for lowercasing and symbol merging

```ts
// Internal classification algorithm example
private classifyOptimized(code: number, ch: string): TokenType {
  if ((code >= 65 && code <= 90) || (code >= 97 && code <= 122)) { // A-Z, a-z
    return "word";
  }
  // ... other classifications
}
```

#### 2. Pipeline (src/core/pipeline.ts)
The Pipeline orchestrates the text processing workflow by managing a chain of processing components.

- **Purpose**: Coordinates the execution of various text processors
- **Key Feature**: Configurable processing steps that can be enabled/disabled
- **Flexibility**: Allows custom processors to be added dynamically

```ts
// Pipeline construction based on configuration
constructor(configPath?: string) {
  // Load configuration
  this.config = ConfigLoader.loadConfig(configPath);

  // Conditionally add processors based on config
  if (this.config.pipeline.enableNormalization) this.use(normalize);
  if (this.config.pipeline.enableCleaning) this.use(clean);
  // ... more conditional additions
}
```

#### 3. Processors (src/processors/)
Processors are individual units of functionality that transform the text processing result. They follow a functional programming approach, accepting and returning `QirrelContext` objects.

- **Design Pattern**: Stateless functions that implement the `PipelineComponent` type
- **Modularity**: Each processor handles a specific aspect of text analysis
- **Chaining**: Processors can be combined in any order to create custom workflows

## Configuration System

### Config Loading (src/config/)
Qirrel uses a hierarchical configuration system that starts with defaults and can be overridden by user-specified YAML files.

- **Default Configuration**: Sensible presets for common use cases
- **YAML Override**: Allows users to customize behavior without code changes
- **Runtime Flexibility**: Config can be accessed programmatically

The configuration system controls:
- Pipeline stage activation
- Tokenizer behavior
- Entity extraction options
- Speech analysis features
- LLM integration settings

## Entity Extraction System

The extraction module (src/processors/extract.ts) implements robust entity detection using a combination of regex patterns and validation libraries:

- **Email Extraction**: Uses pattern matching combined with `validator.isEmail()` for accuracy
- **Phone Numbers**: Leverages `libphonenumber-js` for international phone validation
- **URL Detection**: Combines regex discovery with `validator.isURL()` verification
- **Number Recognition**: Handles integers, floats, and scientific notation

## LLM Integration Architecture

For advanced processing capabilities, Qirrel supports integration with Large Language Models through an adapter pattern:

- **Adapter Pattern**: Abstracts different LLM providers behind a common interface
- **Async Initialization**: LLM adapters are initialized asynchronously to avoid blocking
- **Fallback Mechanisms**: Graceful degradation when LLM services are unavailable

## Type System

Qirrel employs a strong type system for reliable text processing:

- **QirrelContext Interface**: Canonical context for all processing operations
- **Token Interface**: Detailed information about each text element
- **Entity Interface**: Structured representation of extracted information
- **Type Safety**: Comprehensive TypeScript definitions throughout

## Error Handling Strategy

The library implements defensive programming practices:

- **Try-Catch Wrapping**: Individual processor steps are wrapped to prevent cascading failures
- **Warning Messages**: Non-critical failures are logged as warnings rather than thrown errors
- **Graceful Degradation**: Missing features or misconfigurations don't halt processing

## Performance Considerations

Several optimizations ensure efficient text processing:

1. **Single-Pass Algorithms**: Where possible, algorithms process text in a single iteration
2. **Optimized Character Classification**: Direct Unicode code comparisons instead of complex regex
3. **Conditional Processing**: Disabled features don't consume resources
4. **Memory Efficiency**: Objects are reused rather than constantly recreated

## Extensibility Points

Qirrel is designed to be extended through:

1. **Custom Processors**: Users can implement their own `PipelineComponent` functions
2. **Configuration Options**: YAML configuration allows behavior adjustments
3. **Pipeline Modification**: Runtime addition of processors via `addCustomProcessor()`
4. **LLM Adapters**: New providers can be added by implementing the LLM adapter interface

## File Organization

The project structure follows a logical separation of concerns:

```
src/
├── core/           # Fundamental components (Pipeline, Tokenizer)
├── processors/     # Individual text processing functions
├── types/          # TypeScript type definitions
├── config/         # Configuration loading and defaults
├── llms/           # LLM integration components
├── adapters/       # Various adapter implementations
└── api/            # Public API entry points
```

This architecture enables maintainable, testable, and extensible code while providing a clean public API for consumers.