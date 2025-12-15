import { createQirrelContext } from '../src/types';
import type { QirrelContext, MetaContext, MemoryContext, LLMContext, Entity } from '../src/types';
import type { Token } from '../src/core/Tokenizer';

describe('QirrelContext Types', () => {
  describe('createQirrelContext', () => {
    it('should create context with default values', () => {
      const context = createQirrelContext();

      expect(context).toBeDefined();
      expect(context.meta).toBeDefined();
      expect(context.memory).toBeDefined();
      expect(context.llm).toBeDefined();
      expect(context.data).toBeDefined();
    });

    it('should generate valid UUID for requestId', () => {
      const context = createQirrelContext();

      expect(context.meta?.requestId).toBeDefined();
      expect(context.meta?.requestId).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      );
    });

    it('should not prefix requestId with "req_"', () => {
      const context = createQirrelContext();

      expect(context.meta?.requestId).not.toMatch(/^req_/);
    });

    it('should generate unique requestIds for multiple calls', () => {
      const context1 = createQirrelContext();
      const context2 = createQirrelContext();
      const context3 = createQirrelContext();

      expect(context1.meta?.requestId).not.toBe(context2.meta?.requestId);
      expect(context1.meta?.requestId).not.toBe(context3.meta?.requestId);
      expect(context2.meta?.requestId).not.toBe(context3.meta?.requestId);
    });

    it('should set timestamp to current time', () => {
      const before = Date.now();
      const context = createQirrelContext();
      const after = Date.now();

      expect(context.meta?.timestamp).toBeDefined();
      expect(context.meta?.timestamp).toBeGreaterThanOrEqual(before);
      expect(context.meta?.timestamp).toBeLessThanOrEqual(after);
    });

    it('should initialize memory with empty cache', () => {
      const context = createQirrelContext();

      expect(context.memory?.cache).toBeDefined();
      expect(context.memory?.cache).toEqual({});
    });

    it('should use default model "gemini-2.5-flash"', () => {
      const context = createQirrelContext();

      expect(context.llm?.model).toBe('gemini-2.5-flash');
    });

    it('should allow custom model override', () => {
      const context = createQirrelContext(undefined, 'gpt-4');

      expect(context.llm?.model).toBe('gpt-4');
    });

    it('should set allowTools to true by default', () => {
      const context = createQirrelContext();

      expect(context.llm?.safety?.allowTools).toBe(true);
    });

    it('should initialize data with empty values when not provided', () => {
      const context = createQirrelContext();

      expect(context.data?.text).toBe('');
      expect(context.data?.tokens).toEqual([]);
      expect(context.data?.entities).toEqual([]);
    });

    it('should accept custom data', () => {
      const customData: QirrelContext['data'] = {
        text: 'Hello world',
        tokens: [
          { value: 'hello', type: 'word', start: 0, end: 5 },
          { value: 'world', type: 'word', start: 6, end: 11 },
        ],
        entities: [
          { type: 'greeting', value: 'Hello', start: 0, end: 5 },
        ],
      };

      const context = createQirrelContext(customData);

      expect(context.data?.text).toBe('Hello world');
      expect(context.data?.tokens).toHaveLength(2);
      expect(context.data?.entities).toHaveLength(1);
    });

    it('should accept partial data with just text', () => {
      const partialData: QirrelContext['data'] = {
        text: 'Test text',
        tokens: [],
        entities: [],
      };

      const context = createQirrelContext(partialData);

      expect(context.data?.text).toBe('Test text');
      expect(context.data?.tokens).toEqual([]);
      expect(context.data?.entities).toEqual([]);
    });

    it('should accept data with tokens but no entities', () => {
      const dataWithTokens: QirrelContext['data'] = {
        text: 'test',
        tokens: [{ value: 'test', type: 'word', start: 0, end: 4 }],
        entities: [],
      };

      const context = createQirrelContext(dataWithTokens);

      expect(context.data?.tokens).toHaveLength(1);
      expect(context.data?.entities).toHaveLength(0);
    });

    it('should accept data with entities but no tokens', () => {
      const dataWithEntities: QirrelContext['data'] = {
        text: 'test',
        tokens: [],
        entities: [{ type: 'test', value: 'test', start: 0, end: 4 }],
      };

      const context = createQirrelContext(dataWithEntities);

      expect(context.data?.tokens).toHaveLength(0);
      expect(context.data?.entities).toHaveLength(1);
    });

    it('should accept custom model and data together', () => {
      const customData: QirrelContext['data'] = {
        text: 'Custom text',
        tokens: [],
        entities: [],
      };

      const context = createQirrelContext(customData, 'custom-model');

      expect(context.llm?.model).toBe('custom-model');
      expect(context.data?.text).toBe('Custom text');
    });

    it('should handle empty string as model', () => {
      const context = createQirrelContext(undefined, '');

      expect(context.llm?.model).toBe('');
    });

    it('should handle very long model names', () => {
      const longModelName = 'a'.repeat(1000);
      const context = createQirrelContext(undefined, longModelName);

      expect(context.llm?.model).toBe(longModelName);
    });

    it('should create independent context objects', () => {
      const context1 = createQirrelContext();
      const context2 = createQirrelContext();

      context1.data!.text = 'Modified';

      expect(context1.data?.text).toBe('Modified');
      expect(context2.data?.text).toBe('');
    });

    it('should handle data with llmResponse', () => {
      const dataWithResponse: QirrelContext['data'] = {
        text: 'test',
        tokens: [],
        entities: [],
        llmResponse: {
          content: 'LLM generated content',
          usage: {
            promptTokens: 10,
            completionTokens: 20,
            totalTokens: 30,
          },
          model: 'test-model',
        },
      };

      const context = createQirrelContext(dataWithResponse);

      expect(context.data?.llmResponse).toBeDefined();
      expect(context.data?.llmResponse?.content).toBe('LLM generated content');
    });

    it('should preserve all meta fields', () => {
      const context = createQirrelContext();

      expect(context.meta?.requestId).toBeDefined();
      expect(context.meta?.timestamp).toBeDefined();
      expect(typeof context.meta?.requestId).toBe('string');
      expect(typeof context.meta?.timestamp).toBe('number');
    });

    it('should create valid structure for memory context', () => {
      const context = createQirrelContext();

      expect(context.memory).toBeDefined();
      expect(context.memory?.cache).toBeDefined();
      expect(typeof context.memory?.cache).toBe('object');
    });

    it('should create valid structure for llm context', () => {
      const context = createQirrelContext();

      expect(context.llm).toBeDefined();
      expect(context.llm?.model).toBeDefined();
      expect(context.llm?.safety).toBeDefined();
      expect(context.llm?.safety?.allowTools).toBe(true);
    });

    it('should handle special characters in text data', () => {
      const specialData: QirrelContext['data'] = {
        text: 'Special chars: "quotes" \\backslash\\ \nnewline',
        tokens: [],
        entities: [],
      };

      const context = createQirrelContext(specialData);

      expect(context.data?.text).toContain('quotes');
      expect(context.data?.text).toContain('\\backslash\\');
    });

    it('should handle unicode characters in text', () => {
      const unicodeData: QirrelContext['data'] = {
        text: '你好世界 🌍 Привет мир',
        tokens: [],
        entities: [],
      };

      const context = createQirrelContext(unicodeData);

      expect(context.data?.text).toContain('你好世界');
      expect(context.data?.text).toContain('🌍');
      expect(context.data?.text).toContain('Привет мир');
    });

    it('should handle empty arrays in data', () => {
      const emptyData: QirrelContext['data'] = {
        text: '',
        tokens: [],
        entities: [],
      };

      const context = createQirrelContext(emptyData);

      expect(context.data?.tokens).toEqual([]);
      expect(context.data?.entities).toEqual([]);
    });

    it('should handle multiple tokens with various types', () => {
      const multiTokenData: QirrelContext['data'] = {
        text: 'Hello, world!',
        tokens: [
          { value: 'hello', type: 'word', start: 0, end: 5 },
          { value: ',', type: 'punct', start: 5, end: 6 },
          { value: 'world', type: 'word', start: 7, end: 12 },
          { value: '!', type: 'punct', start: 12, end: 13 },
        ],
        entities: [],
      };

      const context = createQirrelContext(multiTokenData);

      expect(context.data?.tokens).toHaveLength(4);
      expect(context.data?.tokens?.[0].type).toBe('word');
      expect(context.data?.tokens?.[1].type).toBe('punct');
    });

    it('should handle multiple entities with various types', () => {
      const multiEntityData: QirrelContext['data'] = {
        text: 'John lives in NYC',
        tokens: [],
        entities: [
          { type: 'person', value: 'John', start: 0, end: 4 },
          { type: 'location', value: 'NYC', start: 14, end: 17 },
        ],
      };

      const context = createQirrelContext(multiEntityData);

      expect(context.data?.entities).toHaveLength(2);
      expect(context.data?.entities?.[0].type).toBe('person');
      expect(context.data?.entities?.[1].type).toBe('location');
    });
  });

  describe('Type interfaces', () => {
    it('should allow optional source in MetaContext', () => {
      const meta: MetaContext = {
        requestId: 'test-id',
        timestamp: Date.now(),
        source: 'http',
      };

      expect(meta.source).toBe('http');
    });

    it('should allow trace in MetaContext', () => {
      const meta: MetaContext = {
        requestId: 'test-id',
        trace: { key: 'value' },
      };

      expect(meta.trace).toEqual({ key: 'value' });
    });

    it('should allow shortTerm memory', () => {
      const memory: MemoryContext = {
        shortTerm: { data: 'temporary' },
      };

      expect(memory.shortTerm).toBeDefined();
    });

    it('should allow longTerm memory', () => {
      const memory: MemoryContext = {
        longTerm: { data: 'persistent' },
      };

      expect(memory.longTerm).toBeDefined();
    });

    it('should allow temperature in LLMContext', () => {
      const llm: LLMContext = {
        model: 'test-model',
        temperature: 0.5,
        safety: { allowTools: true },
      };

      expect(llm.temperature).toBe(0.5);
    });

    it('should allow redactions in safety', () => {
      const llm: LLMContext = {
        safety: {
          allowTools: false,
          redactions: ['sensitive', 'secret'],
        },
      };

      expect(llm.safety?.redactions).toEqual(['sensitive', 'secret']);
    });

    it('should require allowTools in safety object', () => {
      const llm: LLMContext = {
        safety: {
          allowTools: false,
        },
      };

      expect(llm.safety.allowTools).toBe(false);
    });

    it('should allow Entity with all required fields', () => {
      const entity: Entity = {
        type: 'person',
        value: 'John Doe',
        start: 0,
        end: 8,
      };

      expect(entity.type).toBe('person');
      expect(entity.value).toBe('John Doe');
      expect(entity.start).toBe(0);
      expect(entity.end).toBe(8);
    });
  });
});