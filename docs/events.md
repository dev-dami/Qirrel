# Pipeline Events

[Docs Home](./README.md) | [API](./api.md) | [Configuration](./configuration.md) | [Examples](./examples.md) | [Basic](./usage/basic.md) | [Caching](./usage/caching.md) | [LLM](./integrations/llm.md) | [Architecture](./walkthrough.md)

Qirrel exposes lifecycle events on `Pipeline` so you can monitor execution, collect metrics, and handle failures without modifying core processors.

## Event Names

- `PipelineEvent.RunStart` (`run.start`)
- `PipelineEvent.RunEnd` (`run.end`)
- `PipelineEvent.ProcessorStart` (`processor.start`)
- `PipelineEvent.ProcessorEnd` (`processor.end`)
- `PipelineEvent.Error` (`error`)
- `PipelineEvent.LLMCall` (`llm.call`, reserved for LLM-specific instrumentation)

## Subscribe and Unsubscribe

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

## Typical Payload Shapes

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

## Production Notes

- Event handlers run inside pipeline execution. Keep handlers lightweight.
- Handler failures are logged and do not stop pipeline execution.
- Use `duration` from `RunEnd` and `ProcessorEnd` for latency metrics.

## Metrics Example

```ts
import { Pipeline, PipelineEvent } from 'qirrel';

const pipeline = new Pipeline();

pipeline.on(PipelineEvent.ProcessorEnd, ({ processorName, duration }: any) => {
  console.log(`[metric] processor=${processorName} duration_ms=${duration}`);
});

pipeline.on(PipelineEvent.Error, ({ error, stage }: any) => {
  console.error(`[metric] stage=${stage ?? 'unknown'} error=${error.message}`);
});

await pipeline.process('Visit https://example.com and call +1 415 555 2671');
```
