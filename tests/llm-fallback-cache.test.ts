import { GeneralCache, LLMCache } from "../src/llms/cache";
import {
  DefaultFallbackHandler,
  FallbackLLMAdapterWrapper,
  SimpleTextFallbackHandler,
} from "../src/llms/fallback";
import type { LLMConfig, LLMResponse } from "../src/llms/types";
import type { QirrelContext } from "../src/types";

describe("llm fallback and cache", () => {
  test("general cache supports get/set/delete/clear", () => {
    const cache = new GeneralCache({ maxEntries: 3, ttl: 1000 });

    cache.set("a", { value: 1 });
    cache.set("b", { value: 2 });

    expect(cache.has("a")).toBe(true);
    expect(cache.get<{ value: number }>("a")).toEqual({ value: 1 });
    expect(cache.size()).toBe(2);

    expect(cache.delete("a")).toBe(true);
    expect(cache.has("a")).toBe(false);

    cache.clear();
    expect(cache.size()).toBe(0);
  });

  test("llm cache stores typed responses", () => {
    const cache = new LLMCache({ maxEntries: 10, ttl: 1000 });
    const response: LLMResponse = {
      content: "ok",
      model: "test",
    };

    cache.set("k", response);

    expect(cache.get("k")).toEqual(response);
  });

  test("cache key generation is stable for equivalent objects", () => {
    const keyA = GeneralCache.generateKey("llm", { b: 2, a: 1 });
    const keyB = GeneralCache.generateKey("llm", { a: 1, b: 2 });

    expect(keyA).toBe(keyB);
  });

  test("default fallback includes error details and model override", async () => {
    const handler = new DefaultFallbackHandler();

    const result = await handler.handle(
      new Error("boom"),
      "Some long prompt content",
      { model: "fallback-model" } as Partial<LLMConfig>,
    );

    expect(result.model).toBe("fallback-model");
    expect(result.content).toContain("Error processing request: boom");
    expect(result.content).toContain("Original prompt was");
  });

  test("simple text fallback mirrors prompt", async () => {
    const handler = new SimpleTextFallbackHandler();

    const result = await handler.handle(new Error("x"), "Echo me");

    expect(result).toEqual({
      content: "Echo me",
      model: "fallback-text",
    });
  });

  test("fallback wrapper delegates to fallback on generation errors", async () => {
    const fallbackResult: LLMResponse = {
      content: "fallback",
      model: "fallback",
    };

    const primary = {
      generate: async () => {
        throw "string error";
      },
      generateWithContext: async (input: QirrelContext) => input,
    };

    const fallback = {
      handle: async () => fallbackResult,
    };

    const wrapper = new FallbackLLMAdapterWrapper(primary, fallback as any);

    await expect(wrapper.generate("prompt")).resolves.toEqual(fallbackResult);
  });

  test("fallback wrapper returns original context on context-processing failure", async () => {
    const input: QirrelContext = {
      data: {
        text: "hello",
        tokens: [],
        entities: [],
      },
    };

    const primary = {
      generate: async () => ({ content: "ok" }),
      generateWithContext: async () => {
        throw new Error("fail");
      },
    };

    const wrapper = new FallbackLLMAdapterWrapper(primary);

    const result = await wrapper.generateWithContext(input, "{text}");

    expect(result).toBe(input);
  });
});
