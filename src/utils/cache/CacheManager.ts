import type { LLMResponse } from '../../llms/types';
import type { QirrelContext } from '../../types';
import type { CacheOptions, CacheValue } from './types';
import { SimpleLruCache } from './cache';
import { createHash } from "crypto";

export class LruCacheManager extends SimpleLruCache {
  constructor(options: CacheOptions = {}) {
    super(options);
  }

  /**
   * Generate a hash key from input data for consistent cache key generation
   */
  public static generateKey(prefix: string, data: any): string {
    const stableData = this.stableStringify(data);
    const digest = createHash("sha256")
      .update(`${prefix}:${stableData}`)
      .digest("hex");
    const typeName =
      data === null
        ? "null"
        : Array.isArray(data)
          ? "array"
          : data?.constructor?.name || typeof data;
    return `${prefix}_${digest}_${typeName}`;
  }

  private static stableStringify(value: unknown): string {
    const seen = new WeakSet<object>();

    const normalize = (input: unknown): unknown => {
      if (input === null || typeof input !== "object") {
        return input;
      }

      if (Array.isArray(input)) {
        return input.map((entry) => normalize(entry));
      }

      const record = input as Record<string, unknown>;
      if (seen.has(record)) {
        return "[Circular]";
      }

      seen.add(record);
      const normalized: Record<string, unknown> = {};
      for (const key of Object.keys(record).sort()) {
        normalized[key] = normalize(record[key]);
      }
      seen.delete(record);
      return normalized;
    };

    return JSON.stringify(normalize(value));
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
