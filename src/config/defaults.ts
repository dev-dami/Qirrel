import type { PipelineComponent } from "../core/types";

export interface MiniparseConfig {
  pipeline: {
    enableNormalization: boolean;
    enableCleaning: boolean;
    enableExtraction: boolean;
    enableSegmentation: boolean;
    enableAdvCleaning: boolean;
  };
  tokenizer: {
    lowercase: boolean;
    mergeSymbols: boolean;
  };
  cache?: {
    maxEntries?: number;
    ttl?: number; // Time to live in milliseconds
  };
  speech: {
    removeFillerWords: boolean;
    detectRepetitions: boolean;
    findStutters: boolean;
  };
  extraction: {
    extractEmails: boolean;
    extractPhones: boolean;
    extractUrls: boolean;
    extractNumbers: boolean;
  };
  llm?: {
    enabled: boolean;
    provider: string;
    apiKey?: string;
    model?: string;
    baseUrl?: string;
    temperature?: number;
    maxTokens?: number;
    timeout?: number;
  };
}

export const defaultConfig: MiniparseConfig = {
  pipeline: {
    enableNormalization: true,
    enableCleaning: true,
    enableExtraction: true,
    enableSegmentation: true,
    enableAdvCleaning: false,
  },
  tokenizer: {
    lowercase: true,
    mergeSymbols: false,
  },
  cache: {
    maxEntries: 1000,
    ttl: 300000, // 5 minutes default
  },
  speech: {
    removeFillerWords: true,
    detectRepetitions: false,
    findStutters: false,
  },
  extraction: {
    extractEmails: true,
    extractPhones: true,
    extractUrls: true,
    extractNumbers: true,
  },
  llm: {
    enabled: false,
    provider: "gemini",
  },
};