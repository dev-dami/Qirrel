import type { IntentResult } from "../types";

export interface LLMConfig {
  apiKey: string;
  model?: string | undefined;
  baseUrl?: string | undefined;
  temperature?: number | undefined;
  maxTokens?: number | undefined;
  timeout?: number | undefined;
}

export interface LLMResponse {
  content: string;
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
  model?: string;
}

export interface LLMAdapter {
  generate(prompt: string, options?: Partial<LLMConfig>): Promise<LLMResponse>;
  generateWithIntentResult(input: IntentResult, promptTemplate: string, options?: Partial<LLMConfig>): Promise<IntentResult>;
}

export interface LLMProcessorOptions {
  promptTemplate: string;
  adapter: LLMAdapter;
  config?: Partial<LLMConfig>;
}