import type { LLMResponse } from '../../llms/types';
import type { QirrelContext } from '../../types';
import type { CacheOptions, CacheValue } from './types';
import { SimpleLruCache } from './cache';

export class LruCacheManager extends SimpleLruCache {
  constructor(options: CacheOptions = {}) {
    super(options);
  }

  /**
   * Generate a hash key from input data for consistent cache key generation
   */
  public static generateKey(prefix: string, data: any): string {
    const stringifiedData = JSON.stringify(data, Object.keys(data).sort());
    // Simple hash function to create a consistent key from data
    let hash = 0;
    const str = prefix + stringifiedData;

    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0; // Convert to 32bit integer
    }

    return `${prefix}_${Math.abs(hash).toString(36)}_${data.constructor?.name || typeof data}`;
  }
}

// Export specific cache classes for different use cases
export class LLMCacheManager extends SimpleLruCache {
  constructor(options: CacheOptions = {}) {
    super(options);
  }

  get<T = LLMResponse>(key: string): T | undefined {
    return super.get<T>(key);
  }

  set(key: string, value: LLMResponse, ttl?: number): void {
    super.set(key, value, ttl);
  }
}

export class ContextCacheManager extends SimpleLruCache {
  constructor(options: CacheOptions = {}) {
    super(options);
  }

  get<T = QirrelContext>(key: string): T | undefined {
    return super.get<T>(key);
  }

  set(key: string, value: QirrelContext, ttl?: number): void {
    super.set(key, value, ttl);
  }
}