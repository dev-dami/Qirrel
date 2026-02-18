import { Tokenizer } from "./Tokenizer";
import { LruCacheManager } from "../utils/cache/CacheManager";
import { createCachedComponent } from "../utils/cache/cached-components";
import {
  clean,
  extract,
  normalize,
  segment,
  extractEmailsOnly,
  extractPhonesOnly,
  extractUrlsOnly,
  extractNumbersOnly,
  advClean,
} from "../processors";
import { LLMAdapterFactory } from "../llms";
import type { LLMAdapter } from "../llms";
import { createQirrelContext, type Entity, type QirrelContext } from "../types";
import type { PipelineComponent, EventHandler } from "./types";
import { PipelineEvent } from "./Events";
import { ConfigLoader } from "../config/loader";
import type { MiniparseConfig } from "../config/defaults";
import { createHash } from "crypto";

export class Pipeline {
  private readonly components: PipelineComponent[] = [];
  private readonly tokenizer: Tokenizer;
  private readonly config: MiniparseConfig;
  private readonly cacheManager: LruCacheManager;
  private llmAdapter?: LLMAdapter;
  private llmInitPromise: Promise<void> | null = null;
  private eventHandlers: Map<PipelineEvent, Set<EventHandler>> = new Map();

  constructor(configPath?: string) {
    this.config = ConfigLoader.loadConfig(configPath);

    this.tokenizer = new Tokenizer({
      lowercase: this.config.tokenizer.lowercase,
      mergeSymbols: this.config.tokenizer.mergeSymbols,
    });

    // Initialize cache manager with configuration
    const cacheOptions = {
      maxEntries: this.config.cache?.maxEntries || 1000,
      ttl: this.config.cache?.ttl || 300000, // 5 minutes default
    };
    this.cacheManager = new LruCacheManager(cacheOptions);

    // Conditionally add components with caching
    if (this.config.pipeline.enableNormalization) this.use(this.wrapComponentWithCache(normalize));
    if (this.config.pipeline.enableCleaning) this.use(this.wrapComponentWithCache(clean));
    if (this.config.pipeline.enableAdvCleaning) this.use(this.wrapComponentWithCache(advClean));

    if (this.config.pipeline.enableExtraction) {
      if (this.config.extraction.extractEmails) this.use(this.wrapComponentWithCache(extractEmailsOnly));
      if (this.config.extraction.extractPhones) this.use(this.wrapComponentWithCache(extractPhonesOnly));
      if (this.config.extraction.extractUrls) this.use(this.wrapComponentWithCache(extractUrlsOnly));
      if (this.config.extraction.extractNumbers) this.use(this.wrapComponentWithCache(extractNumbersOnly));
    }

    if (this.config.pipeline.enableSegmentation) this.use(this.wrapComponentWithCache(segment));

    // Initialize LLM adapter if LLM functionality is enabled
    if (this.config.llm?.enabled && this.config.llm.apiKey) {
      // Initialize LLM adapter asynchronously and track the promise
      this.llmInitPromise = LLMAdapterFactory.create(
        {
          apiKey: this.config.llm.apiKey, // This is guaranteed to exist due to the condition above
          model: this.config.llm.model || "gemini-2.5-flash", // Provide default model
          baseUrl: this.config.llm.baseUrl,
          temperature: this.config.llm.temperature,
          maxTokens: this.config.llm.maxTokens,
          timeout: this.config.llm.timeout,
          cacheTtl: this.config.llm.cacheTtl,
        },
        this.config.llm.provider,
      ).then(adapter => {
        this.llmAdapter = adapter;
      }).catch(error => {
        console.warn("Failed to initialize LLM adapter:", error);
        // Even on error, resolve the promise so the pipeline can continue
      });
    }
  }

  /**
   * Subscribe to pipeline events
   */
  public on(event: PipelineEvent, handler: EventHandler): this {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    this.eventHandlers.get(event)!.add(handler);
    return this;
  }

