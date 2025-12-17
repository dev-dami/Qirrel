# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [CACHING IMPLEMENTATION 0.3.0]

### Added
- Comprehensive caching system using lru-cache library for production-grade performance
- Pipeline-level caching to cache full processing results with configurable TTL
- Component-level caching for individual processor operations
- LruCacheManager, LLMCacheManager, and ContextCacheManager classes with proper type safety
- Caching configuration options in YAML config (maxEntries, ttl)
- Cache management methods: get, set, has, delete, clear, size, maxSize
- New documentation files for caching usage and configuration
- Direct cache access methods in Pipeline class (getCacheManager, isCached, getCached, setCached)

### Changed
- Updated all processors to properly implement PipelineComponent interface with name, version, cacheable, and run properties
- Modified cache key generation in BaseLLMAdapter to handle empty model strings with fallback
- Refactored tests to work with async processors and proper PipelineComponent interface
- Updated API documentation to include caching-related methods and classes
- Enhanced configuration system to include cache settings
- Updated documentation with comprehensive caching examples and best practices

### Fixed
- Cache key generation issue when model is an empty string
- Type errors related to importing constants with import type
- Test failures due to processors not implementing PipelineComponent interface properly
- Consistency in default model usage across all LLM adapter implementations

## [QIRRELCONTEXT IMPLEMENTATION 0.2.0]

### Added
- QirrelContext as the canonical context
- Namespaced fields: meta (requestId, timestamp, source, trace), memory (shortTerm, longTerm, cache), and llm (model, temperature, safety)
- JSON serializability support for context persistence and transport
- Backward compatibility safeguards for existing integrations

### Changed
- Replaced all IntentResult references with QirrelContext throughout codebase
- Updated all processors (clean, extract, normalize, segment, advClean) to use QirrelContext
- Modified LLM components and adapters to work with new context structure
- Updated API functions to return QirrelContext instead of IntentResult
- Refactored documentation to reflect new context architecture
- Updated test suite to work with QirrelContext structure

### Removed
- Deprecated IntentResult interface and all related type definitions
- Legacy processing patterns that bypassed canonical context

## [QIRREL UPDATE 0.1.0]

### Added
- Comprehensive documentation restructure with modular approach
- New /docs folder with API, configuration, examples, walkthrough, usage, and integration guides
- LLM adapter system for integration with various language models
- Advanced configuration options for pipeline customization
- Speech analysis capabilities for transcribed text

### Changed
- Project renamed from Miniparse to Qirrel
- Improved tokenizer with enhanced Unicode support
- Refined entity extraction with validation using external libraries
- Updated documentation structure to focus on user experience
- Enhanced pipeline architecture with better extensibility

## [0.1.8] - 2025-01-13

### Added
- LLM integration support with Google Gemini
- Async initialization for LLM adapters
- New advanced cleaning processor (advClean)
- Speech analysis features: filler word removal, repetition detection, stutter detection

### Changed
- Updated project name from Miniparse to Qirrel
- Improved error handling with graceful degradation
- Enhanced documentation structure with modular files

## [0.1.0-beta] - 2025-01-08

### Added
- Initial release of Qirrel (formerly Miniparse) as a beta version
- Fast and lightweight NLP text processing library
- Configurable pipeline system with YAML configuration
- Speech pattern analysis and preprocessing functions
- Regex-free implementation for better performance
- Tokenization, extraction, normalization, and segmentation processors
- TypeScript support with full type definitions

### Changed
- Updated project from original light-js-nlp
- Implemented string-based parsing instead of regex for better performance
- Added comprehensive configuration system
- Enhanced speech analysis with filler word detection, repetition detection, and stutter detection

### Fixed
- Performance issues by removing heavy regex usage
- Type safety throughout the codebase
