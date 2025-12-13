import { GenericLLMAdapter } from "./generic";
import type { LLMAdapter, LLMConfig } from "./types";

export class LLMAdapterFactory {
  static async create(
    config: LLMConfig,
    provider: string = "gemini",
    enableCache: boolean = true,
  ): Promise<LLMAdapter> {
    switch (provider.toLowerCase()) {
      case "gemini":
      case "google":
        try {
          const { GeminiLLMAdapter } = await import("./gemini.js");
          return new GeminiLLMAdapter(config, enableCache);
        } catch (error) {
          throw new Error(
            `Gemini adapter failed to load: ${error}. Install @google/generative-ai to use Gemini: bun add @google/generative-ai`,
          );
        }
      case "generic":
        return new GenericLLMAdapter(config, "generic", enableCache);
      default:
        return new GenericLLMAdapter(config, provider, enableCache);
    }
  }
}
