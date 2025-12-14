import type { Token } from "../core/Tokenizer";

export interface Entity {
  type: string;
  value: string;
  start: number;
  end: number;
}

// Canonical context for operational and request-scoped data
export interface MetaContext {
  requestId?: string;
  timestamp?: number;
  source?: "http" | "cli" | "worker"; // Source of the request
  trace?: Record<string, string>;
}

export interface MemoryContext {
  shortTerm?: unknown; // Transient memory for the current session
  longTerm?: unknown; // Persistent memory across sessions
  cache?: Record<string, unknown>; // Cached data for performance
}

export interface LLMContext {
  model?: string; // LLM model identifier
  temperature?: number; // Temperature setting for generation (0.0-1.0)
  safety?: {
    allowTools: boolean; // Whether to allow tool usage - required field within safety
    redactions?: string[];
  };
}

export interface QirrelContext {
  meta?: MetaContext;
  memory?: MemoryContext;
  llm?: LLMContext;
  data?: {
    text: string;
    tokens: Token[];
    entities: Entity[];
  };
}

/**
 * Factory function to create a QirrelContext with default values
 * @param data - The text processing data to include in the context
 * @returns A QirrelContext with sensible defaults
 */
export function createQirrelContext(data?: QirrelContext['data']): QirrelContext {
  return {
    meta: {
      requestId: 'req_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
      timestamp: Date.now(),
    },
    memory: {
      cache: {}
    },
    llm: {
      model: 'gemini-2.5-flash',
      safety: {
        allowTools: true
      }
    },
    data: data || {
      text: '',
      tokens: [],
      entities: []
    }
  };
}
