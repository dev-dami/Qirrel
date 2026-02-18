import { LruCacheManager } from "../src/utils/cache/CacheManager";
import { SimpleLruCache } from "../src/utils/cache/cache";
import * as cacheIndex from "../src/utils/cache";

describe("cache utility modules", () => {
  test("simple lru cache evicts oldest entries at max size", () => {
    const cache = new SimpleLruCache({ maxEntries: 1, ttl: 10_000 });

    cache.set("a", 1);
    cache.set("b", 2);

    expect(cache.has("a")).toBe(false);
    expect(cache.get<number>("b")).toBe(2);
    expect(cache.maxSize()).toBe(1);
  });

  test("cache index exports managers", () => {
    expect(typeof cacheIndex.LruCacheManager).toBe("function");
    expect(typeof cacheIndex.createCachedComponent).toBe("function");
  });

  test("lru cache manager generateKey supports null and arrays", () => {
    const nullKey = LruCacheManager.generateKey("k", null);
    const arrayKey = LruCacheManager.generateKey("k", [1, 2, 3]);

    expect(nullKey).toContain("_null");
    expect(arrayKey).toContain("_array");
  });
});
