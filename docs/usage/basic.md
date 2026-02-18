# Basic Usage

[Docs Home](../README.md) | [API](../api.md) | [Configuration](../configuration.md) | [Examples](../examples.md) | [Caching](./caching.md) | [Events](../events.md) | [LLM](../integrations/llm.md) | [Architecture](../walkthrough.md) | [Agent-Native](../agent-native.md) | [Benchmarks](../benchmarks.md) | [Ecosystem](../ecosystem-comparison.md)

This page is for first-time integration.

## Install

```bash
bun add qirrel
```

## Fastest Start (`processText`)

```ts
import { processText } from 'qirrel';

const result = await processText('Email me at hello@example.com');
console.log(result.data?.entities ?? []);
```

Use this path when you want a simple one-shot parse.

## Batch Processing (`processTexts`)

```ts
import { processTexts } from 'qirrel';

const results = await processTexts(
  [
    'Contact: +1 415 555 2671',
    'Site: https://example.com',
  ],
  undefined,
  { concurrency: 2 },
);

for (const output of results) {
  console.log(output.data?.entities ?? []);
}
```

## Reusable Pipeline (Recommended for Services)

```ts
import { Pipeline } from 'qirrel';

const pipeline = new Pipeline('./miniparse.config.yaml');
await pipeline.init();

const output = await pipeline.process('Price is 29.99 and url is https://example.com');

console.log(output.data?.tokens ?? []);
console.log(output.data?.entities ?? []);
```

Why this is preferred in long-running services:
- cache is reused,
- event handlers are attached once,
- LLM adapter initialization is paid once.

## Output Shape You Should Depend On

Use `result.data?.entities`, not `result.entities`.

```ts
const result = await processText('Call +44 20 7946 0958');
const entities = result.data?.entities ?? [];
```

## Minimal Validation Pattern

```ts
const output = await processText(inputText);
const entities = output.data?.entities ?? [];

const emails = entities.filter((entity) => entity.type === 'email');
const phones = entities.filter((entity) => entity.type === 'phone');
```

## Common Pitfalls

- `processText`/`processTexts` create a new `Pipeline` each call; they do not share cache with previous calls.
- If your service parses continuously, instantiate one `Pipeline` and reuse it.
- Empty `entities` is valid output for text that contains no matches.

## Next Steps

- Configure production defaults in [Configuration](../configuration.md).
- Add metrics hooks in [Events](../events.md).
- Tune throughput in [Caching](./caching.md).
