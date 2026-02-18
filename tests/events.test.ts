import { Pipeline, PipelineEvent } from '../src/index';

describe('Pipeline Events', () => {
  let pipeline: Pipeline;
  let events: any[];

  beforeEach(() => {
    pipeline = new Pipeline();
    events = [];
  });

  test('should emit RunStart and RunEnd events', async () => {
    pipeline.on(PipelineEvent.RunStart, (payload) => {
      events.push({ event: PipelineEvent.RunStart, payload });
    });

    pipeline.on(PipelineEvent.RunEnd, (payload) => {
      events.push({ event: PipelineEvent.RunEnd, payload });
    });

    const result = await pipeline.process("Hello world!");

    expect(events.length).toBe(2);
    expect(events[0].event).toBe(PipelineEvent.RunStart);
    expect(events[1].event).toBe(PipelineEvent.RunEnd);
    expect(events[1].payload.duration).toBeGreaterThanOrEqual(0);
    expect(events[1].payload.context.data?.text).toBe("Hello world!");
  });

  test('should emit ProcessorStart and ProcessorEnd events', async () => {
    pipeline.on(PipelineEvent.ProcessorStart, (payload) => {
      events.push({ event: PipelineEvent.ProcessorStart, payload });
    });

    pipeline.on(PipelineEvent.ProcessorEnd, (payload) => {
      events.push({ event: PipelineEvent.ProcessorEnd, payload });
    });

    await pipeline.process("Hello world!");

    // Should have at least one processor (tokenizer)
    expect(events.length).toBeGreaterThan(0);
    expect(events[0].event).toBe(PipelineEvent.ProcessorStart);
    expect(events[events.length - 1].event).toBe(PipelineEvent.ProcessorEnd);
  });

  test('should allow removing event listeners', async () => {
    const handler = jest.fn();
    pipeline.on(PipelineEvent.RunStart, handler);

    await pipeline.process("Hello world!");
    expect(handler).toHaveBeenCalledTimes(1);

    pipeline.off(PipelineEvent.RunStart, handler);
    await pipeline.process("Hello again!");
    expect(handler).toHaveBeenCalledTimes(1); // Should not be called again
  });

  test('should handle multiple event listeners', async () => {
    const handler1 = jest.fn();
    const handler2 = jest.fn();

    pipeline.on(PipelineEvent.RunStart, handler1);
    pipeline.on(PipelineEvent.RunStart, handler2);

    await pipeline.process("Hello world!");

    expect(handler1).toHaveBeenCalledTimes(1);
    expect(handler2).toHaveBeenCalledTimes(1);
  });

  test('should handle errors gracefully', async () => {
    const errorSpy = jest.fn();
    pipeline.on(PipelineEvent.Error, errorSpy);

    // Add a processor that throws an error - must be a PipelineComponent object
    pipeline.addCustomProcessor({
      name: "error-test-processor",
      version: "1.0.0",
      cacheable: false,
      run: (context) => {
        throw new Error("Test error");
      }
    });

    await expect(pipeline.process("Hello world!")).rejects.toThrow("Test error");
    expect(errorSpy).toHaveBeenCalledTimes(1);
  });

  test('should have correct event payload structure', async () => {
    let runStartPayload: any;
    let processorStartPayload: any;

    pipeline.on(PipelineEvent.RunStart, (payload) => {
      runStartPayload = payload;
    });

    pipeline.on(PipelineEvent.ProcessorStart, (payload) => {
      processorStartPayload = payload;
    });

    await pipeline.process("Hello world!");

    expect(runStartPayload).toBeDefined();
    expect(runStartPayload.context).toBeDefined();
    expect(runStartPayload.context.meta).toBeDefined();

    expect(processorStartPayload).toBeDefined();
    expect(processorStartPayload.processorName).toBeDefined();
    expect(processorStartPayload.context).toBeDefined();
  });

  test('should continue processing when one event handler throws', async () => {
    const successfulHandler = jest.fn();

    pipeline.on(PipelineEvent.RunStart, () => {
      throw new Error('observer failure');
    });
    pipeline.on(PipelineEvent.RunStart, successfulHandler);

    await expect(pipeline.process("Hello resilient pipeline!")).resolves.toBeDefined();
    expect(successfulHandler).toHaveBeenCalledTimes(1);
  });
});
