import { BaseLLMAdapter } from "./base";
import type { LLMConfig, LLMResponse } from "./types";
import https from "https";
import { URL } from "url";

export class GenericLLMAdapter extends BaseLLMAdapter {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly headers: Record<string, string>;

  constructor(config: LLMConfig, private providerName: string = "generic", enableCache: boolean = true) {
    super(config, enableCache);
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || "https://api.example.com/v1";

    // Default headers - can be customized per provider
    this.headers = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${this.apiKey}`,
    };
  }

  public async generate(prompt: string, options?: Partial<LLMConfig>): Promise<LLMResponse> {
    return this.generateWithCache(prompt, options, (config) =>
      this.makeAPICall(prompt, config),
    );
  }

  // Internal method to make the actual API call
  private async makeAPICall(prompt: string, options?: Partial<LLMConfig>): Promise<LLMResponse> {
    const config = this.mergeConfig(options);

    return new Promise((resolve, reject) => {
      const url = new URL(`${this.baseUrl}/completions`); // Generic endpoint

      const postData = this.buildRequestBody(prompt, config);

      const requestOptions = {
        hostname: url.hostname,
        port: url.port || 443,
        path: url.pathname + url.search,
        method: "POST",
        headers: {
          ...this.headers,
          "Content-Length": Buffer.byteLength(postData),
        },
      };

      // Set timeout
      const timeoutId = setTimeout(() => {
        req.destroy(new Error("Request timeout exceeded"));
      }, config.timeout);

      const req = https.request(requestOptions, (res) => {
        clearTimeout(timeoutId);

        let data = "";
        res.on("data", (chunk) => {
          data += chunk;
        });

        res.on("end", () => {
          try {
            const response = JSON.parse(data);

            if (res.statusCode && res.statusCode >= 400) {
              throw new Error(`API request failed with status ${res.statusCode}: ${data}`);
            }

            const processedResponse = this.processResponse(response, config);
            resolve(processedResponse);
          } catch (error) {
            reject(error);
          }
        });
      });

      req.on("error", (error) => {
        clearTimeout(timeoutId);
        reject(error);
      });

      req.write(postData);
      req.end();
    });
  }

  protected buildRequestBody(prompt: string, config: LLMConfig): string {
    // Default request body - can be overridden by specific providers
    return JSON.stringify({
      prompt: prompt,
      model: config.model || "default-model",
      temperature: config.temperature,
      max_tokens: config.maxTokens,
    });
  }

  protected processResponse(response: any, config: LLMConfig): LLMResponse {
    // Default response processing - can be overridden by specific providers
    return {
      content: response.choices?.[0]?.text || response.content || "",
      usage: {
        promptTokens: response.usage?.prompt_tokens,
        completionTokens: response.usage?.completion_tokens,
        totalTokens: response.usage?.total_tokens,
      },
      model: response.model || config.model,
    };
  }
}
