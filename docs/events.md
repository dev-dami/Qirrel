# Pipeline Events

[Docs Home](./README.md) | [API](./api.md) | [Configuration](./configuration.md) | [Examples](./examples.md) | [Basic](./usage/basic.md) | [Caching](./usage/caching.md) | [LLM](./integrations/llm.md) | [Architecture](./walkthrough.md) | [Agent-Native](./agent-native.md) | [Benchmarks](./benchmarks.md) | [Ecosystem](./ecosystem-comparison.md)

`Pipeline` emits lifecycle events so you can instrument runs without modifying processors.

## Event Names

- `PipelineEvent.RunStart` (`run.start`)
- `PipelineEvent.RunEnd` (`run.end`)
- `PipelineEvent.ProcessorStart` (`processor.start`)
- `PipelineEvent.ProcessorEnd` (`processor.end`)
- `PipelineEvent.Error` (`error`)
- `PipelineEvent.LLMCall` (`llm.call`, currently reserved)

## Subscribe/Unsubscribe

```ts
import { Pipeline, PipelineEvent } from 'qirrel';

const pipeline = new Pipeline();

const onRunStart = ({ context }: any) => {
  console.log('run started', context.meta?.requestId);
};

pipeline.on(PipelineEvent.RunStart, onRunStart);
await pipeline.process('Contact support@example.com');
pipeline.off(PipelineEvent.RunStart, onRunStart);
```

## Payload Contracts

### `RunStart`

```ts
{ context: QirrelContext }
```

### `RunEnd`

```ts
{ context: QirrelContext, duration: number }
```

### `ProcessorStart`

```ts
{ processorName: string, context: QirrelContext }
```

### `ProcessorEnd`

```ts
{ processorName: string, context: QirrelContext, duration: number }
```

### `Error`

```ts
{ error: Error, context?: QirrelContext, stage?: 'run' | 'processor' | 'llm' }
```

## Error Semantics

- If an event handler throws, Qirrel logs the handler error and continues pipeline execution.
- If a processor throws during `process`, Qirrel emits `PipelineEvent.Error` and rethrows.

## Metrics Pattern

```ts
import { Pipeline, PipelineEvent } from 'qirrel';

const pipeline = new Pipeline();

pipeline.on(PipelineEvent.ProcessorEnd, ({ processorName, duration }: any) => {
  console.log(`[metric] processor=${processorName} duration_ms=${duration}`);
});

pipeline.on(PipelineEvent.Error, ({ error, stage }: any) => {
  console.error(`[metric] stage=${stage ?? 'unknown'} error=${error.message}`);
});
```

## Operational Guidance

- Keep handlers lightweight; handlers execute inside the request path.
- Avoid blocking I/O in high-volume paths.
- Prefer async fire-and-forget queueing if your telemetry backend is slow.
