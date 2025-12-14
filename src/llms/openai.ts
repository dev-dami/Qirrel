import type { QirrelContext } from "../types";
import { BaseLLMAdapter } from "./base";
import type { LLMConfig, LLMResponse } from "./types";

export class OpenAILLMAdapter extends BaseLLMAdapter {
  private readonly apiKey: string;
  private readonly baseUrl: string;

  constructor(config: LLMConfig, enableCache: boolean = true) {
    super(config, enableCache);
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || "https://api.openai.com/v1";
  }

  public async generate(
    prompt: string,
    options?: Partial<LLMConfig>,
  ): Promise<LLMResponse> {
    const config = this.mergeConfig(options);

    const requestBody = {
      model: config.model || "gpt-3.5-turbo",
      messages: [
        { role: "user", content: prompt }
      ],
      temperature: config.temperature,
      max_tokens: config.maxTokens,
    };

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }

      const data = await response.json();

      return {
        content: data.choices[0]?.message?.content || "",
        usage: {
          promptTokens: data.usage?.prompt_tokens,
          completionTokens: data.usage?.completion_tokens,
          totalTokens: data.usage?.total_tokens,
        },
        model: data.model,
      };
    } catch (error) {
      throw new Error(`OpenAI API request failed: ${error}`);
    }
  }
}