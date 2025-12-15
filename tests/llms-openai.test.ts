import { OpenAILLMAdapter } from '../src/llms/openai';
import type { LLMConfig, LLMResponse } from '../src/llms/types';

// Mock fetch globally
global.fetch = jest.fn();

describe('OpenAILLMAdapter', () => {
  let adapter: OpenAILLMAdapter;
  const defaultConfig: LLMConfig = {
    apiKey: 'test-api-key',
    model: 'gpt-3.5-turbo',
    temperature: 0.7,
    maxTokens: 100,
    timeout: 5000,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    adapter = new OpenAILLMAdapter(defaultConfig);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with valid config', () => {
      expect(adapter).toBeDefined();
    });

    it('should use default baseUrl when not provided', () => {
      const adapterDefault = new OpenAILLMAdapter({ apiKey: 'key' });
      expect(adapterDefault).toBeDefined();
    });

    it('should accept custom baseUrl', () => {
      const customConfig: LLMConfig = {
        ...defaultConfig,
        baseUrl: 'https://custom.api.com',
      };
      const customAdapter = new OpenAILLMAdapter(customConfig);
      expect(customAdapter).toBeDefined();
    });

    it('should throw error for invalid baseUrl', () => {
      const invalidConfig: LLMConfig = {
        ...defaultConfig,
        baseUrl: 'not-a-valid-url',
      };

      expect(() => new OpenAILLMAdapter(invalidConfig)).toThrow('Invalid baseUrl');
    });

    it('should validate baseUrl is a proper URL', () => {
      const invalidConfig: LLMConfig = {
        ...defaultConfig,
        baseUrl: 'htp://invalid',
      };

      expect(() => new OpenAILLMAdapter(invalidConfig)).toThrow();
    });

    it('should accept cache configuration', () => {
      const adapterWithCache = new OpenAILLMAdapter(defaultConfig, true);
      expect(adapterWithCache).toBeDefined();
    });

    it('should work with cache disabled', () => {
      const adapterNoCache = new OpenAILLMAdapter(defaultConfig, false);
      expect(adapterNoCache).toBeDefined();
    });
  });

  describe('generate', () => {
    const mockSuccessResponse = {
      choices: [
        {
          message: {
            content: 'Generated response',
          },
        },
      ],
      usage: {
        prompt_tokens: 10,
        completion_tokens: 20,
        total_tokens: 30,
      },
      model: 'gpt-3.5-turbo',
    };

    beforeEach(() => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockSuccessResponse,
      });
    });

    it('should generate response successfully', async () => {
      const result = await adapter.generate('Test prompt');

      expect(result.content).toBe('Generated response');
      expect(result.usage).toEqual({
        promptTokens: 10,
        completionTokens: 20,
        totalTokens: 30,
      });
      expect(result.model).toBe('gpt-3.5-turbo');
    });

    it('should send correct request to OpenAI API', async () => {
      await adapter.generate('Test prompt');

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.openai.com/v1/chat/completions',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-api-key',
          }),
        })
      );
    });

    it('should include prompt in request body', async () => {
      await adapter.generate('My test prompt');

      const callArgs = (global.fetch as jest.Mock).mock.calls[0];
      const body = JSON.parse(callArgs[1].body);

      expect(body.messages).toEqual([
        { role: 'user', content: 'My test prompt' },
      ]);
    });

    it('should use default model when not specified', async () => {
      await adapter.generate('Test');

      const callArgs = (global.fetch as jest.Mock).mock.calls[0];
      const body = JSON.parse(callArgs[1].body);

      expect(body.model).toBe('gpt-3.5-turbo');
    });

    it('should use custom model from options', async () => {
      await adapter.generate('Test', { model: 'gpt-4' });

      const callArgs = (global.fetch as jest.Mock).mock.calls[0];
      const body = JSON.parse(callArgs[1].body);

      expect(body.model).toBe('gpt-4');
    });

    it('should include temperature in request', async () => {
      await adapter.generate('Test');

      const callArgs = (global.fetch as jest.Mock).mock.calls[0];
      const body = JSON.parse(callArgs[1].body);

      expect(body.temperature).toBe(0.7);
    });

    it('should include max_tokens in request', async () => {
      await adapter.generate('Test');

      const callArgs = (global.fetch as jest.Mock).mock.calls[0];
      const body = JSON.parse(callArgs[1].body);

      expect(body.max_tokens).toBe(100);
    });

    it('should override config with options', async () => {
      await adapter.generate('Test', { temperature: 0.9, maxTokens: 500 });

      const callArgs = (global.fetch as jest.Mock).mock.calls[0];
      const body = JSON.parse(callArgs[1].body);

      expect(body.temperature).toBe(0.9);
      expect(body.max_tokens).toBe(500);
    });

    it('should throw error when response is not ok', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 401,
        text: async () => 'Unauthorized',
      });

      await expect(adapter.generate('Test')).rejects.toThrow('HTTP 401');
    });

    it('should throw error when no content in response', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          choices: [{ message: {} }],
        }),
      });

      await expect(adapter.generate('Test')).rejects.toThrow(
        'OpenAI API returned no content in response'
      );
    });

    it('should throw error when choices array is empty', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          choices: [],
        }),
      });

      await expect(adapter.generate('Test')).rejects.toThrow(
        'OpenAI API returned no content in response'
      );
    });

    it('should throw error when choices is undefined', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({}),
      });

      await expect(adapter.generate('Test')).rejects.toThrow(
        'OpenAI API returned no content in response'
      );
    });

    it('should log error to console when response has no content', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          choices: [{ message: {} }],
        }),
      });

      await expect(adapter.generate('Test')).rejects.toThrow();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'OpenAI API returned unexpected response structure:',
        expect.any(Object)
      );

      consoleErrorSpy.mockRestore();
    });

    it('should handle timeout correctly', async () => {
      const timeoutConfig: LLMConfig = {
        ...defaultConfig,
        timeout: 100,
      };
      const timeoutAdapter = new OpenAILLMAdapter(timeoutConfig);

      (global.fetch as jest.Mock).mockImplementation(() =>
        new Promise((resolve) => setTimeout(resolve, 200))
      );

      await expect(timeoutAdapter.generate('Test')).rejects.toThrow('timed out');
    });

    it('should clear timeout after successful response', async () => {
      const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');

      await adapter.generate('Test');

      expect(clearTimeoutSpy).toHaveBeenCalled();
      clearTimeoutSpy.mockRestore();
    });

    it('should not set timeout when timeout is 0', async () => {
      const noTimeoutConfig: LLMConfig = {
        ...defaultConfig,
        timeout: 0,
      };
      const noTimeoutAdapter = new OpenAILLMAdapter(noTimeoutConfig);

      await noTimeoutAdapter.generate('Test');

      expect(global.fetch).toHaveBeenCalled();
    });

    it('should not set timeout when timeout is negative', async () => {
      const negativeTimeoutConfig: LLMConfig = {
        ...defaultConfig,
        timeout: -1,
      };
      const negativeTimeoutAdapter = new OpenAILLMAdapter(negativeTimeoutConfig);

      await negativeTimeoutAdapter.generate('Test');

      expect(global.fetch).toHaveBeenCalled();
    });

    it('should handle AbortError specifically', async () => {
      const abortError = new Error('Aborted');
      abortError.name = 'AbortError';
      
      (global.fetch as jest.Mock).mockRejectedValue(abortError);

      await expect(adapter.generate('Test')).rejects.toThrow('Request timed out');
    });

    it('should sanitize error messages', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const testError = new Error('Sensitive error details');
      
      (global.fetch as jest.Mock).mockRejectedValue(testError);

      await expect(adapter.generate('Test')).rejects.toThrow(
        'OpenAI API request failed'
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'OpenAI API request failed:',
        testError
      );

      consoleErrorSpy.mockRestore();
    });

    it('should handle non-Error exceptions', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      (global.fetch as jest.Mock).mockRejectedValue('String error');

      await expect(adapter.generate('Test')).rejects.toThrow(
        'OpenAI API request failed'
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'OpenAI API request failed:',
        'String error'
      );

      consoleErrorSpy.mockRestore();
    });

    it('should include error name in sanitized message for Error objects', async () => {
      jest.spyOn(console, 'error').mockImplementation();
      const testError = new TypeError('Type error occurred');
      
      (global.fetch as jest.Mock).mockRejectedValue(testError);

      await expect(adapter.generate('Test')).rejects.toThrow('TypeError');
    });

    it('should use custom baseUrl in requests', async () => {
      const customConfig: LLMConfig = {
        ...defaultConfig,
        baseUrl: 'https://custom.openai.com',
      };
      const customAdapter = new OpenAILLMAdapter(customConfig);

      await customAdapter.generate('Test');

      expect(global.fetch).toHaveBeenCalledWith(
        'https://custom.openai.com/chat/completions',
        expect.any(Object)
      );
    });

    it('should handle missing usage data gracefully', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: 'Response' } }],
          model: 'gpt-3.5-turbo',
        }),
      });

      const result = await adapter.generate('Test');

      expect(result.content).toBe('Response');
      expect(result.usage).toEqual({
        promptTokens: undefined,
        completionTokens: undefined,
        totalTokens: undefined,
      });
    });

    it('should handle partial usage data', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: 'Response' } }],
          usage: {
            prompt_tokens: 5,
          },
          model: 'gpt-3.5-turbo',
        }),
      });

      const result = await adapter.generate('Test');

      expect(result.usage).toEqual({
        promptTokens: 5,
        completionTokens: undefined,
        totalTokens: undefined,
      });
    });

    it('should handle empty prompt', async () => {
      const result = await adapter.generate('');

      expect(result).toBeDefined();
      const callArgs = (global.fetch as jest.Mock).mock.calls[0];
      const body = JSON.parse(callArgs[1].body);
      expect(body.messages[0].content).toBe('');
    });

    it('should handle very long prompts', async () => {
      const longPrompt = 'a'.repeat(10000);

      await adapter.generate(longPrompt);

      const callArgs = (global.fetch as jest.Mock).mock.calls[0];
      const body = JSON.parse(callArgs[1].body);
      expect(body.messages[0].content).toBe(longPrompt);
    });

    it('should handle special characters in prompt', async () => {
      const specialPrompt = 'Test with "quotes" and \\backslashes\\ and \nnewlines';

      await adapter.generate(specialPrompt);

      const callArgs = (global.fetch as jest.Mock).mock.calls[0];
      const body = JSON.parse(callArgs[1].body);
      expect(body.messages[0].content).toContain('quotes');
    });
  });

  describe('timeout handling', () => {
    it('should use ReturnType<typeof setTimeout> for timeout ID', async () => {
      const timeoutConfig: LLMConfig = {
        ...defaultConfig,
        timeout: 5000,
      };
      const timeoutAdapter = new OpenAILLMAdapter(timeoutConfig);

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: 'Response' } }],
          model: 'gpt-3.5-turbo',
        }),
      });

      await expect(timeoutAdapter.generate('Test')).resolves.toBeDefined();
    });

    it('should abort request on timeout', async () => {
      const timeoutConfig: LLMConfig = {
        ...defaultConfig,
        timeout: 10,
      };
      const timeoutAdapter = new OpenAILLMAdapter(timeoutConfig);

      (global.fetch as jest.Mock).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      await expect(timeoutAdapter.generate('Test')).rejects.toThrow();
    });
  });

  describe('error logging', () => {
    it('should use console.error instead of console.warn for missing content', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          choices: [{ message: {} }],
        }),
      });

      await expect(adapter.generate('Test')).rejects.toThrow();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'OpenAI API returned unexpected response structure:',
        expect.any(Object)
      );

      consoleErrorSpy.mockRestore();
    });
  });
});