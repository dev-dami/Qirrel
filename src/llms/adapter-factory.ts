import { GeminiLLMAdapter } from "./gemini";
import { GenericLLMAdapter } from "./generic";
import type { LLMAdapter, LLMConfig } from "./types";

export class LLMAdapterFactory {
  static create(
    config: LLMConfig,
    provider: string = "gemini",
    enableCache: boolean = true,
  ): LLMAdapter {
    switch (provider.toLowerCase()) {
      case "gemini":
      case "google":
        return new GeminiLLMAdapter(config, enableCache);
      case "generic":
        return new GenericLLMAdapter(config, "generic", enableCache);
      default:
        return new GenericLLMAdapter(config, provider, enableCache);
    }
  }
}
