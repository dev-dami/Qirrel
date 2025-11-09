import type { IntentResult } from "../types";
import type { LLMResponse, LLMConfig } from "./types";

export interface FallbackHandler {
  handle(
    error: Error,
    originalPrompt: string,
    config?: Partial<LLMConfig>,
  ): Promise<LLMResponse>;
}

export class DefaultFallbackHandler implements FallbackHandler {
  async handle(
    error: Error,
    originalPrompt: string,
    config?: Partial<LLMConfig>,
  ): Promise<LLMResponse> {
    console.warn(
      `LLM request failed: ${error.message}. Using fallback response.`,
    );

    const fallbackContent = `Error processing request: ${error.message}. Original prompt was: ${originalPrompt ? originalPrompt.substring(0, 100) : "N/A"}...`;
    return {
      content: fallbackContent,
      model: config?.model || "fallback",
    };
  }
}

export class SimpleTextFallbackHandler implements FallbackHandler {
  async handle(
    error: Error,
    originalPrompt: string,
    config?: Partial<LLMConfig>,
  ): Promise<LLMResponse> {
    console.warn(
      `LLM request failed: ${error.message}. Using simple text fallback.`,
    );

    return {
      content: originalPrompt || "",
      model: "fallback-text",
    };
  }
}

export class FallbackLLMAdapterWrapper {
  constructor(
    private primaryAdapter: any,
    private fallbackHandler: FallbackHandler = new DefaultFallbackHandler(),
  ) {}

  async generate(
    prompt: string,
    options?: Partial<LLMConfig>,
  ): Promise<LLMResponse> {
    try {
      return await this.primaryAdapter.generate(prompt, options);
    } catch (error) {
      if (error instanceof Error) {
        return this.fallbackHandler.handle(error, prompt, options);
      } else {
        return this.fallbackHandler.handle(
          new Error(String(error)),
          prompt,
          options,
        );
      }
    }
  }

  async generateWithIntentResult(
    input: IntentResult,
    promptTemplate: string,
    options?: Partial<LLMConfig>,
  ): Promise<IntentResult> {
    try {
      return await this.primaryAdapter.generateWithIntentResult(
        input,
        promptTemplate,
        options,
      );
    } catch (error) {
      console.warn(`LLM processing failed in wrapper: ${error}`);
      return input;
    }
  }
}
