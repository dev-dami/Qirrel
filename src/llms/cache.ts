import type { LLMResponse } from "./types";
import type { QirrelContext } from "../types";
import { LruCacheManager, LLMCacheManager as BaseLLMCacheManager } from "../utils/cache/CacheManager";
import type { CacheOptions, CacheValue } from "../utils/cache/types";

// Re-export the interface and types from the new cache manager
export type { CacheOptions, CacheValue };

export class GeneralCache {
  private cache: LruCacheManager;

  constructor(options: CacheOptions = {}) {
    this.cache = new LruCacheManager(options);
  }

  public get<T = CacheValue>(key: string): T | undefined {
    return this.cache.get<T>(key);
  }

  public set(key: string, value: CacheValue, ttl?: number): void {
    this.cache.set(key, value, ttl);
  }

  public clear(): void {
    this.cache.clear();
  }

  public delete(key: string): boolean {
    return this.cache.delete(key);
  }

  public size(): number {
    return this.cache.size();
  }

  public has(key: string): boolean {
    return this.cache.has(key);
  }

  /**
   * Generate a hash key from input data for consistent cache key generation
   */
  public static generateKey(prefix: string, data: any): string {
    return LruCacheManager.generateKey(prefix, data);
  }
}

export class LLMCache extends BaseLLMCacheManager {
  constructor(options: CacheOptions = {}) {
    super(options);
  }

  public get<T = LLMResponse>(key: string): T | undefined {
    return super.get<T>(key);
  }

  public set(key: string, value: LLMResponse, ttl?: number): void {
    super.set(key, value, ttl);
  }
}
