import {
  createLLMIntentClassifier,
  createLLMSentimentAnalyzer,
  createLLMSummarizer,
  createLLMTextEnhancer,
  createLLMTopicClassifier,
} from "../src/llms/llm-components";
import type { LLMAdapter, LLMConfig, LLMResponse } from "../src/llms/types";
import type { QirrelContext } from "../src/types";

class QueueAdapter implements LLMAdapter {
  constructor(private readonly responses: string[]) {}

  async generate(): Promise<LLMResponse> {
    return {
      content: this.responses.shift() ?? "",
      model: "test-model",
    };
  }

  async generateWithContext(input: QirrelContext): Promise<QirrelContext> {
    return input;
  }
}

describe("llm components hardening", () => {
  const baseContext = (text: string): QirrelContext =>
    ({
      data: {
        text,
        tokens: [],
        entities: [],
      },
    });

  test("summarizer initializes missing entities array before pushing", async () => {
    const adapter = new QueueAdapter(["Short summary"]);
    const component = createLLMSummarizer(adapter, {} as Partial<LLMConfig>, 10);
    const input = { data: { text: "Very long text" } } as unknown as QirrelContext;

    const result = await component.run(input);

    expect(result.data?.entities).toEqual([
      {
        type: "summary",
        value: "Short summary",
        start: 0,
        end: 13,
      },
    ]);
  });

  test("sentiment analyzer initializes missing entities array", async () => {
    const adapter = new QueueAdapter(["positive"]);
    const component = createLLMSentimentAnalyzer(adapter);
    const input = { data: { text: "Great day" } } as unknown as QirrelContext;

    const result = await component.run(input);

    expect(result.data?.entities).toEqual([
      {
        type: "sentiment",
        value: "positive",
        start: 0,
        end: "Great day".length,
      },
    ]);
  });

  test("topic classifier appends multiple topics", async () => {
    const adapter = new QueueAdapter(["finance, ai"]);
    const component = createLLMTopicClassifier(adapter);
    const input = baseContext("Market update");

    const result = await component.run(input);

    expect(result.data?.entities.map((entity) => entity.value)).toEqual(["finance", "ai"]);
  });

  test("intent classifier only appends allowed intents", async () => {
    const adapter = new QueueAdapter(["book_flight", "something_else"]);
    const component = createLLMIntentClassifier(adapter, ["book_flight", "cancel_flight"]);
    const input = baseContext("I need a flight");

    await component.run(input);
    await component.run(input);

    expect(input.data?.entities).toHaveLength(1);
    expect(input.data?.entities[0]?.value).toBe("book_flight");
  });

  test("text enhancer updates text from model output", async () => {
    const adapter = new QueueAdapter(["Improved text"]);
    const component = createLLMTextEnhancer(adapter);
    const input = baseContext("Bad text");

    const result = await component.run(input);

    expect(result.data?.text).toBe("Improved text");
  });
});
