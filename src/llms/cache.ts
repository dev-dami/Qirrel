import type { LLMResponse } from "./types";

export interface CacheOptions {
  maxEntries?: number;
  ttl?: number;
}

export class LLMCache {
  private cache: Map<
    string,
    { response: LLMResponse; timestamp: number; ttl: number }
  >;
  private maxEntries: number;

  constructor(options: CacheOptions = {}) {
    this.cache = new Map();
    this.maxEntries = options.maxEntries || 1000;
  }

  public get(key: string): LLMResponse | undefined {
    const entry = this.cache.get(key);

    if (!entry) {
      return undefined;
    }

    // Check if the entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return undefined;
    }

    return entry.response;
  }

  public set(key: string, response: LLMResponse, ttl: number = 300000): void {
    if (this.cache.size >= this.maxEntries) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(key, {
      response,
      timestamp: Date.now(),
      ttl,
    });
  }

  public clear(): void {
    this.cache.clear();
  }

  public delete(key: string): boolean {
    return this.cache.delete(key);
  }

  public size(): number {
    return this.cache.size;
  }

  public has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) {
      return false;
    }

    // Check if the entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }
}
