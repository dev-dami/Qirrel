# Caching

[Docs Home](../README.md) | [API](../api.md) | [Configuration](../configuration.md) | [Examples](../examples.md) | [Basic](./basic.md) | [Events](../events.md) | [LLM](../integrations/llm.md) | [Architecture](../walkthrough.md)

Qirrel caching is enabled by default and improves repeat-processing performance at two levels:

1. Pipeline result cache (`Pipeline.process` / `Pipeline.processBatch`)
2. Cacheable processor wrappers inside the default pipeline

## Configure Cache

```yaml
cache:
  maxEntries: 1000
  ttl: 300000
```

- `maxEntries`: maximum entries in LRU cache.
- `ttl`: cache lifetime in milliseconds.
- Set `maxEntries: 0` to disable caching.

## Basic Usage

```ts
import { Pipeline } from 'qirrel';

const pipeline = new Pipeline();

const first = await pipeline.process('hello@example.com');
const second = await pipeline.process('hello@example.com');

console.log(first.data?.entities);
console.log(second.data?.entities);
```

## Manual Cache Access

```ts
import { Pipeline } from 'qirrel';

const pipeline = new Pipeline();
const input = 'cached input';

if (!pipeline.isCached(input)) {
  await pipeline.process(input);
}

const cached = pipeline.getCached(input);
console.log(cached?.data?.entities);
```

## Cache Manager API

```ts
import { Pipeline } from 'qirrel';

const pipeline = new Pipeline();
const cache = pipeline.getCacheManager();

cache.set('custom:key', { sample: true }, 60_000);
console.log(cache.get('custom:key'));
console.log(cache.has('custom:key'));
console.log(cache.size(), cache.maxSize());
```

## LLM Cache Notes

LLM adapters also support response caching. Relevant fields:

```yaml
llm:
  cacheTtl: 300000
  timeout: 30000
```

- `cacheTtl` controls cached response lifetime.
- `timeout` controls request timeout.

## Best Practices

- Reuse `Pipeline` instances for repeated calls.
- Tune `ttl` by freshness needs.
- Disable cache (`maxEntries: 0`) for highly dynamic data.
- Use `processBatch(..., { concurrency })` with cache for high-throughput workloads.
