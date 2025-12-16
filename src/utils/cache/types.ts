import type { LLMResponse } from '../../llms/types';
import type { QirrelContext } from '../../types';

export interface CacheOptions {
  maxEntries?: number;
  ttl?: number; // Time to live in milliseconds
  maxSize?: number; // Maximum size in bytes (if applicable)
}

export type CacheValue = LLMResponse | QirrelContext | any;