import { createLLMEntityExtractor, createLLMProcessor } from "../src/llms/llm-processor";
import type { LLMAdapter, LLMConfig, LLMResponse } from "../src/llms/types";
import type { QirrelContext } from "../src/types";

describe("llm processor hardening", () => {
  test("processor returns original input when adapter returns malformed context", async () => {
    const adapter: LLMAdapter = {
      generate: async () => ({ content: "n/a" }),
      generateWithContext: async () => undefined as unknown as QirrelContext,
    };

    const component = createLLMProcessor({
      adapter,
      promptTemplate: "Analyze: {text}",
    });

    const input: QirrelContext = {
      data: {
        text: "hello",
        tokens: [],
        entities: [],
      },
    };

    const result = await component.run(input);

    expect(result).toBe(input);
  });

  test("entity extractor initializes missing entities and skips invalid ranges", async () => {
    const adapter: LLMAdapter = {
      generate: async (): Promise<LLMResponse> => ({
        content: JSON.stringify({
          entities: [
            { type: "bad-negative", value: "x", start: -1, end: 4 },
            { type: "bad-order", value: "y", start: 8, end: 3 },
            { type: "ok", value: "hello", start: 0, end: 5 },
          ],
        }),
      }),
      generateWithContext: async (inputContext: QirrelContext) => inputContext,
    };

    const component = createLLMEntityExtractor("Extract entities", adapter);
    const input = { data: { text: "hello world" } } as unknown as QirrelContext;

    const result = await component.run(input);

    expect(result.data?.entities).toEqual([
      {
        type: "ok",
        value: "hello",
        start: 0,
        end: 5,
      },
    ]);
  });

  test("entity extractor parses fenced json", async () => {
    const adapter: LLMAdapter = {
      generate: async (): Promise<LLMResponse> => ({
        content: "```json\n{\"entities\":[{\"type\":\"person\",\"value\":\"Ada\",\"start\":0,\"end\":3}]}\n```",
      }),
      generateWithContext: async (inputContext: QirrelContext) => inputContext,
    };

    const component = createLLMEntityExtractor("Extract entities", adapter);
    const input: QirrelContext = {
      data: {
        text: "Ada",
        tokens: [],
        entities: [],
      },
    };

    const result = await component.run(input);

    expect(result.data?.entities).toEqual([
      {
        type: "person",
        value: "Ada",
        start: 0,
        end: 3,
      },
    ]);
  });
});
