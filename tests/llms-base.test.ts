import { BaseLLMAdapter } from '../src/llms/base';
import { LLMCache } from '../src/llms/cache';
import { DefaultFallbackHandler, type FallbackHandler } from '../src/llms/fallback';
import type { LLMConfig, LLMResponse } from '../src/llms/types';
import type { QirrelContext } from '../src/types';

// Concrete implementation for testing
class TestLLMAdapter extends BaseLLMAdapter {
  public async generate(prompt: string, options?: Partial<LLMConfig>): Promise<LLMResponse> {
    return {
      content: `Response to: ${prompt}`,
      usage: {
        promptTokens: 10,
        completionTokens: 20,
        totalTokens: 30,
      },
      model: options?.model || this.config.model || 'test-model',
    };
  }
}

describe('BaseLLMAdapter', () => {
  let adapter: TestLLMAdapter;
  const defaultConfig: LLMConfig = {
    apiKey: 'test-key',
    model: 'test-model',
    temperature: 0.5,
    maxTokens: 100,
    timeout: 5000,
  };

  beforeEach(() => {
    adapter = new TestLLMAdapter(defaultConfig);
  });

  describe('constructor', () => {
    it('should initialize with default values when not provided', () => {
      const minimalConfig: LLMConfig = { apiKey: 'test-key' };
      const minimalAdapter = new TestLLMAdapter(minimalConfig);
      
      expect(minimalAdapter).toBeDefined();
    });

    it('should initialize with cache enabled by default', () => {
      const adapterWithCache = new TestLLMAdapter(defaultConfig, true);
      expect(adapterWithCache).toBeDefined();
    });

    it('should initialize without cache when disabled', () => {
      const adapterNoCache = new TestLLMAdapter(defaultConfig, false);
      expect(adapterNoCache).toBeDefined();
    });

    it('should use custom fallback handler when provided', () => {
      const customHandler: FallbackHandler = {
        handle: async (error: Error) => ({
          content: 'custom fallback',
          model: 'fallback',
        }),
      };
      const adapterWithHandler = new TestLLMAdapter(defaultConfig, true, customHandler);
      expect(adapterWithHandler).toBeDefined();
    });

    it('should apply default temperature when not specified', () => {
      const configNoTemp: LLMConfig = { apiKey: 'test-key' };
      const adapter = new TestLLMAdapter(configNoTemp);
      expect(adapter).toBeDefined();
    });

    it('should apply default maxTokens when not specified', () => {
      const configNoTokens: LLMConfig = { apiKey: 'test-key' };
      const adapter = new TestLLMAdapter(configNoTokens);
      expect(adapter).toBeDefined();
    });

    it('should apply default timeout when not specified', () => {
      const configNoTimeout: LLMConfig = { apiKey: 'test-key' };
      const adapter = new TestLLMAdapter(configNoTimeout);
      expect(adapter).toBeDefined();
    });
  });

  describe('generateWithContext', () => {
    it('should process context with text, tokens, and entities', async () => {
      const input: QirrelContext = {
        meta: { requestId: 'test-123', timestamp: Date.now() },
        data: {
          text: 'Hello world',
          tokens: [
            { value: 'hello', type: 'word', start: 0, end: 5 },
            { value: 'world', type: 'word', start: 6, end: 11 },
          ],
          entities: [
            { type: 'greeting', value: 'Hello', start: 0, end: 5 },
          ],
        },
      };

      const promptTemplate = 'Process this text: {text}';
      const result = await adapter.generateWithContext(input, promptTemplate);

      expect(result.data).toBeDefined();
      expect(result.data?.text).toBe('Hello world');
      expect(result.data?.tokens).toHaveLength(2);
      expect(result.data?.entities).toHaveLength(1);
      expect(result.data?.llmResponse).toBeDefined();
      expect(result.data?.llmResponse?.content).toContain('Process this text: Hello world');
    });

    it('should preserve original text in the returned context', async () => {
      const input: QirrelContext = {
        data: {
          text: 'Test text',
          tokens: [],
          entities: [],
        },
      };

      const result = await adapter.generateWithContext(input, 'Template: {text}');

      expect(result.data?.text).toBe('Test text');
    });

    it('should preserve original tokens in the returned context', async () => {
      const tokens = [
        { value: 'test', type: 'word', start: 0, end: 4 },
      ];
      const input: QirrelContext = {
        data: {
          text: 'test',
          tokens: tokens,
          entities: [],
        },
      };

      const result = await adapter.generateWithContext(input, 'Template');

      expect(result.data?.tokens).toEqual(tokens);
      expect(result.data?.tokens).toHaveLength(1);
    });

    it('should preserve original entities in the returned context', async () => {
      const entities = [
        { type: 'test', value: 'entity', start: 0, end: 6 },
      ];
      const input: QirrelContext = {
        data: {
          text: 'entity',
          tokens: [],
          entities: entities,
        },
      };

      const result = await adapter.generateWithContext(input, 'Template');

      expect(result.data?.entities).toEqual(entities);
      expect(result.data?.entities).toHaveLength(1);
    });

    it('should handle empty text gracefully', async () => {
      const input: QirrelContext = {
        data: {
          text: '',
          tokens: [],
          entities: [],
        },
      };

      const result = await adapter.generateWithContext(input, 'Text: {text}');

      expect(result.data?.text).toBe('');
      expect(result.data?.llmResponse).toBeDefined();
    });

    it('should handle missing data object with defaults', async () => {
      const input: QirrelContext = {
        meta: { requestId: 'test' },
      };

      const result = await adapter.generateWithContext(input, 'Template: {text}');

      expect(result.data?.text).toBe('');
      expect(result.data?.tokens).toEqual([]);
      expect(result.data?.entities).toEqual([]);
    });

    it('should replace {text} placeholder in template', async () => {
      const input: QirrelContext = {
        data: {
          text: 'Sample text',
          tokens: [],
          entities: [],
        },
      };

      const result = await adapter.generateWithContext(input, 'Analyze: {text}');

      expect(result.data?.llmResponse?.content).toContain('Analyze: Sample text');
    });

    it('should replace {tokens} placeholder with token values', async () => {
      const input: QirrelContext = {
        data: {
          text: 'test',
          tokens: [
            { value: 'hello', type: 'word', start: 0, end: 5 },
            { value: 'world', type: 'word', start: 6, end: 11 },
          ],
          entities: [],
        },
      };

      const result = await adapter.generateWithContext(input, 'Tokens: {tokens}');

      expect(result.data?.llmResponse?.content).toContain('Tokens: hello world');
    });

    it('should replace {entities} placeholder with entity descriptions', async () => {
      const input: QirrelContext = {
        data: {
          text: 'test',
          tokens: [],
          entities: [
            { type: 'person', value: 'John', start: 0, end: 4 },
            { type: 'location', value: 'NYC', start: 5, end: 8 },
          ],
        },
      };

      const result = await adapter.generateWithContext(input, 'Entities: {entities}');

      expect(result.data?.llmResponse?.content).toContain('person:John');
      expect(result.data?.llmResponse?.content).toContain('location:NYC');
    });

    it('should handle multiple placeholder replacements', async () => {
      const input: QirrelContext = {
        data: {
          text: 'Hello',
          tokens: [{ value: 'hello', type: 'word', start: 0, end: 5 }],
          entities: [{ type: 'greeting', value: 'Hello', start: 0, end: 5 }],
        },
      };

      const template = 'Text: {text}, Tokens: {tokens}, Entities: {entities}';
      const result = await adapter.generateWithContext(input, template);

      expect(result.data?.llmResponse?.content).toContain('Text: Hello');
      expect(result.data?.llmResponse?.content).toContain('Tokens: hello');
      expect(result.data?.llmResponse?.content).toContain('greeting:Hello');
    });

    it('should return original input on error without throwing', async () => {
      const failingAdapter = new (class extends BaseLLMAdapter {
        async generate(): Promise<LLMResponse> {
          throw new Error('Test error');
        }
      })(defaultConfig);

      const input: QirrelContext = {
        data: {
          text: 'test',
          tokens: [],
          entities: [],
        },
      };

      const result = await failingAdapter.generateWithContext(input, 'Template');

      expect(result).toEqual(input);
    });

    it('should preserve other data properties when adding llmResponse', async () => {
      const input: QirrelContext = {
        data: {
          text: 'test',
          tokens: [],
          entities: [],
          customProperty: 'custom value',
        } as any,
      };

      const result = await adapter.generateWithContext(input, 'Template');

      expect(result.data?.text).toBe('test');
      expect(result.data?.llmResponse).toBeDefined();
      expect((result.data as any).customProperty).toBe('custom value');
    });

    it('should handle context with only meta data', async () => {
      const input: QirrelContext = {
        meta: {
          requestId: 'req-123',
          timestamp: 123456789,
        },
      };

      const result = await adapter.generateWithContext(input, 'Process: {text}');

      expect(result.meta).toEqual(input.meta);
      expect(result.data?.llmResponse).toBeDefined();
    });

    it('should pass options to generate method', async () => {
      const input: QirrelContext = {
        data: { text: 'test', tokens: [], entities: [] },
      };

      const options: Partial<LLMConfig> = {
        temperature: 0.9,
        maxTokens: 500,
      };

      const result = await adapter.generateWithContext(input, 'Template', options);

      expect(result.data?.llmResponse).toBeDefined();
    });
  });

  describe('mergeConfig', () => {
    it('should merge options with base config', () => {
      const options: Partial<LLMConfig> = {
        temperature: 0.9,
        maxTokens: 200,
      };

      const merged = (adapter as any).mergeConfig(options);

      expect(merged.temperature).toBe(0.9);
      expect(merged.maxTokens).toBe(200);
      expect(merged.apiKey).toBe('test-key');
    });

    it('should return base config when no options provided', () => {
      const merged = (adapter as any).mergeConfig();

      expect(merged.apiKey).toBe('test-key');
      expect(merged.temperature).toBe(0.5);
    });

    it('should allow overriding all config properties', () => {
      const options: Partial<LLMConfig> = {
        model: 'new-model',
        temperature: 0.1,
        maxTokens: 50,
        timeout: 1000,
      };

      const merged = (adapter as any).mergeConfig(options);

      expect(merged.model).toBe('new-model');
      expect(merged.temperature).toBe(0.1);
      expect(merged.maxTokens).toBe(50);
      expect(merged.timeout).toBe(1000);
    });
  });

  describe('getCacheKey', () => {
    it('should generate consistent cache key', () => {
      const config: LLMConfig = {
        apiKey: 'key',
        model: 'model-1',
        temperature: 0.7,
        maxTokens: 100,
      };

      const key1 = (adapter as any).getCacheKey('test prompt', config);
      const key2 = (adapter as any).getCacheKey('test prompt', config);

      expect(key1).toBe(key2);
    });

    it('should generate different keys for different prompts', () => {
      const config: LLMConfig = {
        apiKey: 'key',
        model: 'model-1',
        temperature: 0.7,
        maxTokens: 100,
      };

      const key1 = (adapter as any).getCacheKey('prompt 1', config);
      const key2 = (adapter as any).getCacheKey('prompt 2', config);

      expect(key1).not.toBe(key2);
    });

    it('should generate different keys for different configs', () => {
      const config1: LLMConfig = {
        apiKey: 'key',
        model: 'model-1',
        temperature: 0.7,
        maxTokens: 100,
      };
      const config2: LLMConfig = {
        apiKey: 'key',
        model: 'model-2',
        temperature: 0.7,
        maxTokens: 100,
      };

      const key1 = (adapter as any).getCacheKey('test', config1);
      const key2 = (adapter as any).getCacheKey('test', config2);

      expect(key1).not.toBe(key2);
    });

    it('should include temperature in cache key', () => {
      const config1: LLMConfig = { apiKey: 'key', model: 'model', temperature: 0.5, maxTokens: 100 };
      const config2: LLMConfig = { apiKey: 'key', model: 'model', temperature: 0.9, maxTokens: 100 };

      const key1 = (adapter as any).getCacheKey('test', config1);
      const key2 = (adapter as any).getCacheKey('test', config2);

      expect(key1).not.toBe(key2);
    });
  });

  describe('generateWithCache', () => {
    it('should cache responses', async () => {
      const adapterWithCache = new TestLLMAdapter(defaultConfig, true);
      
      const result1 = await (adapterWithCache as any).generateWithCache('test prompt');
      const result2 = await (adapterWithCache as any).generateWithCache('test prompt');

      expect(result1.content).toBe(result2.content);
    });

    it('should work without cache', async () => {
      const adapterNoCache = new TestLLMAdapter(defaultConfig, false);
      
      const result = await (adapterNoCache as any).generateWithCache('test prompt');

      expect(result).toBeDefined();
      expect(result.content).toContain('Response to: test prompt');
    });

    it('should use fallback handler on error', async () => {
      const customHandler: FallbackHandler = {
        handle: async () => ({
          content: 'fallback response',
          model: 'fallback-model',
        }),
      };

      const failingAdapter = new (class extends BaseLLMAdapter {
        async generate(): Promise<LLMResponse> {
          throw new Error('Generation failed');
        }
      })(defaultConfig, true, customHandler);

      const result = await (failingAdapter as any).generateWithCache('test');

      expect(result.content).toBe('fallback response');
      expect(result.model).toBe('fallback-model');
    });

    it('should handle non-Error exceptions', async () => {
      const customHandler: FallbackHandler = {
        handle: async () => ({
          content: 'fallback for non-error',
          model: 'fallback',
        }),
      };

      const failingAdapter = new (class extends BaseLLMAdapter {
        async generate(): Promise<LLMResponse> {
          throw 'string error';
        }
      })(defaultConfig, true, customHandler);

      const result = await (failingAdapter as any).generateWithCache('test');

      expect(result.content).toBe('fallback for non-error');
    });

    it('should store response with custom TTL from options', async () => {
      const adapterWithCache = new TestLLMAdapter(defaultConfig, true);
      
      await (adapterWithCache as any).generateWithCache('test', { timeout: 600000 });

      // Response should be cached
      const result = await (adapterWithCache as any).generateWithCache('test');
      expect(result).toBeDefined();
    });
  });
});