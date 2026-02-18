import { GenericLLMAdapter } from "./generic";
import type { LLMAdapter, LLMConfig } from "./types";

async function loadModule(modulePath: string): Promise<Record<string, unknown>> {
  try {
    return require(modulePath) as Record<string, unknown>;
  } catch {
    return (await import(modulePath)) as Record<string, unknown>;
  }
}

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
          const { GeminiLLMAdapter } = (await loadModule("./gemini")) as {
            GeminiLLMAdapter: new (cfg: LLMConfig, useCache: boolean) => LLMAdapter;
          };
          return new GeminiLLMAdapter(config, enableCache);
        } catch (error) {
          throw new Error(
            `Gemini adapter failed to load: ${error}. Install @google/generative-ai to use Gemini: bun add @google/generative-ai`,
          );
        }
      case "openai":
      case "openai-compatible":
        {
          try {
            const { OpenAILLMAdapter } = (await loadModule("./openai")) as {
              OpenAILLMAdapter: new (cfg: LLMConfig, useCache: boolean) => LLMAdapter;
            };
            return new OpenAILLMAdapter(config, enableCache);
          } catch (err) {
            throw new Error(`Failed to load OpenAI adapter: ${err}`);
          }
        }
      case "generic":
        return new GenericLLMAdapter(config, "generic", enableCache);
      default:
        return new GenericLLMAdapter(config, provider, enableCache);
    }
  }
}
