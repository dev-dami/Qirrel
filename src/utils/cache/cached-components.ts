import type { PipelineComponent } from "../../core/types";
import { LruCacheManager } from "./CacheManager";
import type { QirrelContext } from "../../types";

export interface ComponentCacheOptions {
  maxEntries?: number;
  ttl?: number;
}

/**
 * Creates a cached wrapper for a pipeline component
 */
export function createCachedComponent(
  component: PipelineComponent,
  cacheOptions: ComponentCacheOptions = {}
): PipelineComponent {
  const cacheManager = new LruCacheManager({
    maxEntries: cacheOptions.maxEntries || 1000,
    ttl: cacheOptions.ttl || 300000, // 5 minutes default
  });

  return {
    name: component.name,
    version: component.version || "1.0.0",
    cacheable: component.cacheable || false,
    run: async (ctx: QirrelContext): Promise<QirrelContext> => {
      // Only use caching if the component is marked as cacheable
      if (!component.cacheable) {
        return component.run(ctx);
      }

      // Generate a unique cache key based on the component name and context data
      const cacheKey = LruCacheManager.generateKey(
        component.name,
        getRelevantContextData(ctx),
      );

      // Try to get cached result
      const cachedResult = cacheManager.get<QirrelContext>(cacheKey);
      if (cachedResult) {
        return cloneContext(cachedResult);
      }

      // Run the original component
      const result = await component.run(ctx);

      // Cache the result
      cacheManager.set(cacheKey, cloneContext(result));

      return result;
    }
  };
}

/**
 * Extract relevant data from context for cache key generation
 * This avoids caching based on volatile data like timestamps and request IDs
 */
function getRelevantContextData(ctx: QirrelContext): any {
  return {
    text: ctx.data?.text,
    tokens: ctx.data?.tokens?.map(t => ({ value: t.value, type: t.type })),
    entities: ctx.data?.entities,
    model: ctx.llm?.model,
    temperature: ctx.llm?.temperature
  };
}

function cloneContext(context: QirrelContext): QirrelContext {
  if (typeof structuredClone === "function") {
    return structuredClone(context);
  }
  return JSON.parse(JSON.stringify(context)) as QirrelContext;
}
