import type { PipelineComponent } from "../core/types";

export interface QirrelConfig {
  pipeline: {
    enableNormalization: boolean;
    enableCleaning: boolean;
    enableExtraction: boolean;
    enableSegmentation: boolean;
    enableAdvCleaning: boolean;
    enableSpeechClean?: boolean;
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
    cacheTtl?: number;
  };
}

/** Backward compatibility type alias */
export type MiniparseConfig = QirrelConfig;

export const defaultConfig: QirrelConfig = {
  pipeline: {
    enableNormalization: true,
    enableCleaning: true,
    enableExtraction: true,
    enableSegmentation: true,
    enableAdvCleaning: false,
    enableSpeechClean: false,
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
    cacheTtl: 300000,
  },
};