  /**
   * Unsubscribe from pipeline events
   */
  public off(event: PipelineEvent, handler: EventHandler): this {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.delete(handler);
      // Clean up the map if no handlers remain for this event
      if (handlers.size === 0) {
        this.eventHandlers.delete(event);
      }
    }
    return this;
  }

  /**
   * Emit an event with optional payload
   */
  private async emit(event: PipelineEvent, payload?: any): Promise<void> {
    const handlers = this.eventHandlers.get(event);
    if (handlers && handlers.size > 0) {
      for (const handler of handlers) {
        try {
          await handler(payload);
        } catch (error) {
          console.error(`Error in event handler for ${event}:`, error);
        }
      }
    }
  }

  public use(component: PipelineComponent): this {
    this.components.push(component);
    return this;
  }

  public async init(): Promise<void> {
    if (this.llmInitPromise) {
      await this.llmInitPromise;
    }
  }

  public async process(text: string): Promise<QirrelContext> {
    // Check if result is already cached
    if (this.config.cache && this.config.cache.maxEntries !== 0) { // Only check cache if caching is not disabled
      const cachedResult = this.getCached(text);
      if (cachedResult) {
        const clonedCachedResult = this.cloneContext(cachedResult);
        // Return cached result if available
        await this.emit(PipelineEvent.RunStart, { context: clonedCachedResult });
        await this.emit(PipelineEvent.RunEnd, {
          context: clonedCachedResult,
          duration: 0
        });
        return clonedCachedResult;
      }
    }

    // Wait for LLM initialization if needed before processing
    if (this.llmInitPromise) {
      await this.llmInitPromise;
    }

    const startTime = Date.now();

    // Tokenize and add to context
    const tokens = this.tokenizer.tokenize(text);
    let contextWithText: QirrelContext = createQirrelContext(
      {
        text,
        tokens,
        entities: []
      },
      this.config.llm?.model || 'gemini-2.5-flash',
    );
    contextWithText.meta = {
      ...contextWithText.meta,
      source: 'cli',
    };

    // Emit run start event
    await this.emit(PipelineEvent.RunStart, { context: contextWithText });

    let resultContext: QirrelContext = contextWithText;

    try {
      for (const component of this.components) {
        const componentStartTime = Date.now();

        // Get the component name from metadata
        const componentName = component.name;

        // Emit processor start event
        await this.emit(PipelineEvent.ProcessorStart, {
          processorName: componentName,
          context: resultContext
        });

        resultContext = await component.run(resultContext);

        const componentDuration = Date.now() - componentStartTime;

        // Emit processor end event
        await this.emit(PipelineEvent.ProcessorEnd, {
          processorName: componentName,
          context: resultContext,
          duration: componentDuration
        });
      }

      const totalDuration = Date.now() - startTime;

      // Cache the result if caching is enabled
      if (this.config.cache && this.config.cache.maxEntries !== 0) {
        this.setCached(text, resultContext);
      }

      // Emit run end event
      await this.emit(PipelineEvent.RunEnd, {
        context: resultContext,
        duration: totalDuration
      });

      return resultContext;
    } catch (error) {
      // Emit error event
      await this.emit(PipelineEvent.Error, {
        error: error instanceof Error ? error : new Error(String(error)),
        context: resultContext,
        stage: 'run'
      });

      throw error;
    }
  }

  public getConfig(): MiniparseConfig {
    return this.config;
  }

  public addCustomProcessor(component: PipelineComponent): this {
    this.components.push(component);
    return this;
  }

  public getLLMAdapter(): LLMAdapter | undefined {
    return this.llmAdapter;
  }

  public addLLMProcessor(processor: PipelineComponent): this {
    this.components.push(processor);
    return this;
  }

  /**
   * Get the cache manager instance
   */
  public getCacheManager(): LruCacheManager {
    return this.cacheManager;
  }

  /**
   * Check if a result is cached for the given text
   */
  public isCached(text: string): boolean {
    const cacheKey = this.generateCacheKey(text);
    return this.cacheManager.has(cacheKey);
  }

  /**
   * Get cached result for the given text
   */
  public getCached(text: string): QirrelContext | undefined {
    const cacheKey = this.generateCacheKey(text);
    const cached = this.cacheManager.get<QirrelContext>(cacheKey);
    return cached ? this.cloneContext(cached) : undefined;
  }

  /**
   * Cache a result for the given text
   */
  public setCached(text: string, result: QirrelContext, ttl?: number): void {
    const cacheKey = this.generateCacheKey(text);
    this.cacheManager.set(cacheKey, this.cloneContext(result), ttl);
  }

  public async processBatch(
    texts: string[],
    options: { concurrency?: number } = {},
  ): Promise<QirrelContext[]> {
    if (!Array.isArray(texts)) {
      throw new TypeError("processBatch expects an array of text inputs");
    }

    if (texts.length === 0) {
      return [];
    }

    if (texts.some((text) => typeof text !== "string")) {
      throw new TypeError("processBatch expects all inputs to be strings");
    }

    const concurrency = options.concurrency ?? Math.min(4, texts.length);
    if (!Number.isInteger(concurrency) || concurrency <= 0) {
      throw new RangeError("processBatch concurrency must be a positive integer");
    }

    const results: QirrelContext[] = new Array(texts.length);
    let cursor = 0;

    const worker = async (): Promise<void> => {
      while (true) {
        const index = cursor++;
        if (index >= texts.length) {
          return;
        }
        results[index] = await this.process(texts[index]!);
      }
    };

    await Promise.all(
      Array.from({ length: Math.min(concurrency, texts.length) }, () => worker()),
    );

    return results;
  }

  /**
   * Wrap a component with caching if it's cacheable and caching is enabled
   */
  private wrapComponentWithCache(component: PipelineComponent): PipelineComponent {
    // Only wrap with caching if the component is cacheable and caching is enabled
    if (component.cacheable && this.config.cache && this.config.cache.maxEntries !== 0) {
      return createCachedComponent(component, {
        maxEntries: this.config.cache.maxEntries ?? 1000,
        ttl: this.config.cache.ttl ?? 300000,
      });
    }
    return component;
  }

  /**
   * Generate a cache key for the given text
   */
  private generateCacheKey(text: string): string {
    const digest = createHash("sha256").update(text).digest("hex");
    return `pipeline_result_${digest}`;
  }

  private cloneContext(context: QirrelContext): QirrelContext {
    if (typeof structuredClone === "function") {
      return structuredClone(context);
    }
    return JSON.parse(JSON.stringify(context)) as QirrelContext;
  }
}
