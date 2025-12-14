import type { QirrelContext } from "../types";
import { BaseLLMAdapter } from "./base";
import type { LLMConfig, LLMResponse } from "./types";

// Only import Google SDK dynamically when needed
type GoogleGenerativeAI = any;
type GenerativeModel = any;

export class GeminiLLMAdapter extends BaseLLMAdapter {
  private readonly apiKey: string;
  private genAI: GoogleGenerativeAI | null = null;

  constructor(config: LLMConfig, enableCache: boolean = true) {
    super(config, enableCache);
    this.apiKey = config.apiKey;
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
    // Dynamically import the Google SDK
    let GoogleGenerativeAI: any;
    try {
      // Use dynamic import to avoid compile-time dependency
      const genAIModule = await eval("import('@google/generative-ai')");
      GoogleGenerativeAI = genAIModule.GoogleGenerativeAI;
    } catch (error) {
      throw new Error(
        "Google Generative AI SDK not installed. Run: bun add @google/generative-ai"
      );
    }

    // Initialize the SDK if not already done
    if (!this.genAI) {
      this.genAI = new GoogleGenerativeAI(this.apiKey);
    }

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
}
