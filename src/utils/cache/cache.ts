import { LRUCache } from 'lru-cache';
import type { LLMResponse } from '../../llms/types';
import type { QirrelContext } from '../../types';

export interface CacheOptions {
  maxEntries?: number;
  ttl?: number; // Time to live in milliseconds
}

export type CacheValue = LLMResponse | QirrelContext | any;

export class SimpleLruCache {
  private cache: LRUCache<string, CacheValue>;

  constructor(options: CacheOptions = {}) {
    const maxEntries = options.maxEntries || 1000;
    const ttl = options.ttl || 300000; // 5 minutes default

    this.cache = new LRUCache<string, CacheValue>({
      max: maxEntries,
      ttl: ttl,
      ttlAutopurge: true,
    });
  }

  public get<T = CacheValue>(key: string): T | undefined {
    return this.cache.get(key) as T | undefined;
  }

  public set(key: string, value: CacheValue, ttl?: number): void {
    if (ttl !== undefined) {
      this.cache.set(key, value, { ttl });
    } else {
      this.cache.set(key, value);
    }
  }

  public has(key: string): boolean {
    return this.cache.has(key);
  }

  public delete(key: string): boolean {
    return this.cache.delete(key);
  }

  public clear(): void {
    this.cache.clear();
  }

  public size(): number {
    return this.cache.size;
  }

  public maxSize(): number {
    return this.cache.max;
  }
}