import { BaseLLMAdapter } from "./base";
import type { LLMConfig, LLMResponse } from "./types";

export class OpenAILLMAdapter extends BaseLLMAdapter {
  private readonly apiKey: string;
  private readonly baseUrl: string;

  constructor(config: LLMConfig, enableCache: boolean = true) {
    super(config, enableCache);
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || "https://api.openai.com/v1";

    // Strictly validate baseUrl format
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(this.baseUrl);
    } catch (error) {
      throw new Error(`Invalid baseUrl: ${this.baseUrl}`);
    }

    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      throw new Error(`Invalid baseUrl: ${this.baseUrl}`);
    }
  }

  public async generate(
    prompt: string,
    options?: Partial<LLMConfig>,
  ): Promise<LLMResponse> {
    const config = this.mergeConfig(options);
    const cacheKey = this.getCacheKey(prompt, config);
    const ttl = options?.cacheTtl ?? config.cacheTtl ?? this.defaultCacheTtl;

    const cachedResponse = this.cache?.get(cacheKey);
    if (cachedResponse) {
      return cachedResponse;
    }

    const response = await this.makeAPICall(prompt, config);
    this.cache?.set(cacheKey, response, ttl);
    return response;
  }

  private async makeAPICall(
    prompt: string,
    config: LLMConfig,
  ): Promise<LLMResponse> {
    const requestBody = {
      model: config.model || "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: config.temperature,
      max_tokens: config.maxTokens,
    };

    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    try {
      const controller = new AbortController();
      const fetchOptions: RequestInit = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      };

      const fetchPromise = fetch(
        `${this.baseUrl}/chat/completions`,
        fetchOptions,
      );

      const response = await this.withTimeout(
        fetchPromise,
        config.timeout,
        controller,
        (id) => {
          timeoutId = id;
        },
      );

      if (!response || typeof response.ok !== "boolean") {
        throw new Error("OpenAI API returned an invalid response object");
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }

      const data = await response.json();

      const content = data.choices?.[0]?.message?.content;
      if (content == null) {
        console.error('OpenAI API returned unexpected response structure:', data);
        throw new Error('OpenAI API returned no content in response');
      }

      return {
        content,
        usage: {
          promptTokens: data.usage?.prompt_tokens,
          completionTokens: data.usage?.completion_tokens,
          totalTokens: data.usage?.total_tokens,
        },
        model: data.model,
      };
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`Request timed out after ${config.timeout} ms`);
      }

      // Sanitize the error to prevent leaking sensitive data
      if (error instanceof Error) {
        // Log the full error for internal debugging purposes (not exposed to users)
        console.error('OpenAI API request failed:', error);

        // Throw a sanitized error without sensitive details
        throw new Error(`OpenAI API request failed: ${error.name} - ${error.message}`);
      } else {
        // Handle non-Error objects
        console.error('OpenAI API request failed:', error);
        throw new Error('OpenAI API request failed');
      }
    } finally {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
    }
  }

  private async withTimeout<T>(
    promise: Promise<T>,
    timeoutMs: number | undefined,
    controller: AbortController,
    setTimerId: (id: ReturnType<typeof setTimeout>) => void,
  ): Promise<T> {
    if (!timeoutMs || timeoutMs <= 0) {
      return promise;
    }

    return Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        const timeoutId = setTimeout(() => {
          controller.abort();
          reject(new Error(`Request timed out after ${timeoutMs} ms`));
        }, timeoutMs);
        setTimerId(timeoutId);
      }),
    ]);
  }
}
