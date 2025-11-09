import type { IntentResult } from "../types";
import { BaseLLMAdapter } from "./base";
import type { LLMConfig, LLMResponse } from "./types";

interface GenerationConfig {
  temperature?: number | undefined;
  maxOutputTokens?: number | undefined;
  topP?: number | undefined;
  topK?: number | undefined;
}

interface Part {
  text?: string | undefined;
  inlineData?:
    | {
        mimeType: string;
        data: string;
      }
    | undefined;
}

interface Content {
  role: string;
  parts: Part[];
}

interface GenerateContentRequest {
  contents: Content[];
  generationConfig?: GenerationConfig | undefined;
}

interface GenerateContentResponse {
  text(): string;
}

interface GenerateContentResult {
  response: GenerateContentResponse;
}

interface GenerativeModel {
  generateContent(
    request: GenerateContentRequest | string,
  ): Promise<GenerateContentResult>;
}

declare class GoogleGenerativeAI {
  constructor(apiKey: string);
  getGenerativeModel(params: { model: string }): GenerativeModel;
}

export class GeminiLLMAdapter extends BaseLLMAdapter {
  private readonly apiKey: string;
  private readonly genAI: GoogleGenerativeAI;

  constructor(config: LLMConfig, enableCache: boolean = true) {
    super(config, enableCache);
    this.apiKey = config.apiKey;
    this.genAI = new GoogleGenerativeAI(this.apiKey);
  }

  public async generate(
    prompt: string,
    options?: Partial<LLMConfig>,
  ): Promise<LLMResponse> {
    return this.generateWithCache(prompt, options);
  }

  private async makeAPICall(
    prompt: string,
    options?: Partial<LLMConfig>,
  ): Promise<LLMResponse> {
    const config = this.mergeConfig(options);
    const genModel = this.genAI.getGenerativeModel({
      model: config.model || "gemini-2.5-flash",
    });

    try {
      const result = await genModel.generateContent({
        contents: [
          {
            role: "user",
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: config.temperature,
          maxOutputTokens: config.maxTokens,
        },
      });

      const response = await result.response;
      const text = response.text();

      return {
        content: text,
        model: config.model || "gemini-2.5-flash",
      };
    } catch (error) {
      throw new Error(`Gemini API request failed: ${error}`);
    }
  }

  protected override parseResponseToIntentResult(
    input: IntentResult,
    response: LLMResponse,
  ): IntentResult {
    return input;
  }
}
