import { LruCacheManager } from "../src/utils/cache/CacheManager";

describe("LruCacheManager.generateKey", () => {
  test("should not throw for null data", () => {
    expect(() => LruCacheManager.generateKey("prefix", null)).not.toThrow();
  });

  test("should produce stable keys for deeply equivalent objects", () => {
    const keyA = LruCacheManager.generateKey("prefix", {
      top: "value",
      nested: {
        a: 1,
        b: 2,
      },
    });

    const keyB = LruCacheManager.generateKey("prefix", {
      nested: {
        b: 2,
        a: 1,
      },
      top: "value",
    });

    expect(keyA).toBe(keyB);
  });
});
