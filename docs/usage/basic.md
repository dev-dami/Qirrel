# Basic Usage

[Docs Home](../README.md) | [API](../api.md) | [Configuration](../configuration.md) | [Examples](../examples.md) | [Caching](./caching.md) | [Events](../events.md) | [LLM](../integrations/llm.md) | [Architecture](../walkthrough.md) | [Agent-Native](../agent-native.md)

## Install

```bash
bun add qirrel
```

## Process a Single Text

```ts
import { processText } from 'qirrel';

const result = await processText('Email me at hello@example.com');
console.log(result.data?.entities);
```

## Process Multiple Texts

```ts
import { processTexts } from 'qirrel';

const results = await processTexts([
  'Contact: +1 415 555 2671',
  'Site: https://example.com',
]);

for (const item of results) {
  console.log(item.data?.entities);
}
```

## Use the `Pipeline` Directly

```ts
import { Pipeline } from 'qirrel';

const pipeline = new Pipeline();
const output = await pipeline.process('Price is 29.99 and url is https://example.com');

console.log(output.data?.tokens);
console.log(output.data?.entities);
```

## Access Cached Results

```ts
import { Pipeline } from 'qirrel';

const pipeline = new Pipeline();
await pipeline.process('cached text');

if (pipeline.isCached('cached text')) {
  const cached = pipeline.getCached('cached text');
  console.log(cached?.data?.entities);
}
```

## Output Shape

Use `result.data?.entities`, not `result.entities`.

```ts
const result = await processText('Call +44 20 7946 0958');
const entities = result.data?.entities ?? [];
```
