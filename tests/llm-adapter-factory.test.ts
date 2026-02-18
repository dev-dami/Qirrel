import { LLMAdapterFactory } from "../src/llms/adapter-factory";
import { GenericLLMAdapter } from "../src/llms/generic";

describe("llm adapter factory", () => {
  const config = {
    apiKey: "test-key",
    model: "test-model",
  };

  test("creates generic adapter for explicit generic provider", async () => {
    const adapter = await LLMAdapterFactory.create(config, "generic", false);

    expect(adapter).toBeInstanceOf(GenericLLMAdapter);
  });

  test("creates generic adapter for unknown providers", async () => {
    const adapter = await LLMAdapterFactory.create(config, "my-provider", false);

    expect(adapter).toBeInstanceOf(GenericLLMAdapter);
  });

  test("loads openai adapter", async () => {
    const adapter = await LLMAdapterFactory.create(config, "openai", false);

    expect(adapter.constructor.name.toLowerCase()).toContain("openai");
  });

  test("loads gemini adapter", async () => {
    const adapter = await LLMAdapterFactory.create(config, "gemini", false);

    expect(adapter.constructor.name.toLowerCase()).toContain("gemini");
  });
});
