import { EventEmitter } from "node:events";
import https from "https";
import { GeminiLLMAdapter } from "../src/llms/gemini";
import { GenericLLMAdapter } from "../src/llms/generic";
import type { LLMConfig } from "../src/llms/types";

type MockRequest = EventEmitter & {
  write: jest.Mock;
  end: jest.Mock;
  destroy: jest.Mock;
};

describe("generic and gemini adapters", () => {
  const config: LLMConfig = {
    apiKey: "test-key",
    model: "test-model",
    timeout: 50,
    temperature: 0.3,
    maxTokens: 20,
  };

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("generic adapter sends request and parses successful responses", async () => {
    const requestSpy = jest
      .spyOn(https, "request")
      .mockImplementation((options: any, callback: any) => {
        const req = new EventEmitter() as MockRequest;
        req.write = jest.fn();
        req.destroy = jest.fn((error?: Error) => {
          if (error) {
            req.emit("error", error);
          }
        });
        req.end = jest.fn(() => {
          const res = new EventEmitter() as EventEmitter & { statusCode?: number };
          res.statusCode = 200;
          callback(res);
          res.emit(
            "data",
            JSON.stringify({
              choices: [{ text: "generic reply" }],
              usage: {
                prompt_tokens: 1,
                completion_tokens: 2,
                total_tokens: 3,
              },
              model: "generic-model",
            }),
          );
          res.emit("end");
        });
        return req;
      });

    const adapter = new GenericLLMAdapter(config, "generic", false);

    const result = await adapter.generate("hello world");

    expect(result).toEqual({
      content: "generic reply",
      usage: {
        promptTokens: 1,
        completionTokens: 2,
        totalTokens: 3,
      },
      model: "generic-model",
    });

    expect(requestSpy).toHaveBeenCalledTimes(1);
    expect(requestSpy.mock.calls[0]?.[0]).toMatchObject({
      hostname: "api.example.com",
      method: "POST",
    });
  });

  test("generic adapter falls back on HTTP errors", async () => {
    jest.spyOn(https, "request").mockImplementation((_: any, callback: any) => {
      const req = new EventEmitter() as MockRequest;
      req.write = jest.fn();
      req.destroy = jest.fn();
      req.end = jest.fn(() => {
        const res = new EventEmitter() as EventEmitter & { statusCode?: number };
        res.statusCode = 500;
        callback(res);
        res.emit("data", JSON.stringify({ error: "downstream error" }));
        res.emit("end");
      });
      return req;
    });

    const adapter = new GenericLLMAdapter(config, "generic", false);

    const result = await adapter.generate("hello world");

    expect(result.model).toBe("fallback");
    expect(result.content).toContain("API request failed with status 500");
  });

  test("generic adapter can build request payload", () => {
    const adapter = new GenericLLMAdapter(config, "generic", false);

    const payload = JSON.parse(
      (adapter as any).buildRequestBody("sample", {
        ...config,
        model: "custom",
      }),
    );

    expect(payload).toMatchObject({
      prompt: "sample",
      model: "custom",
      temperature: 0.3,
      max_tokens: 20,
    });
  });

  test("gemini adapter falls back when SDK import fails", async () => {
    const evalSpy = jest
      .spyOn(globalThis, "eval")
      .mockRejectedValue(new Error("module missing"));

    const adapter = new GeminiLLMAdapter(config, false);
    const result = await adapter.generate("hello world");

    expect(evalSpy).toHaveBeenCalled();
    expect(result.model).toBe("fallback");
    expect(result.content).toContain("Google Generative AI SDK not installed");
  });

  test("gemini adapter returns model output when SDK is available", async () => {
    const generateContent = jest.fn().mockResolvedValue({
      response: Promise.resolve({
        text: () => "gemini reply",
      }),
    });

    class FakeGoogleGenerativeAI {
      constructor(_: string) {}

      getGenerativeModel() {
        return {
          generateContent,
        };
      }
    }

    jest
      .spyOn(globalThis, "eval")
      .mockResolvedValue({ GoogleGenerativeAI: FakeGoogleGenerativeAI });

    const adapter = new GeminiLLMAdapter(config, false);
    const result = await adapter.generate("hello world", { model: "gemini-x" });

    expect(result).toEqual({
      content: "gemini reply",
      model: "gemini-x",
    });
    expect(generateContent).toHaveBeenCalledTimes(1);
  });
});
