# Caching in Qirrel

Qirrel provides robust caching functionality to improve performance by storing frequently accessed results and avoiding redundant processing. The caching system is built on the `lru-cache` library and supports both pipeline-level and component-level caching.

## Overview

The caching system in Qirrel includes:
- Pipeline-level caching for full processing results
- Component-level caching for individual processor operations
- LRU (Least Recently Used) eviction policy
- Configurable TTL (Time To Live) for cache entries
- Automatic cache management with configurable limits

## Configuration

Caching can be configured via your configuration YAML file:

```yaml
cache:
  maxEntries: 1000    # Maximum number of items to store in cache
  ttl: 300000         # Time-to-live in milliseconds (5 minutes)
```

- When `maxEntries` is set to `0`, caching is completely disabled
- The default TTL is 300,000ms (5 minutes)
- By default, caching is enabled with max 1000 entries

## Using Pipeline Caching

The pipeline automatically uses caching when processing text:

```ts
import { Pipeline } from 'qirrel';

const pipeline = new Pipeline();

// First call processes the text
const result1 = await pipeline.process('Hello world!');

// Subsequent calls with the same text will return cached results
const result2 = await pipeline.process('Hello world!'); // Fast, from cache
```

You can also manually interact with the cache:

```ts
// Check if a result is cached
if (pipeline.isCached('some text')) {
  const cachedResult = pipeline.getCached('some text');
  console.log('Using cached result');
} else {
  const result = await pipeline.process('some text');
  // Result is automatically cached
}
```

## Cache Manager Access

For more advanced caching needs, you can access the cache manager directly:

```ts
import { Pipeline, LruCacheManager } from 'qirrel';

const pipeline = new Pipeline();

// Access the cache manager
const cacheManager = pipeline.getCacheManager();

// Use the cache manager for custom caching
cacheManager.set('my-key', { data: 'some data' }, 60000); // TTL of 1 minute
const cachedData = cacheManager.get('my-key');

// Check cache status
console.log('Cache size:', cacheManager.size());
console.log('Max capacity:', cacheManager.maxSize());
```

## Cache Configuration Options

### Cache Options Interface

```ts
interface CacheOptions {
  maxEntries?: number;   // Maximum number of entries to store (default: 1000)
  ttl?: number;          // Time-to-live in milliseconds (default: 300000 - 5 minutes)
}
```

### Creating Custom Cache Managers

```ts
import { LruCacheManager } from 'qirrel';

const myCache = new LruCacheManager({
  maxEntries: 500,
  ttl: 600000  // 10 minutes
});

myCache.set('example', { value: 'data' });
const result = myCache.get('example');
```

## Cache Management Methods

### LruCacheManager Methods

- `get<T>(key: string)`: Retrieves a value from the cache
- `set(key: string, value: any, ttl?: number)`: Sets a value in the cache
- `has(key: string)`: Checks if a key exists in the cache
- `delete(key: string)`: Deletes a key from the cache
- `clear()`: Clears all entries from the cache
- `size()`: Returns the current number of cached items
- `maxSize()`: Returns the maximum capacity of the cache

### Pipeline Cache Methods

- `getCacheManager()`: Returns the pipeline's cache manager
- `isCached(text: string)`: Checks if text result is cached
- `getCached(text: string)`: Gets cached result for text
- `setCached(text: string, result: QirrelContext, ttl?: number)`: Sets a cached result

## Specialized Cache Managers

### LLMCacheManager

For LLM-specific caching, Qirrel provides an `LLMCacheManager`:

```ts
import { LLMCacheManager } from 'qirrel';

const llmCache = new LLMCacheManager({
  maxEntries: 200,
  ttl: 900000  // 15 minutes for LLM responses
});
```

### ContextCacheManager

For context-specific caching, there's a `ContextCacheManager`:

```ts
import { ContextCacheManager } from 'qirrel';

const contextCache = new ContextCacheManager({
  maxEntries: 50,
  ttl: 180000  // 3 minutes for context data
});
```

## Performance Benefits

Using caching in Qirrel provides several performance benefits:

- **Reduced Processing Time**: Subsequent requests with the same input return immediately from cache
- **Lower Resource Usage**: Avoids re-processing identical inputs
- **Improved Throughput**: Allows the system to handle more requests efficiently
- **Cost Savings**: When using LLMs, reduces API calls for repeated requests

## Best Practices

1. **Configure TTL Appropriately**: Balance between freshness and performance
2. **Monitor Cache Hit Rates**: Ensure your cache configuration is effective
3. **Use Appropriate Max Entries**: Balance memory usage with cache effectiveness
4. **Consider Cache Keys**: Ensure your cache keys are unique and predictable
5. **Handle Cache Misses**: Always be prepared for cache misses in your application logic

## Disabling Caching

To disable caching entirely, set maxEntries to 0 in your configuration:

```yaml
cache:
  maxEntries: 0
```

Alternatively, you can create a pipeline without caching programmatically by setting the config appropriately.