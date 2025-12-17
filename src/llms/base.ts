import type { QirrelContext } from "../types";
import { DEFAULT_LLM_MODEL } from "../types";
import { LLMCache, GeneralCache } from "./cache";
import { DefaultFallbackHandler, type FallbackHandler } from "./fallback";
import type {
  LLMAdapter,
  LLMConfig,
  LLMResponse,
  LLMProcessorOptions,
} from "./types";

export abstract class BaseLLMAdapter implements LLMAdapter {
  protected config: LLMConfig;
  protected cache?: LLMCache;
  protected fallbackHandler: FallbackHandler;

  constructor(
    config: LLMConfig,
    enableCache: boolean = true,
    fallbackHandler?: FallbackHandler,
  ) {
    this.config = {
      ...config,
      temperature: config.temperature ?? 0.7,
      maxTokens: config.maxTokens ?? 1024,
      timeout: config.timeout ?? 30000,
    };

    if (enableCache) {
      this.cache = new LLMCache({
        maxEntries: config.maxTokens ? Math.floor(config.maxTokens / 10) : 100,
        ttl: 300000,
      });
    }

    this.fallbackHandler = fallbackHandler || new DefaultFallbackHandler();
  }

  public abstract generate(
    prompt: string,
    options?: Partial<LLMConfig>,
  ): Promise<LLMResponse>;

  public async generateWithContext(
    input: QirrelContext,
    promptTemplate: string,
    options?: Partial<LLMConfig>,
  ): Promise<QirrelContext> {
    try {
      const text = input.data?.text || "";
      const tokens = input.data?.tokens || [];
      const entities = input.data?.entities || [];

      const filledPrompt = promptTemplate
        .replace(/\{text\}/g, text)
        .replace(/\{tokens\}/g, tokens.map((t) => t.value).join(" "))
        .replace(
          /\{entities\}/g,
          entities.map((e) => `${e.type}:${e.value}`).join(", "),
        );

      const response = await this.generate(filledPrompt, options);

      // Store the response in the context
      return {
        ...input,
        data: {
          ...input.data,
          text: text,
          tokens: tokens,
          entities: entities,
          llmResponse: response
        }
      };
    } catch (error) {
      console.warn(
        `LLM processing failed in generateWithContext: ${error}`,
      );

      return input;
    }
  }

  protected mergeConfig(options?: Partial<LLMConfig>): LLMConfig {
    return {
      ...this.config,
      ...options,
    };
  }

  protected getCacheKey(prompt: string, config: LLMConfig): string {
    const model = config.model || DEFAULT_LLM_MODEL; // Use the same fallback as other call sites
    return `${prompt}|${model}|${config.temperature}|${config.maxTokens}`;
  }

  protected async generateWithCache(
    prompt: string,
    options?: Partial<LLMConfig>,
  ): Promise<LLMResponse> {
    const config = this.mergeConfig(options);
    const cacheKey = this.getCacheKey(prompt, config);

    if (this.cache) {
      const cachedResponse = this.cache.get(cacheKey);
      if (cachedResponse) {
        return cachedResponse;
      }
    }

    try {
      const response = await this.generate(prompt, options);

      if (this.cache) {
        const ttl = options?.timeout || 300000;
        this.cache.set(cacheKey, response, ttl);
      }

      return response;
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
}
