# Usage Examples

[Docs Home](./README.md) | [API](./api.md) | [Configuration](./configuration.md) | [Basic](./usage/basic.md) | [Caching](./usage/caching.md) | [Events](./events.md) | [LLM](./integrations/llm.md) | [Architecture](./walkthrough.md)

## Single Input

```ts
import { processText } from 'qirrel';

const result = await processText('Contact us at support@example.com or +1 415 555 2671');
console.log(result.data?.entities);
```

## Batch Input

```ts
import { processTexts } from 'qirrel';

const results = await processTexts(
  ['Email: team@example.com', 'Call: +44 20 7946 0958'],
  undefined,
  { concurrency: 2 },
);

console.log(results.map((r) => r.data?.entities));
```

## Pipeline + Events

```ts
import { Pipeline, PipelineEvent } from 'qirrel';

const pipeline = new Pipeline();

pipeline.on(PipelineEvent.RunStart, ({ context }) => {
  console.log('start', context.meta?.requestId);
});

pipeline.on(PipelineEvent.RunEnd, ({ duration }) => {
  console.log('done in', duration, 'ms');
});

const result = await pipeline.process('Visit https://example.com and pay 19.99');
console.log(result.data?.entities);
```

## Custom Processor

```ts
import type { PipelineComponent, QirrelContext } from 'qirrel';
import { Pipeline } from 'qirrel';

const hashtagProcessor: PipelineComponent = {
  name: 'extract-hashtag',
  cacheable: true,
  async run(input: QirrelContext): Promise<QirrelContext> {
    if (!input.data) return input;

    const regex = /#[a-zA-Z0-9_]+/g;
    let match: RegExpExecArray | null;
    while ((match = regex.exec(input.data.text)) !== null) {
      input.data.entities.push({
        type: 'hashtag',
        value: match[0],
        start: match.index,
        end: match.index + match[0].length,
      });
    }

    return input;
  },
};

const pipeline = new Pipeline();
pipeline.addCustomProcessor(hashtagProcessor);

const result = await pipeline.process('Follow #qirrel and #nlp');
console.log(result.data?.entities);
```

## Phone Detection Stress Sample

```ts
import { processText } from 'qirrel';

const text = 'US +1 415 555 2671, UK +44 20 7946 0958, NG +234 803 123 4567';
const result = await processText(text);

const phones = (result.data?.entities ?? []).filter((e) => e.type === 'phone');
console.log(phones);
```
