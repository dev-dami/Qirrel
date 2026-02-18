# Caching

[Docs Home](../README.md) | [API](../api.md) | [Configuration](../configuration.md) | [Examples](../examples.md) | [Basic](./basic.md) | [Events](../events.md) | [LLM](../integrations/llm.md) | [Architecture](../walkthrough.md) | [Agent-Native](../agent-native.md) | [Benchmarks](../benchmarks.md) | [Ecosystem](../ecosystem-comparison.md)

Qirrel uses LRU + TTL caching to reduce repeated work.

## Cache Layers

1. Pipeline result cache (`Pipeline.process` and `Pipeline.processBatch`).
2. Component-level cache wrappers for cacheable processors.
3. LLM response cache in adapter implementations.

## Configure Cache

```yaml
cache:
  maxEntries: 1000
  ttl: 300000
```

- `maxEntries`: max entries before LRU eviction.
- `ttl`: entry lifetime in milliseconds.
- Set `maxEntries: 0` to disable cache globally.

## Runtime API

```ts
import { Pipeline } from 'qirrel';

const pipeline = new Pipeline();
const input = 'hello@example.com';

await pipeline.process(input);

console.log(pipeline.isCached(input));
console.log(pipeline.getCached(input)?.data?.entities ?? []);

pipeline.setCached(input, { data: { text: input, tokens: [], entities: [] } });
```

## Cache Keys and Safety Notes

- Pipeline result keys are SHA-256 based on raw input text.
- Component caches use stable hashed keys from component name + relevant context fields.
- Cached contexts are cloned on set/get to avoid cross-request mutation leakage.

## LLM Cache

For adapter-level response caching:

```yaml
llm:
  cacheTtl: 300000
  timeout: 30000
```

Provider behavior currently differs:
- OpenAI adapter implements explicit cache read/write in the adapter.
- Generic and Gemini adapters cache through shared base adapter logic.

## Throughput Tuning

- Reuse one `Pipeline` instance per process/service worker.
- Prefer `processBatch(..., { concurrency })` for bounded parallelism.
- Tune `ttl` by freshness requirements.

## Common Pitfalls

- Disabling cache in config affects both result and component-level cache wrapping.
- Recreating `Pipeline` for every request resets cache and eliminates most cache benefit.
- High concurrency with very low TTL may still miss cache frequently.
