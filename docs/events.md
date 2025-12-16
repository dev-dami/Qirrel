# Pipeline Lifecycle Events

Qirrel provides a comprehensive event system that allows you to hook into the pipeline execution lifecycle. This enables powerful monitoring, debugging, and custom behavior capabilities.

## Available Events

- `PipelineEvent.RunStart` - Fired when the pipeline starts processing
- `PipelineEvent.RunEnd` - Fired when the pipeline completes processing
- `PipelineEvent.ProcessorStart` - Fired when a processor begins execution
- `PipelineEvent.ProcessorEnd` - Fired when a processor completes execution
- `PipelineEvent.LLMCall` - Fired when an LLM call is made (planned)
- `PipelineEvent.Error` - Fired when an error occurs during processing

## Usage Example

```typescript
import { Pipeline, PipelineEvent } from 'qirrel';

const pipeline = new Pipeline();

// Subscribe to pipeline events
pipeline.on(PipelineEvent.RunStart, (payload) => {
  console.log('Pipeline run started:', payload.context.meta?.requestId);
});

pipeline.on(PipelineEvent.RunEnd, (payload) => {
  console.log('Pipeline run ended:', {
    duration: payload.duration,
    entitiesCount: payload.context.data?.entities.length
  });
});

pipeline.on(PipelineEvent.ProcessorStart, (payload) => {
  console.log(`Starting processor: ${payload.processorName}`);
});

pipeline.on(PipelineEvent.ProcessorEnd, (payload) => {
  console.log(`Completed processor: ${payload.processorName} in ${payload.duration}ms`);
});

pipeline.on(PipelineEvent.Error, (payload) => {
  console.error('Pipeline error:', payload.error.message);
});

// Process text with event monitoring
const result = await pipeline.process("Hello world! This is a test email: test@example.com");

// Unsubscribe from events when no longer needed
const errorHandler = (payload) => {
  console.error('Specific error handler:', payload.error.message);
};

pipeline.on(PipelineEvent.Error, errorHandler);

// Later, remove the specific handler
pipeline.off(PipelineEvent.Error, errorHandler);
```

## Event Payloads

Each event includes specific payload data:

- `RunStartPayload`: Contains the initial context 
- `RunEndPayload`: Contains the final context and total duration
- `ProcessorStartPayload`: Contains processor name and current context
- `ProcessorEndPayload`: Contains processor name, context, and execution duration
- `ErrorPayload`: Contains error object, context, and stage information

## Use Cases

The event system is perfect for:

- **Monitoring**: Track pipeline performance and execution times
- **Debugging**: Log detailed information about pipeline execution
- **Analytics**: Collect metrics about processing patterns
- **Integration**: Connect with external systems like logging or alerting platforms
- **Custom Behavior**: Implement custom logic based on pipeline events