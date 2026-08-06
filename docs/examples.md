# Usage Examples

[Docs Home](./README.md) | [API](./api.md) | [Configuration](./configuration.md) | [Basic](./usage/basic.md) | [Caching](./usage/caching.md) | [Events](./events.md) | [LLM](./integrations/llm.md) | [Architecture](./walkthrough.md) | [Agent-Native](./agent-native.md) | [Benchmarks](./benchmarks.md) | [Ecosystem](./ecosystem-comparison.md)

This page contains copy-paste examples for common integration patterns.

## Single Input

```ts
import { processText } from 'qirrel';

const result = await processText('Contact us at support@example.com or +1 415 555 2671');
console.log(result.data?.entities ?? []);
```

## Batch Input with Concurrency

```ts
import { processTexts } from 'qirrel';

const results = await processTexts(
  ['Email: team@example.com', 'Call: +44 20 7946 0958'],
  undefined,
  { concurrency: 2 },
);

console.log(results.map((r) => r.data?.entities ?? []));
```

## Pipeline with Events

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
console.log(result.data?.entities ?? []);
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
console.log(result.data?.entities ?? []);
```

## Speech Transcript Preprocessing

```ts
import { preprocessSpeechInput } from 'qirrel';

const cleanText = preprocessSpeechInput(
  'Um, hello! I need help, you know, with my account t-t-today.',
  { removeFillerWords: true, detectRepetitions: true, findStutters: true }
);

console.log(cleanText);
// "hello! I need help with my account today."
```

## Agent Tool Call Example

```ts
import { createQirrelAgentBridge } from 'qirrel';

const bridge = createQirrelAgentBridge();
const result = await bridge.callTool('qirrel.parse_text', {
  text: 'US +1 415 555 2671, site https://example.com',
});

console.log(result.structuredContent);
```

## Executable Production Scenarios

Full, runnable example scripts are available in the repository root [`examples/`](../examples/):

- [`1-voice-transcript-sanitizer.ts`](../examples/1-voice-transcript-sanitizer.ts): Speech-To-Text audio transcript pre-processing.
- [`2-zero-cost-entity-prefilter.ts`](../examples/2-zero-cost-entity-prefilter.ts): High-volume customer support ticket & email lead router.
- [`3-token-saving-prellm-pipeline.ts`](../examples/3-token-saving-prellm-pipeline.ts): Prompt token reduction & HTML payload cleaning.
- [`4-agent-mcp-offloaded-parsing.ts`](../examples/4-agent-mcp-offloaded-parsing.ts): AI Agent tool offloading via Qirrel Agent Bridge & MCP.

## Choosing the Right Example

- Start with `processText` for scripts and one-off jobs.
- Use reusable `Pipeline` for services.
- Use `preprocessSpeechInput` / `speechClean` for Voice AI & STT transcript cleaning.
- Use `AgentBridge` / MCP when integrating with agent runtimes.

