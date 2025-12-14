import type { Token } from "../core/Tokenizer";

export interface Entity {
  type: string;
  value: string;
  start: number;
  end: number;
}

// Canonical context following AGENTS.md specification
export interface MetaContext {
  requestId: string;
  timestamp: number;
  source?: 'http' | 'cli' | 'worker';
  trace?: Record<string, string>;
}

export interface MemoryContext {
  shortTerm?: unknown;
  longTerm?: unknown;
  cache?: Record<string, unknown>;
}

export interface LLMContext {
  model: string;
  temperature?: number;
  safety: {
    allowTools: boolean;
    redactions?: string[];
  };
}

export interface QirrelContext {
  meta: MetaContext;
  memory: MemoryContext;
  llm: LLMContext;
  data?: {
    text: string;
    tokens: Token[];
    entities: Entity[];
  };
}
